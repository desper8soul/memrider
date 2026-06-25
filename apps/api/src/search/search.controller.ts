import { Body, Controller, Post } from '@nestjs/common';
import { SearchQuerySchema, type SearchQueryInput } from '@memrider/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SearchService } from '@memrider/journal';
import { CurrentUser, type AuthenticatedUser } from '@memrider/auth';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async query(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(SearchQuerySchema)) body: SearchQueryInput,
  ) {
    return this.searchService.search(user.id, body.query, body.topK ?? 5);
  }
}
