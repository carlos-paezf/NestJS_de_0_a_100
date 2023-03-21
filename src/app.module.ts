import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DataSourceConfig } from './config/data.source';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';


@Module( {
    imports: [
        ConfigModule.forRoot( {
            envFilePath: [ `.${ String( process.env.NODE_ENV ).trim() }.env`, `.env` ],
            isGlobal: true,
        } ),
        TypeOrmModule.forRoot( { ...DataSourceConfig } ),
        UsersModule,
        ProjectsModule,
        AuthModule,
        TasksModule
    ],
} )
export class AppModule { }
