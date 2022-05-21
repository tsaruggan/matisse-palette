import Colour, * as matisse from "matisse";
import { clusterize } from 'node-kmeans';

const colours = [
    new Colour("#67598B"),
    new Colour("#6F4048"),
    new Colour("#9C81B9"),
    new Colour("#886381"),
    new Colour("#111024"),
    new Colour("#E7A3B9"),
    new Colour("#4C252A"),
    new Colour("#E48D85"),
]

let vectors = new Array();
for (let i = 0; i < colours.length; i++) {
    vectors[i] = [colours[i].red, colours[i].green, colours[i].blue];
}

clusterize(vectors, { k: 3 }, (err, res) => {
    if (err) console.error(err);
    else res.forEach(element => {
        const centroid = element.centroid;
        const colour = Colour.RGB(centroid[0], centroid[1], centroid[2]);
        console.log(colour.toHEX());
    });
});