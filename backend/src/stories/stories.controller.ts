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
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
    constructor(private storiesService: StoriesService) { }

    @Post()
    async create(@Request() req, @Body() body: { title?: string }) {
        return this.storiesService.createStory(req.user.sub, body.title);
    }

    @Get()
    async getUserStories(@Request() req) {
        return this.storiesService.getUserStories(req.user.sub);
    }

    @Get(':id')
    async getStory(@Request() req, @Param('id') id: string) {
        return this.storiesService.getStoryById(id, req.user.sub);
    }

    @Patch(':id')
    async updateStory(
        @Request() req,
        @Param('id') id: string,
        @Body() updates: any,
    ) {
        return this.storiesService.updateStory(id, req.user.sub, updates);
    }

    @Delete(':id')
    async deleteStory(@Request() req, @Param('id') id: string) {
        return this.storiesService.deleteStory(id, req.user.sub);
    }
}
