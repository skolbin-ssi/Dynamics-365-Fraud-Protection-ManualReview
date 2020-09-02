function isMatchRegexp(str, pattern) {
    let regex = RegExp(pattern);
    return regex.test(str);
}