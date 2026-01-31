import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { StoriesModule } from '../stories/stories.module';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [StoriesModule, DatabaseModule],
    providers: [SuggestionsService],
    controllers: [SuggestionsController],
    exports: [SuggestionsService],
})
export class SuggestionsModule { }
