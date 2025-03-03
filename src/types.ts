export interface ITranscriber {
  /**
   * Loads the speech recognition model asynchronously.
   * @returns A Promise that resolves when the model has finished loading.
   */
  loadModel(): Promise<void>;

  /**
   * Transcribes the provided audio data and returns the recognized text.
   * @param audioData - The audio data to be transcribed, represented as a Float32Array.
   * @returns A Promise that resolves with an object containing the transcribed text.
   */
  transcribe(audioData: Float32Array): Promise<{ text: string }>;
}

export interface IAudioProcessor {
  /**
   * Reads an audio file and returns the audio data as a Float32Array.
   * @returns The audio data as a Float32Array.
   */
  readAudioFile(): Promise<Float32Array>;
}

export interface ILogProcessor {
  /**
   * Writes the provided log data to the log file.
   * @param logData - The log data to be written to the file.
   */
  processLog(logData: string): void;
}
