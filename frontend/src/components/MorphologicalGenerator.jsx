import React, { useState, useEffect } from 'react';
import { getAllRoots, getAllPatterns, generateMultiple, generateDerivatives } from '../services/api';
import { Wand2, AlertCircle, Sparkles } from 'lucide-react';

export default function MorphologicalGenerator() {
  const [roots, setRoots] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [selectedRoot, setSelectedRoot] = useState('');
  const [showRootDropdown, setShowRootDropdown] = useState(false);
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [derivatives, setDerivatives] = useState([]);
  const [mode, setMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredRoots = roots.filter((root) => root.includes(selectedRoot.trim()));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rootsRes = await getAllRoots();
        const patternsRes = await getAllPatterns();
        setRoots(rootsRes.data.roots);
        setPatterns(patternsRes.data.patterns);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleGenerateAll = async (e) => {
    e.preventDefault();
    if (!selectedRoot) {
      setError('Please select a root');
      return;
    }

    try {
      setLoading(true);
      const response = await generateDerivatives(selectedRoot);
      if (response.data.success) {
        setDerivatives(response.data.derivatives);
        setError(null);
      } else {
        setError(response.data.message);
        setDerivatives([]);
      }
    } catch (err) {
      setError('Failed to generate derivatives: ' + err.message);
      setDerivatives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMultiple = async (e) => {
    e.preventDefault();
    if (!selectedRoot || selectedPatterns.length === 0) {
      setError('Please select a root and at least one template');
      return;
    }

    try {
      setLoading(true);
      const response = await generateMultiple(selectedRoot, selectedPatterns);
      if (response.data.success) {
        setDerivatives(response.data.derivatives || []);
        setError(null);
      } else {
        setError(response.data.message);
        setDerivatives([]);
      }
    } catch (err) {
      setError('Failed to generate derivatives: ' + err.message);
      setDerivatives([]);
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
        <div className="p-3 gradient-accent rounded-xl">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">مولد الكلمات الصرفي</h2>
          <p className="text-slate-600 text-sm mt-1">توليد المشتقات من الجذور والأنماط</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-4">
        {[
          { value: 'multiple', label: 'مشتق أو عدة مشتقات', icon: '✨' },
          { value: 'all', label: 'جميع المشتقات', icon: '📚' },
        ].map((mode_option) => (
          <label key={mode_option.value} className="group cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200"
            style={{
              borderColor: mode === mode_option.value ? '#0366d6' : '#e2e8f0',
              backgroundColor: mode === mode_option.value ? '#eff6ff' : 'transparent',
            }}>
            <input
              type="radio"
              value={mode_option.value}
              checked={mode === mode_option.value}
              onChange={(e) => setMode(e.target.value)}
              className="hidden"
            />
            <span className="text-lg">{mode_option.icon}</span>
            <span className="font-semibold text-slate-900">{mode_option.label}</span>
          </label>
        ))}
      </div>

      {/* Multiple Templates Generation */}
      {mode === 'multiple' && (
        <form onSubmit={handleGenerateMultiple} className="card-shadow bg-white rounded-xl p-8 border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            توليد من عدة أنماط
          </h3>

          <div className="space-y-4">
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

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-3 block">اختر الأنماط (تحقق من المربعات)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {patterns.map((pattern) => (
                  <label key={pattern} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      value={pattern}
                      checked={selectedPatterns.includes(pattern)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedPatterns((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((item) => item !== value)
                        );
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                    <span className="arabic-text font-semibold text-slate-900">{pattern}</span>
                  </label>
                ))}
              </div>
              {selectedPatterns.length > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  تم تحديد {selectedPatterns.length} من أصل {patterns.length} نمط
                </p>
              )}
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
            className="w-full gradient-accent text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Wand2 className="w-5 h-5" />
            {loading ? 'جاري التوليد...' : 'توليد الأنماط المختارة'}
          </button>
        </form>
      )}

      {/* All Derivatives Generation */}
      {mode === 'all' && (
        <form onSubmit={handleGenerateAll} className="card-shadow bg-white rounded-xl p-8 border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            توليد جميع المشتقات
          </h3>

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

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-accent text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Wand2 className="w-5 h-5" />
            {loading ? 'جاري التوليد...' : 'توليد جميع المشتقات'}
          </button>
        </form>
      )}

      {/* All Derivatives Results */}
      {derivatives.length > 0 && (mode === 'all' || mode === 'multiple') && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">
              المشتقات من الجذر: <span className="arabic-text text-sky-600">{selectedRoot}</span>
            </h3>
            <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full font-semibold text-sm">
              {derivatives.length} مشتق
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {derivatives.map((deriv, idx) => (
              <div key={idx} className="group card-shadow bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-sky-300">
                <div className="p-4 bg-gradient-to-b from-sky-50 to-transparent group-hover:from-sky-100 transition-colors">
                  <p className="text-xs text-slate-600 mb-3 arabic-text font-semibold">
                    النمط: {deriv.template}
                  </p>
                  <div className="arabic-text text-3xl font-bold text-sky-600 text-right w-full">
                    {deriv.generated_word}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
