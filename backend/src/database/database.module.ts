import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: SUPABASE_CLIENT,
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL');
                const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

                if (!supabaseUrl) {
                    throw new Error('SUPABASE_URL is missing in .env');
                }
                if (!supabaseKey) {
                    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in .env');
                }

                return createClient(supabaseUrl, supabaseKey);
            },
            inject: [ConfigService],
        },
    ],
    exports: [SUPABASE_CLIENT],
})
export class DatabaseModule { }
