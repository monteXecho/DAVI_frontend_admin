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
          className="w-full border border-[#23BD92] rounded-lg px-[16px] pr-[50px] py-[16px] font-montserrat text-[16px] leading-[24px] text-[#1f1f1f] resize-none overflow-hidden focus:outline-none"
        />
        <div
          onClick={handleSubmit}
          className="absolute right-[16px] w-[24px] h-[24px] flex items-center justify-center cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.998 0C4.48 0 0 4.48 0 9.998C0 15.516 4.48 19.996 9.998 19.996C15.516 19.996 19.995 15.516 19.995 9.998C19.995 4.48 15.516 0 9.998 0ZM9.998 1.5C14.688 1.5 18.495 5.308 18.495 9.998C18.495 14.688 14.688 18.496 9.998 18.496C5.308 18.496 1.5 14.688 1.5 9.998C1.5 5.308 5.308 1.5 9.998 1.5ZM11.526 6.215C11.526 6.215 13.028 7.72 14.781 9.474C14.927 9.621 15 9.813 15 10.005C15 10.197 14.927 10.388 14.781 10.535C13.028 12.289 11.527 13.793 11.527 13.793C11.382 13.938 11.191 14.01 11 14.01C10.809 14.009 10.617 13.936 10.47 13.789C10.177 13.496 10.175 13.023 10.466 12.732L12.444 10.755H5.75C5.336 10.755 5 10.419 5 10.005C5 9.591 5.336 9.255 5.75 9.255H12.444L10.465 7.276C10.176 6.987 10.179 6.514 10.471 6.222C10.618 6.075 10.81 6.001 11.002 6C11.192 6 11.382 6.071 11.526 6.215Z" fill="#23BD92"/>
          </svg>
        </div>
      </div>

      {loading && (
        <p className="text-[16px] text-gray-500 mt-1">Bezig met laden...</p>
      )}
    </div>
  );
}
