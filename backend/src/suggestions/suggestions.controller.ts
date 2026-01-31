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
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuggestionsService } from "./suggestions.service";

@Controller("suggestions")
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get("story/:storyId")
  async getPending(@Request() req, @Param("storyId") storyId: string) {
    return this.suggestionsService.getPendingSuggestions(storyId, req.user.sub);
  }

  @Patch(":id")
  async update(@Request() req, @Param("id") id: string, @Body() data: any) {
    return this.suggestionsService.updateSuggestion(id, req.user.sub, data);
  }

  @Delete(":id")
  async reject(@Request() req, @Param("id") id: string) {
    return this.suggestionsService.rejectSuggestion(id, req.user.sub);
  }

  @Post(":id/confirm")
  async confirm(@Request() req, @Param("id") id: string) {
    return this.suggestionsService.confirmSuggestion(id, req.user.sub);
  }

  @Post("revert/element/:elementId")
  async revertElement(@Request() req, @Param("elementId") elementId: string) {
    return this.suggestionsService.revertElement(elementId, req.user.sub);
  }

  @Post("revert/moment/:momentId")
  async revertMoment(@Request() req, @Param("momentId") momentId: string) {
    return this.suggestionsService.revertMoment(momentId, req.user.sub);
  }
}
