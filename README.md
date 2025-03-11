# Audio Transcribe TS

A TypeScript application for real-time audio transcription using the Whisper model with multi-threading and stream processing capabilities.

## Overview

This project demonstrates advanced audio processing techniques including:
- Stream-based audio processing
- Multi-threading for improved performance
- Integration with Whisper ASR model running locally for accurate transcription
- TypeScript implementation for type safety

## Features

- **Real-time Transcription**: Process audio streams on-the-fly
- **Multi-threaded Processing**: Utilize all available CPU cores for faster transcription
- **Local Whisper Model**: Run the Whisper speech recognition model directly on your device without API dependencies
- **Type-Safe Implementation**: Built with TypeScript for better code reliability

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
THREADS_COUNT=4  # Adjust based on your CPU
MODEL_PATH=path/to/whisper/model  # Path to your local Whisper model
```

## Usage

### Start Transcription Service

```bash
npm run start
```

### Process an Audio File

```bash
npm run transcribe -- --file=path/to/audio.mp3
```

### Stream Processing

```bash
npm run stream -- --source=microphone
```

## Architecture

The application uses a worker thread pool to distribute audio processing tasks efficiently. The main process handles I/O operations while worker threads perform CPU-intensive transcription tasks using the locally-running Whisper model.

```
┌─────────────────┐
│  Main Process   │
│  (Stream I/O)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Thread Pool    │
│  Manager        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────┐  ┌─────────┐           │
│  │ Worker  │  │ Worker  │   ...     │
│  │ Thread 1│  │ Thread 2│           │
│  └─────────┘  └─────────┘           │
│                                     │
└─────────────────────────────────────┘
```

## Development

### Building the Project

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## License

MIT
