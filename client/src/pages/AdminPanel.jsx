import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart, 
  Settings, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  Database,
  PieChart
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import API from '../utils/api.js';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock platform statistics data
  const statsData = [
    { name: 'Electronics', searches: 245, color: '#8b5cf6' },
    { name: 'Fashion', searches: 184, color: '#ec4899' },
    { name: 'Beauty', searches: 92, color: '#10b981' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/auth/users');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching admin users list:', error);
      // Fallback if not admin (though ProtectedRoute guards this)
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="text-slate-650 dark:text-slate-350">Admin Panel</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-slate-850 dark:text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="text-brand-primary" size={26} />
          System Administration
        </h1>
        <p className="text-xs text-slate-450 font-medium">Manage platform parameters, monitor search patterns, and inspect profiles.</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl border glass-card flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Members</p>
            <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-0.5">{users.length}</h4>
          </div>
        </div>

        <div className="p-6 rounded-3xl border glass-card flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Search size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Monthly Queries</p>
            <h4 className="text-2xl font-black text-slate-855 text-slate-850 dark:text-white mt-0.5">1,482</h4>
          </div>
        </div>

        <div className="p-6 rounded-3xl border glass-card flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Active Deals Aggregated</p>
            <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-0.5">118</h4>
          </div>
        </div>

      </div>

      {/* Analytics chart and User Management Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left/Center: Registered Users Table */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <Users className="text-brand-primary" size={18} />
              User Profiles
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                      <th className="py-3 px-4">User Name</th>
                      <th className="py-3 px-4">Email Account</th>
                      <th className="py-3 px-4 text-center">System Role</th>
                      <th className="py-3 px-4 text-center">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-700 dark:text-slate-350">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-white">{u.name}</td>
                        <td className="py-3.5 px-4 font-medium">{u.email}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                            u.role === 'admin' 
                              ? 'bg-brand-primary/10 text-brand-primary' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right: Search Categories Analytics Chart */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border glass-card p-6 space-y-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <BarChart className="text-brand-primary" size={18} />
              Trending Queries
            </h3>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full pr-1">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={statsData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.03)' }} />
                  <Bar dataKey="searches" radius={[0, 8, 8, 0]} barSize={16}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4 font-semibold text-center">
              Statistics represent mock search activities. Real data binds to actual Product records in MongoDB database.
            </p>
          </div>
        </aside>

      </div>

    </div>
  );
};

export default AdminPanel;
