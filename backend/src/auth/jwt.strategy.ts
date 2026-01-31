import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

        console.log('--- AUTH DIAGNOSTICS ---');
        console.log('JWKS URL:', jwksUrl);
        console.log('--- END DIAGNOSTICS ---');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUrl,
            }),
            algorithms: ['ES256'],
            audience: 'authenticated',
            issuer: `${supabaseUrl}/auth/v1`,
        });
    }

    async validate(payload: any) {
        console.log('Validating JWT payload:', payload.sub ? 'Valid Sub found' : 'No Sub found');
        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token payload: missing sub');
        }
        return { sub: payload.sub, email: payload.email };
    }
}
