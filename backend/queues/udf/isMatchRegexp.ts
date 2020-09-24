// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

function isMatchRegexp(str, pattern) {
    let regex = RegExp(pattern);
    return regex.test(str);
}