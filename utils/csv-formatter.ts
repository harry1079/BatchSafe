import { getAddress } from 'viem';
import Papa from 'papaparse';

export interface RawPayoutRow {
  recipientAddress: string;
  amount: string; // kept as string in state to avoid decimal collapsing
}

export interface SafeCsvRow {
  token_type: 'native' | 'erc20';
  token_address: string; // empty for native, token contract for erc20
  receiver: string;
  value: string;
  id: string; // always empty for standard fungible tokens
}

export interface CompilerConfig {
  payoutType: 'native' | 'erc20';
  tokenContractAddress?: string; // required if payoutType is erc20
}

/**
 * Compiles validated UI table rows into Safe Transaction Builder CSV rows.
 * Both receiver addresses and token contract addresses are checksummed for safety.
 * 
 * @param rows Array of verified payouts (addresses and decimal values)
 * @param config Configuration specifying token type and contract address
 * @returns Array formatted according to Safe specs, ready for PapaParse conversion
 */
export function compileToSafeRows(
  rows: RawPayoutRow[],
  config: CompilerConfig
): SafeCsvRow[] {
  const { payoutType, tokenContractAddress = '' } = config;

  return rows.map(row => {
    // Ensure inputs are clean
    const receiver = row.recipientAddress.trim();
    const value = row.amount.trim();

    // Checksum the receiver address for safety
    let checksummedReceiver = receiver;
    try {
      checksummedReceiver = getAddress(receiver);
    } catch {
      // Fallback if address is invalid/empty, although export validation should prevent this
    }

    // Checksum the token contract address if it's an ERC-20 transfer
    let checksummedTokenAddress = '';
    if (payoutType === 'erc20' && tokenContractAddress) {
      try {
        checksummedTokenAddress = getAddress(tokenContractAddress.trim());
      } catch {
        checksummedTokenAddress = tokenContractAddress.trim();
      }
    }

    return {
      token_type: payoutType,
      token_address: checksummedTokenAddress,
      receiver: checksummedReceiver,
      value: value,
      id: '', // Leave blank for standard native/ERC-20 transfers
    };
  });
}

/**
 * Compiles rows and unparses them into a raw CSV string.
 * Enforces the exact 5-column Gnosis Safe CSV header schema.
 * 
 * @param rows Array of verified payouts
 * @param config Configuration specifying token type and contract address
 * @returns Standard-compliant CSV string ready for download
 */
export function compileAndUnparse(
  rows: RawPayoutRow[],
  config: CompilerConfig
): string {
  const safeRows = compileToSafeRows(rows, config);
  return Papa.unparse(safeRows, {
    header: true,
    columns: ['token_type', 'token_address', 'receiver', 'value', 'id'],
  });
}
