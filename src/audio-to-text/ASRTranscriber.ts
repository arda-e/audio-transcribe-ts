import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
  AutomaticSpeechRecognitionOutput,
} from "@xenova/transformers";
import { ITranscriber } from "../types";

/**
 * The ASRTranscriber class provides automatic speech recognition (ASR)
 * functionality using the Xenova/whisper-tiny.en model.
 */
export class ASRTranscriber implements ITranscriber {
  private static instance: ASRTranscriber | null = null;
  private speechRecognitionPipeline: AutomaticSpeechRecognitionPipeline | null = null;

  private constructor(
      private readonly modelName: string,
      private readonly chunkLength: number,
      private readonly strideLength: number,
  ) {}

  static create(
      modelName: string = "Xenova/whisper-tiny.en",
      chunkLength: number = 30,
      strideLength: number = 5
  ): ASRTranscriber {
    return new ASRTranscriber(modelName, chunkLength, strideLength);
  }

  static getInstance(): ASRTranscriber {
    if (!this.instance) {
      this.instance = new ASRTranscriber("Xenova/whisper-tiny.en", 30, 5);
    }
    return this.instance;
  }

  private async initializeModel(): Promise<void> {
    if (!this.speechRecognitionPipeline) {
      console.log(`Loading ASR model: ${this.modelName}...`);
      try {
        this.speechRecognitionPipeline = await pipeline(
            "automatic-speech-recognition",
            this.modelName
        );
        console.log(`Model ${this.modelName} loaded successfully.`);
      } catch (error) {
        console.error(`Error loading ASR model (${this.modelName}):`, error);
        throw new Error(`Failed to initialize ASR model: ${this.modelName}`);
      }
    }
  }

  /**
   * Loads the ASR model asynchronously.
   * This method ensures model availability before transcription.
   */
  async loadModel(): Promise<void> {
    await this.initializeModel();
  }


  /**
   * Transcribes the provided audio data and returns the recognized text.
   * @param audioData - The audio data to be transcribed (Float32Array).
   * @returns A promise resolving to an object containing the transcribed text.
   */
  async transcribe(audioData: Float32Array): Promise<{ text: string }> {
    await this.initializeModel(); // Ensures model is loaded before usage.

    console.log("Transcribing audio data...");

    try {
      const result:
          AutomaticSpeechRecognitionOutput
          | AutomaticSpeechRecognitionOutput[] =
          await this.speechRecognitionPipeline!(audioData, {
            chunk_length_s: this.chunkLength,
            stride_length_s: this.strideLength,
          });

      const text = Array.isArray(result)
          ? result.map(r => r.text).join(" ")
          : result.text;
      return { text };
    } catch (error) {
      console.error("Error during transcription:", error);
      throw new Error("Transcription process failed.");
    }
  }

}