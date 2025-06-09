# Test info

- Name: Notes Application >> Note Detail Page (/notes/[id]) >> can edit existing note
- Location: C:\Users\WEBDEV-MAHIPE\Desktop\2025\nextnote\tests\e2e\basic.spec.ts:234:9

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('button').filter({ hasText: 'Save' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('button').filter({ hasText: 'Save' })

    at C:\Users\WEBDEV-MAHIPE\Desktop\2025\nextnote\tests\e2e\basic.spec.ts:252:67
```

# Page snapshot

```yaml
- button "AI Generate":
  - img
  - text: AI Generate
- link "Back to Notes":
  - /url: /notes
- button "Create Note"
- textbox "Note title..."
- combobox:
  - option "General" [selected]
- text: General
- textbox:
  - paragraph
- button "Bold (Ctrl+B)":
  - img
- button "Italic (Ctrl+I)":
  - img
- button "Underline (Ctrl+U)":
  - img
- button "Text Color":
  - img
- button "Highlight Color":
  - img
- button "Headings":
  - img
- button "Bullet List":
  - img
- button "Numbered List":
  - img
- button "Align Left":
  - img
- button "Align Center":
  - img
- button "Align Right":
  - img
- button "Justify":
  - img
- button "Quote Block":
  - img
- button "Code Block":
  - img
- button "Insert Horizontal Line":
  - img
- button "Select text first to add link":
  - img
- button "Insert Link Card":
  - img
- button "Insert Image":
  - img
- button "Upload Image":
  - img
- button "Add Video from URL":
  - img
- button "Add Audio from URL":
  - img
- button "Record Audio":
  - img
- button "Upload Video/Audio File":
  - img
- button "Insert Table":
  - img
- button "Undo (Ctrl+Z)":
  - img
- button "Redo (Ctrl+Y)":
  - img
- alert
```

# Test source

```ts
  152 |   test.describe('Note Detail Page (/notes/[id])', () => {
  153 |     
  154 |     test('can access new note page', async ({ page }) => {
  155 |       // Navigate directly to new note page
  156 |       await page.goto('/notes/new');
  157 |       
  158 |       // Check key elements are present
  159 |       await expect(page.locator('text=Back to Notes')).toBeVisible();
  160 |       await expect(page.locator('input[placeholder="Note title..."]')).toBeVisible();
  161 |       await expect(page.locator('button', { hasText: 'Create Note' })).toBeVisible();
  162 |       
  163 |       // Check folder selector is present
  164 |       await expect(page.locator('select')).toBeVisible();
  165 |     });
  166 |
  167 |     test('can create a new note', async ({ page }) => {
  168 |       await page.goto('/notes/new');
  169 |       
  170 |       // Fill in note details
  171 |       await page.locator('input[placeholder="Note title..."]').fill(TEST_NOTE_TITLE);
  172 |       
  173 |       // Note: The RichTextEditor might need special handling depending on implementation
  174 |       // For now, we'll assume it has a contenteditable area or textarea
  175 |       const contentEditor = page.locator('[contenteditable="true"]').or(page.locator('textarea')).first();
  176 |       if (await contentEditor.isVisible()) {
  177 |         await contentEditor.fill(TEST_NOTE_CONTENT);
  178 |       }
  179 |       
  180 |       // Select folder (keep default for simplicity)
  181 |       const folderSelect = page.locator('select');
  182 |       await folderSelect.selectOption({ index: 0 });
  183 |       
  184 |       // Save the note
  185 |       await page.locator('button', { hasText: 'Create Note' }).click();
  186 |       
  187 |       // Should redirect to notes list
  188 |       await expect(page).toHaveURL('/notes');
  189 |     });
  190 |
  191 |     test('back button works correctly', async ({ page }) => {
  192 |       await page.goto('/notes/new');
  193 |       
  194 |       // Click back button
  195 |       await page.locator('text=Back to Notes').click();
  196 |       
  197 |       // Should return to notes list
  198 |       await expect(page).toHaveURL('/notes');
  199 |     });
  200 |
  201 |     test('folder selection works', async ({ page }) => {
  202 |       await page.goto('/notes/new');
  203 |       
  204 |       const folderSelect = page.locator('select');
  205 |       
  206 |       // Get all options
  207 |       const options = await folderSelect.locator('option').all();
  208 |       
  209 |       if (options.length > 1) {
  210 |         // Select second option
  211 |         await folderSelect.selectOption({ index: 1 });
  212 |         
  213 |         // Verify selection
  214 |         const selectedValue = await folderSelect.inputValue();
  215 |         expect(selectedValue).toBeTruthy();
  216 |       }
  217 |     });
  218 |
  219 |     test('save button shows loading state', async ({ page }) => {
  220 |       await page.goto('/notes/new');
  221 |       
  222 |       // Fill minimum required fields
  223 |       await page.locator('input[placeholder="Note title..."]').fill('Quick Test');
  224 |       
  225 |       // Click save and immediately check for loading state
  226 |       const saveButton = page.locator('button', { hasText: 'Create Note' });
  227 |       await saveButton.click();
  228 |       
  229 |       // The button text might briefly change to "Creating..."
  230 |       // This test might be flaky depending on how fast the operation is
  231 |       // await expect(page.locator('button', { hasText: 'Creating...' })).toBeVisible();
  232 |     });
  233 |
  234 |     test('can edit existing note', async ({ page }) => {
  235 |       // This test assumes there's an existing note to edit
  236 |       // You might need to create one first or mock the data
  237 |       
  238 |       // Navigate to notes list first
  239 |       await page.goto('/notes');
  240 |       
  241 |       // Look for an existing note link
  242 |       const noteLinks = page.locator('a[href*="/notes/"]').filter({ hasNotText: 'new' });
  243 |       
  244 |       if (await noteLinks.count() > 0) {
  245 |         await noteLinks.first().click();
  246 |         
  247 |         // Should be on note detail page
  248 |         await expect(page).toHaveURL(/\/notes\/[^\/]+$/);
  249 |         
  250 |         // Check edit elements are present
  251 |         await expect(page.locator('input[placeholder="Note title..."]')).toBeVisible();
> 252 |         await expect(page.locator('button', { hasText: 'Save' })).toBeVisible();
      |                                                                   ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  253 |         await expect(page.locator('button svg')).toBeVisible(); // Delete button
  254 |       }
  255 |     });
  256 |
  257 |     test('delete confirmation works', async ({ page }) => {
  258 |       // Navigate to an existing note (this test assumes one exists)
  259 |       await page.goto('/notes');
  260 |       
  261 |       const noteLinks = page.locator('a[href*="/notes/"]').filter({ hasNotText: 'new' });
  262 |       
  263 |       if (await noteLinks.count() > 0) {
  264 |         await noteLinks.first().click();
  265 |         
  266 |         // Set up dialog handler to cancel deletion
  267 |         page.on('dialog', dialog => dialog.dismiss());
  268 |         
  269 |         // Click delete button (trash icon)
  270 |         await page.locator('button svg').click();
  271 |         
  272 |         // Should still be on the same page since we cancelled
  273 |         await expect(page).toHaveURL(/\/notes\/[^\/]+$/);
  274 |       }
  275 |     });
  276 |   });
  277 |
  278 |   test.describe('Integration Tests', () => {
  279 |     
  280 |     test('complete note creation workflow', async ({ page }) => {
  281 |       // Start from notes page
  282 |       await page.goto('/notes');
  283 |       
  284 |       // Create a new folder first
  285 |       await page.locator('button', { hasText: 'New Folder' }).click();
  286 |       await page.locator('input[placeholder="Enter folder name"]').fill('Integration Test Folder');
  287 |       await page.locator('button', { hasText: 'Create Folder' }).click();
  288 |       
  289 |       // Find the new folder and add a note
  290 |       await expect(page.locator('text=Integration Test Folder')).toBeVisible();
  291 |       
  292 |       // Click add note in the new folder
  293 |       const addNoteButton = page.locator('text=Add Note').or(page.locator('text=Create First Note')).first();
  294 |       await addNoteButton.click();
  295 |       
  296 |       // Should be on new note page with folder pre-selected
  297 |       await expect(page).toHaveURL(/\/notes\/new/);
  298 |       
  299 |       // Create the note
  300 |       await page.locator('input[placeholder="Note title..."]').fill('Integration Test Note');
  301 |       
  302 |       const contentEditor = page.locator('[contenteditable="true"]').or(page.locator('textarea')).first();
  303 |       if (await contentEditor.isVisible()) {
  304 |         await contentEditor.fill('This note was created during integration testing.');
  305 |       }
  306 |       
  307 |       await page.locator('button', { hasText: 'Create Note' }).click();
  308 |       
  309 |       // Should be back on notes page
  310 |       await expect(page).toHaveURL('/notes');
  311 |       
  312 |       // New note should be visible in the folder
  313 |       await expect(page.locator('text=Integration Test Note')).toBeVisible();
  314 |     });
  315 |
  316 |     test('search across folders works', async ({ page }) => {
  317 |       await page.goto('/notes');
  318 |       
  319 |       // Enter search term
  320 |       const searchInput = page.locator('input[placeholder="Search notes..."]');
  321 |       await searchInput.fill('integration');
  322 |       
  323 |       // Results should filter (this depends on having test data)
  324 |       // We can at least verify the search input works
  325 |       await expect(searchInput).toHaveValue('integration');
  326 |     });
  327 |
  328 |     test('responsive design elements are present', async ({ page }) => {
  329 |       await page.goto('/notes');
  330 |       
  331 |       // Test mobile-specific classes exist (these are Tailwind responsive classes)
  332 |       const headerDiv = page.locator('div.flex.flex-col.md\\:flex-row').first();
  333 |       await expect(headerDiv).toBeVisible();
  334 |       
  335 |       // Test that responsive grid classes exist
  336 |       // const gridElements = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
  337 |       // Elements might not be visible if no notes exist, so we just check the page structure
  338 |     });
  339 |   });
  340 |
  341 |   test.describe('Error Handling', () => {
  342 |     
  343 |     test('handles invalid note ID gracefully', async ({ page }) => {
  344 |       // Try to access a non-existent note
  345 |       await page.goto('/notes/invalid-note-id');
  346 |       
  347 |       // Should either redirect or show appropriate error
  348 |       // The exact behavior depends on your error handling implementation
  349 |       await page.waitForLoadState('networkidle');
  350 |       
  351 |       // At minimum, the page should not crash
  352 |       await expect(page.locator('body')).toBeVisible();
```