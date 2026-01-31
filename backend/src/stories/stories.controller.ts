import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("stories")
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  async create(@Request() req, @Body() body: { title?: string }) {
    return this.storiesService.createStory(req.user.sub, body.title);
  }

  @Get()
  async getUserStories(@Request() req) {
    return this.storiesService.getUserStories(req.user.sub);
  }

  @Get(":id")
  async getStory(@Request() req, @Param("id") id: string) {
    return this.storiesService.getStoryById(id, req.user.sub);
  }

  @Patch(":id")
  async updateStory(
    @Request() req,
    @Param("id") id: string,
    @Body() updates: any,
  ) {
    return this.storiesService.updateStory(id, req.user.sub, updates);
  }

  @Delete(":id")
  async deleteStory(@Request() req, @Param("id") id: string) {
    return this.storiesService.deleteStory(id, req.user.sub);
  }

  @Get(":id/brainstorm")
  async brainstorm(@Request() req, @Param("id") id: string) {
    return this.storiesService.brainstormStoryOptions(id, req.user.sub);
  }

  @Get(":id/elements")
  async getElements(@Request() req, @Param("id") id: string) {
    return this.storiesService.getStoryElements(id, req.user.sub);
  }

  @Get(":id/timeline")
  async getTimeline(@Request() req, @Param("id") id: string) {
    return this.storiesService.getStoryTimeline(id, req.user.sub);
  }

  @Get(":id/connections")
  async getConnections(@Request() req, @Param("id") id: string) {
    return this.storiesService.getStoryConnections(id, req.user.sub);
  }

  @Get(":id/mentions")
  async getMentions(@Request() req, @Param("id") id: string) {
    return this.storiesService.getStoryMentions(id, req.user.sub);
  }

  @Patch(":id/elements/:elementId")
  async updateElement(
    @Request() req,
    @Param("id") id: string,
    @Param("elementId") elementId: string,
    @Body() updates: any,
  ) {
    return this.storiesService.updateStoryElement(
      id,
      elementId,
      req.user.sub,
      updates,
    );
  }

  @Delete(":id/elements/:elementId")
  async deleteElement(
    @Request() req,
    @Param("id") id: string,
    @Param("elementId") elementId: string,
  ) {
    return this.storiesService.deleteStoryElement(id, elementId, req.user.sub);
  }

  @Patch(":id/timeline/:momentId")
  async updateMoment(
    @Request() req,
    @Param("id") id: string,
    @Param("momentId") momentId: string,
    @Body() updates: any,
  ) {
    return this.storiesService.updateStoryMoment(
      id,
      momentId,
      req.user.sub,
      updates,
    );
  }

  @Delete(":id/timeline/:momentId")
  async deleteMoment(
    @Request() req,
    @Param("id") id: string,
    @Param("momentId") momentId: string,
  ) {
    return this.storiesService.deleteStoryMoment(id, momentId, req.user.sub);
  }

  @Post(":id/interview/:characterId")
  async interviewCharacter(
    @Request() req,
    @Param("id") id: string,
    @Param("characterId") characterId: string,
    @Body() body: { prompt: string },
  ) {
    return this.storiesService.interviewStoryCharacter(
      id,
      characterId,
      req.user.sub,
      body.prompt,
    );
  }
}
