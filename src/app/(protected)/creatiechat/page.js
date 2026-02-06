'use client'

import CreatieChat from './CreatieChat';

export default function CreatieChatPage() {
  return (
    <div className="w-full h-full flex flex-col py-[81px] px-[97px] overflow-scroll scrollbar-hide">
      <div className="pb-[17px] font-montserrat font-extrabold text-2xl">
        CreatieChat
      </div>
      <div className="w-full h-[calc(100vh-200px)] min-h-[500px]">
        <CreatieChat />
      </div>
    </div>
  );
}

