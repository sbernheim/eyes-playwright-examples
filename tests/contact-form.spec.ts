import { test } from '../eyes-test';
import { Target } from '@applitools/eyes-playwright';

// This "describe" method contains related test cases with per-test setup and cleanup.
test.describe('Contact Form', () => {

  test('submit an empty contact form', async ({ page, eyes }) => {

    await page.goto('https://sandbox.applitools.com/samples/form');

    await eyes.check('Contact form', Target.window().fully().strict());

    await page.getByText('Submit').click();

    await eyes.check('Contact form with errors', Target.window().fully().strict());
  })

});