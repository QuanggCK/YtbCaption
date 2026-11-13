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

// Cache the last computed "auto-fit" font size so we don't re-run the
// expensive measureText() loop on every single exported frame — the fitted
// size only ever changes when the inputs that affect it change.
let fontFitCache = { key: null, fontSize: null };

function getFittedFontSize(ctx, config, rawLines, maxTextWidth, maxTextHeight) {
  const key = [
    config.captionText,
    config.fontSize,
    config.fontWeight,
    config.fontFamily,
    config.lineHeight,
    maxTextWidth,
    maxTextHeight
  ].join('|');

  if (fontFitCache.key === key) {
    return fontFitCache.fontSize;
  }

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

  fontFitCache = { key, fontSize: effectiveFontSize };
  return effectiveFontSize;
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
  if (elapsed < entranceSpeed && entranceSpeed > 0 && entranceAnimation !== 'none') {
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
    } else if (entranceAnimation === 'split') {
      // Xuất hiện từ ở giữa tách rộng ra 2 bên
      opacity = Math.min(1, progress * 3);
      const splitProgress = easeOutBack(progress);
      return { visible: true, opacity, scale: 1, offsetX: 0, offsetY: 0, glitchRgb: 0, splitProgress };
    }
  } 
  // 2. Exit Phase
  else if (remaining < exitSpeed && exitSpeed > 0 && exitAnimation !== 'none') {
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
    } else if (exitAnimation === 'fold') {
      // Gập vào ở giữa lại
      opacity = Math.min(1, progress * 2.5);
      const splitProgress = Math.pow(progress, 1.8);
      return { visible: true, opacity, scale: 1, offsetX: 0, offsetY: 0, glitchRgb: 0, splitProgress };
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
    glitchRgb,
    splitProgress: 1
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
  const borderWidth = config.borderWidth || 10;
  const avatarSize = config.avatarSize || 150;
  const frameStyle = config.frameStyle || 'classic';
  const splitProgress = Math.max(0, anim.splitProgress !== undefined ? anim.splitProgress : 1);

  // ================= STYLE A: SPLIT BRACKET FRAME (Khung Góc Tách / Gập như ảnh mẫu) =================
  if (frameStyle === 'splitBracket') {
    const drawBracketContent = (offsetColor = null, channelX = 0, channelY = 0) => {
      ctx.save();
      if (channelX !== 0 || channelY !== 0) {
        ctx.translate(channelX, channelY);
      }

      const showAvatar = config.showAvatar && avatarImageElement;
      const avatarOverlap = showAvatar ? (config.avatarOverlap || 50) : 0;
      const bannerX = showAvatar ? avatarOverlap : 0;
      const bannerY = showAvatar ? (avatarSize - bannerHeight) / 2 : 0;

      const centerX = bannerX + bannerWidth / 2;
      const centerY = bannerY + bannerHeight / 2;
      const halfW = bannerWidth / 2;
      const halfH = bannerHeight / 2;

      const wDist = halfW * Math.min(1.05, splitProgress);
      const hDist = halfH * Math.min(1.05, splitProgress);

      const tlX = centerX - wDist;
      const tlY = centerY - hDist;
      const brX = centerX + wDist;
      const brY = centerY + hDist;

      // Inner background fill
      if (config.bgColor && config.bgColor !== 'transparent' && wDist > 0 && hDist > 0) {
        if (config.bgType === 'gradient') {
          const grad = ctx.createLinearGradient(tlX, tlY, brX, brY);
          grad.addColorStop(0, config.bgColor1 || '#38bdf8');
          grad.addColorStop(1, config.bgColor2 || '#0284c7');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = config.bgColor;
        }
        ctx.fillRect(tlX, tlY, Math.max(0, wDist * 2), Math.max(0, hDist * 2));
      }

      // Bracket Angle Corner Arms
      const armW = Math.min(90, Math.max(40, bannerWidth * 0.22));
      const armH = Math.min(70, Math.max(30, bannerHeight * 0.35));
      const activeArmW = armW * Math.min(1, splitProgress * 1.4);
      const activeArmH = armH * Math.min(1, splitProgress * 1.4);
      const bColor = offsetColor || config.borderColor || '#0066ff';

      ctx.fillStyle = bColor;

      // 1. Top-Left Bracket Angle (┌)
      ctx.fillRect(tlX, tlY, activeArmW, borderWidth);
      ctx.fillRect(tlX, tlY, borderWidth, activeArmH);

      // 2. Bottom-Right Bracket Angle (┘)
      ctx.fillRect(brX - activeArmW, brY - borderWidth, activeArmW, borderWidth);
      ctx.fillRect(brX - borderWidth, brY - activeArmH, borderWidth, activeArmH);

      // 3. Optional 4-corners mode
      if (config.bracketMode === '4corners') {
        // Top-Right Bracket Angle (┐)
        ctx.fillRect(brX - activeArmW, tlY, activeArmW, borderWidth);
        ctx.fillRect(brX - borderWidth, tlY, borderWidth, activeArmH);

        // Bottom-Left Bracket Angle (└)
        ctx.fillRect(tlX, brY - borderWidth, activeArmW, borderWidth);
        ctx.fillRect(tlX, brY - activeArmH, borderWidth, activeArmH);
      }

      // Render Text inside Split Clip Mask
      if (wDist > 4 && hDist > 4) {
        ctx.save();
        ctx.beginPath();
        const clipPad = borderWidth * 0.5;
        ctx.rect(
          tlX + clipPad,
          tlY + clipPad,
          Math.max(0, wDist * 2 - clipPad * 2),
          Math.max(0, hDist * 2 - clipPad * 2)
        );
        ctx.clip();

        const textPaddingLeft = showAvatar ? (avatarSize - avatarOverlap + 20) : 32;
        const maxTextWidth = Math.max(50, bannerWidth - textPaddingLeft - 20);
        const maxTextHeight = Math.max(30, bannerHeight - 20);

        const rawLines = (config.captionText || 'Caption here').split('\n');
        const effectiveFontSize = getFittedFontSize(ctx, config, rawLines, maxTextWidth, maxTextHeight);

        const alignMode = config.textAlign || (showAvatar ? 'left' : 'center');
        ctx.font = `${config.fontWeight || '700'} ${effectiveFontSize}px "${config.fontFamily || 'Oswald'}", sans-serif`;
        ctx.textAlign = alignMode;
        ctx.textBaseline = 'middle';

        const lineHeight = effectiveFontSize * (config.lineHeight || 1.15);
        const totalTextHeight = (rawLines.length - 1) * lineHeight;

        let textX = centerX;
        if (showAvatar) {
          const availLeft = bannerX + textPaddingLeft;
          const availWidth = bannerWidth - textPaddingLeft;
          if (alignMode === 'center') textX = availLeft + availWidth / 2;
          else if (alignMode === 'right') textX = availLeft + availWidth - 20;
          else textX = availLeft;
        } else {
          if (alignMode === 'right') textX = centerX + halfW - 36;
          else if (alignMode === 'left') textX = centerX - halfW + 36;
          else textX = centerX;
        }

        const textY = centerY;
        let currentY = textY - (totalTextHeight / 2);

        rawLines.forEach((line) => {
          if (config.textGlow) {
            ctx.shadowColor = config.shadowColor || 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = config.shadowBlur || 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          } else {
            ctx.shadowColor = 'transparent';
          }

          if (config.textStrokeWidth && config.textStrokeWidth > 0) {
            ctx.strokeStyle = config.textStrokeColor || '#ffffff';
            ctx.lineWidth = config.textStrokeWidth;
            ctx.lineJoin = 'round';
            ctx.strokeText(line, textX, currentY);
          }

          ctx.fillStyle = offsetColor || config.textColor || '#000000';
          ctx.fillText(line, textX, currentY);
          currentY += lineHeight;
        });

        ctx.restore();
      }

      ctx.restore();
    };

    if (anim.glitchRgb > 0) {
      drawBracketContent('rgba(255, 0, 80, 0.7)', -anim.glitchRgb, 0);
      drawBracketContent('rgba(0, 240, 255, 0.7)', anim.glitchRgb, 0);
    }
    drawBracketContent();
    ctx.restore();
    return;
  }

  // ================= STYLE B: CLASSIC ROUNDED BANNER =================
  // Banner starts at X offset to allow avatar overlap on left
  const avatarOverlap = config.avatarOverlap !== undefined ? config.avatarOverlap : 50;
  const bannerX = avatarOverlap;
  const bannerY = (avatarSize - bannerHeight) / 2;

  // Apply splitProgress transform for classic banner if split/fold active
  if (splitProgress < 1) {
    const cX = bannerX + bannerWidth / 2;
    const cY = bannerY + bannerHeight / 2;
    ctx.translate(cX, cY);
    ctx.scale(splitProgress, Math.max(0.05, splitProgress));
    ctx.translate(-cX, -cY);
  }

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
    const effectiveFontSize = getFittedFontSize(ctx, config, rawLines, maxTextWidth, maxTextHeight);

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

      // Text Stroke (Nét viền chữ)
      if (config.textStrokeWidth && config.textStrokeWidth > 0) {
        ctx.strokeStyle = config.textStrokeColor || '#ffffff';
        ctx.lineWidth = config.textStrokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(line, textX, currentY);
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
