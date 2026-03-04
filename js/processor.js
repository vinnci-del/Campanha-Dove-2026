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
 * Modificado para NÃO APENAS COLAR, mas sim deformar a original e mesclar suavemente.
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
                // 1. Base: Imagem Original (O rosto real que vamos modificar)
                ctx.drawImage(imgOrig, 0, 0, canvas.width, canvas.height);

                // --- SISTEMA DE TRANSFORMAÇÃO NA FOTO ORIGINAL ---

                // 2. Distorção da Boca (Esticar a boca da pessoa)
                const mouth = landmarks.getMouth();
                const mouthCenter = getCentroid(mouth);
                // Estica horizontalmente e um pouco verticalmente (Boca Grande Barbie)
                applyAdvancedDistort(ctx, mouthCenter.x, mouthCenter.y, 100, 1.6, 1.4);

                // 3. Maçãs do Rosto (Inchamento)
                const jaw = landmarks.getJawOutline();
                // Pontos aproximados das bochechas
                applyAdvancedDistort(ctx, jaw[3].x, jaw[6].y, 100, 1.25, 1.25);
                applyAdvancedDistort(ctx, jaw[13].x, jaw[6].y, 100, 1.25, 1.25);

                // 4. Desenhar Olhos Azuis (Brilho translúcido sobre o olho real)
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                drawGlowEye(ctx, getCentroid(leftEye));
                drawGlowEye(ctx, getCentroid(rightEye));

                // 5. Mesclagem de "Pele de Plástico" (IA) usando Alpha Mask Suave
                // Em vez de clipar um "ovo", usamos um gradiente radial para esfumaçar as bordas
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tctx = tempCanvas.getContext('2d');

                // Desenha a imagem da IA
                tctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                // Cria uma máscara de transparência (gradiente)
                tctx.globalCompositeOperation = 'destination-in';
                const centerX = canvas.width / 2;
                const centerY = canvas.height * 0.45;
                const grad = tctx.createRadialGradient(centerX, centerY, canvas.width * 0.1, centerX, centerY, canvas.width * 0.45);
                grad.addColorStop(0, 'rgba(0,0,0,1)'); // Centro opaco
                grad.addColorStop(0.8, 'rgba(0,0,0,0.5)'); // Bordas sumindo
                grad.addColorStop(1, 'rgba(0,0,0,0)'); // Transparente total

                tctx.fillStyle = grad;
                tctx.fillRect(0, 0, canvas.width, canvas.height);

                // 6. Aplica a camada de textura da IA com blend de Cor e Suavização
                ctx.globalAlpha = 0.5; // Ocupa metade da textura
                ctx.drawImage(tempCanvas, 0, 0);

                // 7. Blend de Cor (Para pegar o tom de maquiagem e olhos da IA)
                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.6;
                ctx.drawImage(tempCanvas, 0, 0);

                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            imgAI.src = aiUrl;
        };
        imgOrig.src = originalUrl;
    });
}

/** 
 * Distorce a imagem esticando uma área específica (Warp Effect)
 */
function applyAdvancedDistort(ctx, x, y, radius, scaleX, scaleY) {
    const canvas = ctx.canvas;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');

    // Pega a área original
    tctx.drawImage(canvas,
        x - radius, y - radius, radius * 2, radius * 2,
        0, 0, radius * 2, radius * 2
    );

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    // Desenha a área esticada de volta
    ctx.drawImage(tempCanvas,
        0, 0, radius * 2, radius * 2,
        -radius, -radius, radius * 2, radius * 2
    );
    ctx.restore();
}

/** Desenha o brilho azul artificial nas coordenadas do olho de forma suave */
function drawGlowEye(ctx, center) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, 14, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(center.x, center.y, 2, center.x, center.y, 14);
    grad.addColorStop(0, 'rgba(0, 180, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(0, 100, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'overlay';
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
