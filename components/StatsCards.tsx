'use client';

import { Card } from '@/components/ui/card';

interface StatusCounts {
  all: number;
  delivered: number;
  rto: number;
  dto: number;
  in_transit: number;
  cancelled: number;
  pending: number;
}

interface StatsCardsProps {
  total: number;
  statusCounts: StatusCounts;
  isSnapmintTab: boolean;
}

export function StatsCards({ total, statusCounts, isSnapmintTab }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {/* Delivered */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-emerald-600">{statusCounts.delivered.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">Delivered</p>
            </div>
          </div>
        </div>
      </Card>

      {/* In Transit */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-blue-600">{statusCounts.in_transit.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">In Transit</p>
            </div>
          </div>
        </div>
      </Card>

      {/* RTO */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-rose-600">{statusCounts.rto.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">RTO</p>
            </div>
          </div>
        </div>
      </Card>

      {/* DTO */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-orange-600">{statusCounts.dto.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">DTO</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cancelled */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-amber-600">{statusCounts.cancelled.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">Cancelled</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-600">{statusCounts.pending.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">Pending</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Total */}
      <Card className={`relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_10px_28px_rgba(0,0,0,0.05)] ${isSnapmintTab ? 'ring-2 ring-emerald-200' : ''}`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSnapmintTab ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <p className={`text-2xl font-semibold tracking-tight ${isSnapmintTab ? 'text-emerald-600' : 'text-slate-900'}`}>{total.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500">Total</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
