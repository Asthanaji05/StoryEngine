import { Module } from "@nestjs/common";
import { GamificationService } from "./gamification.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
