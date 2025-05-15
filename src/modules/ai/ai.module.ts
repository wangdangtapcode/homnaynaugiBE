import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IngredientModule } from '../ingredient/ingredient.module';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // Giới hạn kích thước file: 10MB
      },
    }),
    IngredientModule
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {} 