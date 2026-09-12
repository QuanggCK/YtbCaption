/**
 * Video Exporter module for YtbCaption
 *
 * Two export paths:
 *  1. exportViaWebCodecs (preferred) — renders every frame OFFLINE (not in real time),
 *     seeking the source video to an exact timestamp for each frame instead of racing
 *     a wall-clock timer. This is what actually fixes "video export không mượt": since
 *     nothing is time-boxed, no frame can ever be dropped or duplicated. It muxes real
 *     H.264 + AAC into an actual .mp4 container via `mp4-muxer`, so the download is a
 *     true MP4 on every browser that supports WebCodecs (current Chrome/Edge; Safari 17+
 *     partial), not a re-labelled .webm.
 *  2. exportViaMediaRecorder (fallback) — used automatically when WebCodecs isn't
 *     available (e.g. Firefox). Same real-time capture approach as before, but the
 *     render loop now runs on requestAnimationFrame with a drift-corrected clock
 *     instead of setInterval, and fps/bitrate are tuned to reduce dropped frames.
 *
 * Requires the `mp4-muxer` package for the WebCodecs path:
 *   npm install mp4-muxer
 * If it isn't installed, the dynamic import fails gracefully and we fall back to
 * exportViaMediaRecorder automatically — nothing breaks.
 */

import { renderCanvasFrame } from './canvasRenderer';

function supportsWebCodecsExport() {
  return (
    typeof window !== 'undefined' &&
    'VideoEncoder' in window &&
    'AudioEncoder' in window &&
    'VideoFrame' in window
  );
}

function seekVideoTo(video, time) {
  return new Promise((resolve) => {
    if (!video) return resolve();
    const clamped = Math.min(time, Math.max(0, (video.duration || time) - 0.01));
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = clamped;
  });
}

// Reasonable bitrate scaled to resolution instead of a fixed 8Mbps for every size.
function estimateBitrate(width, height, fps) {
  return Math.round(width * height * fps * 0.07);
}

/**
 * PATH 1 — Offline, frame-accurate export producing a real .mp4 via WebCodecs.
 */
async function exportViaWebCodecs({ canvasRef, videoRef, avatarImgRef, config, onProgress, onComplete, onError }) {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  const canvas = canvasRef.current;
  const ctx = canvas ? canvas.getContext('2d') : null;
  const video = videoRef ? videoRef.current : null;
  if (!canvas || !ctx) throw new Error('Canvas context unavailable');

  const fps = 30;
  const width = canvas.width;
  const height = canvas.height;
  const duration = Math.max(1, config.totalDuration || (video && video.duration > 0 ? video.duration : 10));
  const totalFrames = Math.ceil(duration * fps);

  let cancelled = false;
  const originalLoop = video ? video.loop : false;
  const originalTime = video ? video.currentTime : 0;
  if (video) {
    video.pause();
    video.loop = false;
  }

  // Decode audio (if any) up front so we can encode it deterministically alongside video.
  let audioBuffer = null;
  if (video && video.src) {
    try {
      const resp = await fetch(video.src);
      const arrayBuf = await resp.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
      await audioCtx.close();
    } catch (err) {
      console.warn('No usable audio track found, exporting video-only:', err);
      audioBuffer = null;
    }
  }

  let hasAudio = !!audioBuffer;
  if (hasAudio) {
    const audioSupport = await AudioEncoder.isConfigSupported({
      codec: 'mp4a.40.2',
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      bitrate: 128000,
    });
    if (!audioSupport.supported) {
      console.warn('AAC audio encoding not supported here, exporting video-only.');
      hasAudio = false;
    }
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height },
    audio: hasAudio
      ? { codec: 'aac', numberOfChannels: audioBuffer.numberOfChannels, sampleRate: audioBuffer.sampleRate }
      : undefined,
    fastStart: 'in-memory',
  });

  const videoEncoderConfig = {
    codec: 'avc1.42001f', // H.264 Baseline — broadly compatible
    width,
    height,
    bitrate: estimateBitrate(width, height, fps),
    framerate: fps,
  };

  const videoSupport = await VideoEncoder.isConfigSupported(videoEncoderConfig);
  if (!videoSupport.supported) {
    throw new Error('Trình duyệt không hỗ trợ mã hóa H.264 qua WebCodecs');
  }

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('Video encode error:', e),
  });
  videoEncoder.configure(videoEncoderConfig);

  let audioEncoder = null;
  if (hasAudio) {
    const audioEncoderConfig = {
      codec: 'mp4a.40.2', // AAC-LC
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      bitrate: 128000,
    };
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('Audio encode error:', e),
    });
    audioEncoder.configure(audioEncoderConfig);
  }

  const cleanupVideoEl = () => {
    if (video) {
      video.loop = originalLoop;
      video.currentTime = originalTime;
    }
  };

  const controller = {
    cancel: () => {
      cancelled = true;
    },
  };

  (async () => {
    try {
      // --- Encode video frames (offline: each frame gets exactly 1/fps seconds, no timing race) ---
      for (let i = 0; i < totalFrames; i++) {
        if (cancelled) break;
        const t = i / fps;

        if (video && video.src) {
          await seekVideoTo(video, t);
        }

        renderCanvasFrame(ctx, width, height, video, avatarImgRef.current, config, t, {
          isPlaying: true,
          isExporting: true,
        });

        const frame = new VideoFrame(canvas, { timestamp: Math.round(t * 1e6) });
        videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
        frame.close();

        onProgress(Math.round(((i + 1) / totalFrames) * 90)); // reserve last 10% for audio+mux

        // Yield periodically so the tab stays responsive during long exports.
        if (i % 4 === 0) await new Promise((r) => setTimeout(r, 0));
      }

      await videoEncoder.flush();

      // --- Encode audio (deterministic PCM slicing, matches video duration exactly) ---
      if (audioEncoder && !cancelled) {
        const sampleRate = audioBuffer.sampleRate;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const frameSize = 1024;
        const totalSamples = Math.min(audioBuffer.length, Math.floor(duration * sampleRate));
        const channelData = [];
        for (let c = 0; c < numberOfChannels; c++) channelData.push(audioBuffer.getChannelData(c));

        for (let offset = 0; offset < totalSamples; offset += frameSize) {
          if (cancelled) break;
          const len = Math.min(frameSize, totalSamples - offset);
          const interleaved = new Float32Array(len * numberOfChannels);
          for (let i = 0; i < len; i++) {
            for (let c = 0; c < numberOfChannels; c++) {
              interleaved[i * numberOfChannels + c] = channelData[c][offset + i];
            }
          }
          const audioData = new AudioData({
            format: 'f32',
            sampleRate,
            numberOfFrames: len,
            numberOfChannels,
            timestamp: Math.round((offset / sampleRate) * 1e6),
            data: interleaved,
          });
          audioEncoder.encode(audioData);
          audioData.close();
        }
        await audioEncoder.flush();
      }

      cleanupVideoEl();

      if (cancelled) return;

      onProgress(100);
      muxer.finalize();
      const { buffer } = muxer.target;

      if (!buffer || buffer.byteLength === 0) {
        throw new Error('File xuất ra rỗng (0 KB) — trình duyệt có thể không hỗ trợ mã hóa H.264/AAC ổn định.');
      }

      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      onComplete({ url, blob, filename: 'ytb_caption_export.mp4' });
    } catch (err) {
      cleanupVideoEl();
      if (onError) onError(err);
    }
  })();

  return controller;
}

/**
 * PATH 2 — Real-time fallback export via MediaRecorder (used when WebCodecs is unavailable).
 */
async function exportViaMediaRecorder({ canvasRef, videoRef, avatarImgRef, config, onProgress, onComplete, onError }) {
  let rafId = null;
  let originalLoopState = false;
  let video = videoRef ? videoRef.current : null;
  let cancelled = false;

  const cleanup = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (video) {
      video.pause();
      video.loop = originalLoopState;
    }
  };

  try {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!canvas || !ctx) throw new Error('Canvas context unavailable');

    if (video) {
      originalLoopState = video.loop;
      video.loop = false;
      video.currentTime = 0;
    }

    const fps = 30; // 30fps is plenty for a caption overlay and halves the encode/render load vs 60fps
    const duration = Math.max(1, config.totalDuration || (video && video.duration > 0 ? video.duration : 10));
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    let audioStream = null;
    if (video && video.captureStream) {
      try {
        const stream = video.captureStream();
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) audioStream = new MediaStream([audioTracks[0]]);
      } catch (err) {
        console.warn('Could not capture audio stream from video element:', err);
      }
    }

    const canvasStream = canvas.captureStream(fps);
    const combinedTracks = [...canvasStream.getVideoTracks()];
    if (audioStream) combinedTracks.push(...audioStream.getAudioTracks());
    const recordingStream = new MediaStream(combinedTracks);

    // NOTE: intentionally NOT offering 'video/mp4' here. MediaRecorder reports it as
    // "supported" in current Chrome, but recording a *combined* stream (canvas video
    // track + a foreign audio track pulled from the <video> element) into an MP4
    // container frequently produces a completely empty (0 byte) file — a known
    // MediaRecorder limitation. WebM recording of combined streams is reliable, so we
    // stick to it here; a real .mp4 is produced by the WebCodecs path above instead.
    const candidateMimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    let mimeType = '';
    for (const type of candidateMimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    if (!mimeType) mimeType = 'video/webm';

    const recordedChunks = [];
    const recorderOptions = { videoBitsPerSecond: estimateBitrate(canvasWidth, canvasHeight, fps), mimeType };
    const mediaRecorder = new MediaRecorder(recordingStream, recorderOptions);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      cleanup();
      if (cancelled) return;
      const actualType = mimeType || 'video/webm';
      const blob = new Blob(recordedChunks, { type: actualType });

      if (blob.size === 0) {
        if (onError) {
          onError(new Error('File xuất ra rỗng (0 KB). Hãy thử lại hoặc dùng trình duyệt Chrome/Edge bản mới nhất.'));
        }
        return;
      }

      const url = URL.createObjectURL(blob);
      const ext = actualType.includes('mp4') ? 'mp4' : 'webm';
      onComplete({ url, blob, filename: `ytb_caption_export.${ext}` });
    };

    if (video && video.src) {
      await video.play().catch((err) => {
        console.warn('Video play auto-start failed during export:', err);
      });
    }

    mediaRecorder.start(100);

    // requestAnimationFrame + performance.now() gives a self-correcting clock instead of
    // setInterval's fixed callback, which drifts under load and is a common cause of judder.
    let startPerf = null;

    const tick = (now) => {
      if (cancelled) return;
      if (startPerf === null) startPerf = now;
      let elapsedTime = (now - startPerf) / 1000;

      if (video && !video.paused && video.currentTime > 0 && video.currentTime <= duration) {
        elapsedTime = Math.max(elapsedTime, video.currentTime);
      }

      const cappedTime = Math.min(elapsedTime, duration);

      renderCanvasFrame(ctx, canvasWidth, canvasHeight, video, avatarImgRef.current, config, cappedTime, {
        isPlaying: true,
        isExporting: true,
      });

      onProgress(Math.min(100, Math.round((cappedTime / duration) * 100)));

      if (elapsedTime >= duration) {
        cleanup();
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return {
      cancel: () => {
        cancelled = true;
        cleanup();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      },
    };
  } catch (err) {
    cleanup();
    if (onError) onError(err);
  }
}

export async function exportVideoTrack(params) {
  if (supportsWebCodecsExport()) {
    try {
      return await exportViaWebCodecs(params);
    } catch (err) {
      console.warn('WebCodecs MP4 export unavailable, falling back to MediaRecorder:', err);
    }
  }
  return exportViaMediaRecorder(params);
}
