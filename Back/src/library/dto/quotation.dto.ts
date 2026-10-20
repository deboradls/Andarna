import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class SaveQuotationDto {
  @IsUUID() userBookId: string;
  @IsString() @MinLength(1) @MaxLength(5000) text: string;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) page?: number | null;
}
