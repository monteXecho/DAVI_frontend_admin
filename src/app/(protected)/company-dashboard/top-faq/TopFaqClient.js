'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useApi } from '@/lib/useApi';
import SortableHeader from '@/components/SortableHeader';
import { useSortableData } from '@/lib/useSortableData';

function bronLabel(bronStatus) {
  if (bronStatus === 'metBron') return 'met bron';
  return 'zonder';
}

export default function TopFaqClient() {
  const router = useRouter();
  const { getCompanyDashboardTopFaq } = useApi();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [monthStart, setMonthStart] = useState('');

  const { items: sorted, requestSort, sortConfig } = useSortableData(rows);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanyDashboardTopFaq();
      setRows(Array.isArray(data?.items) ? data.items : []);
      setMonthStart(typeof data?.month_start === 'string' ? data.month_start : '');
    } catch (e) {
      console.error(e);
      toast.error('Kon topvragen niet laden.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getCompanyDashboardTopFaq]);

  useEffect(() => {
    load();
  }, [load]);

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

        <div className="mb-6 font-montserrat font-extrabold text-[18px] leading-[130%] text-[#342222]">
          Top 10 meest gestelde vragen
        </div>

        {monthStart ? (
          <p className="mb-4 text-xs text-[#5c5c5c] font-montserrat">
            Deze maand (UTC), vanaf {monthStart}
          </p>
        ) : null}

        <p className="mb-4 text-sm text-[#5c5c5c] font-montserrat max-w-3xl">
          <span className="font-semibold text-[#342222]">Bron:</span> met bron = minstens één
          keer beantwoord met geciteerde documenten; zonder = alleen antwoorden zonder bronverwijzingen
          (zoals bij &quot;vragen zonder antwoord&quot; met wel een tekstantwoord).
        </p>

        <div className="mt-4 border border-[#E5E5E5] rounded-lg relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-1 flex items-center justify-center pointer-events-none">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#F4F4F4] border-b border-[#C5BEBE]">
                  <SortableHeader
                    sortKey="rank"
                    onSort={requestSort}
                    currentSort={sortConfig}
                    className="font-montserrat font-semibold text-sm text-[#342222] px-4 py-3 w-12"
                  >
                    No.
                  </SortableHeader>
                  <SortableHeader
                    sortKey="question_text"
                    onSort={requestSort}
                    currentSort={sortConfig}
                    className="font-montserrat font-semibold text-sm text-[#342222] px-4 py-3"
                  >
                    Vraag
                  </SortableHeader>
                  <SortableHeader
                    sortKey="count"
                    onSort={requestSort}
                    currentSort={sortConfig}
                    align="right"
                    className="font-montserrat font-semibold text-sm text-[#342222] px-4 py-3 w-24"
                  >
                    Aantal
                  </SortableHeader>
                  <SortableHeader
                    sortKey="bron_status"
                    onSort={requestSort}
                    currentSort={sortConfig}
                    className="font-montserrat font-semibold text-sm text-[#342222] px-4 py-3 w-36"
                  >
                    Beantwoord
                  </SortableHeader>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={`${row.rank}-${row.question_text}`}
                    className="border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition"
                  >
                    <td className="font-montserrat text-sm text-[#342222] px-4 py-3 align-top">
                      {row.rank}
                    </td>
                    <td className="font-montserrat text-sm text-[#342222] px-4 py-3 align-top">
                      {row.question_text || '—'}
                    </td>
                    <td className="font-montserrat text-sm text-[#342222] px-4 py-3 align-top text-right tabular-nums">
                      {typeof row.count === 'number' ? row.count.toLocaleString('nl-NL') : '—'}
                    </td>
                    <td className="font-montserrat text-sm text-[#342222] px-4 py-3 align-top">
                      {bronLabel(row.bron_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 font-montserrat">
              Nog geen vragen deze maand.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
