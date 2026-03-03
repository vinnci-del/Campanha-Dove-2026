// BLOCO: Processamento de Imagem (Filtros IA)

/**
 * Super Harmonização Exagerada & Lúdica
 * Parâmetros: symmetry 0.99, smoothing 0.95, identity_preservation 0.30
 */
function generateAlgoritmica(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    // 1. Fundo Base
    ctx.drawImage(img, 0, 0);

    // 2. Ultra Suavização (Pele de Filtro Extremo)
    ctx.globalAlpha = 0.85;
    ctx.filter = 'blur(15px) brightness(1.2) contrast(1.1) saturate(1.4)';
    ctx.drawImage(img, 0, 0);

    // 3. Brilho Lúdico (Glow Colorido)
    ctx.globalAlpha = 0.4;
    ctx.filter = 'contrast(1.5) saturate(2.0) hue-rotate(10deg)';
    ctx.drawImage(img, 0, 0);

    // 4. Detalhes Artificiais (Sharpen Pasted Look)
    ctx.globalAlpha = 0.45;
    ctx.filter = 'contrast(2) brightness(1.1) saturate(1.5)';
    ctx.drawImage(img, 0, 0);

    // 5. Vinheta e Foco Central
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
    const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.8
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 6. "Distorção de Beleza"
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas,
        canvas.width * 0.05, 0, canvas.width * 0.9, canvas.height,
        0, 0, canvas.width, canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.90);
}
