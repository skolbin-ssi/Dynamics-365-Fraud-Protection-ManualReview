/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param {number} r - The red color value
 * @param {number} g - The green color value
 * @param {number} b - The blue color value
 * @return {array} The HSL representation
 */
export function rgbToHsl(r: number, g: number, b: number) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;

    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    let h = 0;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
        s = 0; // achromatic
        h = s;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
            case gg: h = (bb - rr) / d + 2; break;
            case bb: h = (rr - gg) / d + 4; break;
            default: break;
        }

        h /= 6;
    }

    return [h, s, l];
}
