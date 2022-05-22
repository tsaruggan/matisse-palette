import Colour, * as matisse from "matisse";

export function generatePalette(pixels, k, distanceFn = squaredEuclideanDistance, meanFn = geometricMeanRGB, max_iterations = 50) {
    let iterations = 0;
    let oldCentroids, centroids, clusters;

    // initialize centroids randomly
    centroids = getRandomCentroids(pixels, k);

    // run the K-means algorithm
    while (!shouldStop(oldCentroids, centroids, iterations, max_iterations)) {
        // save the old centroids for convergence test
        oldCentroids = [...centroids];
        iterations++;

        // assign clusters to each pixel based on centroids
        clusters = clusterize(pixels, centroids, distanceFn);

        // recalculate the centroids
        centroids = recalculateCentroids(pixels, clusters, meanFn)
    }
    return centroids;
}

function clusterize(pixels, centroids, distanceFn) {
    // set up the clusters data structure
    const clusters = {};
    for (let c = 0; c < centroids.length; c++) {
        clusters[c] = {
            pixels: [],
            centroid: centroids[c],
        };
    }

    // for each pixel, choose the "closest" centroid
    for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i];
        let closestCentroid, closestCentroidIndex, prevDistance;
        for (let j = 0; j < centroids.length; j++) {
            let centroid = centroids[j];
            if (j === 0) {
                closestCentroid = centroid;
                closestCentroidIndex = j;
                prevDistance = distanceFn(pixel, closestCentroid);
            } else {
                const distance = distanceFn(pixel, centroid);
                if (distance < prevDistance) {
                    prevDistance = distance;
                    closestCentroid = centroid;
                    closestCentroidIndex = j;
                }
            }
        }

        // add pixel to centroid's cluster
        clusters[closestCentroidIndex].pixels.push(pixel);
    }
    return clusters;
}

// recalculate the centroids assigned to each cluster
function recalculateCentroids(pixels, clusters, meanFn) {
    let newCentroid;
    const newCentroidList = [];
    for (const index in clusters) {
        const centroidGroup = clusters[index];
        if (centroidGroup.pixels.length > 0) {
            // each centroid is a geometric mean or average of the pixels in that cluster
            newCentroid = meanFn(centroidGroup.pixels);
        } else {
            // if a centroid is empty, it should be randomly re-initialized
            newCentroid = getRandomCentroids(pixels, 1)[0];
        }
        newCentroidList.push(newCentroid);
    }
    return newCentroidList;
}

// determine whether to stop iterating the K-means algorithm
function shouldStop(oldCentroids, centroids, iterations, max_iterations) {
    // stop if the number of iterations exceeds the max
    if (iterations > max_iterations) {
        return true;
    }

    // don't stop if no old centroids to perform convergence test
    if (!oldCentroids || !oldCentroids.length) {
        return false;
    }

    // convergence test; don't stop if old centroids and new centroids have changed
    // the K-means algorithm has converged when the centroid assignments no longer change
    for (let i = 0; i < centroids.length; i++) {
        if (centroids[i].equals(oldCentroids[i])) {
            return false;
        }
    }
    return true;
}

// select n random pixels as centroids
function getRandomCentroids(pixels, n) {
    // generate a random list of n indicies
    const randomIndicies = [];
    while (randomIndicies.length < n) {
        const index = random(0, pixels.length);
        if (randomIndicies.indexOf(index) === -1) {
            randomIndicies.push(index);
        }
    }

    // return centroids from random indicies
    const centroids = randomIndicies.map(index => pixels[index]);
    return centroids;
}

// gennerate a random number between min and max (inclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// calculate the (squared) Euclidean distance between two pixels
function squaredEuclideanDistance(pixel1, pixel2) {
    const diffs = [];
    diffs.push(pixel1.red - pixel2.red);
    diffs.push(pixel1.green - pixel2.green);
    diffs.push(pixel1.blue - pixel2.blue);
    return diffs.reduce((previous, current) => (previous + (current * current)), 0);
}

// determine the geometric mean of all pixels
function geometricMeanRGB(pixels) {
    let red2 = 0;
    let green2 = 0;
    let blue2 = 0;
    for (let i = 0; i < pixels.length; i++) {
        red2 += pixels[i].red ** 2;
        green2 += pixels[i].green ** 2;
        blue2 += pixels[i].blue ** 2;
    }

    const numPixels = pixels.length;
    const red = Math.sqrt(red2 / numPixels);
    const green = Math.sqrt(green2 / numPixels);
    const blue = Math.sqrt(blue2 / numPixels);
    return Colour.RGB(red, green, blue);
}