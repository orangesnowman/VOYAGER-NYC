import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, Mic, MicOff, User, ArrowRight, Type, Headphones } from 'lucide-react';

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
  const [activeMode, setActiveMode] = useState<'ESCUCHA' | 'DICTA' | 'ESCRIBE'>('ESCUCHA');
  const [isListening, setIsListening] = useState(false);
  const [isEscribeActive, setIsEscribeActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentText = value !== undefined ? value : internalText;

  const updateText = (newVal: string) => {
    if (onChangeValue) {
      onChangeValue(newVal);
    } else {
      setInternalText(newVal);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    updateText(val);
    if (isListening) {
      baseTextRef.current = val;
    }
  };

  // Auto-resize textarea height as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
    }
  }, [currentText]);

  // Setup Web Speech Recognition for continuous dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'EN' ? 'en-US' : 'es-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const prefix = baseTextRef.current;
        const separator = prefix && !prefix.endsWith(' ') && !transcript.startsWith(' ') ? ' ' : '';
        const combined = prefix + separator + transcript;
        updateText(combined);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Error instantiating SpeechRecognition:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [selectedLang]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(selectedLang === 'EN' 
        ? 'Voice dictation is not supported in this browser. You can type your message.' 
        : 'La dictación por voz no es compatible con este navegador. Puedes escribir tu mensaje.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    } else {
      baseTextRef.current = currentText;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = selectedLang === 'EN' ? 'en-US' : 'es-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
          setIsListening(false);
        }
      }
    }
  };

  const handleEscuchaClick = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    setIsEscribeActive(false);
    setActiveMode('ESCUCHA');
  };

  const handleDictaClick = () => {
    setActiveMode('DICTA');
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    } else {
      toggleListening();
    }
  };

  const handleEscribeClick = () => {
    setActiveMode('ESCRIBE');
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    }
    setIsEscribeActive(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const handlePausaClick = () => {
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
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    if (currentText.trim()) {
      onSubmitText(currentText.trim());
      updateText('');
      setActiveMode('ESCUCHA');
      setIsEscribeActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const defaultPlaceholder = isListening
    ? (selectedLang === 'EN' ? 'Listening... speak now' : 'Escuchando... habla ahora')
    : (selectedLang === 'EN' ? 'Write or dictate...' : 'Escribe o dicta...');

  return (
    <div className="flex-shrink-0 px-3 pt-2 pb-2 md:pb-2.5 bg-transparent flex justify-end w-full select-none">
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-[95%] sm:max-w-[92%] relative rounded-[22px] rounded-tr-none transition-all bg-white border-[5px] ${
          isListening 
            ? 'border-red-500 shadow-lg shadow-red-500/20' 
            : 'border-cyan-400 shadow-sm hover:shadow-md'
        } px-3.5 py-2 flex flex-col gap-1`}
      >
        {/* Top Header Row: User Modes (ESCUCHA, DICTA, ESCRIBE, PAUSA) + User Profile Icon */}
        <div className="flex justify-between items-center select-none border-b border-black/5 pb-1">
          {/* Modes: ESCUCHA | DICTA | ESCRIBE | PAUSA */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* ESCUCHA Mode Option (Default) */}
            <button
              type="button"
              onClick={handleEscuchaClick}
              style={{ fontFamily: "'Raleway', sans-serif" }}
              className={`flex items-center gap-1 cursor-pointer transition-all ${
                activeMode === 'ESCUCHA' && !isListening
                  ? 'text-[#1A365D] font-extrabold'
                  : 'text-black/50 font-bold hover:text-[#1A365D]'
              }`}
            >
              <Headphones className={`w-3.5 h-3.5 ${activeMode === 'ESCUCHA' ? 'text-[#1A365D]' : 'text-black/40'}`} />
              <span className="text-[7.5pt] sm:text-[8pt] tracking-wider uppercase whitespace-nowrap">
                {selectedLang === 'EN' ? 'LISTEN' : 'ESCUCHA'}
              </span>
            </button>

            {/* DICTA Mode Option */}
            <button
              type="button"
              onClick={handleDictaClick}
              style={{ fontFamily: "'Raleway', sans-serif" }}
              className={`flex items-center gap-1 cursor-pointer transition-all ${
                isListening || activeMode === 'DICTA'
                  ? 'text-red-600 font-black animate-pulse'
                  : 'text-black/50 font-bold hover:text-red-600'
              }`}
            >
              <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-red-600 animate-pulse' : 'text-black/40'}`} />
              <span className="text-[7.5pt] sm:text-[8pt] tracking-wider uppercase whitespace-nowrap">
                {selectedLang === 'EN' ? 'DICTATE' : 'DICTA'}
              </span>
              {isListening && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              )}
            </button>

            {/* ESCRIBE Mode Option */}
            <button
              type="button"
              onClick={handleEscribeClick}
              style={{ fontFamily: "'Raleway', sans-serif" }}
              className={`flex items-center gap-1 cursor-pointer transition-all ${
                activeMode === 'ESCRIBE' || isEscribeActive
                  ? 'text-[#1A365D] font-extrabold'
                  : 'text-black/50 font-bold hover:text-[#1A365D]'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-black/40" />
              <span className="text-[7.5pt] sm:text-[8pt] tracking-wider uppercase whitespace-nowrap">
                {selectedLang === 'EN' ? 'TYPE' : 'ESCRIBE'}
              </span>
            </button>

            {/* PAUSA Option */}
            <button
              type="button"
              onClick={handlePausaClick}
              disabled={!isConnected}
              style={{ fontFamily: "'Raleway', sans-serif" }}
              className={`flex items-center gap-1 cursor-pointer transition-all ${
                !isConnected ? 'opacity-30 cursor-not-allowed' : ''
              } ${
                isPaused ? 'text-red-600 font-extrabold animate-pulse' : 'text-black/50 font-bold hover:text-red-600'
              }`}
            >
              <span className="text-[7.5pt] sm:text-[8pt] tracking-wider uppercase whitespace-nowrap">
                {selectedLang === 'EN' ? 'PAUSE' : 'PAUSA'}
              </span>
              {isPaused ? (
                <Play fill="currentColor" stroke="none" className="w-3 h-3 text-red-600 animate-pulse" />
              ) : (
                <Pause fill="currentColor" stroke="none" className="w-3 h-3 text-[#1A365D]" />
              )}
            </button>
          </div>

          {/* User Profile Icon */}
          <User className="w-4 h-4 text-[#5A8DF8] stroke-[2.2] flex-shrink-0" />
        </div>

        {/* Textarea + Speech Bubble Action Controls */}
        <div className="flex items-center gap-2 w-full pt-0.5">
          <div className="relative flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={currentText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setActiveMode('ESCRIBE');
                setIsEscribeActive(true);
              }}
              placeholder={placeholderText || defaultPlaceholder}
              style={{ fontFamily: '"American Typewriter", "Courier New", Courier, serif' }}
              className="w-full focus:outline-none transition-all border-none bg-transparent text-black text-right placeholder:text-right placeholder:text-black/40 font-serif text-[14px] leading-snug p-0 resize-none min-h-[28px] max-h-[100px] overflow-y-auto pr-1"
            />
            {/* Blinking Caret / "I" Beam Indicator when ESCRIBE is active and empty */}
            {isEscribeActive && !currentText && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none pr-0.5">
                <span className="w-[2px] h-[16px] bg-blue-600 animate-pulse inline-block" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            {/* Arrow Send Button - appears when text is typed or dictation finished */}
            {!isListening && currentText.trim().length > 0 && (
              <button
                type="submit"
                onClick={handleSubmit}
                title={selectedLang === 'EN' ? 'Send message' : 'Enviar mensaje'}
                className="p-1.5 rounded-full bg-[#5A8DF8] hover:bg-blue-600 text-white shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Microphone Dictation Button */}
            <button
              type="button"
              onClick={handleDictaClick}
              title={
                isListening
                  ? (selectedLang === 'EN' ? 'Stop dictating' : 'Detener dictado')
                  : (selectedLang === 'EN' ? 'Dictate with voice' : 'Dictar por voz')
              }
              className={`p-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/40 animate-pulse scale-105'
                  : 'bg-neutral-100 text-neutral-600 hover:text-[#1A365D] hover:bg-neutral-200 active:scale-95'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Mic className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
