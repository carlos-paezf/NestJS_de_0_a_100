import { Column, Entity, OneToMany } from "typeorm"
import { BaseEntity } from '../../config/base.entity'
import { ROLES } from "../../constants"
import { IUser } from "../../interface/user.interface"
import { UsersProjectsEntity } from './usersProjects.entity'


/**
 * The UserEntity class is a TypeScript class that extends the BaseEntity class 
 * and implements the IUser interface 
 * @class
 * @extends BaseEntity
 * @implements {IUser}
 * */
@Entity( { name: 'users' } )
export class UserEntity extends BaseEntity implements IUser {
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number

    @Column( { unique: true } )
    email: string

    @Column( { unique: true } )
    username: string

    @Column()
    password: string

    @Column( {
        type: 'enum',
        enum: ROLES
    } )
    role: ROLES

    @OneToMany( () => UsersProjectsEntity, ( userProject ) => userProject.user )
    projectsIncludes: UsersProjectsEntity[]
}