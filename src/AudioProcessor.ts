import wf from "wavefile";
import { readFileSync } from "fs";
import { IAudioProcessor } from "./types";

/**
 * The `AudioProcessor` class is responsible for reading and processing audio files.
 * It can read audio files, convert them to 32-bit floating-point format, and resample them to 16kHz.
 * If the audio file has multiple channels, the class will merge the channels by averaging the samples.
 */
export class AudioProcessor implements IAudioProcessor {
  private readonly audioPath: string;

  constructor(audioPath: string) {
    this.audioPath = audioPath;
  }

  readAudioFile(): Float32Array {
    console.log(`Reading audio file: ${this.audioPath}`);
    const buffer: Buffer = readFileSync(this.audioPath);
    const wav = new wf.WaveFile(buffer);
    wav.toBitDepth("32f"); // Convert to 32-bit floating point
    wav.toSampleRate(16000); // Resample to 16kHz

    const audioData = wav.getSamples(); // May return Float64Array or an array of Float64Arrays

    if (Array.isArray(audioData)) {
      // Convert each channel to Float32Array and merge channels by averaging them.
      const float32Channels = audioData.map(
        (channel) => new Float32Array(channel),
      );
      return this.mergeChannels(float32Channels);
    }
    // For single-channel audio, convert directly.
    return new Float32Array(audioData);
  }

  /**
   * Merges multiple audio channels into a single channel by averaging the samples.
   * @param channels - An array of Float32Arrays representing the audio channels to be merged.
   * @returns A new Float32Array containing the merged audio data.
   */
  private mergeChannels(channels: Float32Array[]): Float32Array {
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
}
