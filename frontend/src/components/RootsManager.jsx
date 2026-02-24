import React, { useState, useEffect } from 'react';
import { addRoot, uploadRootsFile, getAllRoots, deleteRoot, updateRoot, getRootWords } from '../services/api';
import { BookOpen, Plus, CheckCircle, AlertCircle, Upload, Trash2, Edit, Cloud, X } from 'lucide-react';

export default function RootsManager() {
  const [root, setRoot] = useState('');
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [editingRoot, setEditingRoot] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [selectedRootWords, setSelectedRootWords] = useState(null);
  const [rootWordsLoading, setRootWordsLoading] = useState(false);

  const fetchRoots = async () => {
    try {
      const response = await getAllRoots();
      setRoots(response.data.roots);
    } catch (err) {
      setError('Failed to fetch roots');
    }
  };

  useEffect(() => {
    fetchRoots();
  }, []);

  const handleAddRoot = async (e) => {
    e.preventDefault();
    if (!root.trim()) {
      setError('Root cannot be empty');
      return;
    }

    if (root.length !== 3) {
      setError('Root must be exactly 3 characters (trilateral)');
      return;
    }

    try {
      setLoading(true);
      const response = await addRoot(root);
      setMessage({ type: 'success', text: response.data.message });
      setRoot('');
      setError(null);
      await fetchRoots();
    } catch (err) {
      setError('Failed to add root: ' + err.message);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);

    try {
      setLoading(true);
      const response = await uploadRootsFile(file);
      
      if (response.data.success) {
        setUploadMessage({
          type: 'success',
          text: `${response.data.added_count} جذور مضافة بنجاح`,
          details: response.data.errors,
        });
        setError(null);
        await fetchRoots();
      } else {
        setUploadMessage({
          type: 'error',
          text: response.data.message,
        });
      }
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: 'Failed to upload file: ' + err.message,
      });
    } finally {
      setLoading(false);
      setUploadFile(null);
    }
  };

  const handleDeleteRoot = async (rootToDelete) => {
    if (!confirm(`هل أنت متأكد من حذف الجذر "${rootToDelete}"؟`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteRoot(rootToDelete);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        await fetchRoots();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to delete root: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (rootToEdit) => {
    setEditingRoot(rootToEdit);
    setEditValue(rootToEdit);
  };

  const handleCancelEdit = () => {
    setEditingRoot(null);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim() || editValue.length !== 3) {
      setError('Root must be exactly 3 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await updateRoot(editingRoot, editValue);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setEditingRoot(null);
        setEditValue('');
        setError(null);
        await fetchRoots();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update root: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWordsModal = async (selectedRoot) => {
    try {
      setRootWordsLoading(true);
      setShowWordsModal(true);
      setSelectedRootWords({ root: selectedRoot, words: [] });

      const response = await getRootWords(selectedRoot);
      const derivedWords = response.data?.derived_words || {};
      const wordsList = Object.entries(derivedWords).map(([word, meta]) => ({
        word,
        template: meta?.template || '-',
        frequency: meta?.frequency || 0,
      }));

      setSelectedRootWords({
        root: selectedRoot,
        words: wordsList,
      });
    } catch (err) {
      setSelectedRootWords({ root: selectedRoot, words: [] });
      setError('Failed to load derived words: ' + err.message);
    } finally {
      setRootWordsLoading(false);
    }
  };

  const handleCloseWordsModal = () => {
    setShowWordsModal(false);
    setSelectedRootWords(null);
    setRootWordsLoading(false);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <div className="p-3 gradient-primary rounded-xl">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">إدارة الجذور</h2>
          <p className="text-slate-600 text-sm mt-1">أضف وأدر الجذور الثلاثية العربية</p>
        </div>
      </div>

      {/* Single Root Form */}
      <form onSubmit={handleAddRoot} className="card-shadow bg-white rounded-xl p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          إضافة جذر واحد
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">أدخل جذراً جديداً (3 حروف عربية فقط)</span>
              <input
                type="text"
                value={root}
                onChange={(e) => setRoot(e.target.value)}
                maxLength={3}
                placeholder="مثال: كتب"
                className="arabic-text input-modern w-full text-lg text-center"
              />
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
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            إضافة الجذر
          </button>
        </div>
      </form>

      {/* Upload File Form */}
      <div className="card-shadow bg-white rounded-xl p-8 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-purple-600" />
          استيراد جذور من ملف
        </h3>
        
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 mb-3 block">اختر ملف نصي (TXT)</span>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors duration-200 group">
            <input
              type="file"
              accept=".txt"
              onChange={handleUploadFile}
              className="hidden"
              id="roots-file-input"
              disabled={loading}
            />
            <label htmlFor="roots-file-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-900 font-semibold">
                  {uploadFile ? `✓ ${uploadFile.name}` : 'اسحب ملف أو اضغط للاختيار'}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  ملفات نصية فقط - جذر واحد في كل سطر
                </p>
              </div>
            </label>
          </div>
        </label>

        {uploadMessage && (
          <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 ${
            uploadMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {uploadMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold">{uploadMessage.text}</p>
              {uploadMessage.details && uploadMessage.details.length > 0 && (
                <div className="text-xs mt-2 space-y-1 opacity-75">
                  {uploadMessage.details.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Roots Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">الجذور المخزنة</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {roots.length} جذر
          </span>
        </div>

        {roots.length === 0 ? (
          <div className="card-shadow bg-white rounded-xl p-12 border border-slate-100 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">لا توجد جذور مخزنة حتى الآن</p>
            <p className="text-slate-500 text-sm mt-2">ابدأ بإضافة جذر جديد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roots.map((r, idx) => (
              <div
                key={idx}
                className="group card-shadow bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-blue-300"
              >
                {editingRoot === r ? (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={3}
                      className="arabic-text input-modern w-full text-center text-2xl font-bold"
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
                    <button
                      type="button"
                      onClick={() => handleOpenWordsModal(r)}
                      className="w-full p-6 text-center border-b border-slate-100 group-hover:bg-blue-50 transition-colors"
                    >
                      <div className="arabic-text text-3xl font-bold text-blue-600">
                        {r}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">اضغط لعرض الكلمات المشتقة</p>
                    </button>
                    <div className="p-4 flex gap-2">
                      <button
                        onClick={() => handleStartEdit(r)}
                        disabled={loading}
                        className="flex-1 gradient-primary text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteRoot(r)}
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

      {/* Derived Words Modal */}
      {showWordsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">الكلمات المشتقة</h3>
                <p className="text-sm text-slate-600">
                  الجذر: <span className="arabic-text font-bold text-blue-600">{selectedRootWords?.root}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseWordsModal}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {rootWordsLoading ? (
                <p className="text-slate-600 text-center py-8">جاري تحميل الكلمات...</p>
              ) : selectedRootWords?.words?.length > 0 ? (
                <div className="space-y-3">
                  {selectedRootWords.words.map((entry, index) => (
                    <div
                      key={`${entry.word}-${index}`}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">الكلمة المشتقة</p>
                          <p className="arabic-text text-2xl font-bold text-blue-600">{entry.word}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">النمط</p>
                          <p className="arabic-text text-lg font-semibold text-slate-800">{entry.template}</p>
                          <p className="text-xs text-slate-500 mt-1">التكرار: {entry.frequency}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-600">لا توجد كلمات مشتقة محفوظة لهذا الجذر</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
