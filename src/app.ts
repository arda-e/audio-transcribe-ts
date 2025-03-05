import { ASRTranscriber, AudioProcessor, LogProcessor } from "./audio-to-text";
import { Benchmark } from "./utils/";

/**
 * Handles the end-to-end process of transcribing an audio file.
 * - Reads the audio file
 * - Loads the ASR model
 * - Transcribes the audio
 * - Logs the transcription result
 * @param audioPath - The path to the audio file to transcribe
 * @param logsPath - The directory path for storing log files
 */
export async function transcribeAudio(audioPath: string, logsPath: string) {
  console.log("Starting transcription process...");
  console.log("Reading audio file:", audioPath);

  try {
    const transcriber = ASRTranscriber.create();
    console.log("Initializing ASR model...");
    await transcriber.loadModel();

    const processor = AudioProcessor.create(audioPath);
    const logProcessor = new LogProcessor(logsPath);

    console.log("Processing audio file...");
    let audioData: Float32Array<ArrayBufferLike>;
    await Benchmark.measureExecutionTime(
      async () => (audioData = await processor.readAudioFile()),
    );

    console.log("Performing transcription...");
    const output = await Benchmark.measureExecutionTime(
      async () => await transcriber.transcribe(audioData),
    );

    console.log("Transcription complete. Logging results...");
    logProcessor.processLog(output.text);

    console.log("Transcription process completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error occurred during transcription:", error);
    throw error;
  }
}
