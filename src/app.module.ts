import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { ChatdbModule } from './chatdb/chatdb.module';
import { WechatModule } from './wechat/wechat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env', '.env.local', '.env.production']
          : ['.env', '.env.local', '.env.development'],
    }),
    GptModule,
    ChatdbModule,
    WechatModule,
    PassportModule.register({ defaultStrategy: 'local', session: true }),
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
          logging: process.env.NODE_ENV !== 'production',
          // change this for production
          synchronize: process.env.NODE_ENV !== 'production',
          migrations: ['dist/db/migrations/*.js'],
          migrationsRun: process.env.NODE_ENV === 'production',
        };
      },
      inject: [ConfigService],
    }),
    TokenModule,
    AuthModule,
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
