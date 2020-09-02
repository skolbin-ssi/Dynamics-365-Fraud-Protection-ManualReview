import queryString, { ParsedQuery } from 'query-string';

/**
 * Maps keys from specified type to booleans types
 */
type BooleanReadSearchFields<T> = {
    [P in keyof T]?: T[P] | boolean
};

/**
 * Describes URL search query (a.k.a. available search params into URL e.g. ?selectedIds='')
 */
interface ReadSearchQueryFields extends ParsedQuery {
    selectedIds: string[];
    rating?: string;
    aggregation?: string;
    overturnedIds?: string[];
    overturnedRating?: string;
    overturnedAggregation?: string;
    from?: string;
    to?: string;
}

/**
 * Returns specified field from the URL search available in ReadSearchQueryFields interface
 * @param search - react router history search
 * @param fields - fields from URL (e.g.: fields.selectedIds ) which to read and return
 */
export function readUrlSearchQueryOptions(search: string, fields: BooleanReadSearchFields<ReadSearchQueryFields>): ReadSearchQueryFields {
    const searchQueryFields = {
        selectedIds: [],
        rating: '',
        aggregation: '',
        overturnedIds: [],
        overturnedRating: '',
        overturnedAggregation: ''
    } as ReadSearchQueryFields;

    if (fields.selectedIds) {
        const parsedQuery = queryString
            .parse(search, { arrayFormat: 'comma' }) as ReadSearchQueryFields;

        if (parsedQuery.selectedIds) {
            searchQueryFields.selectedIds = Array.isArray(parsedQuery.selectedIds)
                ? parsedQuery!.selectedIds
                : [parsedQuery.selectedIds];
        }
    }

    if (fields.rating) {
        const parsedQuery = queryString
            .parse(search) as ReadSearchQueryFields;

        if (parsedQuery.rating) {
            searchQueryFields.rating = parsedQuery.rating;
        }
    }

    if (fields.aggregation) {
        const parsedQuery = queryString
            .parse(search) as ReadSearchQueryFields;

        if (parsedQuery.aggregation) {
            searchQueryFields.aggregation = parsedQuery.aggregation;
        }
    }

    if (fields.overturnedIds) {
        const parsedQuery = queryString
            .parse(search, { arrayFormat: 'comma' }) as ReadSearchQueryFields;

        if (parsedQuery.overturnedIds) {
            searchQueryFields.overturnedIds = Array.isArray(parsedQuery.overturnedIds)
                ? parsedQuery!.overturnedIds
                : [parsedQuery.overturnedIds];
        }
    }

    if (fields.overturnedRating) {
        const parsedQuery = queryString
            .parse(search) as ReadSearchQueryFields;

        if (parsedQuery.overturnedRating) {
            searchQueryFields.overturnedRating = parsedQuery.overturnedRating;
        }
    }

    if (fields.overturnedAggregation) {
        const parsedQuery = queryString
            .parse(search) as ReadSearchQueryFields;

        if (parsedQuery.overturnedAggregation) {
            searchQueryFields.overturnedAggregation = parsedQuery.overturnedAggregation;
        }
    }

    return searchQueryFields;
}

export function stringifyIntoUrlQueryString(fields: Partial<ReadSearchQueryFields>): string {
    let result = '';

    if (fields.selectedIds) {
        const selectedIds = queryString.stringify({ selectedIds: fields.selectedIds }, { arrayFormat: 'comma' });
        result = result.concat(`&${selectedIds}`);
    }

    if (fields.rating) {
        const rating = queryString.stringify({ rating: fields.rating });
        result = result.concat(`&${rating}`);
    }

    if (fields.aggregation) {
        const aggregation = queryString.stringify({ aggregation: fields.aggregation });
        result = result.concat(`&${aggregation}`);
    }

    if (fields.overturnedIds) {
        const overturnedIds = queryString.stringify({ overturnedIds: fields.overturnedIds }, { arrayFormat: 'comma' });
        result = result.concat(`&${overturnedIds}`);
    }

    if (fields.overturnedRating) {
        const overturnedRating = queryString.stringify({ overturnedRating: fields.overturnedRating });
        result = result.concat(`&${overturnedRating}`);
    }

    if (fields.overturnedAggregation) {
        const overturnedAggregation = queryString.stringify({ overturnedAggregation: fields.overturnedAggregation });
        result = result.concat(`&${overturnedAggregation}`);
    }

    return result
        .replace(/^&/, '');
}
