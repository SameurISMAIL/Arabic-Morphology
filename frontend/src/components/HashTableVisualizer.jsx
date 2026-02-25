import React, { useEffect, useMemo, useState } from 'react';
import { Database, AlertCircle, RefreshCcw } from 'lucide-react';
import { getPatternsTable } from '../services/api';

export default function HashTableVisualizer() {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPatternsTable();
      setTableData(response.data?.table || null);
    } catch (err) {
      setError('Failed to load hash table: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTable();
  }, []);

  const nonEmptyBuckets = useMemo(() => {
    if (!tableData?.buckets) return [];
    return tableData.buckets.filter((bucket) => bucket.count > 0);
  }, [tableData]);

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-primary rounded-xl">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">التصور الفعلي لجدول الهاش</h2>
            <p className="text-slate-600 text-sm mt-1">عرض الـ Buckets وسلاسل التصادم (Collision Chaining)</p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadTable}
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {tableData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">حجم الجدول</p>
            <p className="text-2xl font-bold text-blue-600">{tableData.size}</p>
          </div>
          <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">إجمالي الأنماط</p>
            <p className="text-2xl font-bold text-blue-600">{tableData.count}</p>
          </div>
          <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Load Factor</p>
            <p className="text-2xl font-bold text-blue-600">{(tableData.load_factor * 100).toFixed(2)}%</p>
          </div>
          <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Buckets غير الفارغة</p>
            <p className="text-2xl font-bold text-blue-600">{tableData.non_empty_buckets}</p>
          </div>
          <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">عدد التصادمات</p>
            <p className="text-2xl font-bold text-blue-600">{tableData.collisions}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="card-shadow bg-white rounded-xl border border-slate-100 p-4">
        {loading ? (
          <p className="text-center text-slate-600 py-12">جاري تحميل جدول الهاش...</p>
        ) : !tableData ? (
          <p className="text-center text-slate-600 py-12">لا توجد بيانات متاحة</p>
        ) : nonEmptyBuckets.length === 0 ? (
          <p className="text-center text-slate-600 py-12">جدول الهاش فارغ حالياً</p>
        ) : (
          <div className="space-y-4">
            {nonEmptyBuckets.map((bucket) => (
              <div key={bucket.index} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-800">Bucket #{bucket.index}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {bucket.count} عنصر
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {bucket.chain.map((entry, idx) => (
                    <React.Fragment key={`${entry.template}-${idx}`}>
                      <div className="px-4 py-2 rounded-lg bg-white border border-blue-200 min-w-[110px] text-center">
                        <p className="arabic-text font-bold text-blue-700">{entry.template}</p>
                        <p className="text-[10px] text-slate-500">hash: {entry.hash_value}</p>
                      </div>
                      {idx < bucket.chain.length - 1 && (
                        <span className="text-slate-400 font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-3">
          كل Bucket غير فارغ يمثل سلسلة تصادمات (Chaining). كل عنصر في السلسلة هو نمط صرفي.
        </p>
      </div>
    </div>
  );
}
