import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { assertConfigured } from '../common/utils/setup';

type SnippetRecord = {
  id: string;
  title: string;
  description: string;
  language: string;
  username: string;
  create_time: number;
  update_time: number;
  execute: boolean;
  private: boolean;
  fork_from: string;
};

@Injectable()
export class SnippetService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly runtimeConfigService: RuntimeConfigService,
  ) {}

  async getHomeFeed() {
    assertConfigured(this.runtimeConfigService);
    return {
      site: {
        name: this.runtimeConfigService.config.base.name,
        domain: this.runtimeConfigService.config.base.domain,
      },
      snippets: await this.listSnippets(12),
    };
  }

  async getExploreFeed() {
    assertConfigured(this.runtimeConfigService);
    return {
      snippets: await this.listSnippets(30),
    };
  }

  async getSnippet(id: string) {
    assertConfigured(this.runtimeConfigService);

    const snippetRepo = this.dataSource.getRepository<SnippetRecord>('Snippet');
    const codeRepo = this.dataSource.getRepository('Code');
    const commentRepo = this.dataSource.getRepository('Comment');
    const favRepo = this.dataSource.getRepository('Fav');

    const snippet = await snippetRepo.findOne({
      where: { id },
      select: ['id', 'title', 'description', 'language', 'username', 'create_time', 'update_time', 'execute', 'private', 'fork_from'],
    });

    if (!snippet || snippet.private) {
      throw new NotFoundException({
        code: 'SNIPPET_NOT_FOUND',
        message: 'Snippet was not found.',
      });
    }

    const [codes, stars, comments] = await Promise.all([
      codeRepo.find({
        where: { snippet: id },
        select: ['id', 'filename', 'order', 'execute', 'command', 'create_time', 'update_time'],
        order: { order: 'ASC' },
      }),
      favRepo.count({ where: { snippet: id } }),
      commentRepo.count({ where: { snippet: id } }),
    ]);

    return {
      snippet,
      files: codes,
      stats: {
        stars,
        comments,
      },
    };
  }

  async getEmbed(id: string) {
    const data = await this.getSnippet(id);
    return {
      snippet: data.snippet,
      files: data.files,
    };
  }

  private async listSnippets(limit: number) {
    const snippetRepo = this.dataSource.getRepository<SnippetRecord>('Snippet');
    const codeRepo = this.dataSource.getRepository('Code');
    const favRepo = this.dataSource.getRepository('Fav');
    const commentRepo = this.dataSource.getRepository('Comment');

    const snippets = await snippetRepo.find({
      where: { private: false },
      select: ['id', 'title', 'description', 'language', 'username', 'create_time', 'update_time', 'execute', 'fork_from'],
      order: { create_time: 'DESC' },
      take: limit,
    });

    const ids = snippets.map((item) => item.id);
    if (!ids.length) {
      return [];
    }

    const [codes, favs, comments] = await Promise.all([
      codeRepo.find({
        where: { snippet: In(ids) },
        select: ['id', 'snippet', 'filename', 'order'],
        order: { order: 'ASC' },
      }),
      favRepo.find({
        where: { snippet: In(ids) },
        select: ['snippet'],
      }),
      commentRepo.find({
        where: { snippet: In(ids) },
        select: ['snippet'],
      }),
    ]);

    return snippets.map((snippet) => ({
      ...snippet,
      files: codes.filter((item) => item.snippet === snippet.id),
      stats: {
        stars: favs.filter((item) => item.snippet === snippet.id).length,
        comments: comments.filter((item) => item.snippet === snippet.id).length,
      },
    }));
  }
}
