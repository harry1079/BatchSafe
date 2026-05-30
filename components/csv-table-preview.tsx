import React from 'react';
import { Trash2, AlertTriangle, CheckCircle2, RefreshCw, XCircle, Info, Sparkles } from 'lucide-react';
import { PayoutRowState } from '../app/page';

interface CsvTablePreviewProps {
  rows: PayoutRowState[];
  onRowUpdate: (id: string, updatedFields: Partial<PayoutRowState>) => void;
  onRowDelete: (id: string) => void;
  onFixAllChecksums: () => void;
  onClearAll: () => void;
}

export default function CsvTablePreview({
  rows,
  onRowUpdate,
  onRowDelete,
  onFixAllChecksums,
  onClearAll
}: CsvTablePreviewProps) {
  // Compute statistics
  const totalRows = rows.length;
  const duplicateCount = rows.filter(r => r.isDuplicate).length;
  const checksumFailCount = rows.filter(r => r.validationStatus === 'CHECKSUM_FAILED').length;
  const invalidAddressCount = rows.filter(r => r.validationStatus === 'MALFORMED' || r.validationStatus === 'EMPTY').length;
  const invalidAmountCount = rows.filter(r => !r.isAmountValid).length;
  const hasErrors = checksumFailCount > 0 || invalidAddressCount > 0 || invalidAmountCount > 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Summary/Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transfers Card */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-4">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Total Rows</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-display text-white">{totalRows}</span>
            <span className="text-xs text-zinc-300">transfers</span>
          </div>
        </div>

        {/* Invalid Addresses Card */}
        <div className={`rounded-xl border p-4 transition-colors ${
          invalidAddressCount > 0 
            ? 'border-rose-500/40 bg-rose-500/5' 
            : 'border-zinc-700 bg-zinc-950/40'
        }`}>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Malformed Addresses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-display ${invalidAddressCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {invalidAddressCount}
            </span>
            {invalidAddressCount > 0 && <span className="text-xs text-rose-400">needs correction</span>}
          </div>
        </div>

        {/* Checksum Warnings Card */}
        <div className={`rounded-xl border p-4 transition-colors ${
          checksumFailCount > 0 
            ? 'border-amber-500/40 bg-amber-500/5' 
            : 'border-zinc-700 bg-zinc-950/40'
        }`}>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Checksum Warnings</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-display ${checksumFailCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {checksumFailCount}
              </span>
              {checksumFailCount > 0 && <span className="text-xs text-amber-400">capitalization</span>}
            </div>
            {checksumFailCount > 0 && (
              <button
                onClick={onFixAllChecksums}
                className="flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 transition-colors uppercase tracking-wider cursor-pointer border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded"
              >
                <Sparkles className="h-3 w-3" />
                Fix All
              </button>
            )}
          </div>
        </div>

        {/* Invalid Amounts Card */}
        <div className={`rounded-xl border p-4 transition-colors ${
          invalidAmountCount > 0 
            ? 'border-rose-500/40 bg-rose-500/5' 
            : 'border-zinc-700 bg-zinc-950/40'
        }`}>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Invalid Amounts</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-display ${invalidAmountCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {invalidAmountCount}
            </span>
            {invalidAmountCount > 0 && <span className="text-xs text-rose-400">must be numeric &gt; 0</span>}
          </div>
        </div>
      </div>

      {/* Global Alerts Banner */}
      {hasErrors && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-normal text-amber-300 animate-in fade-in duration-200">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Validation issues detected in table list.</span>
            <p className="mt-1 text-zinc-300">
              Please fix the highlighted cells. You can edit cells inline or click the warning badges to auto-resolve checksum capitalizations. The CSV export is locked until all records are valid.
            </p>
          </div>
        </div>
      )}

      {/* Duplicate warning banner */}
      {duplicateCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 text-xs leading-normal text-indigo-300 animate-in fade-in duration-200">
          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-200">Duplicate recipient addresses detected.</span>
            <p className="mt-1 text-zinc-300">
              Duplicate addresses are highlighted. Verify if these are intended double payments (e.g. separate milestone payments) or spreadsheet compile duplicates.
            </p>
          </div>
        </div>
      )}

      {/* Action triggers: Fix all, Clear all */}
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-semibold text-zinc-200 flex items-center gap-2">
          Payout Table Preview
          <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-normal">
            Editable
          </span>
        </h4>
        <button
          onClick={onClearAll}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-semibold cursor-pointer py-1 px-2 border border-zinc-700 hover:border-zinc-650 bg-zinc-950/20 hover:bg-zinc-950/40 rounded-lg"
        >
          Clear and Reset List
        </button>
      </div>

      {/* Main Table Preview Portal */}
      <div className="glass-panel overflow-hidden rounded-xl border border-zinc-700">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/40">
                <th className="py-3.5 px-4 font-semibold text-zinc-250 w-12 text-center">#</th>
                <th className="py-3.5 px-4 font-semibold text-zinc-250">Recipient Address (EVM)</th>
                <th className="py-3.5 px-4 font-semibold text-zinc-250 w-44">Status Badges</th>
                <th className="py-3.5 px-4 font-semibold text-zinc-250 w-40">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-zinc-250 w-14 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/10">
              {rows.map((row, index) => {
                const isChecksumErr = row.validationStatus === 'CHECKSUM_FAILED';
                const isMalformed = row.validationStatus === 'MALFORMED' || row.validationStatus === 'EMPTY';
                const isAmtErr = !row.isAmountValid;

                return (
                  <tr 
                    key={row.id} 
                    className={`transition-colors group hover:bg-zinc-900/30 ${
                      row.isDuplicate ? 'bg-indigo-500/5' : ''
                    } ${isChecksumErr || isMalformed || isAmtErr ? 'bg-rose-500/2' : ''}`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-zinc-400 font-mono align-middle select-none">
                      {index + 1}
                    </td>

                    {/* Address Edit Cell */}
                    <td className="py-3 px-4 align-middle">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.address}
                          onChange={(e) => onRowUpdate(row.id, { address: e.target.value })}
                          className={`w-full bg-transparent font-mono py-1.5 px-2 rounded border border-transparent focus:bg-zinc-900/60 focus:border-zinc-500 focus:outline-none transition-all text-zinc-100 ${
                            isMalformed ? 'text-rose-400 border-rose-500/50 bg-rose-500/10' : ''
                          } ${isChecksumErr ? 'text-amber-400 border-amber-500/50 bg-amber-500/10' : ''}`}
                          placeholder="0x..."
                        />
                      </div>
                    </td>

                    {/* Validation Badges Cell */}
                    <td className="py-3 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* Address Validity Badge */}
                        {row.validationStatus === 'VALID' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid
                          </span>
                        )}
                        {isChecksumErr && (
                          <button
                            type="button"
                            onClick={() => onRowUpdate(row.id, { validationStatus: 'VALID' })}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer group/badge"
                            title="Click to auto-fix checksum case capitalization"
                          >
                            <RefreshCw className="h-3 w-3 animate-spin-hover" />
                            <span>Unchecksummed</span>
                          </button>
                        )}
                        {isMalformed && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-450">
                            <XCircle className="h-3 w-3" />
                            Malformed
                          </span>
                        )}

                        {/* Duplicate Badge */}
                        {row.isDuplicate && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                            Duplicate
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount Edit Cell */}
                    <td className="py-3 px-4 align-middle">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.amount}
                          onChange={(e) => onRowUpdate(row.id, { amount: e.target.value })}
                          className={`w-full font-mono py-1.5 px-2 rounded border border-transparent focus:bg-zinc-900/60 focus:border-zinc-500 focus:outline-none transition-all text-zinc-150 ${
                            isAmtErr ? 'text-rose-400 border-rose-500/50 bg-rose-500/10' : ''
                          }`}
                          placeholder="0.0"
                        />
                      </div>
                    </td>

                    {/* Row Delete Cell */}
                    <td className="py-3 px-4 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => onRowDelete(row.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete payout transfer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
