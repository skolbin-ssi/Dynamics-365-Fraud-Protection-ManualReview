// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../data-transformer';
import { GetStaticFilterFieldsResponse } from '../../api-services/settings-api-service/api-models';
import { FilterField } from '../../../models/filter/filter-field';
import { FilterFieldDto } from '../../api-services/models/settings';

export class GetFilterFieldTransformer implements DataTransformer {
    mapResponse(
        getStaticFilterFieldsResponse: GetStaticFilterFieldsResponse
    ): FilterField[] {
        return getStaticFilterFieldsResponse.map(this.mapSingleFilterField.bind(this));
    }

    private mapSingleFilterField(fieldDto: FilterFieldDto): FilterField {
        return new FilterField().fromDto(fieldDto);
    }
}
