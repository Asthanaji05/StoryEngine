import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // CORS configuration
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL,
        ].filter(Boolean) as string[],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });

    // Diagnostic Middleware
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
            const auth = req.headers.authorization;
            console.log(`[Diagnostic] ${req.method} ${req.path}`);
            console.log('Authorization Header:', auth ? 'Present' : 'MISSING');
            if (auth?.startsWith('Bearer ')) {
                const token = auth.split(' ')[1];
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                        console.log('Token Header:', JSON.stringify(header));
                        console.log('Token Payload Subject (sub):', payload.sub);
                        console.log('Token Payload Audience (aud):', payload.aud);
                        console.log('Token Payload Issuer (iss):', payload.iss);
                    }
                } catch (e) {
                    console.log('Token decoding failed:', e.message);
                }
            }
        }
        next();
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Story Engine Backend is running on: http://localhost:${port}/api`);
}

bootstrap();
