'use client';

import { useRef, useState } from 'react';

export default function AutoGrowingTextarea({ onSubmit, loading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-2">
      <div className="relative w-full flex items-center">
        <textarea
          ref={textareaRef}
          placeholder="Stel een vraag"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          className="w-full border border-[#23BD92] rounded-[8px] px-[16px] pr-[50px] py-[16px] font-montserrat text-[16px] leading-[24px] text-[#1f1f1f] resize-none overflow-hidden focus:outline-none"
        />
        <div
          onClick={handleSubmit}
          className="absolute right-[16px] w-[24px] h-[24px] flex items-center justify-center cursor-pointer"
        >
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 10C12 12.209 10.209 14 8 14C5.791 14 4 12.209 4 10V4C4 1.791 5.791 0 8 0C10.209 0 12 1.791 12 4V10ZM16 8V10C16 14.418 12.418 18 8 18C3.582 18 0 14.418 0 10V8H2V10C2 13.309 4.691 16 8 16C11.309 16 14 13.309 14 10V8H16ZM9 21.03V19H7V21.03C4.718 21.169 3 21.774 3 22.5C3 23.329 5.238 24 8 24C10.762 24 13 23.329 13 22.5C13 21.774 11.282 21.169 9 21.03Z" fill="#23BD92" />
          </svg>
        </div>
      </div>

      {loading && (
        <p className="text-[16px] text-gray-500 mt-1">Bezig met laden...</p>
      )}
    </div>
  );
}
