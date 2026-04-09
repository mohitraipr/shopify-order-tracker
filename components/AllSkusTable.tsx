'use client';

import { useState } from 'react';
import { SkuStats } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface AllSkusTableProps {
  skus: SkuStats[];
  isSnapmintTab: boolean;
}

export function AllSkusTable({ skus, isSnapmintTab }: AllSkusTableProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'delivered' | 'rto' | 'dto'>('total');

  const filteredSkus = skus
    .filter((s) => s.sku.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          {(['total', 'delivered', 'rto', 'dto'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                sortBy === key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">SKU</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-emerald-600">Delivered</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-blue-600">Transit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-rose-600">RTO</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-rose-600">RTO %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-orange-600">DTO</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-amber-600">Cancel</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</th>
                <th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSkus.map((sku, index) => {
                const rtoRate = sku.total > 0 ? (sku.rto / sku.total) * 100 : 0;
                const deliveredPct = (sku.delivered / sku.total) * 100;
                const transitPct = (sku.in_transit / sku.total) * 100;
                const rtoPct = (sku.rto / sku.total) * 100;
                const dtoPct = (sku.dto / sku.total) * 100;
                const cancelledPct = (sku.cancelled / sku.total) * 100;
                const pendingPct = (sku.pending / sku.total) * 100;

                return (
                  <tr key={sku.sku} className={`transition-colors hover:bg-slate-50/50 ${rtoRate > 20 ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-700">
                        {sku.sku}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${isSnapmintTab ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {sku.total}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-emerald-600">{sku.delivered}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">{sku.in_transit}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-rose-600">{sku.rto}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                        rtoRate > 20 ? 'bg-rose-100 text-rose-700' : rtoRate > 10 ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
                      }`}>
                        {rtoRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-orange-600">{sku.dto}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-amber-600">{sku.cancelled}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-500">{sku.pending}</td>
                    <td className="px-4 py-3 pl-6">
                      <div className="flex h-2.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        {deliveredPct > 0 && <div className="h-full bg-emerald-500" style={{ width: `${deliveredPct}%` }} />}
                        {transitPct > 0 && <div className="h-full bg-blue-500" style={{ width: `${transitPct}%` }} />}
                        {rtoPct > 0 && <div className="h-full bg-rose-500" style={{ width: `${rtoPct}%` }} />}
                        {dtoPct > 0 && <div className="h-full bg-orange-500" style={{ width: `${dtoPct}%` }} />}
                        {cancelledPct > 0 && <div className="h-full bg-amber-500" style={{ width: `${cancelledPct}%` }} />}
                        {pendingPct > 0 && <div className="h-full bg-slate-400" style={{ width: `${pendingPct}%` }} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredSkus.length} of {skus.length} SKUs
            {search && ` matching "${search}"`}
          </p>
        </div>
      </div>
    </div>
  );
}
