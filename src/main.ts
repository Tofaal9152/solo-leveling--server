import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtGuard } from './common/guard';
import { corsConfig } from './config/cors.config';
import { validationPipeConfig } from './config/validation.pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply Global Pipes
  app.useGlobalPipes(validationPipeConfig);

  // Apply Global Guards
  const reflector = new Reflector();
  app.useGlobalGuards(new JwtGuard(reflector));
 
  // Enable CORS
  app.enableCors(corsConfig);

  await app.listen(process.env.PORT);
}
bootstrap().catch((err) => {
  if (err instanceof Error) {
    console.error('Error during application bootstrap:', err.message);
  }
});
