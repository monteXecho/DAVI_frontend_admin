import { Suspense } from 'react';
import ActiveUsersClient from './ActiveUsersClient';

export default function ActiveUsersPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-[#23BD92] border-gray-200" />
            </div>
          }
        >
          <ActiveUsersClient />
        </Suspense>
      </div>
    </div>
  );
}
