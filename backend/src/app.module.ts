import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StoriesModule } from './stories/stories.module';
import { NarrationsModule } from './narrations/narrations.module';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DatabaseModule,
        AuthModule,
        StoriesModule,
        NarrationsModule,
        AiModule,
        SuggestionsModule,
    ],
})
export class AppModule { }
