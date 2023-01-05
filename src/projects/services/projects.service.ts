import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm'
import { ProjectDTO, ProjectUpdateDTO } from '../dtos/project.dto'
import { ProjectEntity } from '../entities/project.entity'

@Injectable()
export class ProjectsService {
    constructor ( @InjectRepository( ProjectEntity ) private readonly _projectRepository: Repository<ProjectEntity> ) { }

    /**
     * It returns a promise of an array of ProjectEntity objects
     * @returns An array of ProjectEntity objects
     */
    public async findProjects (): Promise<ProjectEntity[]> {
        try {
            return await this._projectRepository.find()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It returns a project entity from the database by id
     * @param {string} id - string - The id of the project we want to find
     * @returns A project object
     */
    public async findProjectById ( id: string ): Promise<ProjectEntity> {
        try {
            return await this._projectRepository
                .createQueryBuilder( 'project' )
                .where( { id } )
                .getOne()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It takes a ProjectDTO object, saves it to the database, and returns a ProjectEntity object
     * @param {ProjectDTO} body - ProjectDTO
     * @returns The project that was created.
     */
    public async createProject ( body: ProjectDTO ): Promise<ProjectEntity> {
        try {
            return await this._projectRepository.save( body )
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It takes in an id and a body, and returns a promise of either an UpdateResult or null
     * @param {string} id - string - The id of the project you want to update
     * @param {ProjectUpdateDTO} body - ProjectUpdateDTO
     * @returns The result of the update operation.
     */
    public async updateProject ( id: string, body: ProjectUpdateDTO ): Promise<UpdateResult | null> {
        try {
            const result: UpdateResult = await this._projectRepository.update( id, body )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It deletes a project from the database.
     * @param {string} id - string - The id of the project to be deleted
     * @returns The result of the delete operation.
     */
    public async deleteProject ( id: string ): Promise<DeleteResult | null> {
        try {
            const result: DeleteResult = await this._projectRepository.delete( id )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }
}
