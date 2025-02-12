import { ASRTranscriber } from './ASRTranscriber';
import { AudioProcessor } from './AudioProcessor';
import { Benchmark } from './Benchmark';
import {LogProcessor} from "./LogProcessor";

import { join } from 'path';

(async () => {
    const audioPath = join(process.cwd(), 'src', 'audio', 'test.wav');
    const logPath = join(process.cwd(), 'src', 'logs', 'log.txt');

    console.log("Reading audio file:", audioPath);

    const transcriber = new ASRTranscriber();
    const processor = new AudioProcessor(audioPath);
    const logProcessor = new LogProcessor(logPath);

    await transcriber.loadModel();
    const audioData = processor.readAudioFile();

    const output = await Benchmark.measureExecutionTime(() => transcriber.transcribe(audioData));
    logProcessor.processLog(output.text);
    console.log(output);
})();
