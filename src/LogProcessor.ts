import fs from 'fs';
import {ILogProcessor} from "./types";
import * as path from "node:path";

export class LogProcessor implements ILogProcessor {
    private readonly logFilePath: string;
    private readonly logFile: fs.WriteStream;

    constructor(logFilePath: string) {
        this.logFilePath = logFilePath;
        const logDirectory = path.dirname(logFilePath);

        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, { recursive: true });
        }

        this.logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
    }

    processLog(logData: string): void {
        this.logFile.write(logData + '\n');
        this.closeLogFile()
    }

    private closeLogFile(): void {
        this.logFile.end();
    }
}
