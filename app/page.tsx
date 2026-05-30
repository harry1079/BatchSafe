"use client";

import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from '../components/header';
import CsvDropzone from '../components/csv-dropzone';
import CsvTablePreview from '../components/csv-table-preview';
import ConversionControls, { TokenConfig } from '../components/conversion-controls';
import FooterCta from '../components/footer-cta';
import { validateAddress, findDuplicateAddresses } from '../utils/address-validator';
import { compileAndUnparse } from '../utils/csv-formatter';
import { getAddress } from 'viem';
import { track } from '@vercel/analytics';

export type ValidationStatus = 'VALID' | 'MALFORMED' | 'CHECKSUM_FAILED' | 'EMPTY';

export interface PayoutRowState {
  id: string;
  address: string;
  amount: string; // Keep as string to avoid decimal collapsing during typing
  validationStatus: ValidationStatus;
  isAmountValid: boolean;
  isDuplicate: boolean;
}

export type FileStatus = 'idle' | 'ready';

export default function Home() {
  const [rows, setRows] = useState<PayoutRowState[]>([]);
  const [fileStatus, setFileStatus] = useState<FileStatus>('idle');
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    type: 'native',
    contractAddress: '',
    symbol: 'ETH'
  });

  // Calculate validation states and duplicate flags
  const calculateRowStates = (
    inputRows: { id?: string; address: string; amount: string }[]
  ): PayoutRowState[] => {
    // 1. Initial mapping & check
    const mapped = inputRows.map(row => {
      const id = row.id || crypto.randomUUID();
      const cleanAddress = row.address.trim();
      const cleanAmount = row.amount.trim();

      const addrVal = validateAddress(cleanAddress);
      const isAmtValid = /^\d+(\.\d+)?$/.test(cleanAmount) && parseFloat(cleanAmount) > 0;

      return {
        id,
        address: row.address,
        amount: row.amount,
        validationStatus: addrVal.errorType,
        isAmountValid: isAmtValid,
        isDuplicate: false
      };
    });

    // 2. Flags duplicates (across all occurrences)
    const addresses = mapped.map(r => r.address);
    const duplicates = findDuplicateAddresses(addresses);

    return mapped.map(r => {
      const cleanAddr = r.address.trim().toLowerCase();
      const isDup = cleanAddr ? duplicates.has(cleanAddr) : false;
      return {
        ...r,
        isDuplicate: isDup
      };
    });
  };

  const handleDataParsed = (parsedData: { address: string; amount: string }[]) => {
    const preparedRows = calculateRowStates(parsedData);
    setRows(preparedRows);
    setFileStatus('ready');
  };

  const handleRowUpdate = useCallback((id: string, updatedFields: Partial<PayoutRowState>) => {
    setRows(prevRows => {
      const updated = prevRows.map(row => {
        if (row.id !== id) return row;

        const merged = { ...row, ...updatedFields };

        // Handle inline validation updates
        if ('address' in updatedFields || 'validationStatus' in updatedFields) {
          // If clicked auto-fix checksum, badge updates status to VALID, run viem getAddress
          let targetAddress = merged.address.trim();
          if (updatedFields.validationStatus === 'VALID') {
            try {
              targetAddress = getAddress(targetAddress);
            } catch {
              // fallback
            }
          }

          const addrVal = validateAddress(targetAddress);
          merged.address = targetAddress;
          merged.validationStatus = addrVal.errorType;
        }

        if ('amount' in updatedFields) {
          const cleanAmount = merged.amount.trim();
          merged.isAmountValid = /^\d+(\.\d+)?$/.test(cleanAmount) && parseFloat(cleanAmount) > 0;
        }

        return merged;
      });

      // Recalculate duplicates across all rows
      const addresses = updated.map(r => r.address);
      const duplicates = findDuplicateAddresses(addresses);

      return updated.map(r => {
        const cleanAddr = r.address.trim().toLowerCase();
        return {
          ...r,
          isDuplicate: cleanAddr ? duplicates.has(cleanAddr) : false
        };
      });
    });
  }, []);

  const handleRowDelete = useCallback((id: string) => {
    setRows(prevRows => {
      const filtered = prevRows.filter(r => r.id !== id);
      
      // Recalculate duplicates across remaining rows
      const addresses = filtered.map(r => r.address);
      const duplicates = findDuplicateAddresses(addresses);

      return filtered.map(r => {
        const cleanAddr = r.address.trim().toLowerCase();
        return {
          ...r,
          isDuplicate: cleanAddr ? duplicates.has(cleanAddr) : false
        };
      });
    });
  }, []);

  const handleFixAllChecksums = useCallback(() => {
    setRows(prevRows => {
      const updated = prevRows.map(row => {
        if (row.validationStatus === 'CHECKSUM_FAILED') {
          try {
            const checksummed = getAddress(row.address.trim());
            return {
              ...row,
              address: checksummed,
              validationStatus: 'VALID' as ValidationStatus
            };
          } catch {
            return row;
          }
        }
        return row;
      });

      const addresses = updated.map(r => r.address);
      const duplicates = findDuplicateAddresses(addresses);

      return updated.map(r => {
        const cleanAddr = r.address.trim().toLowerCase();
        return {
          ...r,
          isDuplicate: cleanAddr ? duplicates.has(cleanAddr) : false
        };
      });
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setRows([]);
    setFileStatus('idle');
  }, []);

  const handleExport = useCallback(() => {
    const hasErrors = rows.some(r => r.validationStatus !== 'VALID' || !r.isAmountValid);
    if (hasErrors || rows.length === 0) return;

    const rawRows = rows.map(r => ({
      recipientAddress: r.address,
      amount: r.amount
    }));

    const csvContent = compileAndUnparse(rawRows, {
      payoutType: tokenConfig.type,
      tokenContractAddress: tokenConfig.contractAddress
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const assetName = tokenConfig.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    link.setAttribute('download', `safe_payout_batch_${assetName.toLowerCase()}.csv`);
    link.click();

    // Track usage analytics
    try {
      track('export_csv', {
        asset_symbol: tokenConfig.symbol,
        token_type: tokenConfig.type,
        transfer_count: rows.length
      });
    } catch (e) {
      // Ignore analytics logging failures in dev
    }

    // Confetti success feedback
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, [rows, tokenConfig]);

  const hasExportErrors = rows.some(r => r.validationStatus !== 'VALID' || !r.isAmountValid) || rows.length === 0;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030303]">
      {/* Background glowing details */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-glow-orb-indigo blur-3xl" />
        <div className="absolute top-[40%] right-[-10%] h-[550px] w-[550px] rounded-full bg-glow-orb-purple blur-3xl" />
      </div>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 relative z-10">
        {/* Landing Hero Message */}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Gnosis Safe Bulk Transfer Compiler
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Quickly parse a list of EVM addresses and decimal amounts, validate formats, detect duplicate records, and compile Gnosis Safe compatible payouts. Zero server latency, entirely client-side.
          </p>
        </div>

        {/* Dashboard Area */}
        <div className="space-y-8">
          {fileStatus === 'idle' ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <CsvDropzone onDataParsed={handleDataParsed} />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Interactive preview list table */}
              <CsvTablePreview
                rows={rows}
                onRowUpdate={handleRowUpdate}
                onRowDelete={handleRowDelete}
                onFixAllChecksums={handleFixAllChecksums}
                onClearAll={handleClearAll}
              />

              {/* Conversion presets configure outputs */}
              <ConversionControls
                onTokenConfigChange={setTokenConfig}
                onExport={handleExport}
                isExportDisabled={hasExportErrors}
                totalTransfers={rows.length}
              />
            </div>
          )}
        </div>

        {/* Trojan Horse persistent Footer CTA */}
        <FooterCta />
      </main>
    </div>
  );
}
