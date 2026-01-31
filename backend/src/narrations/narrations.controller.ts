import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NarrationsService } from "./narrations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("stories/:storyId/narrations")
@UseGuards(JwtAuthGuard)
export class NarrationsController {
  constructor(private narrationsService: NarrationsService) {}

  @Post()
  async addNarration(
    @Request() req,
    @Param("storyId") storyId: string,
    @Body() body: { content: string },
  ) {
    return this.narrationsService.addNarration(
      storyId,
      req.user.sub,
      body.content,
    );
  }

  @Get()
  async getNarrations(@Request() req, @Param("storyId") storyId: string) {
    return this.narrationsService.getNarrations(storyId, req.user.sub);
  }
}
