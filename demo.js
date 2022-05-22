import { generatePalette } from "./index.js";
import Colour, * as matisse from "matisse";

// const pixels = [
//     new Colour("#67598B"),
//     new Colour("#6F4048"),
//     new Colour("#9C81B9"),
//     new Colour("#886381"),
//     new Colour("#111024"),
//     new Colour("#E7A3B9"),
//     new Colour("#4C252A"),
//     new Colour("#E48D85"),
// ]




import getPixels from "get-pixels";

getPixels("drake.png", function (err, image) {
    const shape = [...image.shape];
    const width = shape[0], height = shape[1], numChannels = shape[2];
    let reds, greens, blues, alphas;

    if (numChannels >= 3) {
        reds = image.pick(null, null, 0);
        greens = image.pick(null, null, 1);
        blues = image.pick(null, null, 2);

        if (numChannels == 4) {
            alphas = image.pick(null, null, 3);
        }
    }

    const pixels = pixelsFromChannels(reds, greens, blues, alphas, width, height);
    const k = 3;
    const palette = generatePalette(pixels, k);
    palette.forEach(colour => console.log(colour.toHEX()));
});

function pixelsFromChannels(reds, greens, blues, alphas, width, height) {
    const pixels = [];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let red = reds.get(i, j);
            let green = greens.get(i, j);
            let blue = blues.get(i, j);
            let alpha = 1.00;

            if (alphas) {
                alpha = alphas.get(i, j) / 255;
            }

            const pixel = Colour.RGB(red, green, blue, alpha);
            pixels.push(pixel);
        }
    }
    return pixels;
}