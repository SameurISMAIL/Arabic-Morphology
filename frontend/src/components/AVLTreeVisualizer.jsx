import React, { useEffect, useMemo, useState } from 'react';
import { GitBranch, AlertCircle, RefreshCcw, X } from 'lucide-react';
import { getRootsTree, getRootWords } from '../services/api';

const SVG_WIDTH = 1200;
const LEVEL_HEIGHT = 130;
const NODE_RADIUS = 26;

function computeTreeLayout(tree) {
  if (!tree) {
    return { nodes: [], edges: [], depth: 0 };
  }

  const nodes = [];
  const edges = [];

  const traverse = (node, x, y, depth, spread) => {
    if (!node) return;

    nodes.push({
      root: node.root,
      x,
      y,
      depth,
      height: node.height,
    });

    if (node.left) {
      const childX = x - spread;
      const childY = y + LEVEL_HEIGHT;
      edges.push({ x1: x, y1: y, x2: childX, y2: childY });
      traverse(node.left, childX, childY, depth + 1, Math.max(spread / 2, 55));
    }

    if (node.right) {
      const childX = x + spread;
      const childY = y + LEVEL_HEIGHT;
      edges.push({ x1: x, y1: y, x2: childX, y2: childY });
      traverse(node.right, childX, childY, depth + 1, Math.max(spread / 2, 55));
    }
  };

  traverse(tree, SVG_WIDTH / 2, 70, 0, SVG_WIDTH / 4);
  const depth = Math.max(...nodes.map((n) => n.depth), 0) + 1;

  return { nodes, edges, depth };
}

export default function AVLTreeVisualizer() {
  const [treeData, setTreeData] = useState(null);
  const [stats, setStats] = useState({ count: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showWordsModal, setShowWordsModal] = useState(false);
  const [selectedRootWords, setSelectedRootWords] = useState(null);
  const [rootWordsLoading, setRootWordsLoading] = useState(false);

  const loadTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRootsTree();
      setTreeData(response.data?.tree || null);
      setStats({
        count: response.data?.count || 0,
        height: response.data?.height || 0,
      });
    } catch (err) {
      setError('Failed to load AVL tree: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const { nodes, edges, depth } = useMemo(() => computeTreeLayout(treeData), [treeData]);
  const svgHeight = Math.max(220, depth * LEVEL_HEIGHT + 60);

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

      setSelectedRootWords({ root: selectedRoot, words: wordsList });
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
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-primary rounded-xl">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">الشجرة الفعلية AVL</h2>
            <p className="text-slate-600 text-sm mt-1">عرض بنية الشجرة مع الجذور المخزنة</p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadTree}
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500">عدد الجذور</p>
          <p className="text-2xl font-bold text-blue-600">{stats.count}</p>
        </div>
        <div className="card-shadow bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500">ارتفاع الشجرة</p>
          <p className="text-2xl font-bold text-blue-600">{stats.height}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="card-shadow bg-white rounded-xl border border-slate-100 p-4">
        {loading ? (
          <p className="text-center text-slate-600 py-12">جاري تحميل الشجرة...</p>
        ) : !treeData ? (
          <p className="text-center text-slate-600 py-12">لا توجد جذور في الشجرة حالياً</p>
        ) : (
          <div className="overflow-auto">
            <svg width={SVG_WIDTH} height={svgHeight} className="min-w-[900px]">
              {edges.map((edge, idx) => (
                <line
                  key={`edge-${idx}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              ))}

              {nodes.map((node) => (
                <g
                  key={node.root}
                  onClick={() => handleOpenWordsModal(node.root)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill="#dbeafe"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 6}
                    textAnchor="middle"
                    className="arabic-text"
                    fontSize="20"
                    fill="#1e40af"
                  >
                    {node.root}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-3">اضغط على أي عقدة لعرض الكلمات المشتقة الخاصة بهذا الجذر</p>
      </div>

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
                    <div key={`${entry.word}-${index}`} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
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
