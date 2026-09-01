# Medical & Travel Expense Request — V7

Dynamic editor matching the supplied two-page reference layout.

## Save PDF
Use **Save PDF**. It generates a standalone two-page PDF directly in the browser and downloads it automatically. The PDF includes the complete reference artwork plus current user-entered values, added rows, and checkbox states.

The PDF generator now resolves asset paths from the current document URL, has a `toBlob` fallback, and reports the actual generation error instead of the misleading Live Server-only message.

## Run
Open `index.html` with VS Code Live Server (recommended).
