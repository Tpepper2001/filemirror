import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { Lock, Unlock, Link as LinkIcon, Copy, Check, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import CryptoJS from 'crypto-js';

// ==========================================
// CONFIGURATION
// ==========================================
const supabaseUrl = "https://wzgjecyzxnohieoijcwr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Z2plY3l6eG5vaGllb2lqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE4NjcsImV4cCI6MjA4MTI3Nzg2N30._XOGAVxWr1rxND0gUP8AEcIDoU9v5xyqnnl8mB4eMNs";
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// UTILS
// ==========================================
const Spinner = () => <Loader2 className="w-5 h-5 animate-spin" />;

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
      // 1. Encrypt the link using the password
      // We use AES encryption so the DB never sees the real link or the password
      const encryptedData = CryptoJS.AES.encrypt(link, password).toString();

      // 2. Upload to Supabase
      const { data, error } = await supabase
        .from('gates')
        .insert([{ encrypted_data: encryptedData }])
        .select()
        .single();

      if (error) throw error;
      setResultId(data.id);
    } catch (err) {
      alert("Error creating gate: " + err.message);
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            SecureLink Gate
          </h1>
          <p className="text-slate-400">Encrypt and password-protect your file links.</p>
        </div>

        {!resultId ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                  <input
                    type="url"
                    required
                    placeholder="https://dropbox.com/file..."
                    className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="SecretKey123"
                    className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {loading ? <Spinner /> : <>Create Secure Gate <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Link Secured!</h3>
              <p className="text-slate-400 text-sm">Share this URL with the recipient.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-600 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Gate URL</p>
              <div className="flex items-center gap-3">
                <input 
                  readOnly 
                  value={shareUrl} 
                  className="bg-transparent text-blue-400 text-sm flex-1 outline-none truncate font-mono"
                />
                <button 
                  onClick={copyToClipboard}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setResultId(null); setLink(''); setPassword(''); }}
              className="w-full py-3 text-slate-300 hover:text-white font-medium transition-colors"
            >
              Create Another
            </button>
          </div>
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
      // 1. Fetch encrypted blob from Supabase
      const { data, error: dbError } = await supabase
        .from('gates')
        .select('encrypted_data')
        .eq('id', id)
        .single();

      if (dbError || !data) throw new Error("Gate not found");

      // 2. Attempt Decrypt locally
      const bytes = CryptoJS.AES.decrypt(data.encrypted_data, password);
      const originalLink = bytes.toString(CryptoJS.enc.Utf8);

      // 3. Validate Result
      if (!originalLink || !originalLink.startsWith('http')) {
        throw new Error("Incorrect password");
      }

      setDecryptedLink(originalLink);
    } catch (err) {
      setError("Access Denied: " + (err.message === "Gate not found" ? "Invalid URL" : "Incorrect Password"));
    } finally {
      setLoading(false);
    }
  };

  if (decryptedLink) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Unlock className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
          <p className="text-slate-400 mb-8">You can now access the protected file.</p>
          
          <a
            href={decryptedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-green-900/20"
          >
            Open Resource
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Restricted Access</h2>
          <p className="text-slate-400 mt-1">This file is password protected.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative group">
            <input
              type="password"
              placeholder="Enter Access Password"
              className="w-full bg-slate-900 border border-slate-600 text-white text-center text-lg py-4 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center"
          >
            {loading ? <Spinner /> : "Unlock File"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP ROUTER
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
