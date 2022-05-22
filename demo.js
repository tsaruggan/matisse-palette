import { generatePalette } from "./index.js";
import Colour, * as matisse from "matisse";

const pixels = [
    new Colour("#67598B"),
    new Colour("#6F4048"),
    new Colour("#9C81B9"),
    new Colour("#886381"),
    new Colour("#111024"),
    new Colour("#E7A3B9"),
    new Colour("#4C252A"),
    new Colour("#E48D85"),
]

const k = 3;
const palette = generatePalette(pixels, k, (pixel1, pixel2) => {
    const distance = matisse.temperature(pixel1) - matisse.temperature(pixel2);
    return distance ** 2;
});
palette.forEach(colour => console.log(colour.toHEX()));
