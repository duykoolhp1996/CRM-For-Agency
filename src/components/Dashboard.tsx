import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Lead, Client, Project } from '../types';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

interface Revenue {
  id: string;
  amount: number;
  status: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState({
    leads: true,
    clients: true,
    projects: true,
    revenues: true
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const qLeads = query(collection(db, 'leads'), where('ownerId', '==', userId));
    const qClients = query(collection(db, 'clients'), where('ownerId', '==', userId));
    const qProjects = query(collection(db, 'projects'), where('ownerId', '==', userId));
    const qRevenues = query(collection(db, 'revenues'), where('ownerId', '==', userId));

    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
      setLoading(prev => ({ ...prev, leads: false }));
    });

    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
      setLoading(prev => ({ ...prev, clients: false }));
    });

    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(prev => ({ ...prev, projects: false }));
    });

    const unsubRevenues = onSnapshot(qRevenues, (snapshot) => {
      setRevenues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Revenue)));
      setLoading(prev => ({ ...prev, revenues: false }));
    });

    return () => {
      unsubLeads();
      unsubClients();
      unsubProjects();
      unsubRevenues();
    };
  }, []);

  const isInitialLoading = loading.leads || loading.clients || loading.projects || loading.revenues;

  if (isInitialLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-accent-yellow animate-spin" />
        <p className="text-text-muted font-bold tracking-widest uppercase text-xs animate-pulse">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const successRevenue = revenues.filter(r => r.status === 'Success').reduce((sum, r) => sum + r.amount, 0);
  const pendingRevenue = revenues.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
  const activeLeads = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Cancelled').length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : 0;

  const stats = [
    { label: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString()} VNĐ`, icon: DollarSign, trend: `+${pendingRevenue.toLocaleString()}`, up: true, accent: true },
    { label: 'Số lượng Lead', value: leads.length.toString(), icon: Users, trend: `+${leads.filter(l => l.status === 'New').length}`, up: true, accent: false },
    { label: 'Dự án đang chạy', value: activeProjects.toString(), icon: Briefcase, trend: `+${projects.filter(p => p.status === 'Planning').length}`, up: true, accent: false },
    { label: 'Tổng khách hàng', value: clients.length.toString(), icon: Users, trend: wonLeads > 0 ? `+${wonLeads}` : '0', up: true, accent: false },
  ];

  // Process funnel data
  const funnelData = [
    { value: leads.length, name: 'Total', fill: 'rgba(255,255,255,0.05)' },
    { value: leads.filter(l => l.status !== 'New').length, name: 'Contacted', fill: 'rgba(255,255,255,0.1)' },
    { value: leads.filter(l => ['Qualified', 'Proposal', 'Negotiation', 'Won'].includes(l.status)).length, name: 'Qualified', fill: 'rgba(255,255,255,0.15)' },
    { value: leads.filter(l => ['Proposal', 'Negotiation', 'Won'].includes(l.status)).length, name: 'Proposal', fill: 'rgba(255,255,255,0.2)' },
    { value: wonLeads, name: 'Won', fill: '#EFFF33' },
  ].filter(d => d.value > 0);

  // Process real data for charts
  const monthlyData = revenues
    .filter(r => r.status === 'Success')
    .reduce((acc: { [key: string]: number }, curr) => {
      const month = curr.date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + curr.amount;
      return acc;
    }, {});

  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({
      name: `Tháng ${month.split('-')[1]}`,
      revenue: amount,
      rawMonth: month
    }))
    .sort((a, b) => a.rawMonth.localeCompare(b.rawMonth))
    .slice(-6); // Show last 6 months

  // Fallback if no data
  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Tháng 1', revenue: 0 },
    { name: 'Tháng 2', revenue: 0 },
    { name: 'Tháng 3', revenue: 0 },
    { name: 'Tháng 4', revenue: 0 },
  ];

  const sourceData = [
    { name: 'Direct', value: leads.filter(l => l.source === 'Direct').length || 1 },
    { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length || 0 },
    { name: 'Social', value: leads.filter(l => l.source === 'Social').length || 0 },
    { name: 'Other', value: leads.filter(l => !['Direct', 'Referral', 'Social'].includes(l.source)).length || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">Sales team</h2>
        <p className="text-base sm:text-lg text-text-muted font-medium">Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="flex overflow-x-auto pb-6 gap-4 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 custom-scrollbar scrollbar-hide">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            stat.accent ? "accent-card" : "bento-card",
            "relative overflow-hidden group shrink-0 w-[85vw] sm:w-auto"
          )}>
            <div className="flex justify-between items-start mb-8">
              <div className={cn(
                "p-3 rounded-2xl",
                stat.accent ? "bg-black/10 text-black" : "bg-white/5 text-accent-yellow"
              )}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-black px-3 py-1.5 rounded-full",
                stat.accent 
                  ? "bg-black/10 text-black" 
                  : (stat.up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")
              )}>
                {stat.up ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-2",
              stat.accent ? "text-black/60" : "text-text-muted"
            )}>{stat.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">{stat.value}</h3>
            
            {/* Decorative arrow like in the image */}
            <div className={cn(
              "absolute bottom-6 right-6 p-2 rounded-full",
              stat.accent ? "bg-black/10" : "bg-white/5"
            )}>
              <ArrowUpRight size={20} />
            </div>
          </div>
        ))}
        <div className="w-20 shrink-0 sm:hidden" /> {/* Spacer for mobile scroll end */}
      </div>

      {/* Charts Section */}
      {/* Charts Grid */}
      <div className="flex overflow-x-auto pb-8 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 gap-4 lg:gap-6 scrollbar-hide">
        <div className="lg:col-span-2 bento-card shrink-0 w-[85vw] lg:w-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white font-display uppercase tracking-wider">Top Leads Funnels</h3>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                <TrendingUp size={16} />
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EFFF33" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EFFF33" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#EFFF33', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#EFFF33" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card shrink-0 w-[85vw] lg:w-auto">
          <h3 className="text-xl font-black text-white font-display mb-8 uppercase tracking-wider">Deals pipeline</h3>
          <div className="h-[240px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#888" stroke="none" dataKey="name" fontSize={10} fontWeight={900} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {funnelData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-20 shrink-0 lg:hidden" /> {/* Spacer for mobile scroll end */}
      </div>
    </div>
  );
};

export default Dashboard;
