// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Search and return a value from the object by provided string path to that value.
 *
 * Example:
 *      let obj = { 'a': [ { 'b': { 'c': 3 } } ] };
 *      let value = getDeepValue(obj, [a.[0].b.c), 'N/A')
 *      Output: console.log(value) ==> 3
 *
 * @param obj - searchable object;
 * @param path - string path to the field, to retrieve the value from;
 * @param placeHolder - placeholder for the values, in case of value cannot be found;
 * @returns - value from the last search string path;
 */
export function getDeepValue<T>(obj: T, path: string, placeHolder: string): string {
    function stringToPath(searchPath: string) {
        const output: string[] = [];

        searchPath.split('.').forEach(item => {
            item.split(/\[([^}]+)\]/g).forEach(key => {
                if (key.length > 0) {
                    output.push(key);
                }
            });
        });

        return output;
    }

    if (!path.length) {
        return placeHolder;
    }

    const pathArray = stringToPath(path);

    // Cache the current object
    let current: any = obj;

    for (let i = 0; i < pathArray.length; i += 1) {
        if (!current[pathArray[i]]) return placeHolder;
        current = current[pathArray[i]];
    }

    return current;
}
