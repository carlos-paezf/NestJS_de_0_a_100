import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersModule } from '../providers/providers.module';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from './entities/user.entity';
import { UsersProjectsEntity } from './entities/usersProjects.entity';
import { UsersService } from './services/users.service';

@Global()
@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            UserEntity, UsersProjectsEntity
        ] ),
        ProvidersModule
    ],
    providers: [ UsersService ],
    controllers: [ UsersController ],
    exports: [ UsersService ]
} )
export class UsersModule { }
