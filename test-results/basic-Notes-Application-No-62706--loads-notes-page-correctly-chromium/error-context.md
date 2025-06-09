# Test info

- Name: Notes Application >> Notes List Page (/notes) >> loads notes page correctly
- Location: C:\Users\WEBDEV-MAHIPE\Desktop\2025\nextnote\tests\e2e\basic.spec.ts:21:9

# Error details

```
Error: expect.toContainText: Error: strict mode violation: locator('p') resolved to 3 elements:
    1) <p class="text-gray-600">Organize your thoughts by folders</p> aka getByText('Organize your thoughts by')
    2) <p class="text-gray-500">0 notes</p> aka getByText('0 notes')
    3) <p class="text-gray-500 mb-4">No notes in this folder yet</p> aka getByText('No notes in this folder yet')

Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for locator('p')

    at C:\Users\WEBDEV-MAHIPE\Desktop\2025\nextnote\tests\e2e\basic.spec.ts:26:39
```

# Page snapshot

```yaml
- heading "My Notes" [level=1]
- paragraph: Organize your thoughts by folders
- button "Grid View"
- button "List View"
- textbox "Search notes..."
- button "New Folder"
- heading "General" [level=2]
- paragraph: 0 notes
- link "Add Note":
  - /url: /notes/new?folderId=default
- paragraph: No notes in this folder yet
- link "Create First Note":
  - /url: /notes/new?folderId=default
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Test data constants
   4 | const TEST_FOLDER_NAME = 'Test Folder';
   5 | const TEST_NOTE_TITLE = 'Test Note Title';
   6 | const TEST_NOTE_CONTENT = 'This is test note content for automated testing.';
   7 | // const UPDATED_NOTE_TITLE = 'Updated Test Note';
   8 | // const UPDATED_NOTE_CONTENT = 'This is updated test note content.';
   9 |
   10 | test.describe('Notes Application', () => {
   11 |   
   12 |   test.beforeEach(async ({ page }) => {
   13 |     // Navigate to the notes page before each test
   14 |     await page.goto('/notes');
   15 |     // Wait for the page to be fully loaded
   16 |     await expect(page.locator('h1')).toContainText('My Notes');
   17 |   });
   18 |
   19 |   test.describe('Notes List Page (/notes)', () => {
   20 |     
   21 |     test('loads notes page correctly', async ({ page }) => {
   22 |       // Check main heading
   23 |       await expect(page.locator('h1')).toContainText('My Notes');
   24 |       
   25 |       // Check subtitle
>  26 |       await expect(page.locator('p')).toContainText('Organize your thoughts by folders');
      |                                       ^ Error: expect.toContainText: Error: strict mode violation: locator('p') resolved to 3 elements:
   27 |       
   28 |       // Check search input is present
   29 |       await expect(page.locator('input[placeholder="Search notes..."]')).toBeVisible();
   30 |       
   31 |       // Check new folder button is present
   32 |       await expect(page.locator('button', { hasText: 'New Folder' })).toBeVisible();
   33 |       
   34 |       // Check view mode toggles are present
   35 |       await expect(page.locator('[title="Grid View"]')).toBeVisible();
   36 |       await expect(page.locator('[title="List View"]')).toBeVisible();
   37 |     });
   38 |
   39 |     test('can switch between grid and list view modes', async ({ page }) => {
   40 |       const gridButton = page.locator('[title="Grid View"]');
   41 |       const listButton = page.locator('[title="List View"]');
   42 |       
   43 |       // Should start in grid view (default)
   44 |       await expect(gridButton).toHaveClass(/bg-blue-500/);
   45 |       
   46 |       // Switch to list view
   47 |       await listButton.click();
   48 |       await expect(listButton).toHaveClass(/bg-blue-500/);
   49 |       await expect(gridButton).not.toHaveClass(/bg-blue-500/);
   50 |       
   51 |       // Switch back to grid view
   52 |       await gridButton.click();
   53 |       await expect(gridButton).toHaveClass(/bg-blue-500/);
   54 |       await expect(listButton).not.toHaveClass(/bg-blue-500/);
   55 |     });
   56 |
   57 |     test('search functionality works', async ({ page }) => {
   58 |       const searchInput = page.locator('input[placeholder="Search notes..."]');
   59 |       
   60 |       // Type in search box
   61 |       await searchInput.fill('test search term');
   62 |       await expect(searchInput).toHaveValue('test search term');
   63 |       
   64 |       // Clear search
   65 |       await searchInput.clear();
   66 |       await expect(searchInput).toHaveValue('');
   67 |     });
   68 |
   69 |     test('can create a new folder', async ({ page }) => {
   70 |       // Click new folder button
   71 |       await page.locator('button', { hasText: 'New Folder' }).click();
   72 |       
   73 |       // Check modal is visible
   74 |       await expect(page.locator('text=Create New Folder')).toBeVisible();
   75 |       
   76 |       // Fill folder name
   77 |       await page.locator('input[placeholder="Enter folder name"]').fill(TEST_FOLDER_NAME);
   78 |       
   79 |       // Select a color (click the second color option)
   80 |       await page.locator('button[style*="background-color"]').nth(1).click();
   81 |       
   82 |       // Click create button
   83 |       await page.locator('button', { hasText: 'Create Folder' }).click();
   84 |       
   85 |       // Modal should close
   86 |       await expect(page.locator('text=Create New Folder')).not.toBeVisible();
   87 |       
   88 |       // New folder should appear in the list
   89 |       await expect(page.locator('text=' + TEST_FOLDER_NAME)).toBeVisible();
   90 |     });
   91 |
   92 |     test('can cancel folder creation', async ({ page }) => {
   93 |       // Click new folder button
   94 |       await page.locator('button', { hasText: 'New Folder' }).click();
   95 |       
   96 |       // Check modal is visible
   97 |       await expect(page.locator('text=Create New Folder')).toBeVisible();
   98 |       
   99 |       // Click cancel button
  100 |       await page.locator('button', { hasText: 'Cancel' }).click();
  101 |       
  102 |       // Modal should close
  103 |       await expect(page.locator('text=Create New Folder')).not.toBeVisible();
  104 |     });
  105 |
  106 |     test('can close folder modal with X button', async ({ page }) => {
  107 |       // Click new folder button
  108 |       await page.locator('button', { hasText: 'New Folder' }).click();
  109 |       
  110 |       // Check modal is visible
  111 |       await expect(page.locator('text=Create New Folder')).toBeVisible();
  112 |       
  113 |       // Click X button to close
  114 |       await page.locator('button svg').first().click();
  115 |       
  116 |       // Modal should close
  117 |       await expect(page.locator('text=Create New Folder')).not.toBeVisible();
  118 |     });
  119 |
  120 |     test('folder actions menu works', async ({ page }) => {
  121 |       // First create a folder if none exists (skip default folder)
  122 |       const folderMenus = page.locator('button svg.h-5.w-5').filter({ hasText: '' });
  123 |       
  124 |       if (await folderMenus.count() > 0) {
  125 |         // Click the first folder menu (three dots)
  126 |         await folderMenus.first().click();
```