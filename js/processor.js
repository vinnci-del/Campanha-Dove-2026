/**
 * Harmonização Artificial Exagerada (Distorção Visual)
 * Simula: Boca grande, maçãs do rosto inchadas, olhos azuis, queixo definido e maquiagem pesada.
 */
function generateAlgoritmica(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Trabalhar com uma resolução consistente para os cálculos de posição
    canvas.width = 800;
    canvas.height = 1000;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Fundo Base (Redimensionado)
    ctx.drawImage(img, 0, 0, w, h);

    // 2. Ultra Suavização de Pele (Efeito "Filtro de IA")
    // Criamos uma camada de blur suave para dar aquele aspecto de pele perfeita/plastificada
    const skinCanvas = document.createElement('canvas');
    skinCanvas.width = w;
    skinCanvas.height = h;
    const sctx = skinCanvas.getContext('2d');
    sctx.filter = 'blur(4px) saturate(1.2) brightness(1.05)';
    sctx.drawImage(canvas, 0, 0);

    ctx.globalAlpha = 0.6;
    ctx.drawImage(skinCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // 3. Olhos Azuis (Simulando lentes de contato)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 100, 255, 0.25)';
    ctx.filter = 'blur(2px)';
    // Posições estimadas baseadas no crop centralizado
    ctx.beginPath();
    ctx.arc(w * 0.36, h * 0.42, w * 0.035, 0, Math.PI * 2);
    ctx.arc(w * 0.64, h * 0.42, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Maquiagem e Contorno (Maçãs e Queixo)
    // Maçãs do rosto (Highlights exagerados)
    const cheekHighlight = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.4);
    cheekHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    cheekHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    cheekHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.save();
    ctx.translate(w * 0.25, h * 0.55); // Maçã esquerda
    ctx.scale(1, 0.6);
    ctx.fillStyle = cheekHighlight;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(w * 0.75, h * 0.55); // Maçã direita
    ctx.scale(1, 0.6);
    ctx.fillStyle = cheekHighlight;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Boca Grande (Batom e Volume)
    ctx.save();
    ctx.filter = 'blur(3px)';
    ctx.fillStyle = 'rgba(210, 50, 80, 0.25)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.74, w * 0.18, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Aplicar Distorção (Liquify/Estiramento)
    const distCanvas = document.createElement('canvas');
    distCanvas.width = w;
    distCanvas.height = h;
    const dctx = distCanvas.getContext('2d');
    dctx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, w, h);

    // Técnica de mesh distortion simplificada (fatiamento horizontal com escala variável)
    const slices = 50;
    const sliceH = h / slices;

    for (let i = 0; i < slices; i++) {
        const sy = i * sliceH;
        let scaleX = 1.0;

        const relY = sy / h;
        // Distorção na área das maçãs
        if (relY > 0.45 && relY < 0.65) {
            const t = (relY - 0.45) / 0.2; // 0 a 1
            scaleX = 1 + Math.sin(t * Math.PI) * 0.12;
        }
        // Distorção na área da boca
        if (relY > 0.68 && relY < 0.85) {
            const t = (relY - 0.68) / 0.17; // 0 a 1
            scaleX = 1 + Math.sin(t * Math.PI) * 0.18;
        }

        const sw = w;
        const dw = w * scaleX;
        const dx = (w - dw) / 2;

        ctx.drawImage(distCanvas, 0, sy, sw, sliceH, dx, sy, dw, sliceH);
    }

    // 7. Nitidez Artificial Final (Oversharpened look)
    ctx.save();
    ctx.filter = 'contrast(1.15) brightness(1.02)';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(distCanvas, 0, 0);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
}
