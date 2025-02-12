import { ASRTranscriber } from './ASRTranscriber';
import { AudioProcessor } from './AudioProcessor';
import { Benchmark } from './Benchmark';
import { join } from 'path';

(async () => {
    const audioPath = join(process.cwd(), 'src', 'audio', 'test.wav');
    console.log("Reading audio file:", audioPath);

    const transcriber = new ASRTranscriber();
    const processor = new AudioProcessor(audioPath);

    await transcriber.loadModel();
    const audioData = processor.readAudioFile();

    const output = await Benchmark.measureExecutionTime(() => transcriber.transcribe(audioData));

    console.log(output);
})();
