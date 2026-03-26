'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/useApi';
import DashboardCard from '../compagnies/components/DashboardCard';
import { PersonIcon, DocumentIcon } from '../compagnies/components/DashboardIcons';
import DocumentChatQuestionsIcon from './document-chat-questions/DocumentChatQuestionsIcon';
import TopFaqTileCard from './top-faq/TopFaqTileCard';
import DocumentsOlderThan2yTileCard from './documents-older-than-2y/DocumentsOlderThan2yTileCard';
import LastUserActivityTileCard from './last-user-activity/LastUserActivityTileCard';
import DocumentChangesTileCard from './document-changes/DocumentChangesTileCard';

export default function CompanyDashboardClient() {
  const router = useRouter();
  const {
    getCompanyDashboardActiveUsersCount,
    getCompanyDashboardDocumentsInUseCount,
    getCompanyDashboardDocumentChatQuestionsCount,
    getCompanyDashboardDocumentChatUnansweredCount,
    getCompanyDashboardTopFaqPreview,
    getCompanyDashboardDocumentsOlderThan2yCount,
  } = useApi();
  const [activeUsersCount, setActiveUsersCount] = useState(null);
  const [documentsInUseCount, setDocumentsInUseCount] = useState(null);
  const [documentChatQuestionsMonthCount, setDocumentChatQuestionsMonthCount] =
    useState(null);
  const [unansweredQuestionsCount, setUnansweredQuestionsCount] = useState(null);
  const [topFaqPreview, setTopFaqPreview] = useState(null);
  const [documentsOlderThan2yCount, setDocumentsOlderThan2yCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [active, inUse, chatQ, unans, topPrev, oldDocs] = await Promise.all([
          getCompanyDashboardActiveUsersCount(),
          getCompanyDashboardDocumentsInUseCount(),
          getCompanyDashboardDocumentChatQuestionsCount(),
          getCompanyDashboardDocumentChatUnansweredCount(),
          getCompanyDashboardTopFaqPreview(),
          getCompanyDashboardDocumentsOlderThan2yCount(),
        ]);
        if (!cancelled) {
          setActiveUsersCount(typeof active?.count === 'number' ? active.count : 0);
          setDocumentsInUseCount(typeof inUse?.count === 'number' ? inUse.count : 0);
          setDocumentChatQuestionsMonthCount(
            typeof chatQ?.count === 'number' ? chatQ.count : 0
          );
          setUnansweredQuestionsCount(
            typeof unans?.count === 'number' ? unans.count : 0
          );
          setTopFaqPreview(topPrev && typeof topPrev === 'object' ? topPrev : null);
          setDocumentsOlderThan2yCount(
            typeof oldDocs?.count === 'number' ? oldDocs.count : 0
          );
        }
      } catch (e) {
        console.error('Company dashboard stats:', e);
        if (!cancelled) {
          setActiveUsersCount(0);
          setDocumentsInUseCount(0);
          setDocumentChatQuestionsMonthCount(0);
          setUnansweredQuestionsCount(0);
          setTopFaqPreview(null);
          setDocumentsOlderThan2yCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    getCompanyDashboardActiveUsersCount,
    getCompanyDashboardDocumentsInUseCount,
    getCompanyDashboardDocumentChatQuestionsCount,
    getCompanyDashboardDocumentChatUnansweredCount,
    getCompanyDashboardTopFaqPreview,
    getCompanyDashboardDocumentsOlderThan2yCount,
  ]);

  if (loading) {
    return (
      <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
        <div className="w-full px-[102px] py-[46px] flex justify-center items-center min-h-[400px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit min-h-full flex flex-col py-[81px] overflow-y-auto scrollbar-hide">
      <div className="w-full px-[102px] py-[46px] max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-montserrat text-[#342222]">
            DAVI Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <button
            type="button"
            onClick={() => router.push('/company-dashboard/active-users')}
            className="text-left w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          >
            <DashboardCard
              number={activeUsersCount ?? 0}
              label="Actieve gebruikers in de laatste 30 dagen"
              icon={<PersonIcon />}
            />
          </button>

          <button
            type="button"
            onClick={() => router.push('/company-dashboard/documents-in-use')}
            className="text-left w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          >
            <DashboardCard
              number={documentsInUseCount ?? 0}
              label="Documenten in gebruik"
              icon={<DocumentIcon />}
            />
          </button>

          <button
            type="button"
            onClick={() => router.push('/company-dashboard/document-chat-questions')}
            className="text-left w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          >
            <DashboardCard
              number={documentChatQuestionsMonthCount ?? 0}
              label={
                <>
                  <span className="block">Vragen gesteld</span>
                  <span className="block">deze maand</span>
                </>
              }
              icon={<DocumentChatQuestionsIcon className="w-9 h-9" />}
            />
          </button>

          <button
            type="button"
            onClick={() => router.push('/company-dashboard/document-chat-unanswered')}
            className="text-left w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          >
            <DashboardCard
              number={unansweredQuestionsCount ?? 0}
              label={
                <>
                  <span className="block">Vragen gesteld</span>
                  <span className="block">zonder antwoord</span>
                </>
              }
              icon={<DocumentChatQuestionsIcon className="w-9 h-9" />}
            />
          </button>

          <TopFaqTileCard
            topQuestion={topFaqPreview?.top_question ?? ''}
            count={typeof topFaqPreview?.count === 'number' ? topFaqPreview.count : 0}
            onClick={() => router.push('/company-dashboard/top-faq')}
          />
          <DocumentsOlderThan2yTileCard
            count={documentsOlderThan2yCount ?? 0}
            onClick={() => router.push('/company-dashboard/documents-older-than-2y')}
          />
          <LastUserActivityTileCard
            onClick={() => router.push('/company-dashboard/last-user-activity')}
          />
          <DocumentChangesTileCard
            onClick={() => router.push('/company-dashboard/document-changes')}
          />
          <PlaceholderTile
            icon={
              <span className="text-[#23BD92] text-2xl" aria-hidden>
                →
              </span>
            }
            label="Stel een analysevraag"
          />
        </div>
      </div>
    </div>
  );
}

function PlaceholderTile({ icon, label }) {
  return (
    <div
      className="opacity-55 pointer-events-none select-none"
      aria-hidden="true"
    >
      <DashboardCard number="—" label={label} icon={icon} />
    </div>
  );
}
