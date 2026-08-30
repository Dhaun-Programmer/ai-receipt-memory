import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { warrantyAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function WarrantyTracker() {
  const [warranties, setWarranties] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('warranties');

  useEffect(() => {
    Promise.all([warrantyAPI.getAll(), warrantyAPI.getReturns()])
      .then(([w, r]) => { setWarranties(w.data.warranties); setReturns(r.data.returns); })
      .catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Warranty & Return Tracker</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('warranties')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'warranties' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Warranties ({warranties.length})</button>
        <button onClick={() => setTab('returns')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'returns' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Returns ({returns.length})</button>
      </div>

      {tab === 'warranties' && (
        <div className="space-y-3">
          {warranties.length === 0 && <div className="text-center py-20 text-gray-400">No warranty items found</div>}
          {warranties.map((w, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <Link to={`/receipt/${w.receiptId}`} className="font-semibold text-gray-900 hover:text-primary-600">{w.productName}</Link>
                <p className="text-sm text-gray-500">{w.storeName} · Purchased {new Date(w.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-xs text-gray-400 mt-1">Warranty: {w.warrantyPeriod}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${w.status === 'active' ? 'bg-green-100 text-green-700' : w.status === 'expiring_soon' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {w.status === 'expired' ? 'Expired' : `${w.daysRemaining} days left`}
                </span>
                <p className="text-xs text-gray-500 mt-2">Expires: {new Date(w.warrantyExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'returns' && (
        <div className="space-y-3">
          {returns.length === 0 && <div className="text-center py-20 text-gray-400">No return items found</div>}
          {returns.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <Link to={`/receipt/${r.receiptId}`} className="font-semibold text-gray-900 hover:text-primary-600">{r.productName}</Link>
                <p className="text-sm text-gray-500">{r.storeName} · Purchased {new Date(r.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-xs text-gray-400 mt-1">Return Period: {r.returnPeriod}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-blue-100 text-blue-700' : r.status === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {r.status === 'expired' ? 'Expired' : `${r.daysRemaining} days left`}
                </span>
                <p className="text-xs text-gray-500 mt-2">Deadline: {new Date(r.returnDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
