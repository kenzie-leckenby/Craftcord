const { createCanvas, loadImage, ImageData } = require('canvas');
const fs = require('fs');
const decodeGif = require("decode-gif");
const GIFEncoder = require('gifencoder');
const fetch = require('node-fetch');
const path = require('path');

/*
async function overlayImagesFromURL(inputImage1URL, inputImage2URL) {
    //const outputImagePath = path.join(__dirname, 'tempImg.gif'); // Specify the output file path
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(52, 52);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        let outputType = 'tempImg.png';
        let outputImagePath = '';

        try {
            // Load the first image from URL (assumed to be a PNG)
            const response1 = await fetch(inputImage1URL);
            if (!response1.ok) {
                reject(new Error(`Failed to fetch the first image: ${response1.statusText}`));
                return;
            }
            const image1 = await loadImage(await response1.buffer());
            ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);

            // Determine the file format of the second image
            const fileExtension = path.extname(inputImage2URL);

            if (fileExtension.toLowerCase() === '.png') {
                // Load the second image from URL (assumed to be a PNG)
                const response2 = await fetch(inputImage2URL);
                if (!response2.ok) {
                    reject(new Error(`Failed to fetch the second image: ${response2.statusText}`));
                    return;
                }
                const image2 = await loadImage(await response2.buffer());
                ctx.drawImage(image2, 10, 10, 32, 32);

                outputImagePath = path.join(__dirname, outputType);

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
            } else if (fileExtension.toLowerCase() === '.gif') {
                outputType = 'tempImg.gif';
                outputImagePath = path.join(__dirname, outputType);

                // Load the second image from URL (assumed to be a GIF)
                const response2 = await fetch(inputImage2URL);
                if (!response2.ok) {
                    reject(new Error(`Failed to fetch the second image: ${response2.statusText}`));
                    return;
                }
                const gifBuffer = await response2.buffer();

                // Create a GIF encoder with specified dimensions
                const gif = new GIFEncoder(canvas.width, canvas.height);

                // Start the GIF
                gif.createReadStream().pipe(fs.createWriteStream(outputImagePath));
                gif.start();
                gif.setRepeat(0); // 0 means repeat forever
                gif.setDelay(100); // Delay between frames in milliseconds

                // Process each frame in the GIF
                const gifFrames = decodeGif(gifBuffer).frames; // You'll need a GIF parser library
                //console.log(gifFrames);
                for (const frame of gifFrames) {
                    const imageData = new ImageData(frame.data, 16, 16);
                    ctx.putImageData(imageData, 32, 32); // Overlay on the canvas
                    gif.addFrame(ctx); // Add the frame to the GIF
                }

                gif.finish();
                resolve(outputImagePath);

            } else {
                reject(new Error(`Unsupported file format for the second image: ${fileExtension}`));
                return;
            }
        } catch (error) {
            reject(error);
        }
    });
}*/

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

//overlayImagesFromURL('https://minecraft.wiki/images/Advancement-plain-raw.png', 'https://minecraft.wiki/images/Invicon_Obsidian.png')

module.exports = {
    overlayImagesFromURL,
};