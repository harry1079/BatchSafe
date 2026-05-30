# BatchSafe (Trojan Horse Utility) — Technical Specification & Product Blueprint

## 1. Product Overview
**BatchSafe** is a high-utility, lightning-fast client-side web application designed to solve a single massive pain point for Web3 operations leads, product managers, and DAOs: **formatting bulk multi-address payouts for Safe (formerly Gnosis Safe).**

Instead of manually copy-pasting addresses and amounts into Gnosis Safe's batch transfer tool, users can drag and drop a basic Excel/CSV file, instantly validate the addresses, review the conversion, and export a perfectly formatted **Safe-compatible CSV file** in one click.

### Key Objectives
*   **Zero Barrier to Entry:** Free, fast, works entirely in the browser, no wallet connection required.
*   **The Inbound Funnel:** Acts as a lead-generator for the full Next.js/Supabase subscription task manager.
*   **Premium Aesthetic:** Built with a dark, high-end "Linear-style" UI/UX that appeals to modern Web3 builders.
*   **Hosting & Deployment Target:** Optimized for **Vercel Hobby Tier hosting** and custom domain linking (`batchsafe.xyz`). The utility is fully client-side to ensure zero server-side latency, absolute data privacy (private keys and addresses are never transmitted to a server), and $0/month operational costs.

---

## 2. Core UI/UX Experience (The "Vibe" Spec)

To fit your design-forward, "vibe coder" workflow, the user interface is centered on high-fidelity feedback and motion.

### The Screen Layout (Single Page Interface)
*   **Header:** Clean logo (`BatchSafe`), small tagline, and a subtle Github link.
*   **Dropzone Card:** A large, dashed-border drag-and-drop zone with smooth CSS hover transition animations. Supporting drag-and-drop or manual file picking.
*   **Manual Entry Option:** A togglable textarea where users can paste raw lists (e.g., `address, amount` or `address tab amount`) if they don't have a file ready.
*   **Interactive Table (The Preview Portal):** Once a file is processed, the dropzone disappears and is replaced by a gorgeous live table featuring:
    *   **Checksum Verification Indicator:** A tiny green pill `[Valid]` or red alert icon `[Invalid Address]` next to every address.
    *   **Duplicate Detection:** Highlighted rows showing duplicate addresses, warning the user before they execute double payments.
    *   **Token Type/Currency Toggle:** Easily choose whether the payout is in native token (ETH/Base) or a custom ERC20 (USDC, OP, ARB) and enter the token contract address.
*   **Footer Banner (The Trojan Horse):** A persistent, beautifully designed call-to-action (CTA) card highlighting:
    > ⚡ *Tired of compiling spreadsheets every Friday? Integrate your ClickUp/Linear task board directly and automate these payouts. [Join the Beta for Our Full Task Manager]*

---

## 3. Safe CSV Format Specification

Safe's native "Transaction Builder" application expects a CSV formatted with high precision. If any column is named incorrectly or contains the wrong type of value, the Safe UI will throw an upload error.

### The Required Header Schema
The CSV must contain exactly these 5 columns:
```csv
token_type,token_address,receiver,value,id
```

### Column Field Breakdown

| Column | Type | Description |
| :--- | :--- | :--- |
| **token_type** | `string` | Must be either `'native'` (for ETH, SOL, MATIC, etc.) or `'erc20'` (for tokens like USDC, USDT, OP). |
| **token_address**| `string` | If `token_type` is `erc20`, this must be the contract address of that token on your chain (e.g., `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` for Base USDC). If `token_type` is `native`, this field must be **blank**. |
| **receiver** | `string` | The 42-character hex address of the recipient. Must be a valid Ethereum-style format (`0x...`). |
| **value** | `string` | The decimal amount of the token/ETH to send (e.g., `100` or `12.5`). **Crucial:** Unlike raw smart contracts that require Wei/un-decimalized integers, Safe's Transaction Builder CSV parser reads standard decimalized floating-point numbers. |
| **id** | `string` | Used only for NFT transfers (ERC-721/1155). For standard ERC20 or native payments, this field must be **blank**. |

### Example Outputs

#### Example 1: Native Network Tokens (e.g., ETH, Base ETH)
```csv
token_type,token_address,receiver,value,id
native,,0x93C4c10DA30B2c842E0d5dC08477dE9b835eE8b9,1.5,
native,,0x41f87A4FBE363C0123Ab57CD902C5A1dB7c5A866,0.75,
```

#### Example 2: ERC-20 Tokens (e.g., USDC on Base network)
```csv
token_type,token_address,receiver,value,id
erc20,0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,0x93C4c10DA30B2c842E0d5dC08477dE9b835eE8b9,150.00,
erc20,0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,0x41f87A4FBE363C0123Ab57CD902C5A1dB7c5A866,75.50,
```

---

## 4. Front-End Technical Stack (Client-Side)

Since we want this tool to be completely **free to host** and have **zero server/DB maintenance**, everything will run on the client's side in the browser.

*   **Framework:** Next.js (App Router, React 19).
*   **Styling:** Tailwind CSS + Radix UI primitives (via `shadcn/ui` components).
*   **Icons:** `lucide-react`.
*   **CSV Parsing:** `papaparse` (the industry standard for client-side CSV parsing/generation).
*   **Web3 Validation Utils:** `viem` or `ethers` (specifically for checking 0x address formats and checksum validation).

---

## 5. Next.js App Directory Folder Structure

Here is the exact structure we will set up in your Next.js project. It keeps components highly modular and separates core parsing utilities from standard UI layout:

```text
/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx               # Global wrapper, HTML headers, meta tags
│   └── page.tsx                 # Main application dashboard (The single page)
├── components/
│   ├── ui/                      # shadcn primitives
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── csv-dropzone.tsx         # The drag & drop file handler
│   ├── csv-table-preview.tsx    # Live editable preview and validator
│   └── conversion-controls.tsx  # Token contract address inputs + download triggers
└── utils/
    ├── address-validator.ts     # Viem address checksum/regex helper
    └── csv-formatter.ts         # Logic that structures parsed rows into Safe CSV specs
```

---

## 6. Step-by-Step Implementation Milestones

To help you "vibe code" this systematically with me (or tools like Cursor), here are the bite-sized sprints we'll execute:

### Milestone 1: The Premium Landing & Skeleton (UI-First)
*   Build the Next.js landing layout using Tailwind CSS.
*   Implement the custom drag-and-drop component (`csv-dropzone.tsx`) with elegant micro-interactions (soft shadows, scaling, drag-over highlights).
*   Create a clean mock-up of the preview table below it so we can finalize the visual layout before wiring up the real data parser.

### Milestone 2: File Parsing & Raw Preview
*   Install `papaparse`.
*   Connect the dropzone file handler to `papaparse`'s parser.
*   Feed parsed records into a React state variable and display them in the table. At this stage, we'll display exactly what the user uploaded (even if it's messy).

### Milestone 3: Address & Data Validation Logic
*   Build out `utils/address-validator.ts` using `viem`'s `isAddress` utility.
*   Iterate over the parsed table rows:
    *   If the address is valid, show a checkmark.
    *   If it's malformed (too short, wrong chars), highlight the input box red and show a warning.
    *   Count duplicates and flag them.
*   Add inline editing to the table, so users can correct typos in addresses or amounts directly on the web app!

### Milestone 4: Gnosis Safe Conversion & Export
*   Add the token selector controls (Choose `ETH/Native` vs `ERC20`).
*   Build the Gnosis Safe compiler logic: map the rows to the required CSV schema headers (`token_type`, `token_address`, `receiver`, `value`, `id`).
*   Implement the **"Export CSV"** button, which converts the verified table back to a CSV string via `papaparse` and triggers an automatic browser download.

---

## 7. Immediate Next Steps
1. **Initialize Directory:** We will create this project locally in a standard Next.js template.
2. **Setup Dependencies:** Install `tailwind-merge`, `clsx`, `lucide-react`, `papaparse`, and `viem`.
3. **Begin Milestone 1:** Start building the clean aesthetic UI shell.

*Blueprint authored with care by Luna.* 🖤
