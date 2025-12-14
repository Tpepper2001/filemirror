import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Lock, Unlock, Link as LinkIcon, Copy, Check, ArrowRight, ShieldCheck, Loader2, Sparkles, Zap } from 'lucide-react';
import CryptoJS from 'crypto-js';

// ==========================================
// CONFIGURATION
// ==========================================
const supabaseUrl = "https://wzgjecyzxnohieoijcwr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Z2plY3l6eG5vaGllb2lqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE4NjcsImV4cCI6MjA4MTI3Nzg2N30._XOGAVxWr1rxND0gUP8AEcIDoU9v5xyqnnl8mB4eMNs";
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// STUNNING UI COMPONENTS
// ==========================================

const AuroraBackground = () => (
  <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
    {/* Animated Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
    
    {/* Grid Overlay */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative z-10 backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-3xl overflow-hidden ${className}`}>
    {/* Glossy Reflection */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
    {children}
  </div>
);

const GlowingInput = ({ icon: Icon, ...props }) => (
  <div className="relative group transition-all duration-300">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur"></div>
    <div className="relative flex items-center bg-[#0f0f11] rounded-xl border border-white/10">
      <div className="pl-4 text-gray-500 group-focus-within:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input
        {...props}
        className="w-full bg-transparent text-white p-4 outline-none placeholder:text-gray-600 font-medium"
      />
    </div>
  </div>
);

const NeonButton = ({ children, loading, onClick, className = "", color = "blue" }) => {
  const gradients = {
    blue: "from-cyan-500 via-blue-500 to-indigo-600 shadow-cyan-500/20",
    red: "from-orange-500 via-red-500 to-rose-600 shadow-red-500/20",
    green: "from-emerald-400 via-green-500 to-teal-600 shadow-green-500/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`relative group w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} transition-all duration-300 opacity-90 group-hover:opacity-100`}></div>
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-shine" />
      
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradients[color]} blur-xl opacity-0 group-hover:opacity-50 transition duration-500`}></div>
      
      <div className="relative flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </div>
    </button>
  );
};

// ==========================================
// PAGE: CREATE GATE
// ==========================================
const CreateGate = () => {
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!link || !password) return;
    setLoading(true);

    try {
      const encryptedData = CryptoJS.AES.encrypt(link, password).toString();
      const { data, error } = await supabase.from('gates').insert([{ encrypted_data: encryptedData }]).select().single();
      if (error) throw error;
      setResultId(data.id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = resultId ? `${window.location.origin}/access/${resultId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-white">
      <AuroraBackground />

      <div className="w-full max-w-lg relative z-20 perspective-1000">
        {!resultId ? (
          <GlassCard className="p-8 md:p-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Sparkles className="w-8 h-8 text-cyan-300" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                SecureGate
              </h1>
              <p className="text-gray-400">Military-grade encryption for your links.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-300 uppercase tracking-wider ml-1">Destination URL</label>
                <GlowingInput 
                  icon={LinkIcon} 
                  type="url" 
                  placeholder="https://drive.google.com/..." 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider ml-1">Secret Password</label>
                <GlowingInput 
                  icon={Lock} 
                  type="text" 
                  placeholder="Set a strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <NeonButton loading={loading} color="blue">
                  Generate Secure Link <ArrowRight className="w-5 h-5" />
                </NeonButton>
              </div>
            </form>
          </GlassCard>
        ) : (
          <GlassCard className="p-10 text-center animate-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce-slow">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Link Secured!</h2>
            <p className="text-gray-400 mb-8 text-sm">Anyone with this link will need the password.</p>

            <div className="bg-[#0f0f11] border border-white/10 rounded-xl p-2 flex items-center mb-8 group hover:border-green-500/50 transition-colors">
              <code className="flex-1 text-green-400 text-sm truncate px-4 font-mono">{shareUrl}</code>
              <button 
                onClick={copyToClipboard}
                className="p-3 rounded-lg bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white transition-all"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <button 
              onClick={() => { setResultId(null); setLink(''); setPassword(''); }}
              className="text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <Zap className="w-4 h-4" /> Create Another
            </button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

// ==========================================
// PAGE: ACCESS GATE
// ==========================================
const AccessGate = () => {
  const { id } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decryptedLink, setDecryptedLink] = useState(null);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase.from('gates').select('encrypted_data').eq('id', id).single();
      if (dbError || !data) throw new Error("Link not found");

      const bytes = CryptoJS.AES.decrypt(data.encrypted_data, password);
      const originalLink = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalLink || !originalLink.startsWith('http')) throw new Error("Incorrect password");

      setDecryptedLink(originalLink);
    } catch (err) {
      setError(err.message === "Link not found" ? "Invalid Link" : "Incorrect Password");
    } finally {
      setLoading(false);
    }
  };

  if (decryptedLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans text-white">
        <AuroraBackground />
        <GlassCard className="w-full max-w-md p-12 text-center relative z-20 animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-white/20">
            <Unlock className="w-12 h-12 text-white -rotate-12" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
          <p className="text-gray-400 mb-8">The vault has been successfully unlocked.</p>
          
          <a href={decryptedLink} target="_blank" rel="noopener noreferrer" className="block w-full">
            <NeonButton color="green">
              Download / View File <ArrowRight className="w-5 h-5" />
            </NeonButton>
          </a>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-white">
      <AuroraBackground />
      
      <GlassCard className="w-full max-w-md p-10 relative z-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] border-4 border-gray-900">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Restricted Area</h2>
          <p className="text-gray-400">This content is locked. Enter credentials.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <GlowingInput 
            icon={ShieldCheck} 
            type="password" 
            placeholder="Enter Access Password" 
            className="text-center tracking-widest text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center animate-in shake">
              {error}
            </div>
          )}

          <NeonButton loading={loading} color="red">
            Unlock Content
          </NeonButton>
        </form>
      </GlassCard>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateGate />} />
        <Route path="/access/:id" element={<AccessGate />} />
      </Routes>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
