import { test as base } from '@playwright/test';
import {
  BatchInfo,
  Configuration,
  EyesRunner,
  ClassicRunner,
  VisualGridRunner,
  BrowserType,
  Eyes,
} from '@applitools/eyes-playwright';
import { 
  EyesOptions, 
  EyesDevice, 
  DesktopBrowserInfo, 
  ChromeEmulationInfo, 
  IOSDeviceInfo
} from './eyes-options';

// Settings to control how tests are run.
// These could be set by environment variables or other input mechanisms.
// They are hard-coded here to keep the example project simple.

// Applitools objects to share for all tests as worker-scoped fixtures
type EyesContext = {
  batchInfo: BatchInfo;
  eyesConfig: Configuration,
  runner: EyesRunner;
};

// Playwright will instantiate a new Applitools Eyes object fixture for each
// test that needs one as a test-scoped fixture.
type EyesTest = {
  eyes: Eyes;
};

const USE_ULTRAFAST_GRID = process.env.USE_ULTRAFAST_GRID;
let globalBatchId = process.env.APPLITOOLS_BATCH_ID;
let globalBatchName = process.env.APPLITOOLS_BATCH_NAME;
let globalAppName = process.env.APPLITOOLS_APP_NAME;

function testPathTitle (path: string[], separator: string = " -> "): string  {
  return path.slice(1).join(separator);
}

function appPathTitle (path: string[], separator?: string): string {
  return testPathTitle(path.slice(0,-1), separator);
}

function useUFG (opts: EyesOptions): boolean {
  return USE_ULTRAFAST_GRID == undefined ? Boolean(opts.useUltraFastGrid) : Boolean(USE_ULTRAFAST_GRID);
}

// This method sets up the configuration for running visual tests.
// The configuration is shared by all tests in a test suite, so it belongs in a worker-scoped fixture.
// This fixture is shared across all your test classes to avoid duplication.
export const test = base.extend<EyesOptions & EyesTest, EyesContext>({
  batchInfo: [ async({}, use, workerInfo) => {
    const opts = workerInfo.project.use as EyesOptions;
    // Create a new batch for tests.
    // A batch is the collection of visual checkpoints for a test suite.
    // Batches are displayed in the Eyes Test Manager, so use meaningful names.
    const runnerName = useUFG(opts) ? 'Ultrafast Grid' : 'Classic Runner';
    const batchName = globalBatchName || opts.batchName || `Eyes Playwright TypeScript Test with ${runnerName}`;
    let batchInfo = new BatchInfo({name: batchName});

    const batchId = batchInfo.getId();
    // Share this batch ID with other worker processes
    // TODO - This might need to be moved to a globalSetup or hook function
    process.env.APPLITOOLS_BATCH_ID = globalBatchId || batchId;

    await use(batchInfo);
  }, { scope: 'worker' }],

  eyesConfig: [ async({ batchInfo }, use, workerInfo) => {
    const opts = workerInfo.project.use as EyesOptions;
    // Create a configuration for Applitools Eyes.
    let eyesConfig = new Configuration();

    // Set the batch for the config.
    eyesConfig.setBatch(batchInfo);

    // If running tests on the Ultrafast Grid, configure browsers.
    if (useUFG(opts)) {

      const browsers = opts.browsers;
      if (browsers) {
        for (const eyesBrowser of browsers) {
          // Must cast the browser configuations from the Playwright config file to their
          // correct types before passing them to the Configuration.addBrowser function.
          if ('chromeEmulationInfo' in eyesBrowser) {
            eyesConfig.addBrowser(eyesBrowser as ChromeEmulationInfo);
          } else if ('iosDeviceInfo' in eyesBrowser) {
            eyesConfig.addBrowser(eyesBrowser as IOSDeviceInfo);
          } else if ('deviceName' in eyesBrowser) {
            eyesConfig.addBrowser(eyesBrowser as EyesDevice);
          } else if ('width' in eyesBrowser && 'height' in eyesBrowser) {
            eyesConfig.addBrowser(eyesBrowser as DesktopBrowserInfo)
          } else {
            console.log('Browser Configuration type was not recognized!')
            console.log(eyesBrowser)
          }
        }
      // If no browser configurations were defined, use the Playwright browser viewport settings
      // or reasonable default values, and render checkpoint images with the browser config below.
      } else {
        const width = workerInfo.project.use.viewport?.width || 1024;
        const height = workerInfo.project.use.viewport?.height || 768;
        eyesConfig.addBrowser( width, height, BrowserType.CHROME );
      }
    }

    // Pass the Eyes configuration to the using test, hook or fixture
    await use(eyesConfig);
  }, { scope: 'worker' }],

  runner: [ async({}, use, workerInfo) => {
    const opts = workerInfo.project.use as EyesOptions;

    let runner: EyesRunner;

    if (useUFG(opts)) {
      // Create the runner for the Ultrafast Grid.
      // Concurrency refers to the number of visual checkpoints Applitools will perform in parallel.
      // Warning: If you have a free account, then concurrency will be limited to 1.
      runner = new VisualGridRunner({ testConcurrency: 5 });
    }
    else {
      // Create the classic runner.
      runner = new ClassicRunner();
    }

    await use(runner);

    // TODO - Check an option to decide whether to call runner.getAllTestResults() to implicitly
    //        close the batch and print all the test results OR explicitly close the batch
    // Close the batch and report visual differences to the console.
    // Note that it forces Playwright to wait synchronously for all visual checkpoints to complete.
    const results = await runner.getAllTestResults();
    console.log('Visual test results', results);
  }, { scope: 'worker' }],

  eyes: async({ page, runner, eyesConfig }, use, testInfo) => {

    let projectUse = test.info().project.use;
    let applitoolsConfigs = projectUse as EyesOptions;
    let sep = applitoolsConfigs.titlePathSepatator;
    const appName = globalAppName || 
      applitoolsConfigs.appNameTitlePath ? appPathTitle(testInfo.titlePath, sep) : applitoolsConfigs.appName || 
      testInfo.titlePath[1];
    const testName = applitoolsConfigs.testNameTitlePath ? testPathTitle(testInfo.titlePath, sep) : applitoolsConfigs.testName || testInfo.title;

    // Create the Applitools Eyes object connected to the runner and set its configuration.
    let eyes = new Eyes(runner, eyesConfig);

    // Set the Eyes browser viewport from the Playwright browser viewport settings or reasonable defaults.
    const width = testInfo.project.use.viewport?.width || 1024;
    const height = testInfo.project.use.viewport?.height || 768;

    // Open Eyes to start visual testing.
    // Each test should open its own Eyes for its own snapshots.
    // It is a recommended practice to set all four inputs below:
    await eyes.open(
      
      // The Playwright page object to "watch"
      page,
      
      // The name of the application under test.
      // All tests for the same app should share the same app name.
      // Set this name wisely: Applitools features rely on a shared app name across tests.
      appName,
      
      // The name of the test case for the given application.
      // Additional unique characteristics of the test may also be specified as part of the test name,
      // such as localization information ("Home Page - EN") or different user permissions ("Login by admin"). 
      testName,
      
      // The viewport size for the local browser.
      // Eyes will resize the web browser to match the requested viewport size.
      // This parameter is optional but encouraged in order to produce consistent results.
      { width: width, height: height }
    );
  
    await use(eyes);
  
    // Close Eyes after the test!
    await eyes.close();
    // TODO - either close asynchronously or do something with the test results!
  }

});
export { expect } from '@playwright/test';