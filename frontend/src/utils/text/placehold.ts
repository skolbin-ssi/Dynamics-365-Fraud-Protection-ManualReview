export function placeHold(value: any, placeholder: any = '-') {
    if (typeof value === 'undefined') {
        return placeholder;
    }

    return value;
}
