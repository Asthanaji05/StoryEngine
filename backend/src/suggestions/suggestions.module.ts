import { Module } from "@nestjs/common";
import { SuggestionsService } from "./suggestions.service";
import { SuggestionsController } from "./suggestions.controller";
import { StoriesModule } from "../stories/stories.module";
import { DatabaseModule } from "../database/database.module";

import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [StoriesModule, DatabaseModule, GamificationModule],
  providers: [SuggestionsService],
  controllers: [SuggestionsController],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
