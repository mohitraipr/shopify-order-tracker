'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterType } from '@/lib/types';

interface FilterControlsProps {
  stuckDays: number;
  onStuckDaysChange: (days: number) => void;
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
}

export function FilterControls({
  stuckDays,
  onStuckDaysChange,
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onSearch,
  onRefresh,
  onExport,
  isLoading,
}: FilterControlsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Search Row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search by order #, tracking ID, or SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 border-slate-200 bg-slate-50/50 pl-10 text-sm transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <Button
          onClick={onSearch}
          className="h-11 bg-slate-900 px-5 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
        >
          Search
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Stuck after
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={365}
              value={stuckDays}
              onChange={(e) => onStuckDaysChange(parseInt(e.target.value) || 3)}
              className="h-9 w-16 border-slate-200 bg-slate-50/50 text-center text-sm font-medium"
            />
            <span className="text-xs text-slate-500">days</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Status
          </label>
          <Select value={filterType} onValueChange={(v) => onFilterChange(v as FilterType)}>
            <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-slate-50/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="stuck">Stuck Only</SelectItem>
              <SelectItem value="cancelled">Cancelled Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="h-9 border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh
              </span>
            )}
          </Button>
          <Button
            onClick={onExport}
            disabled={isLoading}
            className="h-9 bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Excel
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
