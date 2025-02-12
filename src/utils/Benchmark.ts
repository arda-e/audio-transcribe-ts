/**
 * Measures the execution time of an asynchronous function and logs the duration to the console.
 *
 * @param asyncFn - An asynchronous function to be measured.
 * @returns The result of the asynchronous function.
 */
export class Benchmark {
  static async measureExecutionTime<T>(asyncFn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    console.log(`Execution duration: ${(end - start) / 1000} seconds`);
    return result;
  }
}
