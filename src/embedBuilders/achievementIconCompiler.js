const { createCanvas, loadImage, ImageData } = require('canvas');
const fs = require('fs');
const decodeGif = require('decode-gif');
const GifEncoder = require('gif-encoder')
const fetch = require('node-fetch');
const path = require('path');

// Returns a data URI
async function testOverlay(backgroundImageUrl, foregroundImageUrl) {
    // Handles animated achievement icons
    if (foregroundImageUrl.indexOf('gif') != -1) {
        // [TODO] Update code to remove the use of async in a promise statement
        return new Promise (async (resolve, reject) => {
            // Fetches and loads the background then the foreground image
            const backgroundImageFetch = await fetch(backgroundImageUrl); if (!backgroundImageFetch.ok) {reject(new Error(`Failed to fetch the background image: ${backgroundImageFetch.statusText}`)); return;}
            const backgroundImage = await loadImage(await backgroundImageFetch.buffer());

            const foregroundGifFetch = await fetch(foregroundImageUrl); !foregroundGifFetch.ok && reject(new Error(`Failed to fetch the foreground image: ${foregroundGifFetch.statusText}`));
            const foregroundGifObject = decodeGif(await foregroundGifFetch.buffer());

            let gif = new GifEncoder(52, 52, {
                highWaterMark: 5 * 1024 * 1024
            });
            gif.writeHeader();

            foregroundGifObject.frames.forEach(async frame => {
                // Create a new canvas
                const canvas = createCanvas(52, 52);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;

                // Draw background
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

                // Convert Pixel Data to Image Data
                const foregroundImageData = new ImageData(frame.data, foregroundGifObject.width, foregroundGifObject.height);
                ctx.putImageData(foregroundImageData, 10, 10);
                gif.setTransparent('ffffff');
                gif.addFrame(ctx.getImageData(0, 0, 52, 52).data, frame.timeCode);
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

        // [TODO] Update code to remove the use of async in a promise statement
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

async function test() {
    console.log(await testOverlay('https://minecraft.wiki/images/Advancement-plain-raw.png', 'https://minecraft.wiki/images/Invicon_Enchanted_Book.gif'));
}
//test();

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
};