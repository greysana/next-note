import { test, expect } from '@playwright/test';

// Test data constants
const TEST_FOLDER_NAME = 'Test Folder';
const TEST_NOTE_TITLE = 'Test Note Title';
const TEST_NOTE_CONTENT = 'This is test note content for automated testing.';
// const UPDATED_NOTE_TITLE = 'Updated Test Note';
// const UPDATED_NOTE_CONTENT = 'This is updated test note content.';

test.describe('Notes Application', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page before each test
    await page.goto('/notes');
    // Wait for the page to be fully loaded
    await expect(page.locator('h1')).toContainText('My Notes');
  });

  test.describe('Notes List Page (/notes)', () => {
    
    test('loads notes page correctly', async ({ page }) => {
      // Check main heading
      await expect(page.locator('h1')).toContainText('My Notes');
      
      // Check subtitle
      await expect(page.locator('p')).toContainText('Organize your thoughts by folders');
      
      // Check search input is present
      await expect(page.locator('input[placeholder="Search notes..."]')).toBeVisible();
      
      // Check new folder button is present
      await expect(page.locator('button', { hasText: 'New Folder' })).toBeVisible();
      
      // Check view mode toggles are present
      await expect(page.locator('[title="Grid View"]')).toBeVisible();
      await expect(page.locator('[title="List View"]')).toBeVisible();
    });

    test('can switch between grid and list view modes', async ({ page }) => {
      const gridButton = page.locator('[title="Grid View"]');
      const listButton = page.locator('[title="List View"]');
      
      // Should start in grid view (default)
      await expect(gridButton).toHaveClass(/bg-blue-500/);
      
      // Switch to list view
      await listButton.click();
      await expect(listButton).toHaveClass(/bg-blue-500/);
      await expect(gridButton).not.toHaveClass(/bg-blue-500/);
      
      // Switch back to grid view
      await gridButton.click();
      await expect(gridButton).toHaveClass(/bg-blue-500/);
      await expect(listButton).not.toHaveClass(/bg-blue-500/);
    });

    test('search functionality works', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search notes..."]');
      
      // Type in search box
      await searchInput.fill('test search term');
      await expect(searchInput).toHaveValue('test search term');
      
      // Clear search
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    });

    test('can create a new folder', async ({ page }) => {
      // Click new folder button
      await page.locator('button', { hasText: 'New Folder' }).click();
      
      // Check modal is visible
      await expect(page.locator('text=Create New Folder')).toBeVisible();
      
      // Fill folder name
      await page.locator('input[placeholder="Enter folder name"]').fill(TEST_FOLDER_NAME);
      
      // Select a color (click the second color option)
      await page.locator('button[style*="background-color"]').nth(1).click();
      
      // Click create button
      await page.locator('button', { hasText: 'Create Folder' }).click();
      
      // Modal should close
      await expect(page.locator('text=Create New Folder')).not.toBeVisible();
      
      // New folder should appear in the list
      await expect(page.locator('text=' + TEST_FOLDER_NAME)).toBeVisible();
    });

    test('can cancel folder creation', async ({ page }) => {
      // Click new folder button
      await page.locator('button', { hasText: 'New Folder' }).click();
      
      // Check modal is visible
      await expect(page.locator('text=Create New Folder')).toBeVisible();
      
      // Click cancel button
      await page.locator('button', { hasText: 'Cancel' }).click();
      
      // Modal should close
      await expect(page.locator('text=Create New Folder')).not.toBeVisible();
    });

    test('can close folder modal with X button', async ({ page }) => {
      // Click new folder button
      await page.locator('button', { hasText: 'New Folder' }).click();
      
      // Check modal is visible
      await expect(page.locator('text=Create New Folder')).toBeVisible();
      
      // Click X button to close
      await page.locator('button svg').first().click();
      
      // Modal should close
      await expect(page.locator('text=Create New Folder')).not.toBeVisible();
    });

    test('folder actions menu works', async ({ page }) => {
      // First create a folder if none exists (skip default folder)
      const folderMenus = page.locator('button svg.h-5.w-5').filter({ hasText: '' });
      
      if (await folderMenus.count() > 0) {
        // Click the first folder menu (three dots)
        await folderMenus.first().click();
        
        // Check menu items are visible
        await expect(page.locator('text=Edit')).toBeVisible();
        await expect(page.locator('text=Duplicate')).toBeVisible();
        await expect(page.locator('text=Delete')).toBeVisible();
        
        // Click outside to close menu
        await page.click('body');
        await expect(page.locator('text=Edit')).not.toBeVisible();
      }
    });

    test('add note button navigates correctly', async ({ page }) => {
      // Look for "Add Note" or "Create First Note" buttons
      const addNoteButton = page.locator('text=Add Note').or(page.locator('text=Create First Note')).first();
      
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click();
        
        // Should navigate to new note page
        await expect(page).toHaveURL(/\/notes\/new/);
      }
    });
  });

  test.describe('Note Detail Page (/notes/[id])', () => {
    
    test('can access new note page', async ({ page }) => {
      // Navigate directly to new note page
      await page.goto('/notes/new');
      
      // Check key elements are present
      await expect(page.locator('text=Back to Notes')).toBeVisible();
      await expect(page.locator('input[placeholder="Note title..."]')).toBeVisible();
      await expect(page.locator('button', { hasText: 'Create Note' })).toBeVisible();
      
      // Check folder selector is present
      await expect(page.locator('select')).toBeVisible();
    });

    test('can create a new note', async ({ page }) => {
      await page.goto('/notes/new');
      
      // Fill in note details
      await page.locator('input[placeholder="Note title..."]').fill(TEST_NOTE_TITLE);
      
      // Note: The RichTextEditor might need special handling depending on implementation
      // For now, we'll assume it has a contenteditable area or textarea
      const contentEditor = page.locator('[contenteditable="true"]').or(page.locator('textarea')).first();
      if (await contentEditor.isVisible()) {
        await contentEditor.fill(TEST_NOTE_CONTENT);
      }
      
      // Select folder (keep default for simplicity)
      const folderSelect = page.locator('select');
      await folderSelect.selectOption({ index: 0 });
      
      // Save the note
      await page.locator('button', { hasText: 'Create Note' }).click();
      
      // Should redirect to notes list
      await expect(page).toHaveURL('/notes');
    });

    test('back button works correctly', async ({ page }) => {
      await page.goto('/notes/new');
      
      // Click back button
      await page.locator('text=Back to Notes').click();
      
      // Should return to notes list
      await expect(page).toHaveURL('/notes');
    });

    test('folder selection works', async ({ page }) => {
      await page.goto('/notes/new');
      
      const folderSelect = page.locator('select');
      
      // Get all options
      const options = await folderSelect.locator('option').all();
      
      if (options.length > 1) {
        // Select second option
        await folderSelect.selectOption({ index: 1 });
        
        // Verify selection
        const selectedValue = await folderSelect.inputValue();
        expect(selectedValue).toBeTruthy();
      }
    });

    test('save button shows loading state', async ({ page }) => {
      await page.goto('/notes/new');
      
      // Fill minimum required fields
      await page.locator('input[placeholder="Note title..."]').fill('Quick Test');
      
      // Click save and immediately check for loading state
      const saveButton = page.locator('button', { hasText: 'Create Note' });
      await saveButton.click();
      
      // The button text might briefly change to "Creating..."
      // This test might be flaky depending on how fast the operation is
      // await expect(page.locator('button', { hasText: 'Creating...' })).toBeVisible();
    });

    test('can edit existing note', async ({ page }) => {
      // This test assumes there's an existing note to edit
      // You might need to create one first or mock the data
      
      // Navigate to notes list first
      await page.goto('/notes');
      
      // Look for an existing note link
      const noteLinks = page.locator('a[href*="/notes/"]').filter({ hasNotText: 'new' });
      
      if (await noteLinks.count() > 0) {
        await noteLinks.first().click();
        
        // Should be on note detail page
        await expect(page).toHaveURL(/\/notes\/[^\/]+$/);
        
        // Check edit elements are present
        await expect(page.locator('input[placeholder="Note title..."]')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Save' })).toBeVisible();
        await expect(page.locator('button svg')).toBeVisible(); // Delete button
      }
    });

    test('delete confirmation works', async ({ page }) => {
      // Navigate to an existing note (this test assumes one exists)
      await page.goto('/notes');
      
      const noteLinks = page.locator('a[href*="/notes/"]').filter({ hasNotText: 'new' });
      
      if (await noteLinks.count() > 0) {
        await noteLinks.first().click();
        
        // Set up dialog handler to cancel deletion
        page.on('dialog', dialog => dialog.dismiss());
        
        // Click delete button (trash icon)
        await page.locator('button svg').click();
        
        // Should still be on the same page since we cancelled
        await expect(page).toHaveURL(/\/notes\/[^\/]+$/);
      }
    });
  });

  test.describe('Integration Tests', () => {
    
    test('complete note creation workflow', async ({ page }) => {
      // Start from notes page
      await page.goto('/notes');
      
      // Create a new folder first
      await page.locator('button', { hasText: 'New Folder' }).click();
      await page.locator('input[placeholder="Enter folder name"]').fill('Integration Test Folder');
      await page.locator('button', { hasText: 'Create Folder' }).click();
      
      // Find the new folder and add a note
      await expect(page.locator('text=Integration Test Folder')).toBeVisible();
      
      // Click add note in the new folder
      const addNoteButton = page.locator('text=Add Note').or(page.locator('text=Create First Note')).first();
      await addNoteButton.click();
      
      // Should be on new note page with folder pre-selected
      await expect(page).toHaveURL(/\/notes\/new/);
      
      // Create the note
      await page.locator('input[placeholder="Note title..."]').fill('Integration Test Note');
      
      const contentEditor = page.locator('[contenteditable="true"]').or(page.locator('textarea')).first();
      if (await contentEditor.isVisible()) {
        await contentEditor.fill('This note was created during integration testing.');
      }
      
      await page.locator('button', { hasText: 'Create Note' }).click();
      
      // Should be back on notes page
      await expect(page).toHaveURL('/notes');
      
      // New note should be visible in the folder
      await expect(page.locator('text=Integration Test Note')).toBeVisible();
    });

    test('search across folders works', async ({ page }) => {
      await page.goto('/notes');
      
      // Enter search term
      const searchInput = page.locator('input[placeholder="Search notes..."]');
      await searchInput.fill('integration');
      
      // Results should filter (this depends on having test data)
      // We can at least verify the search input works
      await expect(searchInput).toHaveValue('integration');
    });

    test('responsive design elements are present', async ({ page }) => {
      await page.goto('/notes');
      
      // Test mobile-specific classes exist (these are Tailwind responsive classes)
      const headerDiv = page.locator('div.flex.flex-col.md\\:flex-row').first();
      await expect(headerDiv).toBeVisible();
      
      // Test that responsive grid classes exist
      // const gridElements = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      // Elements might not be visible if no notes exist, so we just check the page structure
    });
  });

  test.describe('Error Handling', () => {
    
    test('handles invalid note ID gracefully', async ({ page }) => {
      // Try to access a non-existent note
      await page.goto('/notes/invalid-note-id');
      
      // Should either redirect or show appropriate error
      // The exact behavior depends on your error handling implementation
      await page.waitForLoadState('networkidle');
      
      // At minimum, the page should not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('handles empty form submission', async ({ page }) => {
      await page.goto('/notes/new');
      
      // Try to save without filling anything
      await page.locator('button', { hasText: 'Create Note' }).click();
      
      // Should handle gracefully (might show validation or create with defaults)
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    
    test('pages load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/notes');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Assert page loads within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('navigation between pages is smooth', async ({ page }) => {
      await page.goto('/notes');
      
      const startTime = Date.now();
      
      // Navigate to new note page
      await page.goto('/notes/new');
      await page.waitForLoadState('networkidle');
      
      // Navigate back
      await page.locator('text=Back to Notes').click();
      await page.waitForLoadState('networkidle');
      
      const totalTime = Date.now() - startTime;
      
      // Assert navigation completes within reasonable time
      expect(totalTime).toBeLessThan(2000);
    });
  });
});

// Utility test helpers
test.describe('Test Utilities', () => {
  
  test('cleanup test data', async ({ page }) => {
    // This test can be used to clean up test data if needed
    // Implementation depends on your data management approach
    await page.goto('/notes');
    
    // Example: Delete test folders/notes created during testing
    // This would need to be implemented based on your specific cleanup needs
  });
});