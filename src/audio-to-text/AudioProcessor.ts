import { createReadStream, createWriteStream } from "fs";
import { readFile } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { WaveFile } from "wavefile";
import { IAudioProcessor } from "../types";
/**
 * The `AudioProcessor` class now processes audio files using streaming.
 * - Uses streams for reading audio files
 * - Pipes data through FFmpeg without writing intermediate files
 * - Extracts audio samples as chunks arrive
 */
export class AudioProcessor implements IAudioProcessor {
  private static readonly TARGET_SAMPLE_RATE = 16000;
  private static readonly TARGET_BIT_DEPTH = "32f";
  private static readonly TARGET_CODEC = "pcm_f32le";

  private constructor(private readonly audioPath: string) {}

  static create(audioPath: string): AudioProcessor {
    return new AudioProcessor(audioPath);
  }

  /**
   * Reads and processes an audio file using streaming.
   * @returns A promise resolving to processed audio data as Float32Array.
   */
  async readAudioFile(): Promise<Float32Array> {
    console.log(`Processing audio file using streaming: ${this.audioPath}`);

    try {
      const processedBuffer = await this.streamResampleAudio();
      return this.extractSamples(processedBuffer);
    } catch (error) {
      console.error(`Error processing audio file: ${error}`);
      throw new Error(`Failed to process audio file: ${this.audioPath}`);
    }
  }

  /**
   * Streams audio data through FFmpeg for resampling and conversion.
   * @returns A Promise resolving to a processed audio buffer.
   */
  private async streamResampleAudio(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const outputPath = this.audioPath.replace(".wav", "_processed.wav");
      const readStream = createReadStream(this.audioPath);
      const writeStream = createWriteStream(outputPath);

      ffmpeg()
          .input(readStream)
          .audioChannels(1) // Convert stereo to mono
          .audioFrequency(AudioProcessor.TARGET_SAMPLE_RATE)
          .audioCodec(AudioProcessor.TARGET_CODEC)
          .format("wav")
          .on("end", async () => {
            console.log(`Streaming resampling complete: ${outputPath}`);
            resolve(await readFile(outputPath));
          })
          .on("error", reject)
          .pipe(writeStream);
    });
  }

  /**
   * Extracts audio samples from the processed buffer.
   * @param buffer - The buffer containing processed WAV data.
   * @returns A Float32Array containing extracted audio samples.
   */
  private extractSamples(buffer: Buffer): Float32Array {
    const waveFile = new WaveFile(buffer);
    waveFile.toBitDepth(AudioProcessor.TARGET_BIT_DEPTH);

    const audioData = waveFile.getSamples();
    return Array.isArray(audioData)
        ? this.mergeChannels(audioData.map((channel) => new Float32Array(channel)))
        : new Float32Array(audioData);
  }

  /**
   * Merges multiple audio channels into a single channel by averaging the samples.
   * @param channels - An array of Float32Arrays representing audio channels.
   * @returns A new Float32Array containing the merged audio data.
   */
  private mergeChannels(channels: Float32Array[]): Float32Array {
    if (channels.length === 1) return channels[0];

    const length = channels[0].length;
    const merged = new Float32Array(length);

    return merged.map((_, i) =>
        channels.reduce((sum, channel) => sum + channel[i], 0) / channels.length
    );
  }
}