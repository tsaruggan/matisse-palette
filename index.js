import Colour, * as matisse from "matisse";

export function generatePalette(pixels, k, distanceFn = squaredEuclideanDistance, meanFn = geometricMeanRGB, maxIterations = 50) {
    const palette = kMeans(pixels, k, distanceFn, meanFn, maxIterations);
    return palette;
}

function kMeans(points, k, distanceFn, meanFn, maxIterations) {
    let iterations = 0;
    let oldCentroids, centroids, clusters;

    // initialize centroids randomly
    centroids = getRandomCentroids(points, k);

    // run the K-means algorithm
    while (!shouldStop(oldCentroids, centroids, iterations, maxIterations)) {
        // save the old centroids for convergence test
        oldCentroids = [...centroids];
        iterations++;

        // assign each point to a centroid based on proximity to centroids
        clusters = clusterize(points, centroids, distanceFn);

        // recalculate the centroids
        centroids = recalculateCentroids(points, clusters, meanFn)
    }
    return centroids;
}

function clusterize(points, centroids, distanceFn) {
    // set up the clusters data structure
    const clusters = {};
    for (let c = 0; c < centroids.length; c++) {
        clusters[c] = {
            points: [],
            centroid: centroids[c],
        };
    }

    // for each point, choose the "closest" centroid
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        let closestCentroid, closestCentroidIndex, prevDistance;
        for (let j = 0; j < centroids.length; j++) {
            let centroid = centroids[j];
            if (j === 0) {
                closestCentroid = centroid;
                closestCentroidIndex = j;
                prevDistance = distanceFn(point, closestCentroid);
            } else {
                const distance = distanceFn(point, centroid);
                if (distance < prevDistance) {
                    prevDistance = distance;
                    closestCentroid = centroid;
                    closestCentroidIndex = j;
                }
            }
        }

        // add pixel to centroid's cluster
        clusters[closestCentroidIndex].points.push(point);
    }
    return clusters;
}

// recalculate the centroids assigned to each cluster
function recalculateCentroids(points, clusters, meanFn) {
    let newCentroid;
    const newCentroidList = [];
    for (const index in clusters) {
        const centroidGroup = clusters[index];
        if (centroidGroup.points.length > 0) {
            // each centroid is a geometric mean or average of the points in that cluster
            newCentroid = meanFn(centroidGroup.points);
        } else {
            // if a centroid is empty, it should be randomly re-initialized
            newCentroid = getRandomCentroids(points, 1)[0];
        }
        newCentroidList.push(newCentroid);
    }
    return newCentroidList;
}

// determine whether to stop iterating the K-means algorithm
function shouldStop(oldCentroids, centroids, iterations, maxIterations) {
    // stop if the number of iterations exceeds the max
    if (iterations > maxIterations) {
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
function getRandomCentroids(points, n) {
    // generate a random list of n indicies
    const randomIndicies = [];
    while (randomIndicies.length < n) {
        const index = random(0, points.length);
        if (randomIndicies.indexOf(index) === -1) {
            randomIndicies.push(index);
        }
    }

    // return centroids from random indicies
    const centroids = randomIndicies.map(index => points[index]);
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