import { generatePalette, extractPixels } from "./index.js";
import Colour, * as matisse from "matisse";

const path = "drake.jpeg"
extractPixels(path, (pixels, error) => {
    if (error) {
        console.log(error);
    } else {
        const palette = generatePalette(pixels, 5);
        palette.forEach(colour => console.log(colour.toHEX()));
    }
});
