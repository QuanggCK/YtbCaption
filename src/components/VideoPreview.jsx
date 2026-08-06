import React, { useEffect, useRef } from 'react';
import { renderCanvasFrame } from '../utils/canvasRenderer';
import { Upload, Play, Pause, RotateCcw, Image as ImageIcon } from 'lucide-react';

export default function VideoPreview({
  canvasRef,
  videoRef,
  avatarImgRef,
  config,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onVideoUpload
}) {
  const containerRef = useRef(null);

  // Canvas loop update
  useEffect(() => {
    let animationFrameId;

    const render = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        let time = currentTime;
        if (isPlaying && video && !video.paused) {
          time = video.currentTime;
          setCurrentTime(video.currentTime);
        }

        renderCanvasFrame(
          ctx,
          canvas.width,
          canvas.height,
          video,
          avatarImgRef.current,
          config,
          time,
          { isPlaying }
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, videoRef, avatarImgRef, config, currentTime, isPlaying, setCurrentTime]);

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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
      {/* Video Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group"
      >
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain"
        />

        {/* Hidden video element */}
        <video
          ref={videoRef}
          src={config.videoUrl || null}
          playsInline
          loop
          className="hidden"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Hidden Avatar Image Loader */}
        <img
          ref={avatarImgRef}
          src={config.avatarSrc || '/sample_avatar.jpg'}
          alt="Avatar"
          className="hidden"
          crossOrigin="anonymous"
        />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-90 group-hover:opacity-100 transition-opacity">
          <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 backdrop-blur-md border border-slate-700 cursor-pointer transition-all shadow-md">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tải Video Nền</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onVideoUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
