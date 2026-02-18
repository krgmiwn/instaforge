
import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, Loader2, Sparkles, Terminal, CheckCircle, Cpu, Activity, Lock, Globe, AlertTriangle, Link, Wifi, Code, RefreshCw } from 'lucide-react';
import { generateProfileData, generateAutomationLog } from '../services/geminiService';
import { saveAccount } from '../services/storageService';
import { initiateRegistration, verifyOtp, testNodeConnection } from '../services/apiService';
import { CreationStep, CreationLog, InstagramAccount } from '../types';

const Creator: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<CreationStep>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<CreationLog[]>([]);
  const [profile, setProfile] = useState<{username: string, fullName: string, bio: string} | null>(null);
  const [nodeIp, setNodeIp] = useState<string>('Detecting...');
  
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('node_url') || '');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Initial IP Check
  useEffect(() => {
    const checkIp = async () => {
      if (!backendUrl) return;
      try {
        const result = await testNodeConnection(backendUrl);
        if (result.status === 'online' && result.maskedIp) {
          setNodeIp(result.maskedIp);
        } else {
          setNodeIp('Offline');
        }
      } catch {
        setNodeIp('Error');
      }
    };
    checkIp();
  }, [backendUrl]);

  const addLog = (message: string, type: CreationLog['type'] = 'info') => {
    setLogs(prev => [...prev, { 
      timestamp: new Date().toLocaleTimeString(), 
      message, 
      type 
    }]);
    setStatusMessage(message);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setStep('GENERATING');
      setProgress(5);
      addLog(`[SYSTEM] Initializing deployment for ${email}...`);
      
      // Always show the IP at the start of the log
      addLog(`[NETWORK] Target IP: ${nodeIp} (Instagram blocks are tied to this address)`, 'ai');

      const generatedData = await generateProfileData(email);
      setProfile(generatedData);
      addLog(`[AI] Profile parameters optimized: @${generatedData.username}`, 'success');
      setProgress(20);

      setStep('CONNECTING');
      addLog(`[NETWORK] Calling node: ${backendUrl}`);

      if (!backendUrl) {
        addLog("CRITICAL: No Backend Node URL provided.", "critical");
        setStep('ERROR');
        return;
      }

      setStep('SUBMITTING');
      addLog(`[HTTP] POST /v1/register -> Dispatching payload via ${nodeIp}...`, 'info');
      
      try {
        const result = await initiateRegistration(email, password, backendUrl);
        
        addLog(`[NODE RESPONSE] Status: ${result.status}`, 'success');
        
        if (result.status === 'success' || result.ok) {
          addLog("Handshake accepted. Waiting for Instagram OTP dispatch...", 'success');
          setStep('AWAITING_OTP');
          setProgress(100);
        } else {
          addLog(`[WARN] Server returned status: ${result.status}. Check your Node logs.`, 'error');
          setStep('ERROR');
        }
      } catch (err: any) {
        addLog(`[CONNECTION FAILURE] ${err.message}`, 'error');
        if (err.message.includes('403')) {
          addLog(`BLOCK DETECTED: Instagram has flagged IP ${nodeIp}. Change your proxy in Settings.`, 'critical');
        }
        setStep('ERROR');
      }

    } catch (error) {
      addLog("Automation Interrupt: " + (error as Error).message, 'error');
      setStep('IDLE');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setStep('VERIFYING');
    addLog(`[VERIFIER] Submitting confirmation code: ${otp}`, 'info');

    try {
      const result = await verifyOtp(email, otp, backendUrl);
      
      const newAccount: InstagramAccount = {
        id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        username: profile?.username || 'user',
        email: email,
        password: password,
        cookies: result.cookies ? (typeof result.cookies === 'string' ? result.cookies : JSON.stringify(result.cookies)) : "[]",
        fullName: profile?.fullName || 'Full Name',
        bio: profile?.bio || 'Bio',
        createdAt: new Date().toISOString(),
        status: 'active',
        proxy: nodeIp // Use the current IP for the record
      };

      saveAccount(newAccount);
      setStep('SUCCESS');
      addLog("[CORE] Session synchronized. Account moved to Active Vault.", 'success');
    } catch (err: any) {
      addLog(`[VERIFY FAILURE] ${err.message}`, 'error');
      setStep('AWAITING_OTP');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-2xl border border-slate-100 min-h-[650px] flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Automation Engine</h2>
                <div className="flex items-center mt-1 space-x-3">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${backendUrl ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {backendUrl ? 'System Linked' : 'System Offline'}
                    </span>
                  </div>
                  {backendUrl && (
                    <div className="flex items-center bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <Globe className="w-2.5 h-2.5 text-blue-600 mr-1.5" />
                      <span className="text-[9px] font-black text-slate-600 uppercase font-mono">{nodeIp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {(step === 'IDLE' || step === 'ERROR') && (
              <form onSubmit={handleStart} className="space-y-6">
                {!backendUrl && (
                  <div className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 mb-2">
                    <div className="flex items-center space-x-3 text-red-600 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm font-black uppercase">Backend Required</p>
                    </div>
                    <p className="text-xs text-red-500 leading-relaxed font-bold opacity-80">
                      Instagram blocks direct browser requests. Your ngrok Node.js server must handle the API handshake.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Email Destination</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@provider.com"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-lg shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Account Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 outline-none transition-all font-bold text-slate-800 text-lg shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!backendUrl}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black uppercase tracking-widest text-sm rounded-3xl transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] mt-4"
                >
                  {step === 'ERROR' ? 'Retry Handshake' : 'Execute Registration'}
                </button>
              </form>
            )}

            {(step === 'AWAITING_OTP' || step === 'VERIFYING') && (
              <form onSubmit={handleVerify} className="space-y-8 animate-in slide-in-from-bottom-6">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-center shadow-2xl relative border-b-8 border-blue-600">
                  <div className="absolute top-6 right-8 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active Challenge</span>
                  </div>
                  <ShieldCheck className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                  <h4 className="text-white text-xl font-black uppercase tracking-widest">Input OTP</h4>
                  <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">
                    Code dispatched to: <span className="text-blue-400 font-bold">{email}</span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full px-6 py-10 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] focus:border-blue-600 outline-none tracking-[0.6em] text-center font-black text-7xl text-slate-900 shadow-inner"
                  />
                  <p className="text-[11px] text-slate-400 font-black mt-6 uppercase tracking-[0.2em]">Check your inbox including Spam</p>
                </div>
                <button
                  type="submit"
                  disabled={step === 'VERIFYING'}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-2xl shadow-blue-200"
                >
                  {step === 'VERIFYING' ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'Confirm Identity'}
                </button>
              </form>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center py-12 animate-in zoom-in duration-700">
                <div className="w-40 h-40 bg-emerald-500 text-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
                  <CheckCircle className="w-20 h-20" />
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Success</h3>
                <p className="text-slate-500 text-lg font-medium max-w-xs mx-auto">Account synchronized. Check the <b>Successful</b> tab.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-2xl mt-12"
                >
                  New Deployment
                </button>
              </div>
            )}

            {['GENERATING', 'CONNECTING', 'SUBMITTING'].includes(step) && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="relative mb-16">
                  <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-[60px] animate-pulse"></div>
                  <div className="relative w-44 h-44 border-[12px] border-slate-50 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
                  <Activity className="absolute inset-0 m-auto w-14 h-14 text-blue-600 animate-bounce" />
                </div>
                <div className="w-full max-w-sm">
                  <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-left border-l-[6px] border-blue-600 shadow-2xl">
                    <div className="flex items-center space-x-2 mb-3">
                       <Wifi className="w-3 h-3 text-blue-400" />
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Node Stream</p>
                    </div>
                    <p className="text-xs font-bold text-white font-mono break-words leading-relaxed">
                      {statusMessage || "HANDSHAKE_INIT..."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0b0f19] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl overflow-hidden">
        <div className="px-10 py-7 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Terminal className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-mono font-black text-slate-300 uppercase tracking-[0.4em]">Debug Console</span>
          </div>
          <div className="flex items-center space-x-3 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Node IP:</span>
            <span className="text-[10px] font-mono text-blue-400 font-bold tracking-tighter">{nodeIp}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 font-mono text-[12px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start animate-in slide-in-from-left-6 duration-300">
              <span className="text-slate-600 mr-5 font-bold shrink-0 opacity-50">[{log.timestamp}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-400 font-bold border-l-2 border-red-500/50 pl-3' : ''}
                ${log.type === 'critical' ? 'text-white bg-red-600/20 border border-red-600/50 px-3 py-1 rounded-lg font-black' : ''}
                ${log.type === 'success' ? 'text-emerald-400 font-bold border-l-2 border-emerald-500/50 pl-3' : ''}
                ${log.type === 'ai' ? 'text-sky-300 italic flex items-center bg-sky-900/20 px-3 py-1 rounded-lg border border-sky-800/30' : 'text-slate-400'}
                break-words w-full
              `}>
                {log.type === 'ai' && <Code className="w-3 h-3 mr-2 shrink-0 text-sky-400" />}
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Cpu className="w-24 h-24 mb-6" />
                <p className="text-sm font-black uppercase tracking-[0.5em]">System Standby</p>
             </div>
          )}
          <div ref={logEndRef} />
        </div>
        <div className="px-10 py-6 border-t border-slate-800 bg-[#0f172a] flex justify-between items-center text-[11px] font-mono">
           <div className="flex items-center space-x-8">
              <span className="text-slate-500 uppercase font-black">Node IP <span className="text-blue-400">{nodeIp}</span></span>
              <span className="text-slate-500 uppercase font-black">Status: <span className="text-emerald-500">LISTENING</span></span>
           </div>
           <div className="text-slate-600 uppercase font-black tracking-[0.2em] opacity-40">AES-GCM 256 BIT</div>
        </div>
      </div>
    </div>
  );
};

export default Creator;
