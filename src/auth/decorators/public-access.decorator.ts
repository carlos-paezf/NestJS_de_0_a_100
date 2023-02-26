import { SetMetadata } from '@nestjs/common'
import { PUBLIC_KEY } from 'src/constants/key-decorators'

/**
 * It sets a metadata key on the decorated function, which is used by the authorization middleware to
 * determine whether or not the function is public
 */
export const PublicAccess = () => SetMetadata( PUBLIC_KEY, true )
