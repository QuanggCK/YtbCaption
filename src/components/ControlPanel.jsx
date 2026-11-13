import React, { useState } from 'react';
import {
  Type,
  Layout,
  User,
  Sparkles,
  Palette,
  Sliders,
  Upload,
  Zap,
  CheckCircle2
} from 'lucide-react';

const GOOGLE_FONTS = [
  { label: 'Inter (Hiện đại, Sắc nét)', value: 'Inter' },
  { label: 'Outfit (Bo cong sang trọng)', value: 'Outfit' },
  { label: 'Montserrat (Độ dày cao, Gaming)', value: 'Montserrat' },
  { label: 'Oswald (Dáng hẹp Thể thao)', value: 'Oswald' },
  { label: 'Press Start 2P (Pixel Retro)', value: 'Press Start 2P' },
  { label: 'Poppins (Bo tròn thân thiện)', value: 'Poppins' },
  { label: 'Roboto (Chuẩn HD)', value: 'Roboto' }
];

export default function ControlPanel({ config, setConfig, onTriggerAnimationPreview, onAvatarUpload }) {
  const [activeTab, setActiveTab] = useState('anim');

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 border-b border-slate-800 bg-slate-950/60 p-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'text'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Type className="w-3.5 h-3.5 shrink-0" />
          <span>Văn Bản</span>
        </button>

        <button
          onClick={() => setActiveTab('badge')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'badge'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layout className="w-3.5 h-3.5 shrink-0" />
          <span>Khung Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'avatar'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>Avatar Logo</span>
        </button>

        <button
          onClick={() => setActiveTab('anim')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'anim'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
          <span>Hiệu Ứng</span>
        </button>
      </div>

      {/* Tab Body Contents */}
      <div className="p-4 space-y-5 overflow-y-auto max-h-[560px] custom-scrollbar">
        {/* ================= TAB 1: TEXT & FONT ================= */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/60">
              <Type className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Văn Bản & Font Chữ</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nội dung dòng chữ (Hỗ trợ nhiều dòng):
              </label>
              <textarea
                rows={3}
                value={config.captionText}
                onChange={(e) => updateConfig('captionText', e.target.value)}
                placeholder="Nhập nội dung caption..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kiểu Font chữ:
                </label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => updateConfig('fontFamily', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Độ nét (Font Weight):
                </label>
                <select
                  value={config.fontWeight}
                  onChange={(e) => updateConfig('fontWeight', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="400">Thường (Regular - 400)</option>
                  <option value="600">Vừa (SemiBold - 600)</option>
                  <option value="700">Dày (Bold - 700)</option>
                  <option value="800">Cực Dày (ExtraBold - 800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Kích thước chữ (Font Size):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={72}
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Căn lề chữ (Text Alignment):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'left', name: 'Căn Trái ⬅️' },
                    { id: 'center', name: 'Căn Giữa ⏹️' },
                    { id: 'right', name: 'Căn Phải ➡️' }
                  ].map((align) => (
                    <button
                      key={align.id}
                      onClick={() => updateConfig('textAlign', align.id)}
                      className={`py-2 text-[11px] font-semibold rounded-lg border transition-all ${
                        (config.textAlign || 'center') === align.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {align.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Màu chữ:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hiệu ứng Glow / Bóng chữ:
                </label>
                <button
                  onClick={() => updateConfig('textGlow', !config.textGlow)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    config.textGlow
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {config.textGlow ? 'Đã bật Glow ✨' : 'Tắt Shadow'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Độ dày viền chữ (Text Stroke):</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {config.textStrokeWidth > 0 ? `${config.textStrokeWidth}px` : 'Tắt'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={config.textStrokeWidth || 0}
                  onChange={(e) => updateConfig('textStrokeWidth', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className={config.textStrokeWidth > 0 ? '' : 'opacity-40 pointer-events-none'}>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Màu viền chữ:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.textStrokeColor || '#ffffff'}
                    onChange={(e) => updateConfig('textStrokeColor', e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.textStrokeColor || '#ffffff'}
                    onChange={(e) => updateConfig('textStrokeColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BANNER BADGE STYLE ================= */}
        {activeTab === 'badge' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/60">
              <Layout className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Kiểu Khung Banner & Thiết Kế</h3>
            </div>

            {/* Frame Style Switcher */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Chọn Kiểu Khung Banner (Frame Style):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateConfig('frameStyle', 'splitBracket')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    (config.frameStyle || 'splitBracket') === 'splitBracket'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-cyan-300">Khung Góc Split 🎵</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">2 góc đối xứng tách/gập (Như ảnh mẫu)</p>
                </button>

                <button
                  onClick={() => updateConfig('frameStyle', 'classic')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.frameStyle === 'classic'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-cyan-300">Banner Bo Góc 🏷️</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Badge bo tròn cổ điển có Avatar</p>
                </button>
              </div>

              {/* Presets Quick Apply */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setConfig((prev) => ({
                      ...prev,
                      frameStyle: 'splitBracket',
                      captionText: 'Music Playing:',
                      fontFamily: 'Oswald',
                      fontSize: 48,
                      fontWeight: '700',
                      textAlign: 'center',
                      borderColor: '#0066ff',
                      bgColor: 'transparent',
                      textColor: '#000000',
                      borderWidth: 10,
                      entranceAnimation: 'split',
                      exitAnimation: 'fold',
                      entranceSpeed: 0.8,
                      exitSpeed: 0.6,
                      showAvatar: false
                    }));
                  }}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                >
                  <span>✨ Áp dụng Mẫu Music Playing (Oswald + Chữ ở giữa)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Màu khung góc/viền:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.borderColor || '#0066ff'}
                    onChange={(e) => updateConfig('borderColor', e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.borderColor}
                    onChange={(e) => updateConfig('borderColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Màu nền khung:
                  </label>
                  <button
                    onClick={() => updateConfig('bgColor', config.bgColor === 'transparent' ? 'rgba(230,230,230,0.85)' : 'transparent')}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                      config.bgColor === 'transparent'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {config.bgColor === 'transparent' ? '✓ Trong Suốt' : 'Bật Trong Suốt'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    disabled={config.bgColor === 'transparent'}
                    value={config.bgColor && config.bgColor.startsWith('#') ? config.bgColor : '#dcdcdc'}
                    onChange={(e) => updateConfig('bgColor', e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0 disabled:opacity-40"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => updateConfig('bgColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Độ dày góc viền (Border Width):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={config.borderWidth}
                  onChange={(e) => updateConfig('borderWidth', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {config.frameStyle === 'classic' && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Độ bo góc khung (Border Radius):</span>
                    <span className="font-mono text-cyan-400 font-bold">{config.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={config.borderRadius}
                    onChange={(e) => updateConfig('borderRadius', parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Chiều rộng (Width):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.bannerWidth}px</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={800}
                  value={config.bannerWidth}
                  onChange={(e) => updateConfig('bannerWidth', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Chiều cao (Height):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.bannerHeight}px</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={240}
                  value={config.bannerHeight}
                  onChange={(e) => updateConfig('bannerHeight', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Position Sliders */}
            <div className="border-t border-slate-800/80 pt-3 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Vị trí hiển thị trên màn hình:</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Vị trí Ngang (X):</span>
                    <span className="font-mono text-cyan-400 font-bold">{config.posX}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    value={config.posX}
                    onChange={(e) => updateConfig('posX', parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Vị trí Dọc (Y):</span>
                    <span className="font-mono text-cyan-400 font-bold">{config.posY}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    value={config.posY}
                    onChange={(e) => updateConfig('posY', parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: AVATAR LOGO ================= */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/60">
              <User className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Avatar / Logo</h3>
            </div>

            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Hiển thị Avatar cùng với khung:</span>
              <button
                onClick={() => updateConfig('showAvatar', !config.showAvatar)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.showAvatar
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {config.showAvatar ? 'Bật Avatar' : 'Ẩn Avatar'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tải ảnh Logo / Avatar đại diện:
              </label>
              <label className="flex items-center justify-center space-x-2 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950 p-4 rounded-xl cursor-pointer transition-all group">
                <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-300">
                  Chọn ảnh từ máy tính (PNG/JPG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hình dạng Avatar:
                </label>
                <select
                  value={config.avatarShape}
                  onChange={(e) => updateConfig('avatarShape', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="circle">Tròn (Circle)</option>
                  <option value="square">Bo Vuông (Rounded Square)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Màu viền Avatar:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.avatarBorderColor}
                    onChange={(e) => updateConfig('avatarBorderColor', e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.avatarBorderColor}
                    onChange={(e) => updateConfig('avatarBorderColor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Kích thước Avatar:</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.avatarSize}px</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={220}
                  value={config.avatarSize}
                  onChange={(e) => updateConfig('avatarSize', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Khoảng cách đè khung (Overlap Offset):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.avatarOverlap}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={config.avatarOverlap}
                  onChange={(e) => updateConfig('avatarOverlap', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ANIMATION CONTROLS (None, Fade, Bounce, Glitch, Split, Fold) ================= */}
        {activeTab === 'anim' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/60">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">Hiệu Ứng Chuyển Động</h3>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Hệ thống hỗ trợ 5 kiểu hiệu ứng: <strong>Split/Fold</strong> (Tách từ ở giữa ra & Gập vào lại), <strong>Fade</strong> (Mờ dần), <strong>Bounce</strong> (Bật nảy) và <strong>Glitch</strong> (Ma trận số).
              </span>
            </div>

            {/* Entrance Animation Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Hiệu ứng Xuất hiện (Entrance Animation):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'split', name: '↔️ Tách Từ Ở Giữa (Split)' },
                  { id: 'bounce', name: 'Bounce (Nảy Elastic)' },
                  { id: 'fade', name: 'Fade (Mờ Dần)' },
                  { id: 'glitch', name: 'Glitch (Cyber Ma Trận)' },
                  { id: 'none', name: 'Không Hiệu Ứng' }
                ].map((anim) => {
                  const selected = config.entranceAnimation === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => updateConfig('entranceAnimation', anim.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs">{anim.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exit Animation Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Hiệu ứng Biến mất (Exit Animation):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'fold', name: '↕️ Gập Vào Ở Giữa (Fold)' },
                  { id: 'bounce', name: 'Bounce (Thu Nhỏ)' },
                  { id: 'fade', name: 'Fade (Mờ Dần)' },
                  { id: 'glitch', name: 'Glitch (Biến Mất Digital)' },
                  { id: 'none', name: 'Không Hiệu Ứng' }
                ].map((anim) => {
                  const selected = config.exitAnimation === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => updateConfig('exitAnimation', anim.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs">{anim.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speeds — disabled/greyed out when the matching animation is 'none' since speed doesn't apply */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className={config.entranceAnimation === 'none' ? 'opacity-40 pointer-events-none' : ''}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Tốc độ xuất hiện:</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.entranceSpeed}s</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  value={config.entranceSpeed}
                  disabled={config.entranceAnimation === 'none'}
                  onChange={(e) => updateConfig('entranceSpeed', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className={config.exitAnimation === 'none' ? 'opacity-40 pointer-events-none' : ''}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Tốc độ biến mất:</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.exitSpeed}s</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  value={config.exitSpeed}
                  disabled={config.exitAnimation === 'none'}
                  onChange={(e) => updateConfig('exitSpeed', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Test Trigger Button */}
            <button
              onClick={onTriggerAnimationPreview}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Xem Trước Hiệu Ứng Ngay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
