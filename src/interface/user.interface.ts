import { ROLES } from "../constants"

/**
 * Defining the interface for the user object. 
 * @interface
 */
export interface IUser {
    firstName: string
    lastName: string
    age: number
    email: string
    username: string
    password: string
    role: ROLES
}