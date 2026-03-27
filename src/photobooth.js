// photobooth.js - Virtual Photo Booth Module
export function initPhotoBooth() {
    const boothSection = document.getElementById('photobooth');
    const btnOpen = document.getElementById('btn-open-booth');
    const boothModal = document.getElementById('booth-modal');
    const btnClose = document.getElementById('btn-close-booth');
    const cameraContainer = document.getElementById('camera-container');
    const videoEl = document.getElementById('booth-video');
    const canvasEl = document.getElementById('booth-canvas');
    const btnCapture = document.getElementById('btn-capture');
    const previewEl = document.getElementById('booth-preview');
    const previewImg = document.getElementById('booth-preview-img');
    const btnRetake = document.getElementById('btn-retake');
    const btnDownload = document.getElementById('btn-download');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    if (!boothModal || !videoEl || !canvasEl) return;

    let stream = null;

    // --- Open / Close Booth ---
    const openBooth = async () => {
        boothModal.classList.remove('hidden');
        boothModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: {ideal: 1080}, height: {ideal: 1080} },
                audio: false
            });
            videoEl.srcObject = stream;
            videoEl.play();
        } catch (err) {
            alert('Tidak bisa mengakses kamera. Pastikan Anda mengizinkan akses kamera di browser Anda.');
            closeBooth();
        }
    };

    const closeBooth = () => {
        boothModal.classList.add('hidden');
        boothModal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        // Reset to camera view
        previewEl?.classList.add('hidden');
        cameraContainer?.classList.remove('hidden');
        btnCapture?.classList.remove('hidden');
        btnRetake?.classList.add('hidden');
        btnDownload?.classList.add('hidden');
        btnWhatsapp?.classList.add('hidden');
    };

    btnOpen?.addEventListener('click', openBooth);
    btnClose?.addEventListener('click', closeBooth);

    // --- Capture Photo ---
    btnCapture?.addEventListener('click', () => {
        const ctx = canvasEl.getContext('2d');
        const size = 1080;
        canvasEl.width = size;
        canvasEl.height = size;

        // Draw video (center-crop to square)
        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        const cropSize = Math.min(vw, vh);
        const sx = (vw - cropSize) / 2;
        const sy = (vh - cropSize) / 2;

        // Mirror the image (selfie mode)
        ctx.save();
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoEl, sx, sy, cropSize, cropSize, 0, 0, size, size);
        ctx.restore();

        // Draw frame overlay using canvas drawing
        drawFrame(ctx, size);

        // Show preview
        const dataUrl = canvasEl.toDataURL('image/png');
        previewImg.src = dataUrl;
        previewEl.classList.remove('hidden');
        cameraContainer.classList.add('hidden');
        btnCapture.classList.add('hidden');
        // Show secondary buttons
        btnRetake?.classList.remove('hidden');
        btnDownload?.classList.remove('hidden');
        btnWhatsapp?.classList.remove('hidden');
    });

    // --- Retake ---
    btnRetake?.addEventListener('click', () => {
        previewEl.classList.add('hidden');
        cameraContainer.classList.remove('hidden');
        btnCapture.classList.remove('hidden');
        btnRetake?.classList.add('hidden');
        btnDownload?.classList.add('hidden');
        btnWhatsapp?.classList.add('hidden');
    });

    // --- Download ---
    btnDownload?.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'aqiqah-naysila-photobooth.png';
        link.href = canvasEl.toDataURL('image/png');
        link.click();
    });

    // --- Share to WhatsApp ---
    btnWhatsapp?.addEventListener('click', async () => {
        try {
            const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'aqiqah-naysila-photobooth.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Aqiqah Naysila - Photo Booth',
                    text: 'Momen bahagia dari Aqiqah Naysila Nadine Maryam Azzahra 💕 #AqiqahNaysila',
                    files: [file]
                });
            } else {
                // Fallback: open WhatsApp with text only
                const text = encodeURIComponent('Momen bahagia dari Aqiqah Naysila Nadine Maryam Azzahra 💕 #AqiqahNaysila');
                window.open(`https://wa.me/?text=${text}`, '_blank');
            }
        } catch (err) {
            // Fallback
            const text = encodeURIComponent('Momen bahagia dari Aqiqah Naysila Nadine Maryam Azzahra 💕 #AqiqahNaysila');
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }
    });
}

// --- Draw Islamic Pastel Frame on Canvas ---
function drawFrame(ctx, size) {
    const borderWidth = 50;
    const cornerSize = 90;

    // Semi-transparent pastel border
    ctx.save();

    // Top border
    ctx.fillStyle = 'rgba(193, 154, 107, 0.7)';  // Warm gold
    ctx.fillRect(0, 0, size, borderWidth);
    // Bottom border
    ctx.fillRect(0, size - borderWidth - 60, size, borderWidth + 60);
    // Left border
    ctx.fillRect(0, 0, borderWidth, size);
    // Right border
    ctx.fillRect(size - borderWidth, 0, borderWidth, size);

    // Inner border line accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(borderWidth + 8, borderWidth + 8, size - (borderWidth + 8) * 2, size - (borderWidth + 8) * 2 - 60);

    // Corner ornaments (Islamic geometric stars)
    drawCornerOrnament(ctx, borderWidth, borderWidth, cornerSize, 1, 1);
    drawCornerOrnament(ctx, size - borderWidth, borderWidth, cornerSize, -1, 1);
    drawCornerOrnament(ctx, borderWidth, size - borderWidth - 60, cornerSize, 1, -1);
    drawCornerOrnament(ctx, size - borderWidth, size - borderWidth - 60, cornerSize, -1, -1);

    // Top text: Bismillah
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('﷽', size / 2, 38);

    // Bottom text area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 32px "Noto Serif", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aqiqah Naysila', size / 2, size - 62);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('02 April 2026  •  #AqiqahNaysila', size / 2, size - 30);

    // Crescent moon icon near top corners
    drawCrescent(ctx, 85, 26, 10);
    drawCrescent(ctx, size - 85, 26, 10);

    ctx.restore();
}

function drawCornerOrnament(ctx, cx, cy, size, dx, dy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dx, dy);

    // Islamic 8-pointed star
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const points = 8;
    const outerR = size * 0.35;
    const innerR = outerR * 0.45;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI * i) / points - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Center dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawCrescent(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(193, 154, 107, 0.7)';
    ctx.beginPath();
    ctx.arc(cx + r * 0.35, cy - r * 0.1, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
