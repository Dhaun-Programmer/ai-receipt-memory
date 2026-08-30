import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { receiptAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Grocery', 'Furniture', 'Travel', 'Healthcare', 'Footwear', 'Other'];

export default function PurchaseHistory() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', store: '', sortBy: 'createdAt', sortOrder: 'desc' });

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      if (!params.search) delete params.search;
      if (!params.category || params.category === 'All') delete params.category;
      if (!params.store) delete params.store;
      const res = await receiptAPI.getAll(params);
      setReceipts(res.data.receipts);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { loadReceipts(); }, [filters, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Purchase History</h1><p className="text-gray-500 text-sm">{total} purchase(s) found</p></div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="Search receipts..." value={filters.search} onChange={e => { setFilters({...filters, search: e.target.value}); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none" />
          <select value={filters.category} onChange={e => { setFilters({...filters, category: e.target.value}); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <input placeholder="Filter by store..." value={filters.store} onChange={e => { setFilters({...filters, store: e.target.value}); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 outline-none" />
          <select value={`${filters.sortBy}-${filters.sortOrder}`} onChange={e => { const [sortBy, sortOrder] = e.target.value.split('-'); setFilters({...filters, sortBy, sortOrder}); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 outline-none">
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="totalAmount-desc">Highest Price</option>
            <option value="totalAmount-asc">Lowest Price</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-20"><div className="text-5xl mb-4">🧾</div><p className="text-gray-500 mb-4">No receipts found</p><Link to="/upload" className="text-primary-600 font-medium hover:underline">Upload your first receipt</Link></div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.map(r => (
              <Link key={r._id} to={`/receipt/${r._id}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div><p className="font-semibold text-gray-900">{r.storeName}</p><p className="text-xs text-gray-500">{new Date(r.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                  <p className="font-bold text-primary-600">₹{r.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1">
                  {r.items.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-sm text-gray-600 truncate">{item.name} <span className="text-gray-400">· {item.category}</span></p>
                  ))}
                  {r.items.length > 3 && <p className="text-xs text-gray-400">+{r.items.length - 3} more items</p>}
                </div>
              </Link>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
