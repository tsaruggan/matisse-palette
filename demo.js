import { generatePalette } from "./index.js";
import Colour from "matisse";

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
const palette = generatePalette(pixels, k);
palette.forEach(colour => console.log(colour.toHEX()));
