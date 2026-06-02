import { Body, Controller, Post } from '@nestjs/common';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async query(@Body() dto: SearchDto) {
    return this.searchService.search(dto.query, dto.topK ?? 5);
  }
}
