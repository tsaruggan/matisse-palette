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
generatePalette(pixels, k);

function generatePalette(pixels, k) {
    // initialize data 
    let iterations = 0;
    let oldCentroids, labels, centroids;

    // initialize centroids randomly
    centroids = getRandomCentroids(pixels, k);
    console.log(centroids);
}

// select k random pixels as centroids
function getRandomCentroids(pixels, k) {
    // generate a random list of k indicies
    const numPixels = pixels.length;
    const randomIndicies = [];
    while (randomIndicies.length < k) {
        const index = random(0, numPixels);
        if (randomIndicies.indexOf(index) === -1) {
            randomIndicies.push(index);
        }
    }

    // get centroids from random indicies
    const centroids = [];
    for (let i = 0; i < randomIndicies.length; i++) {
        const centroid = pixels[randomIndicies[i]];
        centroids.push(centroid);
    }
    return centroids;
}

// gennerate a random number between min and max (inclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

