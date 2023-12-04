const { GifReader } = require('omggif');
const arrayRange = require("array-range")

const gifuct = require('gifuct-js');

function decodeGif(buffer) {
    const gif = gifuct.parseGIF(buffer);
    const frames = gifuct.decompressFrames(gif, true);

    return {
        frames: frames,
        width: gif.width,
        height: gif.height
    };
}

function decodeFrame(buffer, frameIndex) {
	const gif = gifuct.parseGIF(buffer);
	const frame = gifuct.decompressFrame(gif.frames[frameIndex].frame, gif.gct, true);

	return {
		data: frame.patch,
		width: gif.width,
		height: gif.height
	}
}

/*
function decodeGif(buffer) {
    const reader = new GifReader(buffer);

    let currentTimeCode = 0

	const frames = arrayRange(0, reader.numFrames()).map(frameIndex => {
		const { delay, disposal } = reader.frameInfo(frameIndex)

		const frameData = new Uint8ClampedArray(reader.width * reader.height * 4)
		reader.decodeAndBlitFrameRGBA(frameIndex, frameData)

		const data = {
			timeCode: currentTimeCode,
			data: frameData,
            disposal: disposal
		}

		currentTimeCode += delay * 10

		return data
	})

	return {
		width: reader.width,
		height: reader.height,
		frames: frames
	}
}
*/

module.exports = {
    decodeGif,
	decodeFrame,
}