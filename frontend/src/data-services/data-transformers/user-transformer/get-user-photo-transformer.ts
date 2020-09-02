import { GetUserPhotoResponse } from '../../api-services/user-api-service/api-models';
import { ApiServiceResponse } from '../../base-api-service';
import { DataTransformer } from '../../data-transformer';

export class GetUserPhotoTransformer implements DataTransformer {
    mapResponse(
        response: ApiServiceResponse<GetUserPhotoResponse>
    ): string {
        try {
            const type = response.headers['content-type'] || 'image/jpeg';
            const base64String = Buffer.from(response.data, 'binary').toString('base64');

            return `data:${type};base64,${base64String}`;
        } catch (e) {
            return '';
        }
    }
}
