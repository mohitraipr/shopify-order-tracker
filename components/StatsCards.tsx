'use client';

import { Card } from '@/components/ui/card';

interface StatsCardsProps {
  total: number;
  stuckCount: number;
  cancelledCount: number;
  isSnapmintTab: boolean;
}

export function StatsCards({ total, stuckCount, cancelledCount, isSnapmintTab }: StatsCardsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Total Orders
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{total.toLocaleString()}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSnapmintTab ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-500 ${isSnapmintTab ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: '100%' }} />
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Stuck Orders
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-rose-600">{stuckCount.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fulfilled but not in transit
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-500"
              style={{ width: total > 0 ? `${Math.min((stuckCount / total) * 100, 100)}%` : '0%' }}
            />
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Cancelled
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-amber-600">{cancelledCount.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fulfilled orders later cancelled
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: total > 0 ? `${Math.min((cancelledCount / total) * 100, 100)}%` : '0%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
