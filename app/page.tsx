"use client";

import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import posthog from 'posthog-js';
import Header from '../components/header';
import CsvDropzone from '../components/csv-dropzone';
import CsvTablePreview from '../components/csv-table-preview';
import ConversionControls, { TokenConfig } from '../components/conversion-controls';
import FooterCta from '../components/footer-cta';
import { validateAddress, findDuplicateAddresses } from '../utils/address-validator';
import { compileAndUnparse } from '../utils/csv-formatter';
import { getAddress } from 'viem';
import { Sparkles, ShieldCheck, Wallet, AlertCircle, Terminal } from 'lucide-react';


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
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<'cta' | 'export'>('cta');

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

    posthog.capture('export_csv', {
      asset_symbol: tokenConfig.symbol,
      token_type: tokenConfig.type,
      transfer_count: rows.length
    });

    // Confetti success feedback
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Sleek celebratory popup trigger after confetti starts
    setTimeout(() => {
      setModalSource('export');
      setIsBetaModalOpen(true);
      posthog.capture('show_export_beta_popup');
    }, 800);
  }, [rows, tokenConfig, setModalSource, setIsBetaModalOpen]);

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
        <div className="space-y-4 text-center sm:text-left max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 fill-indigo-400/20" />
            100% Client-Side CSV Utility
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Friday contributor payouts <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">shouldn't ruin your weekend.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Convert messy spreadsheet payouts into Safe-ready batch transactions in seconds. No signups, no wallet connection required to compile, and zero server latency.
          </p>
        </div>

        {/* Dashboard Area */}
        <div className="space-y-8">
          {fileStatus === 'idle' ? (
            <>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                <CsvDropzone onDataParsed={handleDataParsed} />
              </div>

              {/* Trust & Security Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">Zero Server Latency</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your payouts are parsed and compiled entirely in your browser. Contributor addresses and payment amounts never touch a server.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">No Wallet Needed</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Compile, validate, and download Safe-compatible CSV files without linking an admin wallet. Connect only when you execute.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">Auto-Error Spotting</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instantly checks formatting, detects duplicates, and auto-corrects EVM checksum failures to prevent copy-paste losses.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">100% Open Source</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    No black boxes. BatchSafe is completely open-source, client-side, and developer-auditable on GitHub.
                  </p>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="space-y-8 pt-8">
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Get Safe-ready payouts in 3 simple steps
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                    Save hours on contributor payouts without compromising your DAO's security posture.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Visual connectors between steps for md and up */}
                  <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-indigo-500/10 via-zinc-800 to-indigo-500/10 z-0" />

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-indigo-400 font-bold text-sm shadow-md">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-200">Drop your CSV</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                        Export your weekly contributor spreadsheet and drag it right into the tool. No strict formatting required.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-violet-400 font-bold text-sm shadow-md">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-200">Review and Fix</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                        Instantly inspect the preview table. Clean up validation issues, convert addresses, and wipe duplicates in a single click.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-indigo-400 font-bold text-sm shadow-md">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-200">Import to Gnosis Safe</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                        Download the Gnosis-native payout CSV, open the Safe Transaction Builder, upload the file, and queue the transaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
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

        {/* Integration Engine persistent Footer CTA */}
        <FooterCta
          isOpen={isBetaModalOpen}
          setIsOpen={setIsBetaModalOpen}
          modalSource={modalSource}
          setModalSource={setModalSource}
        />
      </main>
    </div>
  );
}
