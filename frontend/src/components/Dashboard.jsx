import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { BarChart3, GitBranch, Grid3X3, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  const StatCard = ({ icon: Icon, label, value, gradientColor, sublabel }) => (
    <div className="group card-shadow bg-white rounded-xl p-6 border border-slate-100 overflow-hidden relative">
      {/* Gradient background */}
      <div className={`absolute -top-20 -right-20 w-48 h-48 ${gradientColor} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-all duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">{label}</p>
            <p className={`text-4xl font-bold ${gradientColor.replace('bg-', 'text-')}`}>
              {loading ? '...' : value}
            </p>
            {sublabel && <p className="text-xs text-slate-500 mt-2">{sublabel}</p>}
          </div>
          <div className={`p-3 rounded-lg ${gradientColor} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${gradientColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-primary rounded-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900">لوحة التحكم</h2>
            <p className="text-slate-600 text-sm mt-1">إحصائيات ومعلومات النظام</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={GitBranch}
          label="إجمالي الجذور"
          value={loading ? '...' : stats.total_roots}
          gradientColor="bg-blue-600"
          sublabel="محفوظة في شجرة AVL"
        />
        <StatCard
          icon={Grid3X3}
          label="إجمالي الأنماط"
          value={loading ? '...' : stats.total_patterns}
          gradientColor="bg-blue-600"
          sublabel="محفوظة في جدول الهاش"
        />
        <StatCard
          icon={TrendingUp}
          label="ارتفاع الشجرة"
          value={loading ? '...' : stats.avl_height}
          gradientColor="bg-blue-600"
          sublabel={stats.avl_height > 0 ? 'مستويات المتوازنة' : '-'}
        />
      </div>

      {/* About Section */}
      <div className="card-shadow bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-xl p-8 text-white border border-indigo-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">عن هذا التطبيق</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              محرك البحث الصرفي العربي هو تطبيق ويب حديث يجمع بين الخوارزميات المتقدمة وتحليل اللغة العربية الطبيعية. 
              يستخدم بنى بيانات مخصصة مثل شجرة AVL وجدول الهاش لتخزين الجذور والأنماط الصرفية بكفاءة عالية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
