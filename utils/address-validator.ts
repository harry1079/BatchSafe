import { isAddress, getAddress } from 'viem';

// Regular expression to check if string matches standard 42-character hex format
export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export interface ValidationResult {
  isValid: boolean;
  errorType: 'VALID' | 'MALFORMED' | 'CHECKSUM_FAILED' | 'EMPTY';
}

/**
 * Validates a wallet address string.
 * @param address Raw address string input
 * @returns Object indicating validity and specific error type if any
 */
export function validateAddress(address: string): ValidationResult {
  const cleanAddress = address?.trim() || '';

  if (!cleanAddress) {
    return { isValid: false, errorType: 'EMPTY' };
  }

  // 1. Basic length and hex structure check
  if (!EVM_ADDRESS_REGEX.test(cleanAddress) || !isAddress(cleanAddress)) {
    return { isValid: false, errorType: 'MALFORMED' };
  }

  // 2. Checksum validation
  try {
    const checksummed = getAddress(cleanAddress);
    if (cleanAddress === checksummed) {
      return { isValid: true, errorType: 'VALID' };
    } else {
      return { isValid: false, errorType: 'CHECKSUM_FAILED' };
    }
  } catch {
    return { isValid: false, errorType: 'MALFORMED' };
  }
}

/**
 * Normalizes an array of parsed CSV rows and checks for duplicate addresses.
 * Returns a Set of duplicate address strings in lowercase format.
 */
export function findDuplicateAddresses(addresses: string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  addresses.forEach(addr => {
    const cleanAddr = addr.trim().toLowerCase();
    if (cleanAddr && EVM_ADDRESS_REGEX.test(cleanAddr)) {
      if (seen.has(cleanAddr)) {
        duplicates.add(cleanAddr);
      } else {
        seen.add(cleanAddr);
      }
    }
  });

  return duplicates;
}
