import React, { useState } from 'react';
import { User, Pause, Play } from 'lucide-react';

interface ChatInputBoxProps {
  selectedLang: 'EN' | 'ES';
  isConnected: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  onSubmitText: (text: string) => void;
  value?: string;
  onChangeValue?: (text: string) => void;
  placeholderText?: string;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  selectedLang,
  isConnected,
  isPaused,
  pause,
  resume,
  onSubmitText,
  value,
  onChangeValue,
  placeholderText
}) => {
  const [internalText, setInternalText] = useState('');

  const currentText = value !== undefined ? value : internalText;
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeValue) {
      onChangeValue(e.target.value);
    } else {
      setInternalText(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentText.trim()) {
      onSubmitText(currentText.trim());
      if (onChangeValue) {
        onChangeValue('');
      } else {
        setInternalText('');
      }
    }
  };

  const defaultPlaceholder = selectedLang === 'EN' 
    ? 'Type your message or scenario...' 
    : 'Escribe tu mensaje o escenario...';

  return (
    <div className="flex-shrink-0 px-3 pt-2 pb-2 md:pb-2.5 bg-white flex justify-end w-full select-none">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-[92%] relative rounded-2xl rounded-tr-none transition-all bg-white border-[5px] border-blue-600/30 shadow-sm animate-border-pulsate px-4 py-2.5 flex flex-col"
      >
        <div className="flex justify-end items-center gap-2.5 mb-1 select-none">
          <button
            type="button"
            onClick={() => {
              if (!isConnected) return;
              if (isPaused) {
                resume();
                if (window.speechSynthesis && window.speechSynthesis.paused) {
                  window.speechSynthesis.resume();
                }
              } else {
                pause();
                if (window.speechSynthesis && window.speechSynthesis.speaking) {
                  window.speechSynthesis.pause();
                }
              }
            }}
            disabled={!isConnected}
            className={`flex items-center gap-1 group cursor-pointer transition-all duration-300 ${
              !isConnected ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {!isPaused && (
              <span 
                style={{ fontFamily: "'Lato', sans-serif" }} 
                className="text-[9px] font-black tracking-wider transition-all duration-300 text-[#1A365D] group-hover:text-red-600"
              >
                {selectedLang === 'EN' ? 'PAUSE' : 'PAUSA'}
              </span>
            )}
            {isPaused ? (
              <Play fill="currentColor" stroke="none" className="w-3.5 h-3.5 text-red-600 transition-all animate-pulse" />
            ) : (
              <Pause fill="currentColor" stroke="none" className="w-3.5 h-3.5 text-[#1A365D] group-hover:text-red-600 transition-all duration-300" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={currentText}
          onChange={handleTextChange}
          placeholder={placeholderText || defaultPlaceholder}
          style={{ fontFamily: '"American Typewriter", "Courier New", Courier, serif' }}
          className="w-full focus:outline-none transition-all border-none bg-transparent text-black text-right placeholder:text-right placeholder:text-black/45 font-serif text-[14px] chat-input-text p-0"
        />
      </form>
    </div>
  );
};
