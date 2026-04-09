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
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
}

export function FilterControls({
  stuckDays,
  onStuckDaysChange,
  filterType,
  onFilterChange,
  onRefresh,
  onExport,
  isLoading,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-1">
        <label className="text-sm font-medium">Days threshold for stuck orders</label>
        <Input
          type="number"
          min={1}
          max={365}
          value={stuckDays}
          onChange={(e) => onStuckDaysChange(parseInt(e.target.value) || 3)}
          className="w-24"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Filter</label>
        <Select value={filterType} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="stuck">Stuck Orders</SelectItem>
            <SelectItem value="cancelled">Cancelled (Fulfilled)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh'}
      </Button>
      <Button onClick={onExport} variant="outline" disabled={isLoading}>
        Export to Excel
      </Button>
    </div>
  );
}
