import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
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
     * It returns a promise of an array of UserEntity objects
     * @returns An array of UserEntity objects
     */
    public async findUsers (): Promise<UserEntity[]> {
        try {
            return await this._userRepository.find()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It returns a user entity from the database by id
     * @param {string} id - string - The id of the user we want to find
     * @returns A user object
     */
    public async findUserById ( id: string ): Promise<UserEntity> {
        try {
            return await this._userRepository
                .createQueryBuilder( 'user' )
                .where( { id } )
                .getOne()
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It takes a UserDTO object, saves it to the database, and returns a UserEntity object
     * @param {UserDTO} body - UserDTO
     * @returns The user that was created.
     */
    public async createUser ( body: UserDTO ): Promise<UserEntity> {
        try {
            return await this._userRepository.save( body )
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It takes in an id and a body, and returns a promise of either an UpdateResult or null
     * @param {string} id - string - The id of the user you want to update
     * @param {UserUpdateDTO} body - UserUpdateDTO
     * @returns The result of the update operation.
     */
    public async updateUser ( id: string, body: UserUpdateDTO ): Promise<UpdateResult | null> {
        try {
            const result: UpdateResult = await this._userRepository.update( id, body )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }

    /**
     * It deletes a user from the database.
     * @param {string} id - string - The id of the user to be deleted
     * @returns The result of the delete operation.
     */
    public async deleteUser ( id: string ): Promise<DeleteResult | null> {
        try {
            const result: DeleteResult = await this._userRepository.delete( id )
            return ( !result.affected )
                ? null
                : result
        } catch ( error ) {
            throw new Error( error )
        }
    }
}
