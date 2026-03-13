import { expect, test } from '@playwright/test';

test('loads core workspace UI', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'VTL Emulator' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Render' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Template' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Output' })).toBeVisible();
});

test('opens and closes settings modal', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0);
});

test('opens actions menu and navigates tabs', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Actions' }).click();
  await expect(page.getByText('Import')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('tab', { name: 'Variables' }).click();
  await expect(page.getByText('Variable Groups')).toBeVisible();
});
