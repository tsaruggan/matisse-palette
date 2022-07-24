# matisse-palette

## Installation
```
npm install matisse-palette
```

## Usage
```javascript
import * as mp from "matisse-palette";

const path = "path/to/your/image.png";
mp.extractPixels(path, (error, pixels) => {
    if (error) {
        console.log(error);
        return;
    }
    const palette = mp.generatePalette(pixels);
    // do something cool!
});
```

## Documentation

### generatePalette(pixels, k, distanceFn, meanFn, maxIterations) ⇒ <code>Array.&lt;Colour&gt;</code>
Generate a colour palette based on an image given a flattened array of image pixel colours. Palette generation
is performed using [K-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) which aims to partition
the pixels into ```k``` different clusters. By default, the algorithm uses a squared Euclidean distance function to
minimize within-cluster variances and a geometric mean function to recalculate centroid assignments that are both
based on the RGB values of each colour. The algorithm is not guaranteed to produce deterministic results or the
optimal solution every time.

**Returns**: <code>Array.&lt;Colour&gt;</code> - The resulting colour palette generated.  

| Param | Type | Description |
| --- | --- | --- |
| pixels | <code>Array.&lt;Colour&gt;</code> | A flattened array of colours representing the pixels of an image. |
| k | <code>number</code> | The number of colours to return in the palette. This is the number of centroids or clusters to partition during the K-means clustering algorithm. By default, ```k``` is set to 5. |
| distanceFn | <code>function</code> | A callback function that returns a "distance" given two  different pixels or Colour instances. The K-means clustering algorithm assigns pixels to the "nearest" cluster based on this function. By default, the squared Euclidean distance is returned using the difference between the  red, green, and blue channels of both pixels. |
| meanFn | <code>function</code> | A callback function that returns a mean or average pixel given an array of pixels. The K-means clustering algorithm recalculates the centroids of each cluster by taking the average of the pixels in each cluster using this function. By default, the geometric mean is returned using the average of the red, green, and blue channels of all the pixels. |
| maxIterations | <code>number</code> | The maximum number of iterations to perform before terminating the K-means clustering algorithm. This is necessary since the algorithm may not converge given the distance and mean functions. By default, the maximum number of iterations is set to 50.|

<a name="extractPixels"></a>

### extractPixels(path, callback)
Given a URL/path, extract all the pixels from an image and return the resulting flattened array of Colour instances.
Note: Image file reading is handled by [scijs/get-pixels](https://github.com/scijs/get-pixels).

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | A path to a JPEG or PNG file. This can be a relative path, an HTTP URL, or a data URL. |
| callback | <code>function</code> | A callback which gets triggered once the pixels are loaded. |
