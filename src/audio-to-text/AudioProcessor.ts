import Piscina from "piscina";
import path from "path";

export class AudioProcessor {
  private static readonly workerPool = new Piscina({
    filename: path.resolve(__dirname, "audioWorker.js"), // Make sure this points to the correct file
    maxThreads: 4, // Number of parallel threads
  });

  private constructor(private readonly audioPath: string) {}

  static create(audioPath: string): AudioProcessor {
    return new AudioProcessor(audioPath);
  }

  async readAudioFile(): Promise<Float32Array> {
    console.log(`Processing audio file in parallel: ${this.audioPath}`);

    try {
      const duration = 10; // Set actual duration dynamically
      const numThreads = 4;
      const segmentDuration = duration / numThreads;

      /**
       * Creates an array of promises that will process the audio file in parallel using the Piscina worker pool.
       * Each promise will process a segment of the audio file with a duration of `segmentDuration` seconds.
       * The start time of each segment is calculated based on the index of the thread.
       */
      const chunkPromises = Array.from({ length: numThreads }, (_, i) =>
          AudioProcessor.workerPool.run({
            audioPath: this.audioPath,
            startTime: i * segmentDuration,
            duration: segmentDuration,
          })
      );

      const processedChunks = await Promise.all(chunkPromises);
      return this.mergeChunks(processedChunks);
    } catch (error) {
      console.error(`Error processing audio file: ${error}`);
      throw new Error(`Failed to process audio file: ${this.audioPath}`);
    }
  }

  /**
   * Merges an array of `Float32Array` chunks into a single `Float32Array`.
   * This is a private helper method used within the `AudioProcessor` class.
   *
   * @param chunks - An array of `Float32Array` chunks to be merged.
   * @returns A single `Float32Array` that contains the merged data from the input chunks.
   */
  private mergeChunks(chunks: Float32Array[]): Float32Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Float32Array(totalLength);

    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    return merged;
  }
}