# Dynamic Report Maker

A lightweight, local HTML app to build and reorder reports with the exact structure you provided. No installs required. Open and run offline.

## Location
- Folder: `report_maker/`
- Entry point: `report_maker/index.html`

## How to Run (Windows)
1. Open File Explorer and navigate to `c:\ForceOfNature\demo_report\report_maker\`.
2. Double‑click `index.html` to open it in your default browser (Chrome/Edge recommended).

## Features
- Drag-and-drop reordering of sections in the left sidebar.
- Edit number, title, content, attachments, and a main reference link for each section.
- Auto-save to `localStorage`. Use Export for backups.
- Export to Markdown (`report.md`) reflecting the current order and content.
- Export/Import JSON to move work across browsers or machines.
- Export to PDF via browser print with paginated print styles.

## Predefined Sections
The app ships with your requested structure, including:
- `GLOBAL INFORMATION` and sub-sections `1.1.` to `1.10.`
- `STRATEGIC MARKET INTELLIGENCE` and sub-sections `2.1.` to `2.2.4.`
- `Search Competitors' Growth in SEO` and sub-sections `3.1.` to `3.6.`
- `Traffic Overview`, `Industry Dynamics Overview`, `Brand Sentiment Analysis – Reviews`, `Tech, UX, On-site`

Tip: You can change the numbering or titles inline if needed.

## Attachments
- Each section supports multiple attachments (name + URL/path).
- A convenience example is pre-seeded under `Brand Sentiment Analysis – Reviews`:
  - `Duolingo.com - Growth Signal Report.pdf` → `c:\\ForceOfNature\\demo_report\\.windsurf\\workflows\\workflows_respaldo\\BuildTurboApp\\Duolingo.com - Growth Signal Report.pdf`
- You can add more attachments via the `+ Add Attachment` button.

## Data Model (JSON)
```json
{
  "sections": [
    {
      "id": "uuid",
      "number": "1.1.",
      "title": "Products/Service",
      "content": "...",
      "link": "https://example.com or C:\\path\\file.pdf",
      "attachments": [
        { "name": "Attachment name", "url": "https://... or path" }
      ]
    }
  ]
}
```

## Shortcuts & Tips
- Click any section on the left to edit it.
- Use `Save` to persist immediately to the browser; it also auto-saves on most edits.
- Use `Export Markdown` for a ready-to-share `.md` file.
- Use `Export PDF` to open the browser print dialog with a clean, paginated layout (A4). Choose "Save as PDF".
- Use `Export JSON` to back up your work. Later, use `Import JSON` to restore.
- `Reset` restores the original template in memory (you can re-import JSON afterward).

## Troubleshooting
- If nothing loads, try a hard refresh (Ctrl+F5) or opening `index.html` in another browser.
- `localStorage` is browser-specific. Use JSON export/import to move data.
- Markdown heading levels are inferred from numbering depth: e.g. `2.` (H2), `2.2.` (H3), `2.2.1.` (H4), deeper → H5.
- PDF export uses the browser's print engine. For best results:
  - Use Chrome or Edge.
  - Paper size A4, margins default, background graphics optional.
  - Major sections (H2) start on a new page for readability.
