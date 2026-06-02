import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { assertConfigured } from '../common/utils/setup';

@Injectable()
export class AccountService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly runtimeConfigService: RuntimeConfigService,
  ) {}

  async getSummary(username: string) {
    assertConfigured(this.runtimeConfigService);

    const accountRepo = this.dataSource.getRepository('Account');
    const snippetRepo = this.dataSource.getRepository('Snippet');
    const favTable = this.runtimeConfigService.getTableName('fav');
    const commentTable = this.runtimeConfigService.getTableName('comment');

    const account = await accountRepo.findOne({
      where: { username },
      select: ['id', 'username', 'nickname', 'email', 'company', 'location', 'url', 'motto', 'avatar', 'verify', 'create_time', 'lastlogin'],
    });

    if (!account) {
      throw new NotFoundException({
        code: 'ACCOUNT_NOT_FOUND',
        message: 'User was not found.',
      });
    }

    const snippets = await snippetRepo.count({
      where: {
        username,
        private: false,
      },
    });

    const [stars, comments] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(fav.id)', 'total')
        .from(favTable, 'fav')
        .innerJoin(
          this.runtimeConfigService.getTableName('snippet'),
          'snippet',
          'snippet.id = fav.snippet AND snippet.username = :username',
          { username },
        )
        .getRawOne<{ total: string }>(),
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(comment.id)', 'total')
        .from(commentTable, 'comment')
        .innerJoin(
          this.runtimeConfigService.getTableName('snippet'),
          'snippet',
          'snippet.id = comment.snippet AND snippet.username = :username',
          { username },
        )
        .getRawOne<{ total: string }>(),
    ]);

    return {
      profile: account,
      stats: {
        snippets,
        stars: Number(stars?.total || 0),
        comments: Number(comments?.total || 0),
      },
    };
  }
}
