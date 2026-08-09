import React, { useState } from 'react';
import { User, X, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLang: 'EN' | 'ES';
  onEmailAuthSubmit: (e: React.FormEvent, isRegister: boolean, name: string, email: string, pass: string) => void;
  onGoogleLogin: () => void;
  onGuestLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  selectedLang,
  onEmailAuthSubmit,
  onGoogleLogin,
  onGuestLogin,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailAuthSubmit(e, isRegister, name, email, password);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-md p-6 sm:p-8 relative overflow-hidden animate-scale-up">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 transition-colors p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-blue-50/80 text-[#1A365D] rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 stroke-[1.75]" />
          </div>
          <h3 style={{ fontFamily: "'Raleway', sans-serif" }} className="text-2xl font-extrabold text-[#1A365D]">
            {selectedLang === 'EN' 
              ? (isRegister ? 'Create Account' : 'Sign In to USA Voyager') 
              : (isRegister ? 'Crear Cuenta en USA Voyager' : 'Iniciar Sesión en USA Voyager')}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
            {selectedLang === 'EN' ? 'Access your personalized learning journey' : 'Accede a tu trayectoria de aprendizaje personalizada'}
          </p>
        </div>

        {/* Register vs Sign In Toggle */}
        <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              isRegister 
                ? 'bg-white text-[#1A365D] shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {selectedLang === 'EN' ? 'Create Account' : 'Crear Cuenta'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister 
                ? 'bg-white text-[#1A365D] shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {selectedLang === 'EN' ? 'Sign In' : 'Iniciar Sesión'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                {selectedLang === 'EN' ? 'Full Name' : 'NOMBRE COMPLETO'}
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedLang === 'EN' ? 'e.g. Maria Gonzalez' : 'ej. María González'}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:border-[#1A365D] focus:ring-1 focus:ring-[#1A365D] focus:outline-none bg-white text-black placeholder-neutral-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
              {selectedLang === 'EN' ? 'E-mail Address' : 'CORREO ELECTRÓNICO'}
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:border-[#1A365D] focus:ring-1 focus:ring-[#1A365D] focus:outline-none bg-white text-black placeholder-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
              {selectedLang === 'EN' ? 'Password' : 'CONTRASEÑA'}
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:border-[#1A365D] focus:ring-1 focus:ring-[#1A365D] focus:outline-none bg-white text-black placeholder-neutral-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1C3B68] hover:bg-[#132A4C] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.98] mt-2"
          >
            {isRegister 
              ? (selectedLang === 'EN' ? 'Create My Account' : 'Crear Mi Cuenta')
              : (selectedLang === 'EN' ? 'Sign In' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2.5 text-neutral-400 text-xs font-medium flex items-center justify-center">
              <span className="w-2 h-2 rounded-full border border-neutral-300 block bg-white" />
            </span>
          </div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onGoogleLogin();
          }}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-neutral-300 hover:bg-neutral-50 rounded-xl text-sm font-semibold text-neutral-800 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{selectedLang === 'EN' ? 'Continue with Google' : 'Continuar con Google'}</span>
        </button>

        {/* Enter as Guest */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onGuestLogin();
          }}
          className="w-full mt-2.5 flex items-center justify-center gap-2.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98]"
        >
          <UserCheck className="w-5 h-5 text-[#1A365D] flex-shrink-0" />
          <span>{selectedLang === 'EN' ? 'Enter as Guest' : 'Entrar como Invitado'}</span>
        </button>
      </div>
    </div>
  );
};
