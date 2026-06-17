import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // node 18.15 + Windows: the parallel worker pool crashes ("No test suite
    // found") when multiple test files run at once. Serialize file execution.
    // Drop this once the dev node version moves to >= 18.18 / 20.
    fileParallelism: false,
  },
});
