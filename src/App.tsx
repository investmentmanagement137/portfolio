import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, BarChart3, PieChart, LayoutDashboard, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Trash2, Loader2, RefreshCw, FileJson, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown, Home, Briefcase, Coins } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';

const WEBHOOK_URL = 'https://n8np.puribijay.com.np/webhook/51bef67d-e017-4fc8-92ca-896d8b6c329aa';
const LTP_URL = 'https://raw.githubusercontent.com/investmentmanagement137/jsons/main/ss_companylist.json';

interface DividendEvent {
  Scrip: string;
  "Book Closure Date": string;
  Holdings: number;
  "Cash %": number;
  "Face Value": number;
  "Dividend Per Share": number;
  "Dividend Amount": number;
}

interface WebhookHolding {
  Scrip: string;
  Sector: string;
  WACC: number;
  "Current Balance": number;
  "Total Investment": number;
  LTP: number;
  "Current Valuation": number;
  "Profit/Loss": number;
  Status: string;
}

interface LtpData {
  Symbol: string;
  LTP: string;
  [key: string]: any;
}

interface Holding {
  scrip: string;
  quantity: number;
  wacc: number;
  investment: number;
  ltp: number;
  currentValue: number;
  pl: number;
  plPercent: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#0ea5e9'];

function App() {
  const [waccFile, setWaccFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [holdingsFile, setHoldingsFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [ltpData, setLtpData] = useState<Record<string, number>>({});
  const [isLtpLoading, setIsLtpLoading] = useState(true);
  
  const [waccRawData, setWaccRawData] = useState<any[]>([]);
  const [holdingsRawData, setHoldingsRawData] = useState<any[]>([]);
  
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({ investment: 0, value: 0, pl: 0, plPercent: 0 });
  
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'dividends' | 'import'>('home');
  const [showDetailedDividends, setShowDetailedDividends] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof DividendEvent; direction: 'asc' | 'desc' } | null>(null);

  // Load saved data from LocalStorage
  useEffect(() => {
    const storedAnalysis = localStorage.getItem('portfolioAnalysis');
    const storedWacc = localStorage.getItem('portfolioWaccRaw');
    const storedHoldings = localStorage.getItem('portfolioHoldingsRaw');

    if (storedAnalysis) {
      try { setData(JSON.parse(storedAnalysis)); } catch (e) { console.error(e); }
    }
    if (storedWacc) {
      try { setWaccRawData(JSON.parse(storedWacc)); } catch (e) { console.error(e); }
    }
    if (storedHoldings) {
      try { setHoldingsRawData(JSON.parse(storedHoldings)); } catch (e) { console.error(e); }
    }
  }, []);

  // Fetch LTP Data
  useEffect(() => {
    setIsLtpLoading(true);
    axios.get(LTP_URL).then(res => {
      const map: Record<string, number> = {};
      res.data.forEach((item: LtpData) => {
        const price = parseFloat(item.LTP.replace(/,/g, ''));
        map[item.Symbol] = isNaN(price) ? 0 : price;
      });
      setLtpData(map);
    }).catch(console.error)
    .finally(() => setIsLtpLoading(false));
  }, []);

  // Calculate Holdings
  useEffect(() => {
    if (Object.keys(ltpData).length === 0) return;

    let calculatedHoldings: Holding[] = [];
    let totalInv = 0;
    let totalVal = 0;

    const webhookHoldings = data?.[3]?.["current holdings in meroshare"];
    
    if (webhookHoldings && Array.isArray(webhookHoldings)) {
      webhookHoldings.forEach((item: WebhookHolding) => {
        const scrip = item.Scrip;
        const qty = item["Current Balance"];
        const wacc = item.WACC;
        const ltp = ltpData[scrip] || item.LTP || 0;
        const investment = item["Total Investment"] || (qty * wacc);
        const currentValue = qty * ltp;

        totalInv += investment;
        totalVal += currentValue;

        calculatedHoldings.push({
          scrip,
          quantity: qty,
          wacc,
          investment,
          ltp,
          currentValue,
          pl: currentValue - investment,
          plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
        });
      });
    }
    else if (holdingsRawData.length > 0) {
      const list = Array.isArray(holdingsRawData) ? holdingsRawData : 
                  (holdingsRawData as any).meroShareMyPortfolio || [];

      list.forEach((item: any) => {
        const scrip = item.script || item.scrip || item.symbol;
        const qty = parseFloat(item.currentBalance || item.balance || item.quantity);
        const wacc = parseFloat(item.wacc || item.cost || item.purchasePrice || 0); 
        
        if (scrip && !isNaN(qty) && qty > 0) {
          const ltp = ltpData[scrip] || parseFloat(item.lastTransactionPrice) || 0;
          const investment = qty * wacc;
          const currentValue = qty * ltp;
          
          totalInv += investment;
          totalVal += currentValue;

          calculatedHoldings.push({
            scrip,
            quantity: qty,
            wacc,
            investment,
            ltp,
            currentValue,
            pl: currentValue - investment,
            plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
          });
        }
      });
    } 
    else if (waccRawData.length > 0) {
      waccRawData.forEach((row: any) => {
        const scrip = row["Scrip Name"];
        const qty = parseFloat(row["WACC Calculated Quantity"]);
        const wacc = parseFloat(row["WACC Rate"]);

        if (scrip && !isNaN(qty) && !isNaN(wacc) && qty > 0) {
          const ltp = ltpData[scrip] || 0;
          const investment = qty * wacc;
          const currentValue = qty * ltp;
          
          totalInv += investment;
          totalVal += currentValue;

          calculatedHoldings.push({
            scrip,
            quantity: qty,
            wacc,
            investment,
            ltp,
            currentValue,
            pl: currentValue - investment,
            plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
          });
        }
      });
    }

    calculatedHoldings.sort((a, b) => b.currentValue - a.currentValue);
    setHoldings(calculatedHoldings);
    setPortfolioSummary({
      investment: totalInv,
      value: totalVal,
      pl: totalVal - totalInv,
      plPercent: totalInv > 0 ? ((totalVal - totalInv) / totalInv) * 100 : 0
    });
  }, [data, holdingsRawData, waccRawData, ltpData]);

  const handleUpload = async () => {
    if (!waccFile || !historyFile) {
      setError("Please select WACC and History CSV files for analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(waccFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setWaccRawData(results.data);
        localStorage.setItem('portfolioWaccRaw', JSON.stringify(results.data));
      }
    });

    if (holdingsFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setHoldingsRawData(json);
          localStorage.setItem('portfolioHoldingsRaw', JSON.stringify(json));
        } catch (err) { console.error("Invalid JSON file"); }
      };
      reader.readAsText(holdingsFile);
    }

    const formData = new FormData();
    formData.append('wacc_report', waccFile);
    formData.append('transaction_history', historyFile);

    try {
      const response = await axios.post(WEBHOOK_URL, formData);
      const result = Array.isArray(response.data) ? response.data : [response.data];
      
      setData(result);
      localStorage.setItem('portfolioAnalysis', JSON.stringify(result));
      setActiveTab('home'); // Redirect to home after upload
    } catch (err) {
      setError("Failed to analyze portfolio. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all portfolio data?")) {
      localStorage.removeItem('portfolioAnalysis');
      localStorage.removeItem('portfolioWaccRaw');
      localStorage.removeItem('portfolioHoldingsRaw');
      setData(null);
      setWaccRawData([]);
      setHoldingsRawData([]);
      setHoldings([]);
      setPortfolioSummary({ investment: 0, value: 0, pl: 0, plPercent: 0 });
      setWaccFile(null);
      setHistoryFile(null);
      setHoldingsFile(null);
      setActiveTab('import');
    }
  };

  const requestSort = (key: keyof DividendEvent) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const dividendSummary = data?.[0]?.["Divident Summary"];
  const dividendDetails = data?.[1]?.["Divident Calculation"] as DividendEvent[] || [];
  
  const yearlyData = dividendSummary?.filter((item: any) => item.Type === "Yearly Summary") || [];
  const scripData = dividendSummary?.filter((item: any) => item.Type === "Scrip Summary")
    .sort((a: any, b: any) => b["Total Dividend"] - a["Total Dividend"])
    .slice(0, 10) || [];

  const allocationData = holdings.slice(0, 10).map(h => ({
    name: h.scrip,
    value: h.currentValue
  }));

  const filteredDividendDetails = dividendDetails.filter(item => 
    item.Scrip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDetails = [...filteredDividendDetails].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCashDividend = sortedDetails.reduce((sum, item) => sum + (item["Dividend Amount"] || 0), 0);

  const SortIcon = ({ columnKey }: { columnKey: keyof DividendEvent }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-[#3c4043] opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#8ab4f8]" /> : <ArrowDown className="w-3 h-3 text-[#8ab4f8]" />;
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: 'home' | 'portfolio' | 'dividends' | 'import', icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(tab); setShowDetailedDividends(false); }}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === tab ? 'text-[#8ab4f8]' : 'text-[#b4b4b4] hover:text-[#e3e3e3]'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#e3e3e3] font-sans pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#3c4043] pb-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#8ab4f8]" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Portfolio Analyzer</h1>
              <p className="text-xs text-[#b4b4b4] hidden md:block">Secure Portfolio Intelligence Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {data && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium border ${isLtpLoading ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-500' : 'bg-green-900/20 border-green-700/50 text-green-500'}`}>
                   {isLtpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                   <span className="hidden md:inline">{isLtpLoading ? 'Syncing...' : 'Live'}</span>
                </div>
             )}
            {data && (
              <button 
                onClick={handleClear}
                className="text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                title="Flush Session"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {data ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2d2d2d] p-6 rounded-2xl border border-[#3c4043] shadow-lg">
                    <div className="flex items-center gap-3 mb-2 text-[#b4b4b4]">
                      <Wallet className="w-5 h-5" />
                      <span className="text-sm font-medium uppercase tracking-wider">Net Capital</span>
                    </div>
                    <div className="text-3xl font-mono text-white">
                      Rs. {portfolioSummary.investment.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#2d2d2d] p-6 rounded-2xl border border-[#3c4043] shadow-lg">
                    <div className="flex items-center gap-3 mb-2 text-[#b4b4b4]">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm font-medium uppercase tracking-wider">Market Value</span>
                    </div>
                    <div className="text-3xl font-mono text-white">
                      Rs. {portfolioSummary.value.toLocaleString()}
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border shadow-lg ${portfolioSummary.pl >= 0 ? 'bg-green-900/10 border-green-800/50' : 'bg-red-900/10 border-red-800/50'}`}>
                    <div className={`flex items-center gap-3 mb-2 ${portfolioSummary.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioSummary.pl >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      <span className="text-sm font-medium uppercase tracking-wider">Performance</span>
                    </div>
                    <div className={`text-3xl font-mono ${portfolioSummary.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioSummary.pl >= 0 ? '+' : ''}{portfolioSummary.pl.toLocaleString()}
                      <span className="text-sm ml-2 opacity-70">({portfolioSummary.plPercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-[#2d2d2d] rounded-2xl border border-[#3c4043] text-center space-y-4">
                  <div className="bg-[#8ab4f8]/10 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-[#8ab4f8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Data Sync</h3>
                    <p className="text-[#b4b4b4] text-sm max-w-md mx-auto mt-1">
                      Your portfolio data is currently loaded. To analyze a new set of files or update your transaction history, please import new data.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('import')}
                    className="bg-[#8ab4f8] text-[#1e1e1e] font-bold py-2 px-6 rounded-lg hover:bg-[#aecbfa] transition-transform active:scale-95"
                  >
                    Update Portfolio Data
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="bg-[#2d2d2d] p-6 rounded-full border border-[#3c4043] shadow-2xl">
                  <LayoutDashboard className="w-16 h-16 text-[#8ab4f8]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Welcome to Portfolio Analyzer</h2>
                <p className="text-[#b4b4b4] max-w-lg">
                  Gain deep insights into your NEPSE portfolio. Track your real-time net worth, analyze dividend income, and visualize asset allocation securely.
                </p>
                <button 
                  onClick={() => setActiveTab('import')}
                  className="bg-[#8ab4f8] text-[#1e1e1e] font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-[#aecbfa] transition-all transform hover:scale-105"
                >
                  Import Data to Start
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- PORTFOLIO TAB --- */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Asset Distribution (Full width on mobile) */}
            <div className="bg-[#2d2d2d] p-6 rounded-2xl border border-[#3c4043] flex flex-col">
              <h3 className="text-sm font-bold mb-6 text-[#b4b4b4] uppercase tracking-widest flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Asset Distribution (Top 10)
              </h3>
              <div className="flex-1 flex flex-col items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie 
                        data={allocationData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value" 
                        nameKey="name" 
                        stroke="none"
                      >
                        {allocationData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | undefined) => `Rs. ${(value || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                        contentStyle={{backgroundColor: '#2d2d2d', borderRadius: '12px', border: '1px solid #3c4043', color: '#e3e3e3'}} 
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full mt-4 space-y-3">
                  {allocationData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs border-b border-[#3c4043]/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-[#e3e3e3]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[#b4b4b4]">Rs. {item.value.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span className="font-mono font-bold text-[#8ab4f8] w-12 text-right">
                          {((item.value / portfolioSummary.value) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My Portfolio Table */}
            <div className="bg-[#2d2d2d] rounded-2xl border border-[#3c4043] overflow-hidden">
              <div className="p-6 border-b border-[#3c4043] flex justify-between items-center bg-[#252525]">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-[#8ab4f8]" />
                  My Portfolio
                  {data?.[3]?.["current holdings in meroshare"] && <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50 ml-2 uppercase tracking-widest">REMOTE_SYNC</span>}
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left relative">
                  <thead className="bg-[#353535] sticky top-0 z-10 text-[#b4b4b4]">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Asset</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">Units</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">WACC</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">LTP</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">Valuation</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c4043]">
                    {holdings.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#353535] transition-colors group">
                        <td className="px-6 py-4 font-bold text-[#8ab4f8]">
                          {item.scrip}
                          <div className="text-[10px] text-[#b4b4b4] font-normal mt-0.5">WACC: {item.wacc.toFixed(1)}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-[#e3e3e3]">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-mono text-[#b4b4b4]">{item.ltp.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white">{item.currentValue.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right font-mono font-bold ${item.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.plPercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- DIVIDENDS TAB --- */}
        {activeTab === 'dividends' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {!showDetailedDividends ? (
              <>
                <div className="bg-[#2d2d2d] p-6 rounded-2xl border border-[#3c4043]">
                  <h3 className="text-sm font-bold mb-6 text-[#b4b4b4] uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Historical Cash Dividend
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3c4043" />
                        <XAxis dataKey="Key" axisLine={false} tickLine={false} tick={{fill: '#b4b4b4', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#b4b4b4', fontSize: 10}} />
                        <Tooltip contentStyle={{backgroundColor: '#2d2d2d', borderRadius: '12px', border: '1px solid #3c4043'}} cursor={{fill: '#3c4043'}} />
                        <Bar dataKey="Total Dividend" fill="#8ab4f8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#2d2d2d] rounded-2xl border border-[#3c4043] overflow-hidden">
                  <div className="p-6 border-b border-[#3c4043] flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#b4b4b4] uppercase tracking-widest">Cash Dividend Breakdown</h3>
                    <button 
                      onClick={() => setShowDetailedDividends(true)}
                      className="text-xs font-bold text-[#8ab4f8] hover:text-white transition-colors border border-[#8ab4f8]/30 hover:border-[#8ab4f8] px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      View Full History <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left relative">
                      <thead className="bg-[#353535] sticky top-0 text-[#b4b4b4]">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Asset Name</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">Total Accrued</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3c4043]">
                        {scripData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#353535] transition-colors">
                            <td className="px-6 py-4 font-bold text-[#8ab4f8]">{item.Key}</td>
                            <td className="px-6 py-4 text-right font-mono text-white">
                              Rs. {item["Total Dividend"].toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              // Detailed View Sub-component logic
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <button 
                    onClick={() => setShowDetailedDividends(false)}
                    className="flex items-center gap-2 text-[#8ab4f8] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Overview
                  </button>
                </div>

                <div className="bg-[#2d2d2d] p-6 rounded-2xl border border-[#3c4043] mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#b4b4b4] mb-1">
                        <BarChart3 className="w-4 h-4 text-[#8ab4f8]" />
                        <span className="text-sm font-medium uppercase tracking-wider">Total Received</span>
                      </div>
                      <div className="text-3xl font-mono text-white">
                        Rs. {totalCashDividend.toLocaleString()}
                      </div>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b4b4b4]" />
                      <input 
                        type="text" 
                        placeholder="Filter by Script..." 
                        className="bg-[#1e1e1e] border border-[#3c4043] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#8ab4f8] w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#2d2d2d] rounded-2xl border border-[#3c4043] overflow-hidden">
                  <div className="p-6 border-b border-[#3c4043]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Detailed cash Dividend History
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#353535] text-[#b4b4b4]">
                        <tr>
                          <th 
                            className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:text-white group transition-colors"
                            onClick={() => requestSort('Book Closure Date')}
                          >
                            <div className="flex items-center gap-1">
                              Date
                              <SortIcon columnKey="Book Closure Date" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:text-white group transition-colors"
                            onClick={() => requestSort('Scrip')}
                          >
                            <div className="flex items-center gap-1">
                              Scrip
                              <SortIcon columnKey="Scrip" />
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right cursor-pointer hover:text-white group transition-colors"
                            onClick={() => requestSort('Dividend Amount')}
                          >
                            <div className="flex items-center justify-end gap-1">
                              Amount
                              <SortIcon columnKey="Dividend Amount" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3c4043]">
                        {sortedDetails.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#353535] transition-colors">
                            <td className="px-6 py-4 font-mono text-[#b4b4b4] whitespace-nowrap">{item["Book Closure Date"]}</td>
                            <td className="px-6 py-4 font-bold text-[#8ab4f8]">{item.Scrip}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-green-400">
                              Rs. {item["Dividend Amount"].toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sortedDetails.length === 0 && (
                      <div className="p-8 text-center text-[#b4b4b4]">
                        No dividends found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- IMPORT TAB --- */}
        {activeTab === 'import' && (
          <div className="bg-[#2d2d2d] rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-[#3c4043] animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="mb-8">
               <h2 className="text-xl font-bold text-white mb-2">Import Portfolio Data</h2>
               <p className="text-[#b4b4b4] text-sm">Upload your Meroshare exports to update your portfolio analysis.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[#b4b4b4]">1. WACC Report (CSV)</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${waccFile ? 'border-green-500/50 bg-green-500/5' : 'border-[#3c4043] hover:border-[#8ab4f8]/50'}`}
                  onClick={() => document.getElementById('wacc-upload')?.click()}
                >
                  <input id="wacc-upload" type="file" className="hidden" accept=".csv" onChange={(e) => setWaccFile(e.target.files?.[0] || null)} />
                  {waccFile ? (
                    <div className="flex flex-col items-center text-green-400">
                      <CheckCircle2 className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium truncate max-w-[150px]">{waccFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#b4b4b4]">
                      <FileText className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs">Mount CSV</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[#b4b4b4]">2. History (CSV)</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${historyFile ? 'border-green-500/50 bg-green-500/5' : 'border-[#3c4043] hover:border-[#8ab4f8]/50'}`}
                  onClick={() => document.getElementById('history-upload')?.click()}
                >
                  <input id="history-upload" type="file" className="hidden" accept=".csv" onChange={(e) => setHistoryFile(e.target.files?.[0] || null)} />
                  {historyFile ? (
                    <div className="flex flex-col items-center text-green-400">
                      <CheckCircle2 className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium truncate max-w-[150px]">{historyFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#b4b4b4]">
                      <FileText className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs">Mount CSV</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[#b4b4b4] flex items-center gap-1">3. Holdings (JSON)</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${holdingsFile ? 'border-green-500/50 bg-green-500/5' : 'border-[#3c4043] hover:border-[#8ab4f8]/50'}`}
                  onClick={() => document.getElementById('holdings-upload')?.click()}
                >
                  <input id="holdings-upload" type="file" className="hidden" accept=".json" onChange={(e) => setHoldingsFile(e.target.files?.[0] || null)} />
                  {holdingsFile ? (
                    <div className="flex flex-col items-center text-green-400">
                      <CheckCircle2 className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium truncate max-w-[150px]">{holdingsFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#b4b4b4]">
                      <FileJson className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs">Optional JSON</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !waccFile || !historyFile}
              className={`w-full py-4 rounded-xl font-bold text-[#1e1e1e] transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#8ab4f8] hover:bg-[#aecbfa]'}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Executing Analysis...' : 'Compute Portfolio'}
            </button>
          </div>
        )}

      </div>

      {/* --- BOTTOM NAVIGATION (Mobile) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-[#252525] border-t border-[#3c4043] h-16 flex items-center justify-around md:hidden px-2 z-50">
        <NavItem tab="home" icon={Home} label="Home" />
        <NavItem tab="portfolio" icon={Briefcase} label="Portfolio" />
        <NavItem tab="dividends" icon={Coins} label="Dividends" />
        <NavItem tab="import" icon={Upload} label="Import" />
      </div>
      
      {/* --- DESKTOP NAVIGATION (Hidden on mobile) --- */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#252525]/90 backdrop-blur-md border border-[#3c4043] rounded-full px-6 py-3 hidden md:flex items-center gap-8 z-50 shadow-2xl">
        <NavItem tab="home" icon={Home} label="Home" />
        <NavItem tab="portfolio" icon={Briefcase} label="Portfolio" />
        <NavItem tab="dividends" icon={Coins} label="Dividends" />
        <NavItem tab="import" icon={Upload} label="Import" />
      </div>

    </div>
  );
}

export default App;