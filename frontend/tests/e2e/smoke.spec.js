import { expect, test } from '@playwright/test';

async function waitForWorkspace(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'VTL Emulator' })).toBeVisible();
  await expect(page.locator('.modern-loading-overlay')).toHaveCount(0);
}

test('loads core workspace UI', async ({ page }) => {
  await waitForWorkspace(page);

  await expect(page.getByRole('button', { name: 'Render' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Template' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Output' })).toBeVisible();
});

test('opens and closes settings modal', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0);
});

test('opens actions menu and navigates tabs', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Actions' }).click();
  await expect(page.getByText('Import')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('tab', { name: 'Variables' }).click();
  await expect(page.getByText('Variable Groups')).toBeVisible();
});

test('renders template and shows output controls', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Render' }).click();
  await expect(page.locator('#result')).toContainText('Hello, World!');
  await expect(page.locator('.modern-performance-stats')).toContainText('Render:');

  await expect(page.getByRole('button', { name: 'Pretty JSON' })).toHaveClass(/active/);
  await page.getByRole('button', { name: 'Pretty JSON' }).click();
  await expect(page.getByRole('button', { name: 'Pretty JSON' })).not.toHaveClass(/active/);

  await page.getByRole('button', { name: 'Wrap' }).click();
  await expect(page.locator('#result')).toHaveClass(/result-wrap/);
});

test('supports debug flow and debug panel', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Debug' }).click();
  await page.getByRole('button', { name: 'Render' }).click();

  await expect(page.getByText('Debug Information')).toBeVisible();
  await expect(page.getByText('Rendering completed in')).toBeVisible();
});

test('can add and clear variables', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('tab', { name: 'Variables' }).click();
  await page.getByRole('button', { name: 'Add Variable' }).click();
  await expect(page.locator('input[placeholder="Key"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Clear All' }).click();
  await page.getByRole('button', { name: 'Confirm Clear' }).click();
  await expect(page.locator('input[placeholder="Key"]')).toHaveCount(0);
});

test('persists settings updates', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.selectOption('select[name="fontSize"]', '18');
  await page.getByRole('button', { name: 'Save Settings' }).click();

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.locator('select[name="fontSize"]')).toHaveValue('18');
  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('exports configuration from actions menu', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Actions' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Export').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^vtl-config-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByText('Configuration exported.')).toBeVisible();
});

test('opens and closes help modal from toolbar button', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Help' }).click();
  await expect(page.getByRole('heading', { name: 'VTL Emulator Help' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'VTL Emulator Help' })).toHaveCount(0);
});

test('opens help modal with keyboard shortcut', async ({ page }) => {
  await waitForWorkspace(page);

  await page.keyboard.press('Control+/');
  await expect(page.getByRole('heading', { name: 'VTL Emulator Help' })).toBeVisible();
});

test('toggles auto render button state', async ({ page }) => {
  await waitForWorkspace(page);

  const autoButton = page.getByRole('button', { name: 'Auto' });
  await autoButton.click();
  await expect(page.getByRole('button', { name: 'Auto ON' })).toBeVisible();
  await page.getByRole('button', { name: 'Auto ON' }).click();
  await expect(page.getByRole('button', { name: 'Auto' })).toBeVisible();
});

test('inserts snippet and returns to template tab', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('tab', { name: 'Snippets' }).click();
  await expect(page.locator('.modern-snippet-item').first()).toBeVisible();
  await page.locator('.modern-snippet-item').first().click();
  await expect(page.getByRole('tab', { name: 'Template', selected: true })).toBeVisible();
});

test('clears result and shows toast', async ({ page }) => {
  await waitForWorkspace(page);

  await page.getByRole('button', { name: 'Render' }).click();
  await expect(page.locator('#result')).toContainText('Hello, World!');

  await page.locator('button[title="Clear"]').click();
  await expect(page.locator('#result')).toContainText('Click "Render" to see the VTL output here...');
  await expect(page.getByText('Output cleared.')).toBeVisible();
});
