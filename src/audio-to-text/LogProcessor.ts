import fs from 'fs';
import path from 'path';
import { ILogProcessor } from "../types";

export class LogProcessor implements ILogProcessor {
  private readonly logFilePath: string;
  private readonly logFile: fs.WriteStream;

  constructor(logsDir: string) {
    // Create a timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `log-${timestamp}.txt`;

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create full path for log file inside logs directory
    this.logFilePath = path.join(logsDir, fileName);
    this.logFile = fs.createWriteStream(this.logFilePath, { flags: 'a' });

    // Write initial log entry
    this.logFile.write(`Log file created at ${new Date().toISOString()}\n`);
  }

  processLog(logData: string): void {
    const timestamp = new Date().toISOString();
    this.logFile.write(`[${timestamp}] ${logData}\n`);
  }

  private closeLogFile(): void {
    this.logFile.end();
  }
}
