import { Controller, Get, Param } from '@nestjs/common';

import { SnippetService } from './snippet.service';

@Controller('api/v1/snippets')
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Get('home')
  getHome() {
    return this.snippetService.getHomeFeed();
  }

  @Get('explore')
  getExplore() {
    return this.snippetService.getExploreFeed();
  }

  @Get(':id')
  getSnippet(@Param('id') id: string) {
    return this.snippetService.getSnippet(id);
  }

  @Get(':id/embed')
  getEmbed(@Param('id') id: string) {
    return this.snippetService.getEmbed(id);
  }
}
