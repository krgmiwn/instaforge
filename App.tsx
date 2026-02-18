
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Creator from './components/Creator';
import AccountList from './components/AccountList';
import { Settings as SettingsIcon, Globe, Shield, Zap, Link, Activity, RefreshCw, CheckCircle2, AlertCircle, Terminal, Code, Info, Server, Save } from 'lucide-react';
import { testNodeConnection, updateNodeConfig } from './services/apiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('node_url') || '');
  const [proxyInput, setProxyInput] = useState(localStorage.getItem('proxy_url') || '');
  const [testStatus, setTestStatus] = useState<{
    status: string;
    latency?: number;
    error?: string;
    proxy?: string;
    maskedIp?: string;
    version?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const saveBackendUrl = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem('node_url', url);
  };

  const handleSaveProxy = async () => {
    if (!backendUrl) return;
    setIsSavingConfig(true);
    try {
        await updateNodeConfig(backendUrl, { proxyUrl: proxyInput });
        localStorage.setItem('proxy_url', proxyInput);
        runDiagnostics();
    } catch (err) {
        alert("Failed to sync proxy settings to node.");
    } finally {
        setIsSavingConfig(false);
    }
  };

  const runDiagnostics = async () => {
    if (!backendUrl) return;
    setIsTesting(true);
    const result = await testNodeConnection(backendUrl);
    setTestStatus(result as any);
    setIsTesting(false);
  };

  useEffect(() => {
    if (backendUrl) runDiagnostics();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Creator />;
      case 'successful':
        return <AccountList />;
      case 'settings':
        return (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 p-4 pb-20">
            <div className="bg-white p-14 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                  <div className="flex items-center space-x-6">
                    <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
                      <SettingsIcon className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">System Bridge</h2>
                      <p className="text-slate-500 text-lg font-medium">Link and debug your Node.js/ngrok automation node.</p>
                    </div>
                  </div>
                  <div className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${backendUrl ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {backendUrl ? 'Bridge Active' : 'Bridge Offline'}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 shadow-inner">
                      <div className="flex items-center space-x-4 mb-8">
                        <Link className="w-7 h-7 text-blue-600" />
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Target Node Address</h3>
                      </div>
                      
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Base Server URL</label>
                          <div className="flex gap-4">
                            <input 
                              type="text" 
                              value={backendUrl}
                              onChange={(e) => saveBackendUrl(e.target.value)}
                              placeholder="http://localhost:3000"
                              className="flex-1 px-6 py-5 bg-white border-2 border-slate-200 rounded-3xl font-bold text-slate-700 focus:border-blue-600 outline-none transition-all shadow-sm text-lg"
                            />
                            <button 
                              onClick={runDiagnostics}
                              disabled={isTesting || !backendUrl}
                              className="px-8 bg-slate-900 text-white font-black uppercase text-xs rounded-3xl hover:bg-black transition-all flex items-center shadow-xl disabled:opacity-50"
                            >
                              {isTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Ping Node'}
                            </button>
                          </div>
                        </div>

                        {testStatus && (
                          <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between ${testStatus.status === 'online' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center space-x-4">
                              {testStatus.status === 'online' ? (
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                   <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                   <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                              )}
                              <div>
                                <p className={`text-sm font-black uppercase ${testStatus.status === 'online' ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {testStatus.status === 'online' ? 'Handshake Successful' : 'Connection Error'}
                                </p>
                                <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-tight">
                                  {testStatus.status === 'online' ? `Latency: ${testStatus.latency}ms | Packet: OK` : testStatus.error}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0f172a] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                       <div className="relative z-10">
                          <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                   <Globe className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="font-black text-white uppercase tracking-widest text-sm">Proxy Intelligence</h3>
                             </div>
                             <button 
                                onClick={handleSaveProxy}
                                disabled={isSavingConfig || !backendUrl}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center disabled:opacity-50 transition-all shadow-lg"
                             >
                                {isSavingConfig ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                                Sync Proxy
                             </button>
                          </div>

                          <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Proxy Endpoint URL</label>
                                <input 
                                    type="text" 
                                    value={proxyInput}
                                    onChange={(e) => setProxyInput(e.target.value)}
                                    placeholder="http://user:pass@host:port"
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-sm text-blue-300 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Masked IP</p>
                                    <p className="text-lg font-mono text-emerald-400 font-bold truncate">{testStatus?.maskedIp || '0.0.0.0'}</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Tunnel Status</p>
                                    <p className="text-lg font-mono text-blue-400 font-bold">{testStatus?.proxy || 'Direct'}</p>
                                </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                        <div className="flex items-center space-x-4 mb-8">
                           <Code className="w-7 h-7 text-sky-400" />
                           <h3 className="font-black text-white uppercase tracking-widest text-sm">Standalone Deployment</h3>
                        </div>
                        <div className="space-y-6">
                           <div className="bg-black/50 p-6 rounded-2xl border border-slate-800 font-mono text-[10px] text-sky-300 leading-relaxed overflow-x-auto">
                              <p className="mb-2 text-slate-500">// No extra packages needed</p>
                              <p className="text-white">node server.js</p>
                              <br/>
                              <p className="mb-2 text-slate-500">// Connection Health Check</p>
                              <p>GET {backendUrl || '...'}/v1/health</p>
                           </div>
                           <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                              <p className="text-[10px] text-slate-300 font-bold leading-relaxed uppercase">
                                 Your Node.js engine v{testStatus?.version || '24.x'} is fully compatible with our zero-dependency standalone bridge.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Creator />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
