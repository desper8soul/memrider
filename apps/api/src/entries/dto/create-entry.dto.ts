import { IsString, MinLength } from 'class-validator';

export class CreateEntryDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
