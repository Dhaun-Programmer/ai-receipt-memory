import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { aiAPI, receiptAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [editData, setEditData] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAnalysis(null);
      setEditData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload an image first');
    setAnalyzing(true);
    try {
      setStep('Uploading receipt...');
      await new Promise(r => setTimeout(r, 500));
      setStep('Reading receipt with AI...');
      await new Promise(r => setTimeout(r, 500));
      setStep('Extracting purchase information...');
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await aiAPI.analyzeReceipt(formData);
      setStep('Detecting warranty information...');
      await new Promise(r => setTimeout(r, 300));
      setStep('Saving purchase memory...');
      await new Promise(r => setTimeout(r, 300));
      setAnalysis(res.data);
      setEditData(res.data.receipt);
      setStep('');
      toast.success('Receipt analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
      setStep('');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await receiptAPI.confirm(editData._id, editData);
      toast.success('Receipt saved!');
      navigate(`/receipt/${editData._id}`);
    } catch (err) {
      toast.error('Failed to save receipt');
    }
  };

  const handleCancel = () => {
    if (editData?._id) receiptAPI.delete(editData._id).catch(() => {});
    setFile(null); setPreview(null); setAnalysis(null); setEditData(null);
  };

  const updateItem = (idx, field, value) => {
    const items = [...editData.items];
    items[idx] = { ...items[idx], [field]: value };
    setEditData({ ...editData, items });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Receipt</h1>
      <p className="text-gray-500 text-sm mb-8">Take a photo or upload an image of your receipt</p>

      {!analysis && (
        <div className="space-y-6">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
            <input {...getInputProps()} />
            {preview ? (
              <div><img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" /><p className="text-sm text-gray-500 mt-4">Click or drag to replace</p></div>
            ) : (
              <div><div className="text-5xl mb-4">📸</div><p className="text-gray-600 font-medium">Drop your receipt here or click to browse</p><p className="text-gray-400 text-sm mt-2">Supports JPG, PNG, WEBP • Max 10MB</p></div>
            )}
          </div>

          {preview && !analyzing && (
            <button onClick={handleAnalyze} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">Analyze Receipt</button>
          )}

          {analyzing && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900">{step}</p>
              <div className="mt-4 flex justify-center gap-2">
                {['Uploading', 'Reading', 'Extracting', 'Warranty', 'Saving'].map((s, i) => (
                  <div key={s} className={`w-2 h-2 rounded-full ${step.toLowerCase().includes(s.toLowerCase().slice(0, 4)) || step.toLowerCase().includes('saving') && i === 4 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Receipt Analysis</h2>
              <span className="text-sm text-gray-500">Confidence: {Math.round((editData.confidence || 0) * 100)}%</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Store Name</label>
                <input value={editData.storeName || ''} onChange={e => setEditData({...editData, storeName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Date</label>
                <input type="date" value={editData.purchaseDate?.slice(0, 10) || ''} onChange={e => setEditData({...editData, purchaseDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount (₹)</label>
                <input type="number" value={editData.totalAmount || ''} onChange={e => setEditData({...editData, totalAmount: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                <input value={editData.paymentMethod || ''} onChange={e => setEditData({...editData, paymentMethod: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Receipt Number</label>
                <input value={editData.receiptNumber || ''} onChange={e => setEditData({...editData, receiptNumber: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm" />
              </div>
            </div>

            <h3 className="font-medium text-gray-900 mb-3">Items</h3>
            <div className="space-y-4">
              {(editData.items || []).map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500">
                        {['Electronics', 'Clothing', 'Food', 'Grocery', 'Furniture', 'Travel', 'Healthcare', 'Footwear', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                      <input type="number" value={item.totalPrice} onChange={e => updateItem(idx, 'totalPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Warranty</label>
                      <input value={item.warrantyPeriod || ''} onChange={e => updateItem(idx, 'warrantyPeriod', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-500" placeholder="e.g. 1 year" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleConfirm} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">Confirm & Save</button>
              <button onClick={handleCancel} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
