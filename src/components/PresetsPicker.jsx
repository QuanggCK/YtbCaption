import React from 'react';
import { Sparkles, Gamepad2, Zap, Shield, Flame } from 'lucide-react';

export const PRESET_TEMPLATES = [
  {
    id: 'gaming_cyan',
    name: 'Gaming Cyan (Ảnh Mẫu)',
    icon: Gamepad2,
    badgeColor: '#00e5ff',
    borderColor: '#00e5ff',
    bgColor: '#44b6e5',
    bgType: 'solid',
    textColor: '#000000',
    fontSize: 40,
    fontFamily: 'Inter',
    fontWeight: '700',
    borderRadius: 36,
    borderWidth: 8,
    avatarBorderColor: '#00e5ff',
    avatarBorderWidth: 4,
    avatarShape: 'circle',
    entranceAnimation: 'bounce',
    exitAnimation: 'fade',
  },
  {
    id: 'cyber_glitch',
    name: 'Cyberpunk Glitch',
    icon: Zap,
    badgeColor: '#ff0055',
    borderColor: '#ff0055',
    bgColor1: '#0f172a',
    bgColor2: '#1e1b4b',
    bgType: 'gradient',
    textColor: '#00f0ff',
    fontSize: 38,
    fontFamily: 'Press Start 2P',
    fontWeight: '700',
    borderRadius: 12,
    borderWidth: 6,
    avatarBorderColor: '#00f0ff',
    avatarBorderWidth: 4,
    avatarShape: 'square',
    entranceAnimation: 'glitch',
    exitAnimation: 'glitch',
  },
  {
    id: 'streamer_gold',
    name: 'Streamer VIP Gold',
    icon: Flame,
    badgeColor: '#eab308',
    borderColor: '#facc15',
    bgColor1: '#854d0e',
    bgColor2: '#ca8a04',
    bgType: 'gradient',
    textColor: '#ffffff',
    fontSize: 36,
    fontFamily: 'Montserrat',
    fontWeight: '800',
    borderRadius: 40,
    borderWidth: 6,
    avatarBorderColor: '#facc15',
    avatarBorderWidth: 5,
    avatarShape: 'circle',
    entranceAnimation: 'bounce',
    exitAnimation: 'bounce',
  },
  {
    id: 'minimal_dark',
    name: 'Minimal Dark Clean',
    icon: Shield,
    badgeColor: '#38bdf8',
    borderColor: '#38bdf8',
    bgColor: '#0f172a',
    bgType: 'solid',
    textColor: '#f8fafc',
    fontSize: 36,
    fontFamily: 'Outfit',
    fontWeight: '600',
    borderRadius: 24,
    borderWidth: 4,
    avatarBorderColor: '#38bdf8',
    avatarBorderWidth: 3,
    avatarShape: 'circle',
    entranceAnimation: 'fade',
    exitAnimation: 'fade',
  }
];

export default function PresetsPicker({ currentPresetId, onSelectPreset }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center space-x-2 mb-3 text-slate-300 font-semibold text-sm">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span>Mẫu Caption Thiết Kế Sẵn:</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_TEMPLATES.map((preset) => {
          const IconComponent = preset.icon;
          const isActive = currentPresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-cyan-500 bg-cyan-500/10 text-white ring-2 ring-cyan-500/20'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: preset.borderColor }}
              >
                <IconComponent className="w-4 h-4 text-slate-950" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate">{preset.name}</p>
                <p className="text-[10px] opacity-70 uppercase tracking-wide">
                  {preset.entranceAnimation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
