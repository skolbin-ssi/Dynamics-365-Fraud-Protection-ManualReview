/**
 * Convert meters to miles
 * @param meters
 */
export function getMiles(meters?: number | null) {
    if (!meters) {
        return null;
    }

    return Number(meters * 0.000621371192).toFixed(0);
}
