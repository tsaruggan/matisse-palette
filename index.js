import Colour, * as matisse from "matisse";
import _ from "lodash";
const MAX_ITERATIONS = 50;

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

    // run the K-means algorithm
    while (!shouldStop(oldCentroids, centroids, iterations)) {
        // save the old centroids for convergence test
        oldCentroids = [...centroids];
        iterations++;

        // assign labels to each pixel based on centroids
        labels = getLabels(pixels, centroids);
        centroids = recalculateCentroids(pixels, labels)
    }

    console.log(labels);
    centroids.forEach(centroid => console.log(centroid.toHEX()));
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

// determine whether to stop iterating the K-means algorithm
function shouldStop(oldCentroids, centroids, iterations) {
    // stop if the number of iterations exceeds the max
    if (iterations > MAX_ITERATIONS) {
        return true;
    }

    // convergence test
    if (!oldCentroids || !oldCentroids.length) {
        return false;
    }

    for (let i = 0; i < centroids.length; i++) {
        if (!_.isEqual(centroids[i].attributes, oldCentroids[i].attributes)) {
            return false;
        }
    }
    return true;
}

function getLabels(pixels, centroids) {
    // set up labels data structure
    const labels = {};
    for (let c = 0; c < centroids.length; c++) {
        labels[c] = {
            pixels: [],
            centroid: centroids[c],
        };
    }

    // For each element in the dataset, choose the closest centroid. 
    // Make that centroid the element's label.
    for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i];
        let closestCentroid, closestCentroidIndex, prevDistance;
        for (let j = 0; j < centroids.length; j++) {
            let centroid = centroids[j];
            if (j === 0) {
                closestCentroid = centroid;
                closestCentroidIndex = j;
                prevDistance = getDistance(pixel, closestCentroid);
            } else {
                // get distance:
                const distance = getDistance(pixel, centroid);
                if (distance < prevDistance) {
                    prevDistance = distance;
                    closestCentroid = centroid;
                    closestCentroidIndex = j;
                }
            }
        }
        // add point to centroid labels:
        labels[closestCentroidIndex].pixels.push(pixel);
    }
    return labels;
}

function getDistance(pixel1, pixel2) {
    const diffs = [];
    diffs.push(pixel1.red - pixel2.red);
    diffs.push(pixel1.green - pixel2.green);
    diffs.push(pixel1.blue - pixel2.blue);
    return diffs.reduce((r, e) => (r + (e * e)), 0);
}

function recalculateCentroids(pixels, labels) {
    // Each centroid is the geometric mean of the points that
    // have that centroid's label. Important: If a centroid is empty (no points have
    // that centroid's label) you should randomly re-initialize it.
    let newCentroid;
    const newCentroidList = [];
    for (const label in labels) {
        const centroidGroup = labels[label];
        if (centroidGroup.pixels.length > 0) {
            // find mean:
            newCentroid = average(centroidGroup.pixels);
        } else {
            // get new random centroid
            newCentroid = getRandomCentroids(pixels, 1)[0];
        }
        newCentroidList.push(newCentroid);
    }
    return newCentroidList;
}

function average(pixels) {
    let red2 = 0;
    let green2 = 0;
    let blue2 = 0;
    for (let i = 0; i < pixels.length; i++) {
        red2  += pixels[i].red ** 2;
        green2 += pixels[i].green ** 2;
        blue2 += pixels[i].blue ** 2;
    }

    const numPixels = pixels.length;
    const red = Math.sqrt(red2 / numPixels);
    const green = Math.sqrt(green2 / numPixels);
    const blue = Math.sqrt(blue2 / numPixels);
    return Colour.RGB(red, green, blue);
}