
import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  ExternalLink, 
  User,
  Search,
  Filter,
  Copy,
  Eye,
  EyeOff,
  Database,
  Check,
  FileJson,
  ShieldCheck,
  Lock,
  Globe
} from 'lucide-react';
import { getAccounts, deleteAccount } from '../services/storageService';
import { InstagramAccount } from '../types';

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Delete this account from the local vault?')) {
      deleteAccount(id);
      setAccounts(getAccounts());
    }
  };

  const toggleVisibility = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportSession = (cookies: string, username: string) => {
    const blob = new Blob([cookies], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IG_${username}_SESSION.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center uppercase">
            <Database className="w-8 h-8 mr-4 text-blue-600" />
            Active Vault
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Verified accounts and session persistent states.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Username/Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-600 outline-none w-full sm:w-80 shadow-sm transition-all"
            />
          </div>
          <button className="p-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 hover:border-slate-300 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredAccounts.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] py-32 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Vault Empty</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Successfully deployed accounts will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group overflow-hidden flex flex-col">
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:bg-blue-600 transition-colors">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900 text-xl leading-tight truncate">@{account.username}</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded">ID: {account.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">{new Date(account.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(`https://instagram.com/${account.username}`, '_blank')}
                      className="p-3 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Credentials Section */}
                  <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Credentials</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`${account.email}:${account.password}`, account.id)}
                        className="text-[10px] flex items-center text-blue-600 font-black hover:underline uppercase tracking-tighter"
                      >
                        {copiedId === account.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedId === account.id ? 'Copied' : 'Copy Set'}
                      </button>
                    </div>
                    <div className="p-5 space-y-4 font-mono text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Registered Email</span>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-700 truncate mr-2">{account.email}</span>
                          <button onClick={() => copyToClipboard(account.email, `${account.id}-e`)}><Copy className="w-3 h-3 text-slate-300 hover:text-blue-500" /></button>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Secure Password</span>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-700">
                            {showSensitive[account.id] ? account.password : '••••••••••••'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => toggleVisibility(account.id)} className="text-slate-400 hover:text-slate-600">
                              {showSensitive[account.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => copyToClipboard(account.password, `${account.id}-p`)}><Copy className="w-3 h-3 text-slate-300 hover:text-blue-500" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">Proxy Bound</p>
                      </div>
                      <p className="text-xs text-slate-700 font-bold truncate">{account.proxy}</p>
                    </div>
                    <button 
                      onClick={() => exportSession(account.cookies, account.username)}
                      className="bg-slate-900 hover:bg-black p-4 rounded-2xl transition-all shadow-lg flex flex-col items-center justify-center group/btn"
                    >
                      <div className="flex items-center space-x-2 text-white mb-1.5">
                        <FileJson className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Export Session</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono group-hover/btn:text-white transition-colors">JSON Cookie Set</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountList;
