import React, { useState, useEffect } from 'react';
import { addPattern, getAllPatterns, deletePattern, updatePattern } from '../services/api';
import { Grid3X3, Plus, Trash2, CheckCircle, AlertCircle, Edit, Sparkles } from 'lucide-react';

export default function PatternsManager() {
  const [template, setTemplate] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [editingPattern, setEditingPattern] = useState(null);
  const [editTemplate, setEditTemplate] = useState('');

  const fetchPatterns = async () => {
    try {
      const response = await getAllPatterns();
      setPatterns(response.data.patterns);
    } catch (err) {
      setError('Failed to fetch patterns');
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const handleAddPattern = async (e) => {
    e.preventDefault();
    if (!template.trim()) {
      setError('Template is required');
      return;
    }

    try {
      setLoading(true);
      const response = await addPattern(template);
      setMessage({ type: 'success', text: response.data.message });
      setTemplate('');
      setError(null);
      await fetchPatterns();
    } catch (err) {
      setError('Failed to add pattern: ' + err.message);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePattern = async (template) => {
    if (confirm(`هل أنت متأكد من حذف النمط "${template}"؟`)) {
      try {
        await deletePattern(template);
        await fetchPatterns();
        setMessage({ type: 'success', text: `النمط "${template}" تم حذفه بنجاح` });
      } catch (err) {
        setError('Failed to delete pattern: ' + err.message);
      }
    }
  };

  const handleStartEdit = (pattern) => {
    setEditingPattern(pattern);
    setEditTemplate(pattern);
  };

  const handleCancelEdit = () => {
    setEditingPattern(null);
    setEditTemplate('');
  };

  const handleSaveEdit = async () => {
    if (!editTemplate.trim()) {
      setError('Template is required');
      return;
    }

    try {
      setLoading(true);
      const response = await updatePattern(editingPattern, editTemplate);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setEditingPattern(null);
        setEditTemplate('');
        setError(null);
        await fetchPatterns();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update pattern: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <div className="p-3 gradient-secondary rounded-xl">
          <Grid3X3 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">إدارة الأنماط الصرفية</h2>
          <p className="text-slate-600 text-sm mt-1">أنشئ وأدر أنماط المشتقات العربية</p>
        </div>
      </div>

      {/* Add Pattern Form */}
      <form onSubmit={handleAddPattern} className="card-shadow bg-white rounded-xl p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-sky-600" />
          إضافة نمط جديد
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-3 block">قالب النمط (Template)</span>
              <input
                type="text"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="مثال: فَاعِل"
                className="arabic-text input-modern w-full text-lg"
              />
              <p className="text-xs text-slate-500 mt-2">استخدم: <strong>ف</strong> للحرف الأول، <strong>ع</strong> للثاني، <strong>ل</strong> للثالث</p>
            </label>
          </div>

          

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {message && message.type === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            إضافة النمط
          </button>
        </div>
      </form>

      {/* Patterns Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">الأنماط المخزنة</h3>
          <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold">
            {patterns.length} نمط
          </span>
        </div>

        {patterns.length === 0 ? (
          <div className="card-shadow bg-white rounded-xl p-12 border border-slate-100 text-center">
            <Grid3X3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">لا توجد أنماط مخزنة حتى الآن</p>
            <p className="text-slate-500 text-sm mt-2">ابدأ بإنشاء نمط جديد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="group card-shadow bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-sky-300"
              >
                {editingPattern === pattern ? (
                  <div className="p-6 space-y-4">
                    <input
                      type="text"
                      value={editTemplate}
                      onChange={(e) => setEditTemplate(e.target.value)}
                      className="arabic-text input-modern w-full text-lg text-center"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={loading}
                        className="flex-1 gradient-success text-white py-2 rounded-lg text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 disabled:opacity-50 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-6 text-center border-b border-slate-100 group-hover:bg-sky-50 transition-colors">
                      <div className="arabic-text text-2xl font-bold text-sky-600">
                        {pattern}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">قالب النمط الصرفي</p>
                    </div>
                    <div className="p-4 flex gap-2">
                      <button
                        onClick={() => handleStartEdit(pattern)}
                        disabled={loading}
                        className="flex-1 gradient-secondary text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePattern(pattern)}
                        disabled={loading}
                        className="flex-1 gradient-danger text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
