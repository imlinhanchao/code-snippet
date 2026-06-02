import { EntitySchema } from 'typeorm';

type EntityMap = {
  account: EntitySchema;
  snippet: EntitySchema;
  code: EntitySchema;
  comment: EntitySchema;
  fav: EntitySchema;
};

function commonColumns() {
  return {
    id: {
      type: 'uuid',
      primary: true,
    },
    create_time: {
      type: Number,
    },
    update_time: {
      type: Number,
    },
  };
}

export function createEntitySchemas(prefix: string): EntityMap {
  return {
    account: new EntitySchema({
      name: 'Account',
      tableName: `${prefix}account`,
      columns: {
        ...commonColumns(),
        username: { type: String, length: 20 },
        nickname: { type: String, length: 20 },
        passwd: { type: String, length: 64 },
        email: { type: String, length: 100 },
        company: { type: String, length: 50 },
        location: { type: String, length: 20 },
        url: { type: String, length: 260 },
        motto: { type: String, length: 200 },
        avatar: { type: String, length: 200 },
        verify: { type: Boolean },
        lastlogin: { type: Number },
      },
    }),
    snippet: new EntitySchema({
      name: 'Snippet',
      tableName: `${prefix}snippet`,
      columns: {
        ...commonColumns(),
        title: { type: String, length: 50 },
        description: { type: String, length: 500 },
        language: { type: String, length: 10 },
        input: { type: 'text' },
        command: { type: String, length: 64 },
        execute: { type: Boolean },
        private: { type: Boolean },
        username: { type: String, length: 20 },
        fork_from: { type: 'uuid' },
      },
    }),
    code: new EntitySchema({
      name: 'Code',
      tableName: `${prefix}code`,
      columns: {
        ...commonColumns(),
        filename: { type: String, length: 50 },
        content: { type: 'text' },
        snippet: { type: 'uuid' },
        order: { type: Number },
        input: { type: 'text' },
        command: { type: String, length: 64 },
        execute: { type: Boolean },
      },
    }),
    comment: new EntitySchema({
      name: 'Comment',
      tableName: `${prefix}comment`,
      columns: {
        ...commonColumns(),
        username: { type: String, length: 20 },
        content: { type: 'text' },
        snippet: { type: 'uuid' },
        reply: { type: 'uuid' },
      },
    }),
    fav: new EntitySchema({
      name: 'Fav',
      tableName: `${prefix}fav`,
      columns: {
        ...commonColumns(),
        username: { type: String, length: 20 },
        snippet: { type: 'uuid' },
      },
    }),
  };
}
