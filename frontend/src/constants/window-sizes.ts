export enum SIZES {
    SM = 'sm',
    M = 'm',
    L = 'l',
    LL = 'll',
    XL = 'xl',
    NS = 'ns',
    QH_CUSTOM = 'queue-header-custom'
}

export const SIZE_RANGES = {
    [SIZES.SM]: [0, 639],
    [SIZES.M]: [640, 1023],
    [SIZES.L]: [1024, 1250],
    [SIZES.LL]: [1250, 1380],
    [SIZES.XL]: [1250, Number.POSITIVE_INFINITY],
    [SIZES.NS]: [640, Number.POSITIVE_INFINITY],
    [SIZES.QH_CUSTOM]: [0, 1430]
};
