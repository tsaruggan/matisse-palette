import { generatePalette, extractPixels } from "./index.js";
import Colour, * as matisse from "matisse";

extractPixels("drake.png", (pixels, error) => {
    if (error) {
        console.log(error);
        return;
    }
    const palette = generatePalette(pixels, 5);
    palette.forEach(colour => console.log(colour.toHEX()));
});