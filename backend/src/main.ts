import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

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
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
  });

  // Diagnostic Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      const auth = req.headers.authorization;
      if (auth?.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const header = JSON.parse(
              Buffer.from(parts[0], "base64").toString(),
            );
            const payload = JSON.parse(
              Buffer.from(parts[1], "base64").toString(),
            );
          }
        } catch (e) {}
      }
    }
    next();
  });

  // Global prefix for all routes
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
