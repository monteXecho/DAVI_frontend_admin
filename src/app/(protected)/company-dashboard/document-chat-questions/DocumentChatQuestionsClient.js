'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useApi } from '@/lib/useApi';
import SearchBox from '@/components/input/SearchBox';
import DropdownMenu from '@/components/input/DropdownMenu';
import DocumentChatQuestionRowIcon from './DocumentChatQuestionRowIcon';

const PAGE_SIZE = 10;
const PAGE_TEAL = '#21BA8E';
const ROLE_ALL_LABEL = 'Filter op door rol gesteld';
const FOLDER_ALL_LABEL = 'Filter op map';

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

export default function DocumentChatQuestionsClient() {
  const router = useRouter();
  const {
    getCompanyDashboardDocumentChatQuestionsCount,
    getCompanyDashboardDocumentChatQuestions,
  } = useApi();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [monthCount, setMonthCount] = useState(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState(ROLE_ALL_LABEL);
  const [folderFilter, setFolderFilter] = useState(FOLDER_ALL_LABEL);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleOptions, setRoleOptions] = useState(['Alle rollen']);
  const [folderOptions, setFolderOptions] = useState(['Alle mappen']);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const roleDropdownOptions = useMemo(() => {
    const rest = roleOptions.filter((o) => o && o !== 'Alle rollen');
    return [ROLE_ALL_LABEL, ...rest];
  }, [roleOptions]);

  const folderDropdownOptions = useMemo(() => {
    const rest = folderOptions.filter((o) => o && o !== 'Alle mappen');
    return [FOLDER_ALL_LABEL, ...rest];
  }, [folderOptions]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [countData, listData] = await Promise.all([
        getCompanyDashboardDocumentChatQuestionsCount(),
        getCompanyDashboardDocumentChatQuestions({
          page,
          page_size: PAGE_SIZE,
          ...(roleFilter && roleFilter !== ROLE_ALL_LABEL ? { role: roleFilter } : {}),
          ...(folderFilter && folderFilter !== FOLDER_ALL_LABEL
            ? { folder: folderFilter }
            : {}),
          ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
        }),
      ]);

      setMonthCount(
        typeof countData?.count === 'number' ? countData.count : 0
      );
      setRows(Array.isArray(listData?.questions) ? listData.questions : []);
      setTotal(typeof listData?.total === 'number' ? listData.total : 0);
      if (Array.isArray(listData?.role_options) && listData.role_options.length) {
        setRoleOptions(listData.role_options);
      }
      if (Array.isArray(listData?.folder_options) && listData.folder_options.length) {
        setFolderOptions(listData.folder_options);
      }
    } catch (e) {
      console.error(e);
      toast.error('Kon vragen niet laden.');
      setRows([]);
      setTotal(0);
      setMonthCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    getCompanyDashboardDocumentChatQuestionsCount,
    getCompanyDashboardDocumentChatQuestions,
    page,
    roleFilter,
    folderFilter,
    debouncedSearch,
  ]);

  useEffect(() => {
    load();
  }, [load]);

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

  const headLine = useMemo(() => {
    const n =
      typeof monthCount === 'number'
        ? monthCount.toLocaleString('nl-NL')
        : '—';
    return `${n} vragen gesteld deze maand`;
  }, [monthCount]);

  const handleRoleChange = (v) => {
    setRoleFilter(v);
    setPage(1);
  };

  const handleFolderChange = (v) => {
    setFolderFilter(v);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

        <div className="mb-6 font-montserrat font-extrabold text-[18px] leading-[130%] text-[#342222]">
          {headLine}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-center min-h-[60px] bg-[#F9FBFA] px-2 mb-0 py-2 rounded-lg">
          <div className="min-w-0 w-full">
            <DropdownMenu
              value={roleFilter}
              onChange={handleRoleChange}
              allOptions={roleDropdownOptions}
            />
          </div>
          <div className="min-w-0 w-full">
            <DropdownMenu
              value={folderFilter}
              onChange={handleFolderChange}
              allOptions={folderDropdownOptions}
            />
          </div>
          <div className="min-w-0 w-full sm:col-span-2 lg:col-span-1">
            <SearchBox
              placeholderText="Filter lijst"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="mt-4 border border-[#E5E5E5] rounded-lg relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-1 flex items-center justify-center pointer-events-none">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
            </div>
          )}
          <ul className="divide-y divide-[#C5BEBE]">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-[#F9FBFA] transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-montserrat text-sm text-[#342222] leading-snug">
                    {row.question_text || '—'}
                  </p>
                </div>
                <div
                  className="shrink-0 flex items-center justify-center"
                  title="Document Chat"
                  aria-hidden
                >
                  <DocumentChatQuestionRowIcon />
                </div>
              </li>
            ))}
          </ul>
          {rows.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 font-montserrat">
              Geen vragen in dit overzicht.
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
