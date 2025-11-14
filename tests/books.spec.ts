import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost/');
  await expect(page.getByRole('heading', { name: 'BOOKS' })).toBeVisible();

  await page.getByRole('heading', { name: 'Giant\'s Bread' }).click();
  await expect(page.locator('#root')).toContainText('Giant\'s Bread');
  await page.getByRole('listitem').filter({ hasText: 'Agatha ChristieGiant\'s Bread$' }).getByRole('button').click();
  await expect(page.locator('span')).toContainText('1');
  await page.getByRole('link', { name: 'Manage Books' }).click();
});
