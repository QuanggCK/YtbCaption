import React, { useState, useRef } from 'react';
import Header from './components/Header';
import VideoPreview from './components/VideoPreview';
import Timeline from './components/Timeline';
import ControlPanel from './components/ControlPanel';
import CanvasExporter from './components/CanvasExporter';
import { exportVideoTrack } from './utils/exportVideo';

const DEFAULT_CONFIG = {
  presetId: 'custom',
  captionText: 'Music Playing:',
  fontFamily: 'Oswald',
  fontSize: 48,
  fontWeight: '700',
  lineHeight: 1.15,
  textAlign: 'center',
  textColor: '#000000',
  textGlow: false,
  textStrokeWidth: 0,
  textStrokeColor: '#ffffff',

  // Frame Style & Border
  frameStyle: 'splitBracket', // 'classic' | 'splitBracket'
  bracketMode: '2corners', // '2corners' | '4corners'
  borderColor: '#0066ff',
  borderWidth: 10,
  borderRadius: 0,
  bgColor: 'transparent',
  bgType: 'solid',
  bannerWidth: 560,
  bannerHeight: 140,

  // Positioning
  posX: 20,
  posY: 35,
  scale: 1,

  // Avatar
  showAvatar: false,
  avatarSrc: '/sample_avatar.jpg',
  avatarShape: 'circle',
  avatarSize: 150,
  avatarBorderColor: '#0066ff',
  avatarBorderWidth: 4,
  avatarOverlap: 50,

  // Animations (Fade, Bounce, Glitch, Split, Fold)
  entranceAnimation: 'split',
  exitAnimation: 'fold',
  entranceSpeed: 0.8,
  exitSpeed: 0.6,

  // Video & Timing
  videoUrl: null,
  totalDuration: 10,
  startTime: 0,
  duration: 8,
};

export default function App() {
  // Config state initialized with Default style
  const [config, setConfig] = useState(DEFAULT_CONFIG);

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

  const handleResetConfig = () => {
    setConfig((prev) => ({
      ...DEFAULT_CONFIG,
      videoUrl: prev.videoUrl, // Preserve loaded video if any
      avatarSrc: prev.avatarSrc // Preserve loaded avatar if any
    }));
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

  const exportControllerRef = useRef(null);

  // Export Action
  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportResult(null);
    setExportError(null);

    const controller = await exportVideoTrack({
      canvasRef,
      videoRef,
      avatarImgRef,
      config,
      onProgress: (percent) => setExportProgress(percent),
      onComplete: (result) => {
        setIsExporting(false);
        setExportResult(result);
        exportControllerRef.current = null;
      },
      onError: (err) => {
        setIsExporting(false);
        setExportError(err.message || 'Lỗi khi xuất video');
        exportControllerRef.current = null;
      }
    });

    exportControllerRef.current = controller;
  };

  const handleCloseExportModal = () => {
    if (isExporting && exportControllerRef.current) {
      exportControllerRef.current.cancel();
      exportControllerRef.current = null;
    }
    setIsExporting(false);
    setExportResult(null);
    setExportError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <Header
        onExport={handleStartExport}
        isExporting={isExporting}
        onResetConfig={handleResetConfig}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Studio Column: Preview + Timeline */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">

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
        onClose={handleCloseExportModal}
      />
    </div>
  );
}
