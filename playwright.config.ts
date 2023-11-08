import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import type { EyesOptions } from './eyes-options';
import { 
  BrowserType,
  DeviceName,
  IosDeviceName, 
  IosVersion,
  ScreenOrientation
} from './eyes-options';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<EyesOptions> = {
  //batchName: 'Example Playwright TypeScript with the ',
  //applicationName: 'ACME Bank',
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 3 * 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',
    headless: false,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Applitools Eyes configurations are included below this comment. */

    /* Sets the name of the Applitools Eyes Batch that will be created when you run this test.  You can also
     * set this value programatically in the eyes-test.ts BatchInfo fixture function, or override this setting
     * by setting the APPLITOOLS_BATCH_NAME environment variable.
     */
    batchName: 'Eyes Playwright Example Tests',
    
    /* Sets the Application Name that will be assigned to all the tests in this batch.  If this is not set, each
     * test will use the title assigned to the outer-most describe block in its spec file.  You can also set this
     * value programatically in the eyes-test.ts Eyes fixture function.
     */
    appName: 'ACME Bank',

    /* Sets the separator string that will be used in between the describe block and test title values used to 
     * construct the appName and/or testName when testNameTitlePath and appNameTitlePath settings are true.
     * The default separator is " -> ".
     */
    //titlePathSepatator: " / ",
    
    /* If testNameTitlePath is set to true the Eyes fixture function in eyes-test.ts will constuct the name for
     * each test by concatentaing all the describe block titles and the test function title, seprateted by the
     * titlePathSeparator string defined above.
     *
     * For example, if the describe blocks titles are "Foo" and "Bar", and the test title is "Test", the Eyes
     * fixture will set the test name to "Foo -> Bar -> Test" when this setting is true.
     */
    //testNameTitlePath: true,

    /* If appNameTitlePath is set to true the Eyes fixture function in eyes-test.ts will constuct the application
     * associated with each test by concatentaing all the describe block titles, seprateted by the
     * titlePathSeparator string defined above, not including the test function title.
     *
     * For example, if the describe blocks titles are "Foo" and "Bar", and the test title is "Test", the Eyes
     * fixture will set the application name to "Foo -> Bar" when this setting is true.
     */
    //appNameTitlePath: true,

    /* Set the useUltraFastGrid setting to true (boolean) to render your app on the Applitools UltraFast Grid.
     */
    useUltraFastGrid: false,

    /* This array sets the Browser and Device configurations Eyes will use to render your application pages on the 
     * UltraFast Grid.  If the useUltraFastGrid is not set or is set to false, this section will be ignored, so
     * there is no need to remove or comment it our when you're NOT using the UFG.
     */
    browsers: [
      // Add 3 desktop browsers with different viewports for cross-browser testing in the Ultrafast Grid.
      // Other browsers are also available, like Edge and IE.
      { width: 800, height:600, name: BrowserType.CHROME },
      { width: 1600, height: 1200, name: BrowserType.FIREFOX },
      { width: 1024, height: 768, name: BrowserType.SAFARI },
      // Add 2 mobile emulation devices with different orientations for cross-browser testing in the Ultrafast Grid.
      // Other mobile devices are available.
      { deviceName: DeviceName.iPhone_11, screenOrientation: ScreenOrientation.PORTRAIT },
      { deviceName: DeviceName.Pixel_5, screenOrientation: ScreenOrientation.LANDSCAPE },
      // Add 2 mobile "chromeEmulation" devices with different orientations
      { chromeEmulationInfo: { deviceName: DeviceName.OnePlus_7T_Pro } }, // screen orientation is PORTRAIT by default
      { chromeEmulationInfo: { deviceName: DeviceName.Kindle_Fire_HDX, screenOrientation: ScreenOrientation.LANDSCAPE } },
      // Add 2 mobile iOS emulated devices with different iOS versions and screen orientations.
      { iosDeviceInfo: { deviceName: IosDeviceName.iPad_Air_4, iosVersion: IosVersion.ONE_VERSION_BACK }},
      { iosDeviceInfo: { deviceName: IosDeviceName.iPhone_14_Pro_Max, iosVersion: IosVersion.LATEST, screenOrientation: ScreenOrientation.LANDSCAPE } }
    ]
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    /*{
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },*/

    /*{
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },*/

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

export default config;
