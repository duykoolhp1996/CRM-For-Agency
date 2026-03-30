import React from 'react';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-yellow rounded-3xl text-black mb-6 shadow-2xl shadow-accent-yellow/20 animate-bounce">
            <TrendingUp size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 font-display tracking-tighter">AgencyFlow</h1>
          <p className="text-text-muted font-medium">The intelligent operating system for your marketing agency.</p>
        </div>

        <div className="bg-card-dark p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-yellow/50 to-transparent" />
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
              <div className="p-2.5 bg-accent-yellow/10 rounded-xl text-accent-yellow">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">AI-Powered Insights</h3>
                <p className="text-xs text-text-muted mt-1 font-medium">Generate campaign ideas and lead summaries instantly with Gemini.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
              <div className="p-2.5 bg-accent-yellow/10 rounded-xl text-accent-yellow">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Secure Data</h3>
                <p className="text-xs text-text-muted mt-1 font-medium">Your client and lead data is protected with enterprise-grade security.</p>
              </div>
            </div>

            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-4 py-5 bg-accent-yellow text-black rounded-3xl font-black uppercase tracking-widest hover:bg-accent-yellow/90 transition-all active:scale-95 shadow-lg shadow-accent-yellow/10"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sign in with Google
            </button>
          </div>

          <p className="mt-10 text-center text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">
            AgencyFlow CRM v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
