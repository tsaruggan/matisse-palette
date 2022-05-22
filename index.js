import Colour, * as matisse from "matisse";
import getPixels from "get-pixels";

/**
 * Generate a colour palette based on an image given a flattened array of image pixel colours. Palette generation
 * is performed using [K-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) which aims to parition
 * the pixels into ```k``` different clusters. By default, the algorithm uses a squared Euclidean distance function to
 * minimize within-cluster variances and a geometric mean function to recalculate centroid assignments that are both
 * based on the RGB values of each colour. The algorithm is not guaranteed to produce deterministic results or the
 * optimal solution every time.
 * @param {Colour[]} pixels - A flattened array of colours representing the pixels of an image.
 * @param {number} k - The number of colours to return in the palette. This is the number of centroids or clusters to
 * partition during the K-means clustering algorithm. By default, ```k``` is set to 5.
 * @param {function(Colour, Colour):number} distanceFn - A callback function that returns a "distance" given two 
 * different pixels or Colour instances. The K-means clustering algorithm assigns pixels to the "nearest" cluster
 * based on this function. By default, the squared Euclidean distance is returned using the difference between the 
 * red, green, and blue channels of both pixels.
 * @param {function(Colour[]):Colour} meanFn - A callback function that returns a mean or average pixel given an array
 * of pixels. The K-means clustering algorithm recalculates the centroids of each cluster by taking the average of the
 * pixels in each cluster using this function. By default, the geometric mean is returned using the average of the red,
 * green, and blue channels of all the pixels.
 * @param {number} maxIterations - The maximum number of iterations to perform before terminating the K-means
 * clustering algorithm. This is necessary since the algorithm may not converge given the distance and mean functions.
 * @returns {Colour[]} The resulting colour palette generated.
 */
export function generatePalette(
    pixels,
    k = 5,
    distanceFn = squaredEuclideanDistanceRGB,
    meanFn = geometricMeanRGB,
    maxIterations = 50) {
    const palette = kMeans(pixels, k, distanceFn, meanFn, maxIterations);
    return palette;
}

/**
 * Given a URL/path, extract all the pixels from an image and return the resulting flattened array of Colour instances.
 * Note: Image file reading is handled by [scijs/get-pixels](https://github.com/scijs/get-pixels).
 * @param {string} path - A path to a JPEG or PNG file. This can be a relative path, an HTTP URL, or a data URL.
 * @param {function(Error, Colour[]):void} callback - A callback which gets triggered once the pixels are loaded. 
 */
export function extractPixels(path, callback) {
    getPixels(path, (error, image) => {
        if (error) {
            callback(error);
            return;
        }

        try {
            const width = image.shape[0];
            const height = image.shape[1];
            const reds = image.pick(null, null, 0);
            const greens = image.pick(null, null, 1);
            const blues = image.pick(null, null, 2);
            const pixels = pixelsFromChannels(reds, greens, blues, width, height);
            callback(undefined, pixels);
        } catch (error) {
            callback(error);
        }
    });
}

// perform the K-means clustering algorithm and return the centroids
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

// partition points into nearest cluster using distance function
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
function squaredEuclideanDistanceRGB(pixel1, pixel2) {
    const redDiff = pixel1.red - pixel2.red;
    const blueDiff = pixel1.blue - pixel2.blue;
    const greenDiff = pixel1.green - pixel2.green;
    const squaredDistance = (redDiff ** 2) + (blueDiff ** 2) + (greenDiff ** 2);
    return squaredDistance;
}

// determine the geometric mean of all pixels
function geometricMeanRGB(pixels) {
    let redSquared = 0, greenSquared = 0, blueSquared = 0;
    for (let i = 0; i < pixels.length; i++) {
        redSquared += pixels[i].red ** 2;
        greenSquared += pixels[i].green ** 2;
        blueSquared += pixels[i].blue ** 2;
    }

    const numPixels = pixels.length;
    const red = Math.sqrt(redSquared / numPixels);
    const green = Math.sqrt(greenSquared / numPixels);
    const blue = Math.sqrt(blueSquared / numPixels);
    return Colour.RGB(red, green, blue);
}

// given ndarrays of red, green, and blue channels, convert into flattened array of colours
function pixelsFromChannels(reds, greens, blues, width, height) {
    const pixels = [];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const red = reds.get(i, j);
            const green = greens.get(i, j);
            const blue = blues.get(i, j);
            const pixel = Colour.RGB(red, green, blue);
            pixels.push(pixel);
        }
    }
    return pixels;
}