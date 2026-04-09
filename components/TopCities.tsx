'use client';

import { CityStats } from '@/lib/types';

interface TopCitiesProps {
  cities: CityStats[];
  isSnapmintTab: boolean;
}

export function TopCities({ cities, isSnapmintTab }: TopCitiesProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Top 15 Cities</h3>
        <span className="text-xs font-medium text-slate-500">by order volume</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">City</th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">State</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-emerald-600">Delivered</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-blue-600">Transit</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-rose-600">RTO</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-orange-600">DTO</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-amber-600">Cancel</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</th>
              <th className="pb-3 pl-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cities.map((city, index) => {
              const deliveredPct = (city.delivered / city.total) * 100;
              const transitPct = (city.in_transit / city.total) * 100;
              const rtoPct = (city.rto / city.total) * 100;
              const dtoPct = (city.dto / city.total) * 100;
              const cancelledPct = (city.cancelled / city.total) * 100;
              const pendingPct = (city.pending / city.total) * 100;
              const rtoRate = city.total > 0 ? ((city.rto / city.total) * 100).toFixed(1) : '0';

              return (
                <tr key={`${city.city}-${city.state}`} className="group transition-colors hover:bg-slate-50/50">
                  <td className="py-3 text-sm font-medium text-slate-400">{index + 1}</td>
                  <td className="py-3">
                    <span className="font-medium text-slate-900">{city.city}</span>
                  </td>
                  <td className="py-3 text-sm text-slate-500">{city.state}</td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-semibold ${isSnapmintTab ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {city.total}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm font-medium text-emerald-600">{city.delivered}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm font-medium text-blue-600">{city.in_transit}</span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-sm font-medium ${city.rto > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                        {city.rto}
                      </span>
                      {city.rto > 0 && Number(rtoRate) > 15 && (
                        <span className="rounded bg-rose-100 px-1 text-[10px] font-semibold text-rose-700">
                          {rtoRate}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-medium ${city.dto > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                      {city.dto}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-medium ${city.cancelled > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                      {city.cancelled}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-medium ${city.pending > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                      {city.pending}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex h-3 w-32 overflow-hidden rounded-full bg-slate-100">
                      {deliveredPct > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${deliveredPct}%` }}
                          title={`Delivered: ${deliveredPct.toFixed(1)}%`}
                        />
                      )}
                      {transitPct > 0 && (
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${transitPct}%` }}
                          title={`In Transit: ${transitPct.toFixed(1)}%`}
                        />
                      )}
                      {rtoPct > 0 && (
                        <div
                          className="h-full bg-rose-500 transition-all"
                          style={{ width: `${rtoPct}%` }}
                          title={`RTO: ${rtoPct.toFixed(1)}%`}
                        />
                      )}
                      {dtoPct > 0 && (
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${dtoPct}%` }}
                          title={`DTO: ${dtoPct.toFixed(1)}%`}
                        />
                      )}
                      {cancelledPct > 0 && (
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${cancelledPct}%` }}
                          title={`Cancelled: ${cancelledPct.toFixed(1)}%`}
                        />
                      )}
                      {pendingPct > 0 && (
                        <div
                          className="h-full bg-slate-400 transition-all"
                          style={{ width: `${pendingPct}%` }}
                          title={`Pending: ${pendingPct.toFixed(1)}%`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">Delivered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-500">In Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="text-xs text-slate-500">RTO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-500">DTO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-500">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          <span className="text-xs text-slate-500">Pending</span>
        </div>
        <div className="ml-auto text-xs text-slate-400">
          Cities with &gt;15% RTO rate are highlighted
        </div>
      </div>
    </div>
  );
}
