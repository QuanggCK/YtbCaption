import React from 'react';
import { Video, Download, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ onExport, isExporting, onResetConfig }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white flex items-center gap-2">
            YtbCaption Studio
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-slate-400">Tùy chỉnh & xuất video Caption thông báo chuyên nghiệp</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onResetConfig}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
          title="Khôi phục cài đặt mặc định"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Đặt lại mặc định</span>
        </button>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Đang Xuất Video...' : 'Xuất Video MP4'}</span>
        </button>
      </div>
    </header>
  );
}
