import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getSummary(), analyticsAPI.getMonthly(), analyticsAPI.getCategories(), analyticsAPI.getStores()])
      .then(([s, m, c, st]) => { setSummary(s.data); setMonthly(m.data.monthly); setCategories(c.data.categories); setStores(st.data.stores); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  const monthlyData = monthly.map(m => ({ name: m.month, amount: m.amount, count: m.count }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Spending', value: `₹${(summary?.totalSpending || 0).toLocaleString('en-IN')}`, icon: '💰' },
          { label: 'This Month', value: `₹${(summary?.thisMonthSpending || 0).toLocaleString('en-IN')}`, icon: '📅' },
          { label: 'Total Purchases', value: summary?.totalPurchases || 0, icon: '🧾' },
          { label: 'Active Warranties', value: summary?.activeWarranties || 0, icon: '🛡️' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {categories.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} /></PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Spending</h2>
          {monthlyData.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{fontSize: 12}} /><YAxis tick={{fontSize: 12}} /><Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} /><Bar dataKey="amount" fill="#6366f1" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Spending by Store</h2>
        {stores.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data</p> : (
          <div className="space-y-3">
            {stores.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 font-medium text-sm text-gray-900 truncate">{s.store}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div className="h-full rounded-full flex items-center px-3" style={{ width: `${Math.max(10, (s.amount / (stores[0]?.amount || 1)) * 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}>
                    <span className="text-xs text-white font-medium">₹{s.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{s.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
