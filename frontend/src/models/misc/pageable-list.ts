export interface PageableList<T> {
    data: T[],
    canLoadMore: boolean;
}
