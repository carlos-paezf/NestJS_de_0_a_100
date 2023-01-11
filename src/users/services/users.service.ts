import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { ErrorManager } from '../../utils/error.manager'
import { UserDTO, UserUpdateDTO } from '../dtos/user.dto'
import { UserEntity } from '../entities/user.entity'


/**
 * It's a service that provides methods for interacting with the database
 * @class 
 */
@Injectable()
export class UsersService {
    constructor ( @InjectRepository( UserEntity ) private readonly _userRepository: Repository<UserEntity> ) { }

    /**
     * It returns a promise that resolves to an object with two properties: count and users
     * @returns { count: number, users: UserEntity[] }
     */
    public async findUsers (): Promise<{ count: number, users: UserEntity[] }> {
        try {
            const { 0: users, 1: count }: [ UserEntity[], number ] = await this._userRepository.findAndCount()
            if ( !count ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se encontraron resultados'
                } )
            }
            return { count, users }
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }

    /**
     * It returns a user entity from the database by id
     * @param {string} id - string - The id of the user we want to find
     * @returns A user object
     */
    public async findUserById ( id: string ): Promise<UserEntity> {
        try {
            const user: UserEntity = await this._userRepository
                .createQueryBuilder( 'user' )
                .where( { id } )
                .getOne()

            if ( !user ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se encontraron resultados'
                } )
            }
            return user
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }

    /**
     * It takes a UserDTO object, saves it to the database, and returns a UserEntity object
     * @param {UserDTO} body - UserDTO
     * @returns The user that was created.
     */
    public async createUser ( body: UserDTO ): Promise<UserEntity> {
        try {
            const user: UserEntity = await this._userRepository.save( body )
            if ( !user ) {
                throw new ErrorManager( {
                    type: 'BAD_REQUEST',
                    message: 'No se aplicaron los cambios'
                } )
            }
            return user
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message )
        }
    }

    /**
     * It takes in an id and a body, and returns a promise of either an UpdateResult or null
     * @param {string} id - string - The id of the user you want to update
     * @param {UserUpdateDTO} body - UserUpdateDTO
     * @returns The result of the update operation.
     */
    public async updateUser ( id: string, body: UserUpdateDTO ): Promise<UpdateResult> {
        try {
            const result: UpdateResult = await this._userRepository.update( id, body )
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
     * It deletes a user from the database.
     * @param {string} id - string - The id of the user to be deleted
     * @returns The result of the delete operation.
     */
    public async deleteUser ( id: string ): Promise<DeleteResult> {
        try {
            const result: DeleteResult = await this._userRepository.delete( id )
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
