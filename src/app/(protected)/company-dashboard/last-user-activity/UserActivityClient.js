'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useApi } from '@/lib/useApi';
import DropdownMenu from '@/components/input/DropdownMenu';
import SortableHeader from '@/components/SortableHeader';
import { useSortableData } from '@/lib/useSortableData';

const PAGE_SIZE = 10;
const PAGE_TEAL = '#21BA8E';

/** Placeholders until product copy is finalized */
const USER_DEFAULT = 'Selecteer gebruiker';
const ACTIVITY_DEFAULT = 'Selecteer activiteit';
const PERIOD_DEFAULT = 'Selecteer periode';

const PERIOD_OPTIONS = [
  { label: 'Laatste 7 dagen', value: '7d' },
  { label: 'Laatste 30 dagen', value: '30d' },
  { label: 'Laatste 90 dagen', value: '90d' },
  { label: 'Alles', value: 'all' },
];

const ACTIVITY_OPTIONS = [
  { label: 'Uploaden', value: 'upload' },
  { label: 'Bijwerken', value: 'update' },
  { label: 'Document in antwoord', value: 'answer_usage' },
  { label: 'Map aangemaakt', value: 'folder_create' },
  { label: 'Map verwijderd', value: 'delete_folder' },
  { label: 'Privé verwijderd', value: 'delete_private' },
];

function formatNlActivityWhen(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startToday - startD) / (24 * 60 * 60 * 1000));
    const time = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return `Vandaag, ${time}`;
    if (diffDays === 1) return `Gisteren, ${time}`;
    const dateOpts = { day: 'numeric', month: 'long' };
    if (d.getFullYear() !== now.getFullYear()) dateOpts.year = 'numeric';
    const datePart = d.toLocaleDateString('nl-NL', dateOpts);
    return `${datePart}, ${time}`;
  } catch {
    return '—';
  }
}

function buildPaginationItems(current, total) {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 5) {
    const out = [];
    for (let i = 1; i <= 5; i += 1) out.push(i);
    out.push('ellipsis');
    for (let i = total - 4; i <= total; i += 1) {
      if (i > 5) out.push(i);
    }
    return out;
  }
  if (current >= total - 4) {
    const out = [];
    for (let i = 1; i <= 5; i += 1) out.push(i);
    out.push('ellipsis');
    for (let i = total - 4; i <= total; i += 1) {
      if (i > 5) out.push(i);
    }
    return out;
  }
  const out = [1, 'ellipsis'];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i += 1) out.push(i);
  out.push('ellipsis');
  out.push(total);
  return out;
}

export default function UserActivityClient() {
  const router = useRouter();
  const { getCompanyDashboardUserActivity } = useApi();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [userOptions, setUserOptions] = useState([]);

  const [periodLabel, setPeriodLabel] = useState(PERIOD_DEFAULT);
  const [userFilterLabel, setUserFilterLabel] = useState(USER_DEFAULT);
  const [activityFilterLabel, setActivityFilterLabel] = useState(ACTIVITY_DEFAULT);

  const periodValue = useMemo(() => {
    if (periodLabel === PERIOD_DEFAULT) return '30d';
    const o = PERIOD_OPTIONS.find((x) => x.label === periodLabel);
    return o ? o.value : '30d';
  }, [periodLabel]);

  const activityValue = useMemo(() => {
    if (activityFilterLabel === ACTIVITY_DEFAULT) return 'all';
    const o = ACTIVITY_OPTIONS.find((x) => x.label === activityFilterLabel);
    return o ? o.value : 'all';
  }, [activityFilterLabel]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        period: periodValue,
      };
      if (userFilterLabel && userFilterLabel !== USER_DEFAULT) {
        params.user = userFilterLabel;
      }
      if (activityValue && activityValue !== 'all') {
        params.activity = activityValue;
      }

      const data = await getCompanyDashboardUserActivity(params);
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(typeof data?.total === 'number' ? data.total : 0);
      if (Array.isArray(data?.user_options) && data.user_options.length) {
        setUserOptions(data.user_options);
      }
    } catch (e) {
      console.error(e);
      toast.error('Kon activiteit niet laden.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    getCompanyDashboardUserActivity,
    page,
    periodValue,
    userFilterLabel,
    activityValue,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const userDropdownOptions = useMemo(() => {
    const rest = userOptions.filter((n) => n && n.length);
    return [USER_DEFAULT, ...rest];
  }, [userOptions]);

  const activityDropdownOptions = useMemo(
    () => [ACTIVITY_DEFAULT, ...ACTIVITY_OPTIONS.map((x) => x.label)],
    []
  );

  const periodDropdownOptions = useMemo(
    () => [PERIOD_DEFAULT, ...PERIOD_OPTIONS.map((x) => x.label)],
    []
  );

  const tableRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      when_sort: r.when ? new Date(r.when).getTime() : 0,
    }));
  }, [rows]);

  const { items: sorted, requestSort, sortConfig } = useSortableData(tableRows);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const pageRangeLabel = useMemo(() => {
    if (total <= 0) return '';
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `${start}–${end} van ${total}`;
  }, [page, total]);

  const paginationItems = useMemo(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const headLine = 'Laatste gebruikersactiviteit';

  const handlePeriodChange = (v) => {
    setPeriodLabel(v);
    setPage(1);
  };

  const handleUserChange = (v) => {
    setUserFilterLabel(v);
    setPage(1);
  };

  const handleActivityChange = (v) => {
    setActivityFilterLabel(v);
    setPage(1);
  };

  if (loading && rows.length === 0) {
    return (
      <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
        <div className="w-full px-[102px] py-[46px] flex justify-center items-center min-h-[280px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
      <ToastContainer position="top-right" />
      <div className="w-full px-[102px] py-[46px]">
        <div className="flex flex-col md:flex-row mb-[50px] gap-2 md:items-center">
          <button
            type="button"
            onClick={() => router.push('/company-dashboard')}
            className="w-fit cursor-pointer p-0 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
            aria-label="Terug naar DAVI Dashboard"
          >
            <svg
              className="w-9 h-9 md:w-15 md:h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.998 0C15.516 0 19.995 4.48 19.995 9.998C19.995 15.515 15.516 19.995 9.998 19.995C4.48 19.995 0 15.515 0 9.998C0 4.48 4.48 0 9.998 0ZM8.475 6.21C8.475 6.21 6.973 7.715 5.22 9.469C5.073 9.616 5 9.808 5 10C5 10.192 5.073 10.383 5.22 10.53C6.973 12.284 8.474 13.788 8.474 13.788C8.619 13.933 8.809 14.005 9 14.005C9.192 14.004 9.384 13.931 9.531 13.784C9.823 13.491 9.825 13.018 9.534 12.727L7.557 10.75H14.25C14.664 10.75 15 10.414 15 10C15 9.586 14.664 9.25 14.25 9.25H7.557L9.535 7.271C9.825 6.982 9.822 6.509 9.529 6.217C9.382 6.07 9.19 5.996 8.999 5.995C8.809 5.995 8.619 6.066 8.475 6.21Z"
                fill="black"
              />
            </svg>
          </button>
          <span className="text-[30px] md:text-[32px] font-bold">DAVI Dashboard</span>
        </div>

        <div className="mb-[29px] font-montserrat font-extrabold text-[18px] leading-[100%] text-[#342222]">
          {headLine}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-center min-h-[60px] bg-[#F9FBFA] px-2 mb-0 py-2 rounded-lg">
          <div className="min-w-0 w-full">
            <DropdownMenu
              value={userFilterLabel}
              onChange={handleUserChange}
              allOptions={userDropdownOptions}
            />
          </div>
          <div className="min-w-0 w-full">
            <DropdownMenu
              value={activityFilterLabel}
              onChange={handleActivityChange}
              allOptions={activityDropdownOptions}
            />
          </div>
          <div className="min-w-0 w-full sm:col-span-2 lg:col-span-1">
            <DropdownMenu
              value={periodLabel}
              onChange={handlePeriodChange}
              allOptions={periodDropdownOptions}
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-t-0 border-[#E5E5E5] rounded-b-lg relative mt-4">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-1 flex items-center justify-center pointer-events-none">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
            </div>
          )}
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead className="bg-[#F9FBFA]">
              <tr className="h-[51px] border-b border-[#C5BEBE]">
                <SortableHeader
                  sortKey="who_name"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  Wie
                </SortableHeader>
                <SortableHeader
                  sortKey="when_sort"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  Wanneer
                </SortableHeader>
                <SortableHeader
                  sortKey="what"
                  onSort={requestSort}
                  currentSort={sortConfig}
                  className="px-2"
                >
                  Wat
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={`${row.when}-${row.who_id}-${idx}`}
                  className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition"
                >
                  <td className="px-4 py-3 font-montserrat text-sm text-[#342222]">
                    {row.who_name || '—'}
                  </td>
                  <td className="px-4 py-3 font-montserrat text-sm text-[#342222] whitespace-nowrap">
                    {formatNlActivityWhen(row.when)}
                  </td>
                  <td className="px-4 py-3 font-montserrat text-sm text-[#342222] whitespace-pre-line">
                    {row.what || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 font-montserrat">
              Geen activiteit in dit overzicht.
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-2 mt-5">
            <p className="text-xs text-[#342222] font-montserrat">{pageRangeLabel}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                aria-label="Vorige pagina"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21BA8E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {paginationItems.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`e-${idx}`}
                    className="flex min-w-8 items-center justify-center px-0.5 font-montserrat text-xs font-bold tracking-[0.12em]"
                    style={{ color: PAGE_TEAL }}
                    aria-hidden
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => setPage(item)}
                    className={`min-w-8 h-8 rounded-md border-2 px-1 font-montserrat text-xs font-bold transition disabled:opacity-50 ${
                      page === item ? '' : 'hover:bg-[#21BA8E]/10'
                    }`}
                    style={
                      page === item
                        ? {
                            backgroundColor: PAGE_TEAL,
                            borderColor: PAGE_TEAL,
                            color: '#ffffff',
                          }
                        : {
                            backgroundColor: '#ffffff',
                            borderColor: PAGE_TEAL,
                            color: PAGE_TEAL,
                          }
                    }
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                aria-label="Volgende pagina"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21BA8E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
