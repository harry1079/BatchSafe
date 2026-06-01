# Implementation Plan - Landing Page Copy & Layout Redesign for BatchSafe

This plan outlines the updates to the landing page copy and layout for [batchsafe.xyz](https://batchsafe.xyz) to better hook DAO treasury managers and Web3 operations leads, build security trust, and separate the CSV utility's value proposition from the upcoming webhook-based automation suite waitlist.

## User Review Required

> [!IMPORTANT]
> **Key Copy Strategy Decisions:**
> 1. **Primary Headline Choice:** We've selected **"Friday contributor payouts shouldn't ruin your weekend."** as the main landing hook because it directly addresses the emotional strain of manual Friday payouts.
> 2. **Clear Separation of Products:** The CSV utility is kept front-and-center as a 100% free, client-side, zero-latency tool requiring no wallet connection. The waitlist is framed in the footer card as the next-level upgrade: **"Ready to skip spreadsheets entirely next Friday?"** (offering automated integrations with Linear/ClickUp/GitHub).

### Headline Options for A/B Testing
Here are the three requested A/B test options that we can rotate:
* **Option A (The Friday Pain):** `"Tired of compiling payment spreadsheets every Friday?"`
* **Option B (The Direct Benefit/Time):** `"From messy spreadsheet to Safe batch transaction in 30 seconds."`
* **Option C (Security/Irreverent):** `"Because copy-pasting 47 addresses at 6pm is how you send money to the wrong person."`

---

## Proposed Changes

### 1. Landing Hero & Main Copy

#### [MODIFY] [page.tsx](file:///Users/hereward/DEVELOPER/WEB3/BatchSafe/app/page.tsx)
* Replace the descriptive headline `"Gnosis Safe Bulk Transfer Compiler"` with the high-impact hook headline `"Friday contributor payouts shouldn't ruin your weekend."`
* Rewrite the one-liner description to highlight: client-side speed/security, no wallet connection required to compile, and zero server latency.
* **Add Trust & Security Signals Grid** (visible when no file is loaded, i.e., `fileStatus === 'idle'`):
  * **Zero Server Latency:** Client-side parsing and compilation in-browser. Contributor and payment data never touch our servers.
  * **No Wallet Needed:** Compile, validate, and download Safe-compatible CSV files without linking an admin wallet. Connect only when executing.
  * **Auto-Error Spotting:** Flag malformed EVM addresses, duplicate entries, and checksum failures instantly.
  * **100% Open Source:** Fully transparent and inspectable logic on GitHub.
* **Add How it Works Section** (visible when no file is loaded):
  * A 3-step visual sequence: 1. Drop your CSV -> 2. Review and Fix -> 3. Import to Gnosis Safe.

---

### 2. Waitlist & Automation Card

#### [MODIFY] [footer-cta.tsx](file:///Users/hereward/DEVELOPER/WEB3/BatchSafe/components/footer-cta.tsx)
* Change the footer CTA title from `"Tired of compiling..."` (which is now in the hero hook) to `"Ready to skip spreadsheets entirely next Friday?"`
* Clarify the description: frame it as the **BatchSafe Automation Suite** waitlist for connecting tools like ClickUp, Linear, or GitHub directly to Safe.
* Update modal texts to match the updated waitlist messaging for both the standard waitlist button and the export-success celebration trigger.

---

## Verification Plan

### Automated Tests
* Run `npm run build` to verify there are no compilation or TypeScript errors.

### Manual Verification
* Visually inspect the landing page in the browser to ensure the layout looks premium, margins are correct, and icons/colors blend with the dark theme.
* Confirm that the Trust Signals and "How it Works" sections disappear when a CSV is uploaded to let the user focus on the transaction table, and reappear when they clear the workspace.
* Verify the footer waitlist CTA opens the email popup, and submitting a valid email works and reports the correct beta details.
