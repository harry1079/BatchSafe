# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-06-01

### Changed
- **Landing Page Copywriting & Visual Layout Redesign**:
  - Rewrote the primary hero headline to address the Friday contributor payout pain: *"Friday contributor payouts shouldn't ruin your weekend."*
  - Added a visual Trust & Security signals grid highlighting client-side processing, no wallet connection to compile, auto-error checking, and open-source transparency.
  - Added a clean 3-step visual sequence outlining the drop -> review -> import process.
  - Redesigned the footer CTA waitlist message and modal text to cleanly separate the free CSV utility from the upcoming automated Integration Suite waitlist.
- **Search Engine Optimization (SEO) Upgrades**:
  - Updated page titles to keyword-rich: *"BatchSafe | Gnosis Safe CSV Import & Bulk Batch Payout Tool"*.
  - Configured optimized meta descriptions and keywords for search queries.
  - Updated heading hierarchies with an SEO-targeted H2 subheading: *"Convert CSV to Gnosis Safe batch transactions. No wallet required."*
  - Refined page introductory copy to naturally integrate targeted keywords (import CSV to Gnosis Safe, bulk transfer, batch payout).
- **Brand Identity Asset Swap**:
  - Replaced the generic Lucide `ShieldCheck` vector icon in the header logo with the custom high-resolution gradient shield logo (`/icon.png`) mounted inside a styled, dark border frame.

## [1.1.0] - 2026-06-01

### Added
- **PostHog Cloud Analytics Integration**: Integrated PostHog Cloud tracking using a client-side provider wrapper to capture key user interaction checkpoints:
  - `click_load_demo`: Triggers when demo sample data is loaded.
  - `file_upload_success`: Triggers when a file is successfully dropped or selected and parsed (records row count and extension).
  - `paste_data_success`: Triggers when manual text is pasted and successfully parsed (records row count).
  - `click_join_beta_cta`: Triggers when the user clicks the waitlist button in the footer.
  - `show_export_beta_popup`: Triggers when the post-export waitlist modal automatically shows up.
  - `export_csv`: Triggers upon successful compilation export.
- **Improved Waitlist Conversion**: Enhanced the beta signup tracking to pass the `source` property (`'cta'` or `'export'`) to PostHog, enabling conversion attribution tracking.
- **Celebratory Post-Export Waitlist Popup**: Designed and integrated a celebratory waitlist popup that automatically displays 800ms after a user clicks *"Export CSV"* (after the confetti shower). The popup utilizes custom styling and tailored automation copy for users who successfully complete a compilation.
