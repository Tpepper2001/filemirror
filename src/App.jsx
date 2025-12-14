import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Link as LinkIcon, Copy, Check, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import CryptoJS from 'crypto-js';
import './App.css'; // Importing the CSS file

// ==========================================
// CONFIGURATION
// ==========================================
const supabaseUrl = "https://wzgjecyzxnohieoijcwr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Z2plY3l6eG5vaGllb2lqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE4NjcsImV4cCI6MjA4MTI3Nzg2N30._XOGAVxWr1rxND0gUP8AEcIDoU9v5xyqnnl8mB4eMNs";
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

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
    <div className="container">
      <div className="ambient-background"></div>
      
      <AnimatePresence mode="wait">
        {!resultId ? (
          <motion.div 
            key="form"
            className="glass-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="header-icon icon-glow-blue">
              <ShieldCheck size={32} />
            </div>
            <div style={{textAlign: 'center'}}>
              <h1>Secure Gate</h1>
              <p>Encrypt your links with AES-256 protection.</p>
            </div>

            <form onSubmit={handleCreate}>
              <div className="input-group">
                <LinkIcon className="input-icon" size={20} />
                <input 
                  type="url" 
                  placeholder="Paste your destination URL" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Set a secure password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary btn-blue" disabled={loading}>
                {loading ? <div className="spinner"></div> : <>Encrypt Link <ArrowRight size={18} /></>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            className="glass-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="header-icon icon-glow-green">
              <Check size={32} />
            </div>
            <div style={{textAlign: 'center'}}>
              <h1>Link Generated</h1>
              <p>Your content is now locked behind a password.</p>
            </div>

            <div className="result-box">
              <div className="result-url">{shareUrl}</div>
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>

            <button 
              className="btn-primary btn-green"
              onClick={() => { setResultId(null); setLink(''); setPassword(''); }}
            >
              Create Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
      const { data, error: dbError } = await supabase.from('gates').select('encrypted_data').eq('id', id).single();
      if (dbError || !data) throw new Error("Link not found");

      const bytes = CryptoJS.AES.decrypt(data.encrypted_data, password);
      const originalLink = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalLink || !originalLink.startsWith('http')) throw new Error("Incorrect password");
      setDecryptedLink(originalLink);
    } catch (err) {
      setError("Invalid password or link expired.");
    } finally {
      setLoading(false);
    }
  };

  if (decryptedLink) {
    return (
      <div className="container">
        <div className="ambient-background"></div>
        <motion.div 
          className="glass-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="header-icon icon-glow-green">
            <Unlock size={32} />
          </div>
          <div style={{textAlign: 'center'}}>
            <h1>Access Granted</h1>
            <p>Your file is ready.</p>
          </div>

          <a href={decryptedLink} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
            <button className="btn-primary btn-green">
              Open Destination <Download size={18} />
            </button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="ambient-background"></div>
      <motion.div 
        className="glass-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="header-icon icon-glow-red">
          <Lock size={32} />
        </div>
        <div style={{textAlign: 'center'}}>
          <h1>Restricted Access</h1>
          <p>This URL is password protected.</p>
        </div>

        <form onSubmit={handleUnlock}>
          <div className="input-group">
            <ShieldCheck className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{textAlign: 'center', paddingLeft: '16px'}}
            />
          </div>

          {error && (
            <motion.div 
              className="error-msg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <button type="submit" className="btn-primary btn-red" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Unlock"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// APP ROUTER
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
root.render(<React.StrictMode><App /></React.StrictMode>);
