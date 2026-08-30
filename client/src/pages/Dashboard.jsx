import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, receiptAPI, notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSummary(),
      receiptAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      notificationAPI.generate(),
      notificationAPI.getAll()
    ]).then(([s, r, _, n]) => {
      setSummary(s.data);
      setRecent(r.data.receipts);
      setNotifications(n.data.notifications);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  const statCards = [
    { label: 'Total Purchases', value: summary?.totalPurchases || 0, icon: '🧾', color: 'bg-primary-50 text-primary-700' },
    { label: 'Total Spending', value: `₹${(summary?.totalSpending || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Active Warranties', value: summary?.activeWarranties || 0, icon: '🛡️', color: 'bg-blue-50 text-blue-700' },
    { label: 'Expiring Soon', value: summary?.expiringSoon || 0, icon: '⚠️', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-sm mt-1">Your purchase overview</p></div>
        <Link to="/upload" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all flex items-center gap-2"><span>+</span> Upload Receipt</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${s.color}`}>{s.icon}</span></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Purchases</h2>
            <Link to="/purchases" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.length === 0 && <div className="p-8 text-center text-gray-400">No purchases yet. <Link to="/upload" className="text-primary-600 hover:underline">Upload your first receipt!</Link></div>}
            {recent.map(r => (
              <Link key={r._id} to={`/receipt/${r._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div><p className="font-medium text-gray-900">{r.items[0]?.name || r.storeName}</p><p className="text-sm text-gray-500">{r.storeName} · {new Date(r.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                <div className="text-right"><p className="font-semibold text-gray-900">₹{r.totalAmount.toLocaleString('en-IN')}</p></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Notifications</h2></div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {notifications.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>}
            {notifications.slice(0, 10).map(n => (
              <div key={n._id} className={`px-6 py-4 ${!n.isRead ? 'bg-primary-50/50' : ''}`}>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { to: '/upload', label: 'Upload Receipt', icon: '📸' },
          { to: '/chat', label: 'Ask AI', icon: '🧠' },
          { to: '/purchases', label: 'View Purchases', icon: '📋' },
          { to: '/warranties', label: 'Warranty Tracker', icon: '🛡️' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-sm font-medium text-gray-700">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
