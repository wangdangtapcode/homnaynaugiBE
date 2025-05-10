import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hôm nay nấu gì API')
    .setDescription('API cho ứng dụng gợi ý món ăn')
    .setVersion('1.0')
    .addTag('Authentication', 'Xác thực người dùng')
    .addTag('Accounts', 'Quản lý tài khoản')
    .addTag('User Profiles', 'Quản lý thông tin người dùng')
    .addTag('Roles', 'Quản lý vai trò')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  console.log(`📚 Swagger UI đang chạy tại http://localhost:${port}/api`);
}
bootstrap();
