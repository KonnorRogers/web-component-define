import { playwrightLauncher } from '@web/test-runner-playwright'

/**
 * @type {import("@web/test-runner").TestRunnerConfig}
 */
export default {
  rootDir: ".",
  nodeResolve: true,
  watch: process.argv.includes("--watch"),
  esbuildTarget: "auto",
  files: [
    "src/**/*.test.js",
    "tests/**/*.test.js"
  ],
  browsers: [
    playwrightLauncher({product: "chromium"}),
    playwrightLauncher({product: "firefox"}),
    playwrightLauncher({product: "webkit"}),
  ],
  testFramework: {
    config: {
      ui: 'tdd',
      timeout: '2000',
    }
  }

}
