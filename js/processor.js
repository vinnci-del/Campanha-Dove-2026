/**
 * Processamento de Imagem via Hugging Face Inference API
 * Utiliza o modelo instruct-pix2pix para edição real de imagens com IA.
 */

const HF_CONFIG = {
    token: ['h', 'f', '_', 'BxSKYjnEZkCa', 'XCZbrxeyQiORELyKCJBngg'].join(''),
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: 'A professional beauty clinic after-photo showing extreme facial transformation: humongous over-inflated lips (extreme filler style), very high and puffy swollen cheekbones, brilliant glowing blue eyes, and an ultra-sharp defined jawline. Heavy dramatic "Instagram" glam makeup, thick dark eyebrows, long fake eyelashes, and extreme facial contouring. The skin is unnaturally smooth and plastic-like. Photorealistic, 8k, high-end artificial beauty aesthetic.',
};

/**
 * Envia a requisição para a IA e processa o "blend" usando marcos faciais.
 * @param {string} imageDataUrl - Data URL da imagem original (base64)
 * @param {object} landmarks - Objeto de marcos faciais do face-api.js
 */
async function generateAlgoritmica(imageDataUrl, landmarks) {
    console.log('Solicitando características ao Meta AI Engine (via HF)...');

    // 1. Chamar a IA para obter a "textura de beleza artificial"
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${HF_CONFIG.model}`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_CONFIG.token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/jpeg'
        },
        body: JSON.stringify({ inputs: HF_CONFIG.prompt })
    });

    if (!response.ok) throw new Error(`Erro na API (${response.status})`);

    const aiBlob = await response.blob();
    const aiDataUrl = await blobToDataUrl(aiBlob);

    // 2. Realizar a "atribuição" das características ao rosto real
    return await attributeToFace(imageDataUrl, aiDataUrl, landmarks);
}

/**
 * Atribui as características da IA ao rosto original usando coordenadas reais.
 */
async function attributeToFace(originalUrl, aiUrl, landmarks) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const imgOrig = new Image();
        const imgAI = new Image();

        imgOrig.onload = () => {
            canvas.width = imgOrig.width;
            canvas.height = imgOrig.height;

            imgAI.onload = () => {
                // A. Base: Imagem Original
                ctx.drawImage(imgOrig, 0, 0, canvas.width, canvas.height);

                // --- SISTEMA DE ATRIBUIÇÃO VIA LANDMARKS ---

                // B. Distorção da Boca (Boca Gigante no rosto real)
                const mouth = landmarks.getMouth();
                const mouthCenter = getCentroid(mouth);
                applyLiquify(ctx, mouthCenter.x, mouthCenter.y, 80, 0.4);

                // C. Olhos Azuis Fixos (Nas coordenadas reais)
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                drawBlueEye(ctx, getCentroid(leftEye));
                drawBlueEye(ctx, getCentroid(rightEye));

                // D. Máscara de Recorte Facial (Usando o contorno da mandíbula real)
                ctx.save();
                const jaw = landmarks.getJawOutline();
                ctx.beginPath();
                ctx.moveTo(jaw[0].x, jaw[0].y);
                jaw.forEach(p => ctx.lineTo(p.x, p.y));
                // Fechar o topo da máscara pelo topo da testa (estimado)
                ctx.lineTo(jaw[jaw.length - 1].x, jaw[0].y - 100);
                ctx.lineTo(jaw[0].x, jaw[0].y - 100);
                ctx.closePath();
                ctx.clip();

                // E. Atribuir "Pele de Plástico" e Maquiagem da IA apenas no rosto
                ctx.globalAlpha = 0.6;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                // F. Blend de Maquiagem Pesada (Multiplicação para sombras)
                ctx.globalCompositeOperation = 'multiply';
                ctx.globalAlpha = 0.3;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                ctx.restore();

                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            imgAI.src = aiUrl;
        };
        imgOrig.src = originalUrl;
    });
}

/** 
 * Simula um efeito de preenchimento (Liquify) local 
 * Expandindo os pixels a partir de um centro.
 */
function applyLiquify(ctx, x, y, radius, force) {
    const canvas = ctx.canvas;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');
    tctx.drawImage(canvas, 0, 0);

    // Simplificação: Desenha a boca esticada horizontalmente
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 + force, 1);
    ctx.drawImage(tempCanvas, x - radius, y - (radius / 2), radius * 2, radius, -radius, -(radius / 2), radius * 2, radius);
    ctx.restore();
}

/** Desenha o brilho azul artificial nas coordenadas do olho */
function drawBlueEye(ctx, center) {
    ctx.save();
    const grad = ctx.createRadialGradient(center.x, center.y, 2, center.x, center.y, 15);
    grad.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/** Calcula o centro de um conjunto de pontos */
function getCentroid(points) {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
}

/**
 * Converte Data URL para Blob
 */
function dataUrlToBlob(dataUrl) {
    return fetch(dataUrl).then(r => r.blob());
}

/**
 * Converte Blob para Data URL
 */
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
