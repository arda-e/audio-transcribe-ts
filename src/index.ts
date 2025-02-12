import { Command } from 'commander';
import { ASRTranscriber, AudioProcessor, LogProcessor } from "./audio-to-text";
import { Benchmark } from "./utils/";
import { join } from "path";

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
    const audioPath = options.audio;
    const logsPath = options.logs;

  console.log("Reading audio file:", audioPath);

  const transcriber = new ASRTranscriber();
  const processor = new AudioProcessor(audioPath);
  const logProcessor = new LogProcessor(logsPath);

  await transcriber.loadModel();
  const audioData = processor.readAudioFile();

  const output = await Benchmark.measureExecutionTime(() =>
    transcriber.transcribe(audioData),
  );
  logProcessor.processLog(output.text);
})();
