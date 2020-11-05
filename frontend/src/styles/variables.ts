// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const customConstants = {
    headerHeight: 48,
    collapsedLeftNavigationWidth: 48,
    expandedLeftNavigationWidth: 230
};

export const GENERAL_COLORS = {
    goodColorLight: '#87BD87',
    badColorLight: '#E36772',
    badDark: '#D83B01',
    goodDark: '#107C10',
};

/**
 * COLORS - represents the map to scss colors
 */
export const COLORS = {
    neutralPrimary: '#323130',
    neutralLight: '#EDEBE9',
    goodColor: '#107C10',
    badColor: '#D83B01',

    pieChart: {
        badColor: GENERAL_COLORS.badColorLight,
        goodColor: '#107C10',
        watchColor: '#8A8886'
    },
    riskScoreDistributionPieChart: {
        green: '#1B5E20',
        lightGreen: '#107C10',
        lime: '#50AF43',
        yellow: '#F5BB41',
        orange: '#F19837',
        orangeHot: '#EE6F2D',
        pink: '#FC7572',
        pinkHot: '#EC433F',
        red: '#CD0000',
        redDark: '#A31515'
    },
    barChart: {
        good: GENERAL_COLORS.goodColorLight,
        overturnedGood: '#DFF6DD',
        bad: GENERAL_COLORS.badColorLight,
        overturnedBad: '#FAC3C8'
    },
    demandSupplyCharts: {
        remaining: '#BF82F1',
        reviewed: '#2B88D8',
        received: '#FF9314',
        released: '#605E5C'
    },
    queueRiskScoreDistributionChart: {
        watched: '#FFCB19',
        good: GENERAL_COLORS.goodDark,
        bad: GENERAL_COLORS.badDark,
        goodLight: GENERAL_COLORS.goodColorLight,
        badLight: GENERAL_COLORS.badColorLight,
    }
};
