# Implementation Plan - SEO Optimization for BatchSafe

This plan outlines the SEO improvements to [batchsafe.xyz](https://batchsafe.xyz) by optimizing page metadata, titles, headers, and body copy to rank for keywords like "Gnosis Safe CSV import," "bulk transfer," and "batch payout."

## Proposed Changes

### 1. Metadata and Page Titles

#### [MODIFY] [layout.tsx](file:///Users/hereward/DEVELOPER/WEB3/BatchSafe/app/layout.tsx)
* Update `metadata.title` to be keyword-rich:
  * **New Title:** `"BatchSafe | Gnosis Safe CSV Import & Bulk Batch Payout Tool"`
* Update `metadata.description` to target key search queries:
  * **New Meta Description:** `"Instantly convert CSV files to Gnosis Safe bulk transfers. Validate formats, verify EVM checksums, and compile Safe-compatible batch payouts. 100% client-side, free, and secure."`

---

### 2. Page Heading Structure & Keyword Copy

#### [MODIFY] [page.tsx](file:///Users/hereward/DEVELOPER/WEB3/BatchSafe/app/page.tsx)
* Incorporate targeted keywords into the landing page layout:
  * **H1 Header (Visual Hook):** Keep the highly-converting headline `"Friday contributor payouts shouldn't ruin your weekend."` as the main `h1`.
  * **H2 Subheader (SEO Target):** Add a descriptive `h2` below the `h1` that targets: `"Convert CSV to Gnosis Safe batch transactions. No wallet required."`
  * **Introductory Copy (Keyword Integration):** Update the subtext paragraph to naturally weave in the required phrases:
    > *"BatchSafe is a secure, client-side utility designed to streamline how you **import CSV to Gnosis Safe**. Instead of manual copy-pasting, drop your spreadsheet to validate formatting, fix EVM checksums, and export a clean **bulk transfer** file for your weekly **batch payout**."*

---

## Verification Plan

### Automated Tests
* Run `npm run build` to verify the application compiles cleanly.

### Manual Verification
* Inspect the rendered HTML (e.g., in developer tools) to confirm:
  * The `<title>` is updated to `"BatchSafe | Gnosis Safe CSV Import & Bulk Batch Payout Tool"`.
  * The `<meta name="description">` matches the new search-engine targeted description.
  * The heading hierarchy goes correctly from `h1` (Hero pain hook) to `h2` (SEO target descriptors).
