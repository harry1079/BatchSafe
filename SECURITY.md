# SECURITY & PRIVACY POLICY

## BatchSafe — Client-Side Safety Guarantee

BatchSafe is a high-utility bulk payout compiler designed specifically for Web3 operations leads, multisig signers, and DAOs. Because we handle high-value address lists, we prioritize absolute security and data privacy.

---

## 1. Zero-Server Architecture

BatchSafe is a **100% client-side application** hosted on Vercel's Hobby Tier. 

*   **No Databases:** We do not host databases or server-side functions.
*   **Local Processing:** All CSV parsing, data validation, duplicate checks, and formatting occur strictly within your browser's runtime memory.
*   **Purged on Close:** All spreadsheet row states are lost as soon as you close or refresh the browser tab. No persistent tracking, LocalStorage, or session storage is utilized.
*   **No Wallet Connection:** We do not connect to MetaMask, WalletConnect, or browser injected web3 providers. This eliminates the risk of malicious transaction signatures or wallet drainers.

---

## 2. Telemetry and Analytics

To monitor application health, we utilize **Vercel Analytics**. This telemetry checks high-level session page views and tracks custom event counts:

*   **Export Event Metrics:** We track when a batch is exported, recording only the asset symbol (e.g. `USDC`), payout type (`erc20` vs `native`), and the total transfer count (e.g., `12`).
*   **No Address Leakage:** Recipient addresses, individual payout values, and transaction parameters are **never** included in analytics payloads.
*   **Privacy-Friendly Signups:** For early access registration, we transmit only the domain of your email address (e.g., `company.com`) to prevent leakage of Personally Identifiable Information (PII).

---

## 3. Threat Modeling & Protections

### A. Cross-Site Scripting (XSS)
React 19 dynamically escapes all output strings injected into the DOM, neutralizing standard markup script injection vectors.

### B. CSV Formula Injection (Macro Attacks)
We enforce strict alphanumeric validation at the UI layer:
*   **Amounts:** Must match positive float format `^\d+(\.\d+)?$`. All command execution tokens (like `=`, `+`, `-`, `@`) are rejected.
*   **Addresses:** Must strictly match standard EVM hex structures (`0x` followed by 40 hex characters).
Because inputs must conform to these strict regex rules, malicious macros cannot be injected into the generated CSV file.

### C. Offline Support (Air-Gapped Operation)
If your operations team requires maximum security, BatchSafe is built as a static application that can be run **100% offline**:
1. Clone the repository: `git clone https://github.com/harry1079/BatchSafe.git`
2. Install dependencies: `npm install`
3. Launch development server: `npm run dev`
4. Disconnect your internet connection. All validation features and CSV generation tools use local mathematical checks (Viem address utilities operate locally without querying a node RPC) and will function perfectly without network access.
