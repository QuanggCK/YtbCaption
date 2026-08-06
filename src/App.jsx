import React, { useState, useRef } from 'react';
import Header from './components/Header';
import PresetsPicker, { PRESET_TEMPLATES } from './components/PresetsPicker';
import VideoPreview from './components/VideoPreview';
import Timeline from './components/Timeline';
import ControlPanel from './components/ControlPanel';
import CanvasExporter from './components/CanvasExporter';
import { exportVideoTrack } from './utils/exportVideo';

export default function App() {
  // Config state initialized with User's Sample Image style!
  const [config, setConfig] = useState({
    presetId: 'gaming_cyan',
    captionText: 'Caption\nhere',
    fontFamily: 'Inter',
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 1.15,
    textColor: '#000000',
    textGlow: false,

    // Banner & Border
    borderColor: '#00e5ff',
    borderWidth: 8,
    borderRadius: 36,
    bgColor: '#44b6e5',
    bgType: 'solid',
    bannerWidth: 540,
    bannerHeight: 140,

    // Positioning
    posX: 20,
    posY: 35,
    scale: 1,

    // Avatar
    avatarSrc: '/sample_avatar.jpg',
    avatarShape: 'circle',
    avatarSize: 150,
    avatarBorderColor: '#00e5ff',
    avatarBorderWidth: 4,
    avatarOverlap: 50,

    // Animations (Fade, Bounce, Glitch)
    entranceAnimation: 'bounce',
    exitAnimation: 'fade',
    entranceSpeed: 0.8,
    exitSpeed: 0.6,

    // Video & Timing
    videoUrl: null,
    totalDuration: 10,
    startTime: 0,
    duration: 8,
  });

  // Playback & Canvas Refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const avatarImgRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Exporter State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState(null);
  const [exportError, setExportError] = useState(null);

  // Preset Selection
  const handleSelectPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      presetId: preset.id,
      borderColor: preset.borderColor || prev.borderColor,
      borderWidth: preset.borderWidth || prev.borderWidth,
      borderRadius: preset.borderRadius || prev.borderRadius,
      bgColor: preset.bgColor || prev.bgColor,
      bgColor1: preset.bgColor1,
      bgColor2: preset.bgColor2,
      bgType: preset.bgType || 'solid',
      textColor: preset.textColor || prev.textColor,
      fontSize: preset.fontSize || prev.fontSize,
      fontFamily: preset.fontFamily || prev.fontFamily,
      fontWeight: preset.fontWeight || prev.fontWeight,
      avatarBorderColor: preset.avatarBorderColor || prev.avatarBorderColor,
      avatarShape: preset.avatarShape || prev.avatarShape,
      entranceAnimation: preset.entranceAnimation || prev.entranceAnimation,
      exitAnimation: preset.exitAnimation || prev.exitAnimation,
    }));
  };

  const handleResetPresets = () => {
    handleSelectPreset(PRESET_TEMPLATES[0]);
  };

  // Video Upload
  const handleVideoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setConfig((prev) => ({ ...prev, videoUrl: url }));
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current.duration) {
            setConfig((prev) => ({
              ...prev,
              totalDuration: Math.round(videoRef.current.duration)
            }));
          }
        };
      }
    }
  };

  // Avatar Upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({ ...prev, avatarSrc: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Animation Preview Trigger
  const triggerAnimationPreview = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = config.startTime;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    setCurrentTime(config.startTime);
  };

  // Export Action
  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportResult(null);
    setExportError(null);

    exportVideoTrack({
      canvasRef,
      videoRef,
      avatarImgRef,
      config,
      onProgress: (percent) => setExportProgress(percent),
      onComplete: (result) => {
        setIsExporting(false);
        setExportResult(result);
      },
      onError: (err) => {
        setIsExporting(false);
        setExportError(err.message || 'Lỗi khi xuất video');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <Header
        onExport={handleStartExport}
        isExporting={isExporting}
        onResetPresets={handleResetPresets}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Studio Column: Presets + Preview + Timeline */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Quick Preset Selector */}
          <PresetsPicker
            currentPresetId={config.presetId}
            onSelectPreset={handleSelectPreset}
          />

          {/* Video Preview Studio Canvas */}
          <VideoPreview
            canvasRef={canvasRef}
            videoRef={videoRef}
            avatarImgRef={avatarImgRef}
            config={config}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onVideoUpload={handleVideoUpload}
          />

          {/* Scrubber & Timing Timeline */}
          <Timeline
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            totalDuration={config.totalDuration}
            setTotalDuration={(val) => setConfig((prev) => ({ ...prev, totalDuration: val }))}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            startTime={config.startTime}
            setStartTime={(val) => setConfig((prev) => ({ ...prev, startTime: val }))}
            duration={config.duration}
            setDuration={(val) => setConfig((prev) => ({ ...prev, duration: val }))}
            videoRef={videoRef}
          />
        </div>

        {/* Right Sidebar Column: Tabbed Controls */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <ControlPanel
            config={config}
            setConfig={setConfig}
            onTriggerAnimationPreview={triggerAnimationPreview}
            onAvatarUpload={handleAvatarUpload}
          />
        </div>
      </main>

      {/* Export Progress / Download Modal */}
      <CanvasExporter
        isExporting={isExporting}
        progressPercent={exportProgress}
        exportResult={exportResult}
        error={exportError}
        onClose={() => {
          setIsExporting(false);
          setExportResult(null);
          setExportError(null);
        }}
      />
    </div>
  );
}
