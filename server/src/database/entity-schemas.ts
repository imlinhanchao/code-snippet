import { EntitySchema } from 'typeorm';

type EntityMap = {
  account: EntitySchema;
  snippet: EntitySchema;
  code: EntitySchema;
  comment: EntitySchema;
  fav: EntitySchema;
};

function commonColumns(): Record<string, any> {
  return {
    id: {
      type: 'varchar' as const,
      length: 36,
      primary: true,
    },
    create_time: {
      type: 'int' as const,
    },
    update_time: {
      type: 'int' as const,
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
        username: { type: 'varchar' as const, length: 20 },
        nickname: { type: 'varchar' as const, length: 20 },
        passwd: { type: 'varchar' as const, length: 64 },
        email: { type: 'varchar' as const, length: 100 },
        company: { type: 'varchar' as const, length: 50 },
        location: { type: 'varchar' as const, length: 20 },
        url: { type: 'varchar' as const, length: 260 },
        motto: { type: 'varchar' as const, length: 200 },
        avatar: { type: 'varchar' as const, length: 200 },
        verify: { type: 'boolean' as const },
        lastlogin: { type: 'int' as const },
      } as Record<string, any>,
    }),
    snippet: new EntitySchema({
      name: 'Snippet',
      tableName: `${prefix}snippet`,
      columns: {
        ...commonColumns(),
        title: { type: 'varchar' as const, length: 50 },
        description: { type: 'varchar' as const, length: 500 },
        language: { type: 'varchar' as const, length: 10 },
        input: { type: 'text' as const },
        command: { type: 'varchar' as const, length: 64 },
        execute: { type: 'boolean' as const },
        private: { type: 'boolean' as const },
        username: { type: 'varchar' as const, length: 20 },
        fork_from: { type: 'varchar' as const, length: 36 },
      } as Record<string, any>,
    }),
    code: new EntitySchema({
      name: 'Code',
      tableName: `${prefix}code`,
      columns: {
        ...commonColumns(),
        filename: { type: 'varchar' as const, length: 50 },
        content: { type: 'text' as const },
        snippet: { type: 'varchar' as const, length: 36 },
        order: { type: 'int' as const },
        input: { type: 'text' as const },
        command: { type: 'varchar' as const, length: 64 },
        execute: { type: 'boolean' as const },
      } as Record<string, any>,
    }),
    comment: new EntitySchema({
      name: 'Comment',
      tableName: `${prefix}comment`,
      columns: {
        ...commonColumns(),
        username: { type: 'varchar' as const, length: 20 },
        content: { type: 'text' as const },
        snippet: { type: 'varchar' as const, length: 36 },
        reply: { type: 'varchar' as const, length: 36 },
      } as Record<string, any>,
    }),
    fav: new EntitySchema({
      name: 'Fav',
      tableName: `${prefix}fav`,
      columns: {
        ...commonColumns(),
        username: { type: 'varchar' as const, length: 20 },
        snippet: { type: 'varchar' as const, length: 36 },
      } as Record<string, any>,
    }),
  };
}
