// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { stringToKebabCase } from './string-to-kebab-case';

describe('patterns.stringToKebabcase', () => {
    const regString = 'test case';
    const kebabString = 'test-case';
    const uppercaseString = 'TEST CASE';

    it('Converts regular string to kebabcase', () => {
        expect(stringToKebabCase(regString)).toMatch(kebabString);
    });

    it('Converts uppercase string to kebabcase', () => {
        expect(stringToKebabCase(uppercaseString)).toMatch(kebabString);
    });
});
