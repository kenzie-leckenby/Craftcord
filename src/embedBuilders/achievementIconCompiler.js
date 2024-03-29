/**
 * ! Dependencies
 * * canvas
 * * decode-gif
 * * gif-encoder
 */

const { createCanvas, loadImage } = require('canvas');
const log = require('../logs/logWriter.js');
const decodeGif = require('decode-gif');
const GifEncoder = require('gif-encoder');

/**
 * @param backgroundImageUrl accepts any image file
 * @param foregroundImageUrl accepts either any image file or .gif
 * @returns a data URI containing the file as either a .png or .gif
 */
async function overlayImagesFromURL(backgroundImageUrl, foregroundImageUrl) {
    // Handles animated achievement icons
    if (foregroundImageUrl.indexOf('gif') != -1) {
        // ! Update code to remove the use of async in a promise statement
        return new Promise (async (resolve, reject) => {
            // Fetches and loads the background then the foreground image
            const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {log.write('er', 'Error', `Failed to fetch the background image: ${backgroundImageFetch.statusText}`); return;}
            const backgroundImageArrayBuffer = await backgroundImageFetch.arrayBuffer();
            const backgroundImage = await loadImage(Buffer.from(backgroundImageArrayBuffer));

            const foregroundGifFetch = await fetch(foregroundImageUrl); if (!foregroundGifFetch.ok) {log.write('er', 'Error', `Failed to fetch the foreground gif: ${backgroundImageFetch.statusText}`); return;}
            const foregroundGifArrayBuffer = await foregroundGifFetch.arrayBuffer();
            const foregroundGifObject = decodeGif(Buffer.from(foregroundGifArrayBuffer));

            let gif = new GifEncoder(52, 52, {
                highWaterMark: 5 * 1024 * 1024 // Sets the buffer size to 5 mbs
            });
            gif.setDispose(0);
            gif.setQuality(3);

            gif.writeHeader();

            // Foreground frame.data pool
            const previousForegroundsCanvas = createCanvas(foregroundGifObject.width, foregroundGifObject.height);
            const previousForegroundsctx = previousForegroundsCanvas.getContext('2d', { alpha: true });

            for (const frame of foregroundGifObject.frames) {
                // Create a new canvas
                const canvas = createCanvas(52, 52);
                const ctx = canvas.getContext('2d', { alpha: true });
                ctx.imageSmoothingEnabled = false;

                //Set the canvas to a solid color for transparency later
                ctx.fillStyle = "Red";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //Draw the background first to the output context
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

                // Draw the current frame's data to the output context
                // Create a temp canvas for the foreground
                const foregroundCanvas = createCanvas(foregroundGifObject.width, foregroundGifObject.height);
                const foregroundctx = foregroundCanvas.getContext('2d', { alpha: true });
                // Convert Pixel Data to Image Data
                const foregroundImageData = foregroundctx.createImageData(foregroundGifObject.width, foregroundGifObject.height);
                foregroundImageData.data.set(frame.data);
                // Draw current foreground to the foreground context
                foregroundctx.putImageData(foregroundImageData, 0, 0);
                previousForegroundsctx.drawImage(foregroundCanvas, 0, 0, 32, 32);
                // Draw the foreground canvas to the output context
                ctx.drawImage(previousForegroundsCanvas, 10, 10, 32, 32);

                // Add the compiled image to the output gif
                gif.setTransparent("0xFF0000");
                gif.addFrame(ctx.getImageData(0, 0, 52, 52).data, frame.delay);
            }

            gif.finish()

            gif.on('readable', () => {
                resolve(`data:image/gif;base64,${gif.read().toString('base64')}`);
            });
        })
    }

    // Handles non-animated achievement icons
    else {
        const canvas = createCanvas(52, 52);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        return new Promise (async (resolve) => {
            // Fetches and loads the background then the foreground image
            const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {log.write('er', 'Error', `Failed to fetch the background image: ${backgroundImageFetch.statusText}`); return;}
            const backgroundImageArrayBuffer = await backgroundImageFetch.arrayBuffer();
            const backgroundImage = await loadImage(Buffer.from(backgroundImageArrayBuffer));
            const foregroundImageFetch = await fetch(foregroundImageUrl); if (!foregroundImageFetch.ok) {log.write('er', 'Error', `Failed to fetch the foreground image: ${backgroundImageFetch.statusText}`); return;}
            const foregroundImageArrayBuffer = await foregroundImageFetch.arrayBuffer();
            const foregroundImage = await loadImage(Buffer.from(foregroundImageArrayBuffer));

            // Draws the images to the canvas
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(foregroundImage, 10, 10, 32, 32);

            // Outputs the resulting image
            const outImage = canvas.toDataURL();
            resolve(outImage);
        })
    }
}

module.exports = {
    overlayImagesFromURL,
};