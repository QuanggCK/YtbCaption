/**
 * Video Exporter module for YtbCaption
 * Records canvas rendering + original video audio into MP4/WebM file.
 */

import { renderCanvasFrame } from './canvasRenderer';

export async function exportVideoTrack({
  canvasRef,
  videoRef,
  avatarImgRef,
  config,
  onProgress,
  onComplete,
  onError
}) {
  try {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
      throw new Error('Canvas context unavailable');
    }

    const fps = 60;
    const duration = config.totalDuration || (video && video.duration > 0 ? video.duration : 10);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 1. Prepare Audio Stream if video has audio
    let audioStream = null;
    if (video && video.captureStream) {
      try {
        const stream = video.captureStream();
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioStream = new MediaStream([audioTracks[0]]);
        }
      } catch (err) {
        console.warn('Could not capture audio stream from video element:', err);
      }
    }

    // 2. Setup Canvas Capture Stream
    const canvasStream = canvas.captureStream(fps);
    const combinedTracks = [...canvasStream.getVideoTracks()];

    if (audioStream) {
      combinedTracks.push(...audioStream.getAudioTracks());
    }

    const recordingStream = new MediaStream(combinedTracks);

    // 3. Choose supported MIME type (prefer MP4)
    let mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else {
        mimeType = 'video/webm';
      }
    }

    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(recordingStream, {
      mimeType,
      videoBitsPerSecond: 8000000 // 8 Mbps for high quality
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      onComplete({ url, blob, filename: `ytb_caption_export.${ext}` });
    };

    // 4. Start playback & recording
    if (video) {
      video.currentTime = 0;
      await video.play().catch(() => {});
    }

    mediaRecorder.start(100);

    const frameInterval = 1000 / fps;
    let currentTime = 0;

    const renderLoop = setInterval(() => {
      if (video && !video.paused) {
        currentTime = video.currentTime;
      } else {
        currentTime += frameInterval / 1000;
      }

      // Draw frame
      renderCanvasFrame(ctx, canvasWidth, canvasHeight, video, avatarImgRef.current, config, currentTime, { isPlaying: true, isExporting: true });

      // Report progress
      const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100));
      onProgress(progressPercent);

      // Check if finished
      if (currentTime >= duration) {
        clearInterval(renderLoop);
        if (video) video.pause();
        mediaRecorder.stop();
      }
    }, frameInterval);

    return {
      cancel: () => {
        clearInterval(renderLoop);
        if (video) video.pause();
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }
    };
  } catch (err) {
    if (onError) onError(err);
  }
}
