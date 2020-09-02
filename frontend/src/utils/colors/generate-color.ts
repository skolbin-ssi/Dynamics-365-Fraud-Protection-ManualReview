import { digestMessageToHexHash } from '../text';
import { rgbToHsl } from './rgb-to-hsl';
import { hslToRgb } from './hsl-to-rgb';

export async function generateColor(id: string): Promise<string> {
    const first6ofId = id.substr(0, 6);
    let hashOutOfId;

    try {
    // check if string is hexadecimal
        if (!Number.isNaN(Number(`0x${first6ofId}`))) {
        // use as is if hexadecimal
            hashOutOfId = first6ofId;
        } else {
        // if not generate hash of initial string
            hashOutOfId = await digestMessageToHexHash(id);
        }
    } catch (e) {
        hashOutOfId = await digestMessageToHexHash(id);
    }

    const r = parseInt(hashOutOfId.substr(0, 2), 16);
    const g = parseInt(hashOutOfId.substr(2, 2), 16);
    const b = parseInt(hashOutOfId.substr(4, 2), 16);

    const [h,, l] = rgbToHsl(r, g, b);
    // align colors by saturation, so they are aligned in the pallet
    const RGBColors = hslToRgb(h, 0.6, l);
    const hexColor = RGBColors.map(c => c.toString(16).padStart(2, '0')).join('');

    return `#${hexColor}`;
}
