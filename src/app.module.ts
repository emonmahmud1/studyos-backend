import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { NotesModule } from './modules/notes/notes.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { EventsModule } from './modules/events/events.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { PomodoroModule } from './modules/pomodoro/pomodoro.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    NotesModule,
    TasksModule,
    FlashcardsModule,
    EventsModule,
    ResourcesModule,
    PomodoroModule,
    ProfileModule,
    AiModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
