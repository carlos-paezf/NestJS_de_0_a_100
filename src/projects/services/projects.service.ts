import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { ErrorManager } from '../../utils/error.manager'
import { ProjectDTO, ProjectUpdateDTO } from '../dtos/project.dto'
import { ProjectEntity } from '../entities/project.entity'

@Injectable()
export class ProjectsService {
    constructor ( @InjectRepository( ProjectEntity ) private readonly _projectRepository: Repository<ProjectEntity> ) { }

    /**
     * It returns a promise of an array of ProjectEntity objects
     * @returns An array of ProjectEntity objects
     */
    public async findProjects (): Promise<{ count: number, projects: ProjectEntity[] }> {
        try {
            const { 0: projects, 1: count }: [ ProjectEntity[], number ] = await this._projectRepository.findAndCount()
            if ( !count ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se encontraron resultados'
                } )
            }
            return { count, projects }
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }

    /**
     * It returns a project entity from the database by id
     * @param {string} id - string - The id of the project we want to find
     * @returns A project object
     */
    public async findProjectById ( id: string ): Promise<ProjectEntity> {
        try {
            const project: ProjectEntity = await this._projectRepository
                .createQueryBuilder( 'project' )
                .where( { id } )
                .getOne()
            if ( !project ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se encontraron resultados'
                } )
            }
            return project
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }

    /**
     * It takes a ProjectDTO object, saves it to the database, and returns a ProjectEntity object
     * @param {ProjectDTO} body - ProjectDTO
     * @returns The project that was created.
     */
    public async createProject ( body: ProjectDTO ): Promise<ProjectEntity> {
        try {
            const project: ProjectEntity = await this._projectRepository.save( body )
            if ( !project ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se aplicaron los cambios'
                } )
            }
            return project
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
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
            if ( !result.affected ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se aplicaron los cambios'
                } )
            }
            return result
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
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
            if ( !result.affected ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se aplicaron los cambios'
                } )
            }
            return result
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }
}
