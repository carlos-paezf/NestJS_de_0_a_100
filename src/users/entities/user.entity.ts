import { IUser } from "src/interface/user.interface"
import { Column, Entity } from "typeorm"
import { BaseEntity } from '../../config/base.entity'

@Entity( { name: 'users' } )
export class UserEntity extends BaseEntity implements IUser {
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number

    @Column()
    email: string

    @Column()
    username: string

    @Column()
    password: string

    @Column()
    role: string
}