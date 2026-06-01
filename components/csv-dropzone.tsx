import React, { useState, useRef } from 'react';
import { UploadCloud, ClipboardList, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import { track } from '@vercel/analytics';

interface CsvDropzoneProps {
  onDataParsed: (rows: { address: string; amount: string }[]) => void;
}

const isHeaderRow = (addr: string, amt: string): boolean => {
  const cleanAddr = addr.toLowerCase().trim();
  const cleanAmt = amt.toLowerCase().trim();
  
  const headerAddressWords = ['address', 'recipient', 'receiver', 'wallet'];
  const headerAmountWords = ['amount', 'ammount', 'value'];
  
  return headerAddressWords.includes(cleanAddr) || headerAmountWords.includes(cleanAmt);
};

export default function CsvDropzone({ onDataParsed }: CsvDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Delimiter Auto-Detection & Manual Parsing
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) {
      setError('Please paste or type some address lists first.');
      return;
    }

    const lines = manualText.split(/\r?\n/);
    const parsedData: { address: string; amount: string }[] = [];

    lines.forEach(line => {
      // Clean up outer spacing and trailing commas
      const cleanLine = line.trim().replace(/,+$/, '').trim();
      if (!cleanLine) return;

      let address = '';
      let amount = '';

      if (cleanLine.includes(',')) {
        // Split on first comma
        const parts = cleanLine.split(',');
        address = parts[0].trim();
        amount = parts.slice(1).join(',').trim();
      } else if (cleanLine.includes('\t')) {
        // Split on first tab
        const parts = cleanLine.split('\t');
        address = parts[0].trim();
        amount = parts.slice(1).join('\t').trim();
      } else {
        // Split on first whitespace sequence
        const parts = cleanLine.split(/\s+/);
        if (parts.length >= 2) {
          address = parts[0].trim();
          amount = parts.slice(1).join(' ').trim();
        } else {
          address = parts[0].trim();
          amount = '';
        }
      }

      if (parsedData.length === 0 && isHeaderRow(address, amount)) return;
      parsedData.push({ address, amount });
    });

    if (parsedData.length === 0) {
      setError('Could not extract any data rows from input.');
      return;
    }

    try {
      track('paste_data_success', { row_count: parsedData.length });
    } catch (e) {
      // Ignore in dev
    }

    setError(null);
    onDataParsed(parsedData);
  };

  // 2. Parse uploaded file using PapaParse
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Unsupported file format. Please upload a .csv or .txt file.');
      return;
    }

    setError(null);
    Papa.parse(file, {
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const parsed = mapCsvResults(results.data);
        if (parsed.length === 0) {
          setError('Empty file or could not parse rows.');
        } else {
          try {
            const ext = file.name.split('.').pop() || 'unknown';
            track('file_upload_success', { file_type: ext, row_count: parsed.length });
          } catch (e) {
            // Ignore in dev
          }
          onDataParsed(parsed);
        }
      },
      error: (err) => {
        setError(`CSV Parser Error: ${err.message}`);
      }
    });
  };

  const mapCsvResults = (data: any[]): { address: string; amount: string }[] => {
    if (!data || data.length === 0) return [];
    
    const firstItem = data[0];
    let mapped: { address: string; amount: string }[] = [];
    
    // Check if parsed as objects (header row present)
    if (typeof firstItem === 'object' && !Array.isArray(firstItem)) {
      mapped = data.map(row => {
        const keys = Object.keys(row);
        const addressKey = keys.find(k => /address|receiver|recipient|to/i.test(k)) || keys[0];
        const amountKey = keys.find(k => /amount|value|tokens|qty|quantity/i.test(k)) || keys[1];
        return {
          address: String(row[addressKey] || '').trim(),
          amount: String(row[amountKey] || '').trim(),
        };
      });
    } else {
      // Parsed as arrays (no headers or manual parsing fallback)
      mapped = data.map(row => {
        if (!Array.isArray(row)) return { address: '', amount: '' };
        return {
          address: String(row[0] || '').trim(),
          amount: String(row[1] || '').trim(),
        };
      });
    }

    if (mapped.length > 0 && isHeaderRow(mapped[0].address, mapped[0].amount)) {
      return mapped.slice(1);
    }
    return mapped;
  };

  // 3. Native Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 4. Load Sample Data (For immediate trial)
  const handleLoadSampleData = () => {
    try {
      track('click_load_demo');
    } catch (e) {
      // Ignore in dev
    }
    const sampleRows = [
      { address: '0x93C4c10DA30B2c842E0d5dC08477dE9b835eE8b9', amount: '1.5' }, // Valid
      { address: '0x41f87a4fbe363c0123ab57cd902c5a1db7c5a866', amount: '0.75' }, // Non-checksummed (should trigger CHECKSUM_FAILED)
      { address: '0x93C4c10DA30B2c842E0d5dC08477dE9b835eE8b9', amount: '2.25' }, // Duplicate address (Row 1 duplicate)
      { address: '0xInvalidAddressHexStructureTooShort', amount: '10.0' }, // Malformed address
      { address: '', amount: '5.0' }, // Empty address
      { address: '0xfB6916095ca1df60bb79ce92ce3ea74c37c5d359', amount: '-2.5' }, // Valid address, invalid negative amount
      { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', amount: 'abc' } // Valid address, non-numeric amount
    ];
    onDataParsed(sampleRows);
  };

  return (
    <div className="w-full space-y-6">
      {/* Interactive Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
            : 'border-zinc-700/80 bg-zinc-950/20 hover:border-zinc-500 hover:bg-zinc-950/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.txt"
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/60 transition-transform group-hover:scale-110 duration-300">
          <UploadCloud className="h-6 w-6 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
        </div>

        <h3 className="mt-4 font-display text-base font-semibold text-zinc-200">
          Drag and drop your spreadsheet here
        </h3>
        
        <p className="mt-2 text-xs text-zinc-400 max-w-sm">
          Supports CSV or TXT lists. Drag them directly, or click to browse files from your computer.
        </p>

        <div className="mt-1.5 text-[10px] text-zinc-400 font-mono">
          Required Columns: <code className="text-zinc-200">address</code>, <code className="text-zinc-200">amount</code>
        </div>
      </div>

      {/* Manual Actions Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/40 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer"
        >
          <ClipboardList className="h-4 w-4" />
          {showManual ? 'Hide Manual Input' : 'Paste Address List'}
        </button>

        <button
          type="button"
          onClick={handleLoadSampleData}
          className="flex items-center gap-2 rounded-lg border border-dashed border-indigo-500/50 bg-indigo-500/5 px-4 py-2 text-xs font-semibold text-indigo-350 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Load Demo Sample Data
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3.5 text-xs text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual Text Paste Accordion */}
      {showManual && (
        <form
          onSubmit={handleManualSubmit}
          className="rounded-xl border border-zinc-700/80 bg-zinc-950/30 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Paste lists (One recipient per line)
            </label>
            <textarea
              rows={6}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={`0x93C4c10DA30B2c842E0d5dC08477dE9b835eE8b9, 1.5&#10;0x41f87a4fbe363c0123ab57cd902c5a1db7c5a866  0.75&#10;0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&#9;150.00`}
              className="w-full rounded-lg border border-zinc-750 bg-zinc-950/60 p-3 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-zinc-650 focus:outline-none focus:ring-1 focus:ring-zinc-650 transition-all"
            />
            <p className="mt-1.5 text-[10px] text-zinc-400 leading-relaxed">
              Auto-detects delimiters (comma, tab, space). Structure: <code className="text-zinc-300">address [delimiter] amount</code>.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 focus:outline-none shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Parse Pasted Data
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
