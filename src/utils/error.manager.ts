import { HttpException, HttpStatus } from "@nestjs/common"


/**
 * It takes an object with two properties, type and message, and then uses the super function to call
 * the constructor function of the parent class, Error, and pass it a string that is the concatenation
 * of the type and message properties
 * @class
 * @extends Error
 */
export class ErrorManager extends Error {
    /**
     * The constructor function takes an object with two properties, type and message, and then uses
     * the super function to call the constructor function of the parent class, Error, and pass it a
     * string that is the concatenation of the type and message properties
     * @param  - { type: keyof typeof HttpStatus, message: string }
     */
    constructor ( { type, message }: { type: keyof typeof HttpStatus, message: string } ) {
        super( `${ type } :: ${ message }` )
    }

    /**
     * It takes a string, splits it on the double colon, and then throws an error with the first part
     * of the string as the error message and the second part as the error code
     * @param {string} message - string - The message to be displayed to the user.
     */
    public static createSignatureError ( message: string ) {
        const name = message.split( " :: " ).at( 0 )

        if ( name ) throw new HttpException( message, HttpStatus[ name ] )
        else throw new HttpException( message, HttpStatus.INTERNAL_SERVER_ERROR )
    }
}