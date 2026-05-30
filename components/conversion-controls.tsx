import React, { useState, useEffect } from 'react';
import { Download, Coins, Network, Sparkles, CheckCircle2 } from 'lucide-react';
import { validateAddress } from '../utils/address-validator';

export interface TokenConfig {
  type: 'native' | 'erc20';
  contractAddress: string;
  symbol: string;
}

interface ConversionControlsProps {
  onTokenConfigChange: (config: TokenConfig) => void;
  onExport: () => void;
  isExportDisabled: boolean;
  totalTransfers: number;
}

interface TokenDetails {
  symbol: string;
  address: string; // empty for native
}

interface NetworkConfig {
  id: string;
  name: string;
  tokens: TokenDetails[];
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    tokens: [
      { symbol: 'ETH (Native)', address: '' },
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
    ]
  },
  {
    id: 'base',
    name: 'Base',
    tokens: [
      { symbol: 'ETH (Native)', address: '' },
      { symbol: 'USDC (Native)', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
      { symbol: 'DAI', address: '0x50c5729ab457585177765506a5fcae19ef1756be' },
    ]
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    tokens: [
      { symbol: 'ETH (Native)', address: '' },
      { symbol: 'USDC (Native)', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
      { symbol: 'USDC.e (Bridged)', address: '0xFF970A61A04b656694149305237845a750B1A014' },
      { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
      { symbol: 'DAI', address: '0xDA10009cBd5D07dd0ceCc66161FC93D7c9000da1' },
    ]
  },
  {
    id: 'optimism',
    name: 'OP Mainnet',
    tokens: [
      { symbol: 'ETH (Native)', address: '' },
      { symbol: 'USDC (Native)', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
      { symbol: 'USDC.e (Bridged)', address: '0x7F5c764cBc14f9669B88837ca1490cca17c31607' },
      { symbol: 'USDT', address: '0x94b008aA00579c1307b0EF2c499aD98a8ce58e58' },
      { symbol: 'DAI', address: '0xDA10009cBd5D07dd0ceCc66161FC93D7c9000da1' },
    ]
  }
];

export default function ConversionControls({
  onTokenConfigChange,
  onExport,
  isExportDisabled,
  totalTransfers
}: ConversionControlsProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[1]); // Default Base
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(1); // Default USDC
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [customSymbol, setCustomSymbol] = useState('CUSTOM');
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);

  // Sync token configurations with parent state
  useEffect(() => {
    if (isCustomToken) {
      const validation = validateAddress(customAddress);
      if (validation.isValid) {
        setCustomAddressError(null);
        onTokenConfigChange({
          type: 'erc20',
          contractAddress: customAddress,
          symbol: customSymbol.trim() || 'CUSTOM'
        });
      } else {
        if (customAddress) {
          setCustomAddressError('Invalid contract address format.');
        } else {
          setCustomAddressError('Token address is required.');
        }
        onTokenConfigChange({
          type: 'erc20',
          contractAddress: '',
          symbol: customSymbol.trim() || 'CUSTOM'
        });
      }
    } else {
      setCustomAddressError(null);
      const token = selectedNetwork.tokens[selectedTokenIndex];
      const type = token.address ? 'erc20' : 'native';
      onTokenConfigChange({
        type: type,
        contractAddress: token.address,
        symbol: token.symbol
      });
    }
  }, [
    selectedNetwork,
    selectedTokenIndex,
    isCustomToken,
    customAddress,
    customSymbol,
    onTokenConfigChange
  ]);

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const net = NETWORKS.find(n => n.id === e.target.value) || NETWORKS[0];
    setSelectedNetwork(net);
    setSelectedTokenIndex(0); // reset to native asset
    setIsCustomToken(false);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomToken(true);
    } else {
      setIsCustomToken(false);
      setSelectedTokenIndex(Number(val));
    }
  };

  const disableExportBtn = isExportDisabled || (isCustomToken && !!customAddressError) || (isCustomToken && !customAddress);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/45 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
          <Coins className="h-4.5 w-4.5" />
        </div>
        <h4 className="font-display text-sm font-semibold text-zinc-200">
          Configure Token Output
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Preset Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Target Network
          </label>
          <div className="relative">
            <select
              value={selectedNetwork.id}
              onChange={handleNetworkChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/40 p-2.5 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none transition-all cursor-pointer appearance-none animate-none"
            >
              {NETWORKS.map(net => (
                <option key={net.id} value={net.id} className="bg-zinc-950">
                  {net.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-3.5 flex items-center text-zinc-400">
              <Network className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Token Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Transfer Asset
          </label>
          <select
            value={isCustomToken ? 'custom' : selectedTokenIndex}
            onChange={handleTokenChange}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/40 p-2.5 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none transition-all cursor-pointer"
          >
            {selectedNetwork.tokens.map((tok, idx) => (
              <option key={tok.symbol} value={idx} className="bg-zinc-950">
                {tok.symbol} {tok.address ? `(${tok.address.slice(0,6)}...${tok.address.slice(-4)})` : ''}
              </option>
            ))}
            <option value="custom" className="bg-zinc-950 font-semibold text-indigo-400">
              + Custom ERC-20 Token
            </option>
          </select>
        </div>
      </div>

      {/* Custom Token Configuration Options */}
      {isCustomToken && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Token Contract Address (EVM)
            </label>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
              className={`w-full rounded-lg border bg-zinc-900/20 p-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition-all ${
                customAddressError ? 'border-rose-500/40 text-rose-450' : 'border-zinc-700'
              }`}
            />
            {customAddressError && (
              <span className="text-[10px] text-rose-400 block font-medium">
                {customAddressError}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Token Symbol
            </label>
            <input
              type="text"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              placeholder="USDC"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/20 p-2 text-xs font-mono text-zinc-250 placeholder-zinc-550 focus:border-zinc-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Download Action Trigger Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-5">
        <div className="text-zinc-400 text-xs">
          {totalTransfers > 0 ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Compiled <strong className="text-zinc-200">{totalTransfers}</strong> transfers successfully.
            </span>
          ) : (
            <span>No transfers compiled yet.</span>
          )}
        </div>

        <button
          onClick={onExport}
          disabled={disableExportBtn}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg cursor-pointer ${
            disableExportBtn
              ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-800'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] hover:shadow-indigo-500/10 active:scale-100 duration-200'
          }`}
        >
          <Download className="h-4.5 w-4.5" />
          <span>Export Safe CSV</span>
          {!disableExportBtn && <Sparkles className="h-4 w-4 text-indigo-200 animate-pulse" />}
        </button>
      </div>
    </div>
  );
}
