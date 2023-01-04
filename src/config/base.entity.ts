import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"


/**
 * Creating a base entity class that will be used by all other entities. 
 * @class 
 * @abstract
 */
export abstract class BaseEntity {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @CreateDateColumn( {
        type: 'timestamp',
        name: 'created_at'
    } )
    createAt: Date

    @UpdateDateColumn( {
        type: 'timestamp',
        name: 'updated_at'
    } )
    updatedAt: Date
}