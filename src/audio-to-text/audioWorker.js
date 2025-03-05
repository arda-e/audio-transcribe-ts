const { createReadStream } = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const { WaveFile } = require("wavefile");

/**
 * Processes an audio segment using FFmpeg, streaming directly from the input file.
 * @param {object} params
 * @param {string} params.audioPath - Path to the input audio file.
 * @param {number} params.startTime - Start time of the segment (in seconds).
 * @param {number} params.duration - Duration of the segment (in seconds).
 * @returns {Promise<Float32Array>}  A Float32Array containing extracted audio samples.
 */
async function processAudio({ audioPath, startTime, duration }) {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(audioPath);
    const passThrough = new PassThrough();
    const chunks = [];

    ffmpeg()
      .input(readStream)
      .setStartTime(startTime)
      .setDuration(duration)
      .audioChannels(1) // Convert stereo to mono
      .audioFrequency(16000)
      .audioCodec("pcm_f32le")
      .format("wav")
      .on("error", reject)
      .pipe(passThrough);

    passThrough.on("data", (chunk) => chunks.push(chunk));
    passThrough.on("error", (error) => reject(error));

    /**
     * Handles the end event of the passThrough stream,
     * extracts the processed audio samples, and resolves the promise with the samples.
     * @param {Error} [error] - If an error occurs during the extraction, it is passed to the reject function.
     * @returns {Promise<Float32Array>} A Promise that resolves with the extracted audio samples.
     */
    passThrough.on("end", async () => {
      try {
        const processedBuffer = Buffer.concat(chunks);
        const processedSamples = extractSamples(processedBuffer);
        resolve(processedSamples);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Extracts audio samples from a processed WAV buffer.
 * @param {Buffer} buffer - The buffer containing processed WAV data.
 * @returns {Float32Array} A Float32Array containing extracted audio samples.
 */
function extractSamples(buffer) {
  const waveFile = new WaveFile(buffer);
  waveFile.toBitDepth("32f");

  const audioData = waveFile.getSamples();
  return Array.isArray(audioData)
    ? mergeChannels(audioData.map((channel) => new Float32Array(channel)))
    : new Float32Array(audioData);
}

/**
 * Merges multiple audio channels into a single channel by averaging the samples.
 * @param {Float32Array[]} channels - An array of Float32Arrays representing audio channels.
 * @returns {Float32Array} A new Float32Array containing the merged audio data.
 */
function mergeChannels(channels) {
  if (channels.length === 1) return channels[0];

  const length = channels[0].length;
  const merged = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const channel of channels) {
      sum += channel[i];
    }
    merged[i] = sum / channels.length;
  }

  return merged;
}

// ✅ Properly export function for Piscina
module.exports = processAudio;
