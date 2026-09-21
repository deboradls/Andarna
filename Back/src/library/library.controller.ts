import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddBookDto, CreateShelfDto, LibraryQueryDto, ShelfAssignmentDto, UpdateBookDetailsDto, UpdateStatusDto } from './dto/library.dto';
import { LibraryService } from './library.service';

type RequestUser = Request & { user: { id: string } };
@UseGuards(JwtAuthGuard)
@Controller()
export class LibraryController {
  constructor(private readonly library: LibraryService) {}
  @Get('books/search') search(@Query('q') query: string) { return this.library.search(query || ''); }
  @Get('shelves') shelves(@Req() req: RequestUser) { return this.library.getShelves(req.user.id); }
  @Post('shelves') createShelf(@Req() req: RequestUser, @Body() dto: CreateShelfDto) { return this.library.createShelf(req.user.id, dto); }
  @Get('library') libraryItems(@Req() req: RequestUser, @Query() query: LibraryQueryDto) { return this.library.getLibrary(req.user.id, query); }
  @Post('library') addBook(@Req() req: RequestUser, @Body() dto: AddBookDto) { return this.library.addBook(req.user.id, dto); }
  @Patch('library/:id/status') updateStatus(@Req() req: RequestUser, @Param('id') id: string, @Body() dto: UpdateStatusDto) { return this.library.updateStatus(req.user.id, id, dto.status); }
  @Patch('library/:id') updateDetails(@Req() req: RequestUser, @Param('id') id: string, @Body() dto: UpdateBookDetailsDto) { return this.library.updateDetails(req.user.id, id, dto); }
  @Post('library/:id/shelves') addToShelf(@Req() req: RequestUser, @Param('id') id: string, @Body() dto: ShelfAssignmentDto) { return this.library.addToShelf(req.user.id, id, dto.shelfId); }
  @Delete('library/:id/shelves/:shelfId') removeFromShelf(@Req() req: RequestUser, @Param('id') id: string, @Param('shelfId') shelfId: string) { return this.library.removeFromShelf(req.user.id, id, shelfId); }
}
