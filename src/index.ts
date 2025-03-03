/**
 * CLI entry point for the audio transcription tool.
 * Parses command-line arguments and invokes the transcription process.
 */

import { Command } from 'commander';
import { join } from "path";
import { transcribeAudio } from "./app";

const DEFAULT_LOGS_DIR = join(process.cwd(), 'logs');

const program = new Command();

program
    .name('audio-transcribe')
    .description('CLI tool for audio transcription')
    .version('1.0.0')
    .requiredOption('-a, --audio <path>', 'Path to audio file')
    .option('-l, --logs <path>', 'Path to logs directory', DEFAULT_LOGS_DIR);

program.parse();

const options = program.opts();

(async () => {
  try {
    await transcribeAudio(options.audio, options.logs);
  } catch (error) {
    console.error("Error occurred during transcription:", error);
    process.exit(1);
  }
})();
