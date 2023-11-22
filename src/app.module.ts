import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { ChatdbModule } from './chatdb/chatdb.module';
import { WechatModule } from './wechat/wechat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development.local', '.env.development'],
    }),
    GptModule,
    ChatdbModule,
    WechatModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mariadb',
          host: configService.get('DATABASE_HOST') || 'localhost',
          port: +configService.get('DATABASE_PORT') || 3306,
          username: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PASS'),
          database: configService.get('DATABASE_NAME'),
          entities: [],
          autoLoadEntities: true,
          // change this for production
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
