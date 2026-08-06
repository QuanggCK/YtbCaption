import React from 'react';
import { Play, Pause, RotateCcw, Clock, Layers } from 'lucide-react';

export default function Timeline({
  currentTime,
  setCurrentTime,
  totalDuration,
  setTotalDuration,
  isPlaying,
  setIsPlaying,
  startTime,
  setStartTime,
  duration,
  setDuration,
  videoRef
}) {
  const togglePlay = () => {
    if (videoRef.current && videoRef.current.src) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetPlay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const endTime = startTime + duration;
  const startPercent = Math.min(100, Math.max(0, (startTime / totalDuration) * 100));
  const endPercent = Math.min(100, Math.max(0, (endTime / totalDuration) * 100));
  const activeWidthPercent = endPercent - startPercent;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      {/* Top Scrubber & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            title={isPlaying ? 'Tạm dừng' : 'Phát video'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={resetPlay}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
            title="Quay lại đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="pl-2 font-mono text-sm font-semibold text-cyan-400">
            {formatTime(currentTime)} <span className="text-slate-500 font-sans font-normal">/ {formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Total Duration adjustment */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Tổng độ dài:
          </span>
          <input
            type="number"
            min={3}
            max={120}
            value={totalDuration}
            onChange={(e) => setTotalDuration(Math.max(1, parseFloat(e.target.value) || 10))}
            className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-slate-200 font-mono focus:border-cyan-500 outline-none"
          />
          <span className="text-xs text-slate-500">giây</span>
        </div>
      </div>

      {/* Visual Timeline Bar & Active Window */}
      <div className="relative pt-2 pb-1">
        {/* Track */}
        <div className="relative w-full h-8 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden">
          {/* Active Caption Window Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-x-2 border-cyan-400 flex items-center justify-center transition-all"
            style={{
              left: `${startPercent}%`,
              width: `${activeWidthPercent}%`
            }}
          >
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider truncate px-1">
              Caption Active ({startTime}s - {endTime}s)
            </span>
          </div>

          {/* Time ticks indicator */}
          <div className="absolute inset-0 pointer-events-none flex justify-between px-2 items-end pb-0.5">
            {[0, 25, 50, 75, 100].map((pct) => (
              <span key={pct} className="text-[9px] font-mono text-slate-600">
                {Math.round((pct / 100) * totalDuration)}s
              </span>
            ))}
          </div>
        </div>

        {/* Range Scrubber Input */}
        <input
          type="range"
          min={0}
          max={totalDuration}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-x-0 bottom-1 w-full h-8 opacity-0 cursor-pointer"
        />
      </div>

      {/* Caption Timing Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">Bắt đầu xuất hiện:</span>
            <span className="font-mono text-cyan-400 font-bold">{startTime}s</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalDuration - 0.5)}
            step={0.1}
            value={startTime}
            onChange={(e) => setStartTime(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">Thời lượng hiển thị (Duration):</span>
            <span className="font-mono text-cyan-400 font-bold">{duration}s</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={totalDuration}
            step={0.1}
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
