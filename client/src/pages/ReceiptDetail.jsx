import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { receiptAPI, getMediaUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    receiptAPI.getOne(id).then(res => setReceipt(res.data.receipt)).catch(() => toast.error('Receipt not found')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this receipt?')) return;
    try { await receiptAPI.delete(id); toast.success('Deleted'); navigate('/purchases'); } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (!receipt) return <div className="text-center py-20 text-gray-500">Receipt not found</div>;

  const warrantyItems = receipt.items.filter(i => i.warrantyExpiry);
  const returnItems = receipt.items.filter(i => i.returnDeadline);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary-600 mb-6 flex items-center gap-1">← Back</button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{receipt.storeName}</h1>
                <p className="text-gray-500 text-sm mt-1">{new Date(receipt.purchaseDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">₹{receipt.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Payment</p><p className="font-medium text-sm">{receipt.paymentMethod}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Receipt #</p><p className="font-medium text-sm">{receipt.receiptNumber || 'N/A'}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Currency</p><p className="font-medium text-sm">{receipt.currency}</p></div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="divide-y divide-gray-100">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div><p className="font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.category} · Qty: {item.quantity}</p></div>
                  <p className="font-semibold text-gray-900">₹{item.totalPrice.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {warrantyItems.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">🛡️ Warranty Info</h3>
              {warrantyItems.map((item, idx) => {
                const exp = new Date(item.warrantyExpiry);
                const now = new Date();
                const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                const status = days > 30 ? 'active' : days > 0 ? 'expiring' : 'expired';
                return (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <div><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.warrantyPeriod}</p></div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${status === 'active' ? 'bg-green-100 text-green-700' : status === 'expiring' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{status === 'expired' ? 'Expired' : `${days} days left`}</span>
                      <p className="text-xs text-gray-500 mt-1">Expires: {exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {returnItems.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">↩️ Return Info</h3>
              {returnItems.map((item, idx) => {
                const dl = new Date(item.returnDeadline);
                const now = new Date();
                const days = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
                const active = days > 0;
                return (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <div><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.returnPeriod}</p></div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{active ? `${days} days left` : 'Expired'}</span>
                      <p className="text-xs text-gray-500 mt-1">Deadline: {dl.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {receipt.imageUrl && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <img src={getMediaUrl(receipt.imageUrl)} alt="Receipt" className="w-full rounded-lg" />
            </div>
          )}
          <Link to={`/chat`} className="block w-full py-3 bg-accent-600 text-white rounded-xl font-medium text-center hover:bg-accent-700 transition-all">🧠 Ask AI about this</Link>
          <button onClick={handleDelete} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all">Delete Receipt</button>
        </div>
      </div>
    </div>
  );
}
