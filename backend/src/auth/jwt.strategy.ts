import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || configService.get<string>('JWT_SECRET'),
            algorithms: ['HS256'], // Supabase uses HS256
        });
    }

    async validate(payload: any) {
        // Supabase JWT payload contains 'sub' (user_id) and 'email'
        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return { sub: payload.sub, email: payload.email };
    }
}
