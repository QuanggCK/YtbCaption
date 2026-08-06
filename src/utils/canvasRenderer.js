/**
 * Canvas Renderer Engine for YtbCaption
 * Renders video frame + animated caption overlay (Avatar + Banner + Text) with Fade, Bounce, and Glitch animations.
 */

// Easing math helpers
export function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Calculates current animation transform values (opacity, scale, offsetX, offsetY, glitchOffset)
 */
export function getAnimationState(currentTime, config, options = {}) {
  const { startTime, duration, entranceSpeed, exitSpeed, entranceAnimation, exitAnimation } = config;
  const endTime = startTime + duration;
  const { isPlaying = false, isExporting = false } = options;

  // In Edit Mode (when paused and not exporting), ensure the caption is always visible so user can see their edits
  if (!isPlaying && !isExporting) {
    return { visible: true, opacity: 1, scale: 1, offsetX: 0, offsetY: 0, glitchRgb: 0 };
  }

  // During video playback or exporting: enforce timing lifespan
  if (currentTime < startTime || currentTime > endTime) {
    return { visible: false, opacity: 0, scale: 0, offsetX: 0, offsetY: 0, glitchRgb: 0 };
  }

  const elapsed = currentTime - startTime;
  const remaining = endTime - currentTime;

  let opacity = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let glitchRgb = 0;

  // 1. Entrance Phase
  if (elapsed < entranceSpeed && entranceSpeed > 0) {
    const progress = Math.min(1, elapsed / entranceSpeed);
    
    if (entranceAnimation === 'fade') {
      opacity = progress;
      scale = 0.95 + progress * 0.05;
    } else if (entranceAnimation === 'bounce') {
      opacity = Math.min(1, progress * 2);
      scale = easeOutBack(progress);
    } else if (entranceAnimation === 'glitch') {
      opacity = progress > 0.1 ? 1 : 0;
      glitchRgb = Math.sin(progress * Math.PI * 10) * 12 * (1 - progress);
      offsetX = (Math.random() - 0.5) * 16 * (1 - progress);
      offsetY = (Math.random() - 0.5) * 8 * (1 - progress);
      scale = 1 + (Math.random() - 0.5) * 0.08 * (1 - progress);
    }
  } 
  // 2. Exit Phase
  else if (remaining < exitSpeed && exitSpeed > 0) {
    const progress = Math.min(1, remaining / exitSpeed); // 1 down to 0
    
    if (exitAnimation === 'fade') {
      opacity = progress;
      scale = 0.95 + progress * 0.05;
    } else if (exitAnimation === 'bounce') {
      opacity = progress;
      scale = progress * progress;
    } else if (exitAnimation === 'glitch') {
      opacity = progress < 0.1 ? 0 : 1;
      glitchRgb = Math.sin((1 - progress) * Math.PI * 10) * 15;
      offsetX = (Math.random() - 0.5) * 20;
      offsetY = (Math.random() - 0.5) * 10;
      scale = 1 + (Math.random() - 0.5) * 0.1;
    }
  }
  // 3. Active Mid-Phase (Continuous Glitch effect option if enabled)
  else if (entranceAnimation === 'glitch' || exitAnimation === 'glitch') {
    // Subtle intermittent micro glitch
    if (Math.random() > 0.92) {
      glitchRgb = (Math.random() - 0.5) * 6;
      offsetX = (Math.random() - 0.5) * 4;
    }
  }

  return {
    visible: true,
    opacity,
    scale,
    offsetX,
    offsetY,
    glitchRgb
  };
}

/**
 * Draws rounded rectangle path on canvas
 */
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Main Frame Rendering Call
 */
export function renderCanvasFrame(ctx, canvasWidth, canvasHeight, videoElement, avatarImageElement, config, currentTime, options = {}) {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Background (Video or Fallback Background)
  if (videoElement && videoElement.readyState >= 2) {
    ctx.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight);
  } else {
    // Gradient dark background preview
    const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    bgGrad.addColorStop(0, '#0b1329');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
    }
  }

  // 2. Check Animation Lifecycle
  const anim = getAnimationState(currentTime, config, options);
  if (!anim.visible || anim.opacity <= 0) return;

  // Save base state
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, anim.opacity));

  // Compute position (X, Y) based on canvas coordinates
  const scale = (config.scale || 1) * anim.scale;
  const posX = (config.posX / 100) * canvasWidth + anim.offsetX;
  const posY = (config.posY / 100) * canvasHeight + anim.offsetY;

  ctx.translate(posX, posY);
  ctx.scale(scale, scale);

  // Dimension settings
  const bannerWidth = config.bannerWidth || 540;
  const bannerHeight = config.bannerHeight || 140;
  const borderRadius = config.borderRadius || 28;
  const borderWidth = config.borderWidth || 8;
  const avatarSize = config.avatarSize || 150;
  
  // Banner starts at X offset to allow avatar overlap on left
  const avatarOverlap = config.avatarOverlap !== undefined ? config.avatarOverlap : 50;
  const bannerX = avatarOverlap;
  const bannerY = (avatarSize - bannerHeight) / 2;

  // Render function for Banner & Text
  const drawBannerContent = (offsetColor = null, channelX = 0, channelY = 0) => {
    ctx.save();
    if (channelX !== 0 || channelY !== 0) {
      ctx.translate(channelX, channelY);
    }

    // A. Outer Border Box
    drawRoundedRect(ctx, bannerX, bannerY, bannerWidth, bannerHeight, borderRadius);
    ctx.fillStyle = offsetColor || config.borderColor || '#00e5ff';
    ctx.fill();

    // B. Inner Banner Container Fill
    const innerMargin = borderWidth;
    const innerX = bannerX + innerMargin;
    const innerY = bannerY + innerMargin;
    const innerW = bannerWidth - (innerMargin * 2);
    const innerH = bannerHeight - (innerMargin * 2);
    const innerRadius = Math.max(4, borderRadius - innerMargin);

    drawRoundedRect(ctx, innerX, innerY, innerW, innerH, innerRadius);
    
    // Background fill (gradient or solid)
    if (config.bgType === 'gradient') {
      const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
      grad.addColorStop(0, config.bgColor1 || '#38bdf8');
      grad.addColorStop(1, config.bgColor2 || '#0284c7');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.bgColor || 'rgba(56, 189, 248, 0.85)';
    }
    ctx.fill();

    // C. Render Text inside Banner with Auto-Font-Fit Containment
    const textPaddingLeft = avatarSize - avatarOverlap + 20;
    const maxTextWidth = Math.max(50, innerW - (textPaddingLeft - innerMargin) - 20);
    const maxTextHeight = Math.max(30, innerH - 16);

    const rawLines = (config.captionText || 'Caption here').split('\n');
    let effectiveFontSize = config.fontSize || 40;
    const minFontSize = 10;

    // Iteratively scale down font size until all lines fit within maxTextWidth and maxTextHeight
    for (let fs = effectiveFontSize; fs >= minFontSize; fs -= 1) {
      ctx.font = `${config.fontWeight || '700'} ${fs}px "${config.fontFamily || 'Inter'}", sans-serif`;
      let fitsWidth = true;
      for (const line of rawLines) {
        if (ctx.measureText(line).width > maxTextWidth) {
          fitsWidth = false;
          break;
        }
      }
      const testLineHeight = fs * (config.lineHeight || 1.15);
      const totalH = rawLines.length * testLineHeight;
      if (fitsWidth && totalH <= maxTextHeight) {
        effectiveFontSize = fs;
        break;
      }
      effectiveFontSize = fs;
    }

    ctx.font = `${config.fontWeight || '700'} ${effectiveFontSize}px "${config.fontFamily || 'Inter'}", sans-serif`;
    ctx.textAlign = config.textAlign || 'left';
    ctx.textBaseline = 'middle';

    const lineHeight = effectiveFontSize * (config.lineHeight || 1.15);
    const totalTextHeight = (rawLines.length - 1) * lineHeight;
    const textX = bannerX + textPaddingLeft;
    const textY = bannerY + (bannerHeight / 2);
    let currentY = textY - (totalTextHeight / 2);

    rawLines.forEach((line) => {
      // Text Shadow/Glow
      if (config.textGlow) {
        ctx.shadowColor = config.shadowColor || 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = config.shadowBlur || 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = 'transparent';
      }

      ctx.fillStyle = offsetColor || config.textColor || '#000000';
      ctx.fillText(line, textX, currentY);
      currentY += lineHeight;
    });

    ctx.restore();
  };

  // D. Render Glitch Chromatic Aberration (if active)
  if (anim.glitchRgb > 0) {
    // Red Channel Shift
    drawBannerContent('rgba(255, 0, 80, 0.7)', -anim.glitchRgb, 0);
    // Cyan/Blue Channel Shift
    drawBannerContent('rgba(0, 240, 255, 0.7)', anim.glitchRgb, 0);
  }

  // Draw main banner
  drawBannerContent();

  // E. Draw Avatar Image Frame (Circle/Square)
  ctx.save();
  const avatarX = 0;
  const avatarY = 0;
  const avatarRadius = avatarSize / 2;
  const avatarCenterX = avatarX + avatarRadius;
  const avatarCenterY = avatarY + avatarRadius;

  // Outer ring glow/border for Avatar
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + (config.avatarBorderWidth || 4), 0, Math.PI * 2);
  ctx.fillStyle = config.avatarBorderColor || '#00e5ff';
  ctx.fill();

  // Avatar Clip Mask
  ctx.beginPath();
  if (config.avatarShape === 'square') {
    drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 16);
  } else {
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.clip();

  // Fill image or avatar placeholder
  if (avatarImageElement && avatarImageElement.complete && avatarImageElement.naturalWidth > 0) {
    ctx.drawImage(avatarImageElement, avatarX, avatarY, avatarSize, avatarSize);
  } else {
    // Default avatar gradient graphic
    const avGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    avGrad.addColorStop(0, '#00e5ff');
    avGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = avGrad;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QK', avatarCenterX, avatarCenterY);
  }

  ctx.restore(); // Restore avatar clip

  ctx.restore(); // Restore global transform
}
