/**
 * Transforms data for API requests from the View
 *
 * RequestViewModel => mapRequest => RequestApiModel => API =>
 * API => ResponseApiModel => mapResponse => ResponseViewModel
 */
export interface DataTransformer {

    /**
     * Maps RequestViewModel to RequestApiModel
     *
     * @param requestViewModel
     */
    mapRequest?(...requestViewModel: any): any;

    /**
     * Maps ResponseApiModel to ResponseViewModel
     * @param response
     */
    mapResponse?(...response: any): any;
}
