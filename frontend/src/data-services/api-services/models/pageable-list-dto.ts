export interface PageableListDTO<T> {
    continuationToken: string;
    size: number;
    values: T[];
}
