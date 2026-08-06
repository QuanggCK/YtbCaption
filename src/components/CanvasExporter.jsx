import React from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function CanvasExporter({
  isExporting,
  progressPercent,
  exportResult,
  onClose,
  error
}) {
  if (!isExporting && !exportResult && !error) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        {!isExporting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-1.5 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* State 1: Exporting in progress */}
        {isExporting && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Đang Khởi Tạo & Render Video...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống đang ghi hình các khung hình Canvas và mã hóa video MP4.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Tiến trình:</span>
                <span className="text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* State 2: Complete Success */}
        {!isExporting && exportResult && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Xuất Video Thành Công! 🎉</h3>
              <p className="text-xs text-slate-400 mt-1">
                File video MP4 của bạn đã sẵn sàng để tải về máy.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <a
                href={exportResult.url}
                download={exportResult.filename || 'ytb_caption_video.mp4'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Tải Về File MP4 Ngay</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {!isExporting && error && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Có lỗi xảy ra</h3>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Thử Lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
