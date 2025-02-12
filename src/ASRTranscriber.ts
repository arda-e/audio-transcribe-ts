import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
  AutomaticSpeechRecognitionOutput,
} from "@xenova/transformers";
import { ITranscriber } from "./types";

/**
 * The ASRTranscriber class uses the Xenova/whisper-tiny.en model by default to transcribe audio data.
 * It allows configuring the chunk length and stride length for the transcription process.
 */
export class ASRTranscriber implements ITranscriber {
  private readonly modelName: string;
  private readonly chunkLength: number;
  private readonly strideLength: number;
  private transcriber: AutomaticSpeechRecognitionPipeline | null;

  constructor(
    modelName: string = "Xenova/whisper-tiny.en",
    chunkLength: number = 30,
    strideLength: number = 5,
  ) {
    this.modelName = modelName;
    this.chunkLength = chunkLength;
    this.strideLength = strideLength;
    this.transcriber = null;
  }

  async loadModel(): Promise<void> {
    console.log(`Loading model ${this.modelName}...`);
    if (!this.transcriber) {
      this.transcriber = (await pipeline(
        "automatic-speech-recognition",
        this.modelName,
      )) as AutomaticSpeechRecognitionPipeline;
    }
  }

  async transcribe(audioData: Float32Array): Promise<{ text: string }> {
    if (!this.transcriber) {
      throw new Error("Model not loaded. Call loadModel() first.");
    }

    console.log("Transcribing audio data...");

    const result:
      | AutomaticSpeechRecognitionOutput
      | AutomaticSpeechRecognitionOutput[] = await this.transcriber(audioData, {
      chunk_length_s: this.chunkLength,
      stride_length_s: this.strideLength,
    });

    if (Array.isArray(result)) {
      return { text: result.map((r) => r.text).join(" ") };
    }
    return { text: result.text };
  }
}
