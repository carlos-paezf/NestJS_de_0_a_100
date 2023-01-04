import { Column, Entity, ManyToOne } from "typeorm"
import { BaseEntity } from "../../config/base.entity"
import { ACCESS_LEVEL } from "../../constants"
import { ProjectEntity } from "../../projects/entities/project.entity"
import { UserEntity } from "./user.entity"


@Entity( { name: 'users_projects' } )
export class UsersProjectsEntity extends BaseEntity {
    @Column( {
        type: 'enum',
        enum: ACCESS_LEVEL
    } )
    accessLevel: ACCESS_LEVEL

    @ManyToOne( () => UserEntity, ( user ) => user.projectsIncludes )
    user: UserEntity

    @ManyToOne( () => ProjectEntity, ( project ) => project.usersIncludes )
    project: ProjectEntity
}