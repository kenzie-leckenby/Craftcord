/**
 * ! Dependencies
 * * canvas
 * * node-fetch
 */
const { createCanvas, loadImage, ImageData } = require('canvas');
const fs = require('fs'); // ! Will be removed when the new function works
const { decodeGif, decodeFrame } = require('./gifFunctions.js')
const GifEncoder = require('gif-encoder')
const fetch = require('node-fetch');
const path = require('path'); // ! Will be removed when the new function works

/**
 * @param backgroundImageUrl accepts any image file
 * @param foregroundImageUrl accepts either any image file or .gif
 * ! Though only .png's have been tested at the moment
 * ! Gif's currently do not fully work so do not reference this function
 * @returns a data URI containing the file as either a .png or .gif
 */
async function testOverlay(backgroundImageUrl, foregroundImageUrl) {
    // Handles animated achievement icons
    if (foregroundImageUrl.indexOf('gif') != -1) {
        // ! Update code to remove the use of async in a promise statement
        return new Promise (async (resolve, reject) => {
            // Fetches and loads the background then the foreground image
            const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {reject(new Error(`Failed to fetch the background image: ${backgroundImageFetch.statusText}`)); return;}
            const backgroundImage = await loadImage(await backgroundImageFetch.buffer());

            const foregroundGifFetch = await fetch(foregroundImageUrl); !foregroundGifFetch.ok && reject(new Error(`Failed to fetch the foreground image: ${foregroundGifFetch.statusText}`));
            const foregroundGifObject = decodeGif(await foregroundGifFetch.buffer());

            let gif = new GifEncoder(52, 52, {
                highWaterMark: 5 * 1024 * 1024 // Sets the buffer size to 5 mbs
            });
            gif.setDispose(2);

            gif.writeHeader();

            foregroundGifObject.frames.forEach(async frame => {
                // Create a new canvas
                const canvas = createCanvas(52, 52);
                const ctx = canvas.getContext('2d', { alpha: true });
                ctx.imageSmoothingEnabled = false;

                // Create a temp canvas for the foreground
                const foregroundCanvas = createCanvas(foregroundGifObject.width, foregroundGifObject.height);
                const foregroundctx = foregroundCanvas.getContext('2d', { alpha: true });

                // Convert Pixel Data to Image Data
                let foregroundImageData = foregroundctx.createImageData(foregroundGifObject.width, foregroundGifObject.height);
                foregroundImageData.data.set(frame.patch);

                // Draw foreground
                foregroundctx.putImageData(foregroundImageData, 0, 0);

                // Draw background and foreground
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                ctx.drawImage(foregroundCanvas, 10, 10, 32, 32);

                // Add the compiled image to the output gif
                gif.addFrame(ctx.getImageData(0, 0, 52, 52).data, frame.delay);
            });

            gif.finish()

            // Supposedly Throws out a Data URI
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

        // ! Update code to remove the use of async in a promise statement
        return new Promise (async (resolve, reject) => {
            // Fetches and loads the background then the foreground image
            const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {reject(new Error(`Failed to fetch the background image: ${backgroundImageFetch.statusText}`)); return;}
            const backgroundImage = await loadImage(await backgroundImageFetch.buffer());
            const foregroundImageFetch = await fetch(foregroundImageUrl); if (!foregroundImageFetch.ok) {reject(new Error(`Failed to fetch the background image: ${foregroundImage.statusText}`)); return;}
            const foregroundImage = await loadImage(await foregroundImageFetch.buffer());

            // Draws the images to the canvas
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(foregroundImage, 10, 10, 32, 32);

            // Outputs the resulting image
            const outImage = canvas.toDataURL();
            resolve(outImage);
        })
    }
}

async function gifFrameTest(backgroundImageUrl, foregroundImageUrl, frameNum) {

    return new Promise (async (resolve, reject) => {
        // Fetches and loads the background then the foreground image
        const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {reject(new Error(`Failed to fetch the background image: ${backgroundImageFetch.statusText}`)); return;}
        const backgroundImage = await loadImage(await backgroundImageFetch.buffer());

        const foregroundGifFetch = await fetch(foregroundImageUrl); !foregroundGifFetch.ok && reject(new Error(`Failed to fetch the foreground image: ${foregroundGifFetch.statusText}`));
        const foregroundGifObject = decodeFrame(await foregroundGifFetch.buffer(), frameNum);

        // Create a new canvas
        const canvas = createCanvas(52, 52);
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = false;

        // Create a temp canvas for the foreground
        const foregroundCanvas = createCanvas(foregroundGifObject.width, foregroundGifObject.height);
        const foregroundctx = foregroundCanvas.getContext('2d', { alpha: true });

        // Convert Pixel Data to Image Data
        let foregroundImageData = foregroundctx.createImageData(foregroundGifObject.width, foregroundGifObject.height);
        foregroundImageData.data.set(foregroundGifObject.data);

        foregroundctx.putImageData(foregroundImageData, 0, 0);

        // Draw background and foreground
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Background
        ctx.drawImage(foregroundCanvas, 10, 10, 32, 32); // Foreground

        // Add the compiled image to the output gif
        const outImage = canvas.toDataURL();
        resolve(outImage);
    })
}



async function overlayImagesFromURL(inputImage1URL, inputImage2URL) {
    const outputImagePath = path.join(__dirname, 'tempImg.png'); // Specify the file path

    return new Promise(async (resolve, reject) => {
        //console.log('Icon compiler started')
        const canvas = createCanvas(52, 52);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        try {
            // Load the first image from URL
            const response1 = await fetch(inputImage1URL);
            if (!response1.ok) {
                reject(new Error(`Failed to fetch the first image: ${response1.statusText}`));
                return;
            }
            const image1 = await loadImage(await response1.buffer());
            ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);

            // Load the second image from URL
            const response2 = await fetch(inputImage2URL);
            if (!response2.ok) {
                reject(new Error(`Failed to fetch the second image: ${response2.statusText}`));
                return;
            }
            const image2 = await loadImage(await response2.buffer());
            ctx.drawImage(image2, 10, 10, 32, 32);

            // Save the resulting image to the specified file path
            const resultFileStream = fs.createWriteStream(outputImagePath);
            const resultStream = canvas.createPNGStream();
            resultStream.pipe(resultFileStream);

            resultFileStream.on('finish', () => {
                resolve(outputImagePath); // Resolve with the file path
            });

            resultFileStream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    overlayImagesFromURL,
    testOverlay,
    gifFrameTest,
};