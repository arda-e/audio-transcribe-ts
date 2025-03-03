import fs from "fs";
import path from "path";
import { ILogProcessor } from "../types";

/**
 * Log processor that writes logs in batches to optimize performance.
 */
export class LogProcessor implements ILogProcessor {
  private static readonly LOG_FLUSH_INTERVAL_MS = 5000;
  private readonly logFilePath: string;
  private readonly logBuffer: string[] = [];
  private readonly logStream: fs.WriteStream;
  private isClosed: boolean = false;

  private flushInterval: NodeJS.Timeout;

  constructor(logsDir: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `log-${timestamp}.txt`;

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logFilePath = path.join(logsDir, fileName);
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: "a" });

    this.flushInterval = setInterval(() => this.flushLogs(), LogProcessor.LOG_FLUSH_INTERVAL_MS);
    process.on("exit", () => this.closeLogFile());
    process.on("SIGINT", () => {
      this.closeLogFile();
      process.exit(0);
    });
  }

  /**
   * Buffers log messages and writes them to the log file in batches.
   * @param logData - The log data to be written.
   */
  processLog(logData: string): void {
    if (this.isClosed) {
      console.warn("Attempted to log after file was closed.");
      return;
    }

    const timestamp = new Date().toISOString();
    this.logBuffer.push(`[${timestamp}] ${logData}`);

    if (this.logBuffer.length >= 10) {
      this.flushLogs();
    }
  }

  /**
   * Writes buffered logs to the file and clears the buffer.
   */
  private flushLogs(): void {
    if (this.isClosed || this.logBuffer.length === 0) return;

    this.logStream.write(this.logBuffer.join("\n") + "\n");
    this.logBuffer.length = 0; // Clear buffer
  }

  /**
   * Cleans up resources when shutting down.
   */
  private closeLogFile(): void {
    if (this.isClosed) return;

    console.log("Closing log file...");
    clearInterval(this.flushInterval);
    this.flushLogs();
    this.logStream.end();
    this.isClosed = true;
  }
}