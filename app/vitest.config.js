import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // node 18.15 + Windows: the default threads pool crashes ("No test suite
    // found") with multiple files / mixed environments. Use forked child
    // processes, one at a time. Revisit once dev node moves to >= 18.18 / 20.
    // One forked child process PER FILE, run serially. singleFork:true (all
    // files in one process) clashes when files use different environments
    // (happy-dom vs node) and reports "no tests".
    pool: 'forks',
    fileParallelism: false,
  },
});
