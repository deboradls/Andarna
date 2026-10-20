import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveQuotationDto } from './dto/quotation.dto';
import { QuotationsService } from './quotations.service';

type UserRequest = Request & { user: { id: string } };

@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotations: QuotationsService) {}
  @Get() list(@Req() req: UserRequest) { return this.quotations.list(req.user.id); }
  @Post() create(@Req() req: UserRequest, @Body() dto: SaveQuotationDto) { return this.quotations.create(req.user.id, dto); }
  @Patch(':id') update(@Req() req: UserRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SaveQuotationDto) { return this.quotations.update(req.user.id, id, dto); }
  @Delete(':id') remove(@Req() req: UserRequest, @Param('id', ParseUUIDPipe) id: string) { return this.quotations.remove(req.user.id, id); }
}
