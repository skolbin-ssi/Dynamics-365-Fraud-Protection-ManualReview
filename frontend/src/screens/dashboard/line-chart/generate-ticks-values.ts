import { Serie } from '@nivo/line';

/**
 * Returns calculated number of tick values for the chart
 * depending on ratio between data length and maximum ticks count
 *
 * @param data
 * @param maxTicksCount - maximum tick values count
 */
export function generateTicksValues(data: Serie[], maxTicksCount = 30) {
    const serieData = data[0].data;
    const dataLength = serieData.length;

    const sirieDatumValues = serieData.map(datum => datum.x as Date);
    const divisor = Math.ceil(dataLength / maxTicksCount);

    return sirieDatumValues.reduce((accum, next, currentIndex) => {
        if (currentIndex % divisor === 0) {
            return [...accum, next];
        }

        return [...accum];
    }, [] as Array<Date>);
}
