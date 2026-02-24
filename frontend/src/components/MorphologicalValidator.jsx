import React, { useState, useEffect } from 'react';
import { getAllRoots, validateWord } from '../services/api';
import { Search, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function MorphologicalValidator() {
  const [roots, setRoots] = useState([]);
  const [word, setWord] = useState('');
  const [selectedRoot, setSelectedRoot] = useState('');
  const [showRootDropdown, setShowRootDropdown] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredRoots = roots.filter((root) => root.includes(selectedRoot.trim()));

  useEffect(() => {
    const fetchRoots = async () => {
      try {
        const response = await getAllRoots();
        setRoots(response.data.roots);
      } catch (err) {
        setError('Failed to load roots');
      }
    };
    fetchRoots();
  }, []);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!word.trim() || !selectedRoot) {
      setError('Please enter a word and select a root');
      return;
    }

    try {
      setLoading(true);
      const response = await validateWord(word, selectedRoot);
      if (response.data.success) {
        setResult({
          word: response.data.word,
          root: response.data.root,
          is_valid: response.data.is_valid,
          template_used: response.data.template_used,
        });
        setError(null);
      } else {
        setError(response.data.message);
        setResult(null);
      }
    } catch (err) {
      setError('Validation failed: ' + err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoot = (root) => {
    setSelectedRoot(root);
    setShowRootDropdown(false);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <div className="p-3 gradient-secondary rounded-xl">
          <Search className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">محقق الكلمات الصرفي</h2>
          <p className="text-slate-600 text-sm mt-1">تحقق من صحة الكلمات والجذور</p>
        </div>
      </div>

      {/* Validation Form */}
      <form onSubmit={handleValidate} className="card-shadow bg-white rounded-xl p-8 border border-slate-100 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" />
          التحقق من الكلمة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-3 block">أدخل الكلمة للتحقق</span>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="مثال: كاتب"
              className="arabic-text input-modern w-full"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-3 block">اختر الجذر (اكتب للتصفية)</span>
            <div className="relative">
              <input
                type="text"
                value={selectedRoot}
                onChange={(e) => {
                  setSelectedRoot(e.target.value);
                  setShowRootDropdown(true);
                }}
                onFocus={() => setShowRootDropdown(true)}
                onBlur={() => setTimeout(() => setShowRootDropdown(false), 150)}
                placeholder="اكتب الجذر..."
                className="arabic-text input-modern w-full"
              />
              {showRootDropdown && filteredRoots.length > 0 && (
                <div className="absolute z-20 w-full mt-2 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                  {filteredRoots.map((root) => (
                    <button
                      key={root}
                      type="button"
                      onMouseDown={() => handleSelectRoot(root)}
                      className="w-full text-right arabic-text px-4 py-2 hover:bg-sky-50 border-b border-slate-100 last:border-b-0"
                    >
                      {root}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">عدد النتائج: {filteredRoots.length}</p>
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-5 h-5" />
          {loading ? 'جاري التحقق...' : 'التحقق من الكلمة'}
        </button>
      </form>

      {/* Validation Result */}
      {result && (
        <div
          className={`card-shadow rounded-xl p-8 border-2 overflow-hidden animate-fade-in ${
            result.is_valid
              ? 'bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-300'
              : 'bg-gradient-to-br from-slate-50 via-white to-blue-50 border-slate-300'
          }`}
        >
          {/* Icon and Status */}
          <div className="flex justify-center mb-6">
            {result.is_valid ? (
              <div className="p-4 bg-sky-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-sky-600" />
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-full">
                <XCircle className="w-12 h-12 text-slate-600" />
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-2">الكلمة</p>
              <p className="arabic-text font-bold text-3xl text-slate-900">
                {result.word}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-2">الجذر</p>
              <p className="arabic-text font-bold text-3xl text-slate-900">
                {result.root}
              </p>
            </div>
          </div>

          {/* Status Result */}
          <div className={`text-center py-6 px-4 rounded-lg mb-6 ${
            result.is_valid
              ? 'bg-sky-100 border-2 border-sky-300'
              : 'bg-slate-100 border-2 border-slate-300'
          }`}>
            <p className={`text-4xl font-bold mb-2 ${
              result.is_valid ? 'text-sky-600' : 'text-slate-600'
            }`}>
              {result.is_valid ? '✓ صحيحة' : '✗ غير صحيحة'}
            </p>
            <p className={`text-sm font-semibold ${
              result.is_valid ? 'text-sky-700' : 'text-slate-700'
            }`}>
              {result.is_valid 
                ? 'الكلمة مشتقة من هذا الجذر' 
                : 'الكلمة غير مشتقة من هذا الجذر'}
            </p>
          </div>

          {/* Template Info */}
          {result.is_valid && result.template_used && (
            <div className="bg-white bg-opacity-70 border border-sky-200 rounded-lg p-4">
              <p className="text-slate-600 text-sm mb-2">النمط المستخدم</p>
              <p className="arabic-text font-bold text-xl text-sky-600">
                {result.template_used}
              </p>
            </div>
          )}

          {!result.is_valid && (
            <div className="bg-white bg-opacity-70 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-700 text-center">
                الكلمة <strong className="arabic-text">"{result.word}"</strong> لا تندرج تحت الجذر <strong className="arabic-text">"{result.root}"</strong> بأي نمط متاح
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="card-shadow bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
        <h4 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          كيفية الاستخدام
        </h4>
        <ul className="text-slate-700 space-y-3">
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">1</span>
            <span>أدخل كلمة عربية تريد التحقق من صحتها الصرفية</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">2</span>
            <span>اختر جذراً تعتقد أن الكلمة مشتقة منه</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">3</span>
            <span>سيتم فحص الكلمة مقابل جميع الأنماط المتاحة</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">4</span>
            <span>إذا تطابقت الكلمة مع أي نمط، سيتم إظهار النمط المستخدم</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
