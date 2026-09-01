# Worker Progress Report — Reference Aligned

This version addresses the browser/reference mismatch by using a cleaned rendering of the **supplied PDF itself** as the page artwork.

The fixed visual content therefore remains in the exact source layout. Dynamic text and checkboxes are layered only over the corresponding areas.

### Dynamic fields

Worker name, claim number, return-to-work information, comments, recovery, pain score, medical information, medication, exercises, other information, Worker App ID and submitted timestamp.

### Direct interaction

Click **Edit PDF**:
- blue dynamic values become editable directly on the page;
- checkboxes can be clicked;
- the editor panel provides all dynamic fields and grouped choices.

### Output

Click **Print / Save PDF** and use Letter paper at 100% scale with zero/none margins and background graphics enabled.

The source report is three Letter pages. The supplied reference content includes the return-to-work/recovery sections on page 1, medical/medication/exercise sections on page 2, and certification on page 3.

## Print architecture

Printing uses a dedicated print-only SVG layer. Each page uses a 612 × 792 coordinate system matching the original PDF points, then Chrome scales that SVG to exactly 8.5 × 11 inches. This keeps the reference artwork, dynamic text and checkboxes in the same coordinate system and prevents the print preview from cropping or shifting fields.

The browser preview and the printed output are intentionally separate render layers: the interactive page remains optimized for editing, while the print layer is optimized for exact Letter-page output.


## Direct Save PDF

The **Save PDF** button now generates the PDF directly in JavaScript. It does not open the browser print dialog.

The generated PDF contains:
- all three reference pages;
- the current dynamic text values;
- current checkbox selections;
- the certification/privacy checkbox state;
- the same Letter page size and reference artwork.

The PDF is downloaded automatically as `Worker_Progress_Report_<claim-number>.pdf`.
