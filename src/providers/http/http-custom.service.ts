import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class HttpCustomService {
    constructor ( private readonly _httpService: HttpService ) { }

    /**
     * This function makes an HTTP GET request to the Rick and Morty API, and returns the data from
     * the response
     * @returns An array of objects.
     */
    async apiFindAll () {
        try {
            const response = await firstValueFrom(
                this._httpService.get( 'https://rickandmortyapi.com/api/character' )
            );

            return response.data;
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }
}
