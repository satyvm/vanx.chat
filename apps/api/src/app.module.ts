import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { databaseConfig } from './config/database.config.js';
import { validateEnv } from './config/env.validation.js';
import { redisConfig, RedisConfig } from './config/redis.config.js';

@Module({
  imports: [
    ChatModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
      validate: validateEnv,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.get<RedisConfig>('redis');
        if (!redis) {
          throw new Error('Redis configuration is not available.');
        }
        return { redis };
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
