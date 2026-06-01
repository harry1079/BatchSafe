# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-06-01

### Added
- **Interactive Analytics Tracking**: Implemented custom privacy-first Vercel Analytics tracking for key interaction checkpoints:
  - `click_load_demo`: Triggers when demo sample data is loaded.
  - `file_upload_success`: Triggers when a file is successfully dropped or selected and parsed (records row count and extension).
  - `paste_data_success`: Triggers when manual text is pasted and successfully parsed (records row count).
  - `click_join_beta_cta`: Triggers when the user clicks the waitlist button in the footer.
  - `show_export_beta_popup`: Triggers when the post-export waitlist modal automatically shows up.
- **Improved Waitlist Conversion**: Enhanced the beta signup tracking to pass the `source` property (`'cta'` or `'export'`) to Resend / Vercel Analytics.
- **Celebratory Post-Export Waitlist Popup**: Designed and integrated a celebratory waitlist popup that automatically displays 800ms after a user clicks *"Export CSV"* (after the confetti shower). The popup utilizes custom styling and tailored automation copy for users who successfully complete a compilation.
