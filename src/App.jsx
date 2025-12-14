import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Lock, Unlock, Link as LinkIcon, Copy, Check, ArrowRight, ShieldCheck, Loader2, FileText, Globe } from 'lucide-react';
import CryptoJS from 'crypto-js';

// ==========================================
// CONFIGURATION
// ==========================================
const supabaseUrl = "https://wzgjecyzxnohieoijcwr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Z2plY3l6eG5vaGllb2lqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE4NjcsImV4cCI6MjA4MTI3Nzg2N30._XOGAVxWr1rxND0gUP8AEcIDoU9v5xyqnnl8mB4eMNs";
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// UTILS & UI COMPONENTS
// ==========================================
const Spinner = () => <Loader2 className="w-5 h-5 animate-spin" />;

// Background Component with Mesh Gradients and Grid
const Background = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#030712]">
    {/* Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    
    {/* Radial Glows */}
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
    
    {/* Noise Texture for that premium feel */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`relative z-10 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
    {/* Top Highlight Line */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <input
      {...props}
      className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600 hover:border-white/20"
    />
  </div>
);

// ==========================================
// COMPONENT: CREATE GATE
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
      const { data, error } = await supabase
        .from('gates')
        .insert([{ encrypted_data: encryptedData }])
        .select()
        .single();

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
    <div className="min-h-screen flex items-center justify-center p-6 font-sans">
      <Background />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-4 shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Gate</span>
          </h1>
          <p className="text-gray-400 text-lg">Military-grade encryption for your shared links.</p>
        </div>

        {!resultId ? (
          <Card className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Destination URL</label>
                <InputField 
                  icon={Globe}
                  type="url"
                  required
                  placeholder="https://dropbox.com/file..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Access Password</label>
                <InputField 
                  icon={Lock}
                  type="text"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-gray-900/90 px-8 py-4 text-sm font-bold text-white backdrop-blur-3xl transition-all group-hover:bg-gray-900/80">
                  {loading ? <Spinner /> : <span className="flex items-center gap-2">Encrypt & Generate Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>}
                </span>
              </button>
            </form>
          </Card>
        ) : (
          <Card className="p-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Encrypted Successfully</h3>
              <p className="text-gray-400 mt-2">Your link has been secured. Copy the URL below.</p>
            </div>

            <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex items-center mb-6 pl-4 group hover:border-indigo-500/30 transition-colors">
              <span className="text-gray-400 text-sm truncate flex-1 font-mono">{shareUrl}</span>
              <button 
                onClick={copyToClipboard}
                className="p-3 rounded-lg bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-400 transition-all"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={() => { setResultId(null); setLink(''); setPassword(''); }}
              className="w-full py-4 text-gray-400 hover:text-white text-sm font-medium transition-colors border-t border-white/5 mt-2"
            >
              Create New Link
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: ACCESS GATE
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
      const { data, error: dbError } = await supabase
        .from('gates')
        .select('encrypted_data')
        .eq('id', id)
        .single();

      if (dbError || !data) throw new Error("Link not found or expired.");

      const bytes = CryptoJS.AES.decrypt(data.encrypted_data, password);
      const originalLink = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalLink || !originalLink.startsWith('http')) {
        throw new Error("Incorrect password.");
      }

      setDecryptedLink(originalLink);
    } catch (err) {
      setError(err.message === "Incorrect password." ? "Incorrect password provided." : "Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  };

  if (decryptedLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-sans">
        <Background />
        <Card className="w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <Unlock className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
          <p className="text-gray-400 mb-8">The secure vault has been opened.</p>
          
          <a
            href={decryptedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 rounded-xl transition-all shadow-lg shadow-white/10"
          >
            <span className="flex items-center gap-2">
              Proceed to File <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans">
      <Background />
      
      <Card className="w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 rotate-3 transition-transform hover:rotate-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gray-800 text-[10px] text-gray-400 px-2 py-1 rounded border border-gray-700">
              AES-256
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">Restricted Access</h2>
          <p className="text-gray-400 text-sm mt-1">Enter credentials to decrypt this link.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-5">
          <div className="space-y-2">
             <InputField 
                icon={Lock}
                type="password"
                placeholder="Enter Password"
                className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600 text-center tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in shake">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-red-400 text-sm font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] flex justify-center items-center"
          >
            {loading ? <Spinner /> : "Unlock Content"}
          </button>
        </form>
      </Card>
    </div>
  );
};

// ==========================================
// MAIN APP ENTRY POINT
// ==========================================
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
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
