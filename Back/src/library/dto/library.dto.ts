import { ArrayMaxSize, ArrayUnique, IsArray, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { ReadingStatus } from '../entities/user-book.entity';

export class CreateShelfDto { @IsString() @MaxLength(80) name: string; @IsOptional() @IsString() @MaxLength(280) description?: string; }
export class AddBookDto { @IsString() googleVolumeId: string; @IsEnum(ReadingStatus) status: ReadingStatus; @IsArray() @ArrayUnique() @ArrayMaxSize(30) @IsUUID('4', { each: true }) shelfIds: string[]; }
export class UpdateStatusDto { @IsEnum(ReadingStatus) status: ReadingStatus; }
export class UpdateBookDetailsDto {
  @IsOptional() @IsInt() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsIn(['percentage', 'pages', 'minutes']) readingMode?: string;
  @IsOptional() @IsInt() @Min(0) readingValue?: number;
  @IsOptional() @IsDateString() readDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) readingNote?: string;
}
export class ShelfAssignmentDto { @IsUUID() shelfId: string; }
export class LibraryQueryDto { @IsOptional() @IsEnum(ReadingStatus) status?: ReadingStatus; @IsOptional() @IsUUID() shelfId?: string; }
