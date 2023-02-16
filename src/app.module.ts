import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceConfig } from './config/data.source'
import { ProjectsModule } from './projects/projects.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';


@Module( {
    imports: [
        ConfigModule.forRoot( {
            envFilePath: [ `.${ String( process.env.NODE_ENV ).trim() }.env`, `.env` ],
            isGlobal: true,
        } ),
        TypeOrmModule.forRoot( { ...DataSourceConfig } ),
        UsersModule,
        ProjectsModule,
        AuthModule
    ],
} )
export class AppModule { }
