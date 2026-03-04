/**
 * Harmonização Artificial Exagerada (Distorção Visual)
 * Simula: Boca grande, maçãs do rosto inchadas, olhos azuis, queixo definido e maquiagem pesada.
 */
function generateAlgoritmica(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Fundo Base
    ctx.drawImage(img, 0, 0);

    // 2. Ultra Suavização de Pele (Filtro 'Plástico')
    ctx.globalAlpha = 1.0;
    ctx.filter = 'blur(1px) brightness(1.1) contrast(1.1) saturate(1.3)';
    ctx.drawImage(img, 0, 0);

    // 3. Simulação de "Distorções de Preenchimento" (Face Contouring com Gradientes)
    // Maçãs do rosto (iluminação exagerada)
    const cheekGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.4);
    cheekGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    cheekGlow.addColorStop(0.6, 'rgba(255, 200, 200, 0.1)');
    cheekGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cheekGlow;
    ctx.fillRect(0, 0, w, h);

    // 4. Maquiagem Pesada (Sombras e Batom)
    // Sombra nos olhos (escuro)
    ctx.fillStyle = 'rgba(40, 0, 60, 0.3)';
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.4, w * 0.1, h * 0.05, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.65, h * 0.4, w * 0.1, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Batom (vermelho vivo/exagerado)
    ctx.fillStyle = 'rgba(255, 0, 50, 0.4)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.75, w * 0.15, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos Azuis (Simulação de íris)
    ctx.fillStyle = 'rgba(0, 150, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(w * 0.35, h * 0.4, w * 0.03, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h * 0.4, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // 5. Queixo Definido (Contorno inferior)
    ctx.lineWidth = 15;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.7);
    ctx.quadraticCurveTo(w * 0.5, h * 0.95, w * 0.8, h * 0.7);
    ctx.stroke();

    // 6. Aplicar Distorção Geométrica (Efeito Liquify)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, w, h);

    // Distorção para alargar maçãs/boca (escala não-linear)
    // Dividimos a imagem em faixas para esticar o centro
    const sliceCount = 30;
    const sliceH = h / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
        const sx = 0;
        const sy = i * sliceH;
        const sWidth = w;
        const sHeight = sliceH;

        // Fator de escala horizontal baseado na altura (maior no meio e na boca)
        let scale = 1.0;
        const relativeY = sy / h;
        if (relativeY > 0.35 && relativeY < 0.55) { // Maçãs
            scale = 1.08;
        } else if (relativeY > 0.65 && relativeY < 0.85) { // Boca
            scale = 1.15;
        }

        const dWidth = sWidth * scale;
        const dx = (w - dWidth) / 2;
        const dy = sy;
        const dHeight = sHeight;

        ctx.drawImage(tempCanvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    // Filtro final de nitidez artificial
    ctx.filter = 'contrast(1.2) brightness(1.05)';
    ctx.globalAlpha = 0.2;
    ctx.drawImage(tempCanvas, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.92);
}
