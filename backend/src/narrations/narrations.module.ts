import { Module } from '@nestjs/common';
import { NarrationsController } from './narrations.controller';
import { NarrationsService } from './narrations.service';
import { AiModule } from '../ai/ai.module';
import { StoriesModule } from '../stories/stories.module';

@Module({
    imports: [AiModule, StoriesModule],
    controllers: [NarrationsController],
    providers: [NarrationsService],
})
export class NarrationsModule { }
