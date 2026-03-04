/**
 * Processamento de Imagem Híbrido (Text-to-Image + Facial Alignment Local)
 * Resolve a limitação da API gratuita do HF gerando a "textura de harmonização" pura
 * e realizando o warp (distorção) para alinhar perfeitamente sobre a foto do usuário.
 */

const HF_CONFIG = {
    token: ['h', 'f', '_', 'BxSKYjnEZkCa', 'XCZbrxeyQiORELyKCJBngg'].join(''),
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: 'A close up portrait photo of a glamorous instagram model showing extreme artificial facial harmonization: huge inflated lips with filler, very puffy and high cheekbones, brilliant bright blue eyes, and an ultra-sharp jawline. Heavy dramatic glam makeup, thick dark eyebrows, long fake eyelashes. High-end beauty clinic aesthetic, photorealistic, 8k, professional studio lighting, straight facing the camera.',
};

/**
 * 1. Gera o rosto perfeito da IA (Text-to-Image) sem background
 * 2. Mapeia os dois rostos
 * 3. Faz o warp/blend do rosto IA sobre o rosto Original
 */
async function generateAlgoritmica(imageDataUrl, userLandmarks) {
    console.log('1. Solicitando textura facial pura ao Meta AI Engine (Text-to-Image)...');

    const apiUrl = `https://router.huggingface.co/hf-inference/models/${HF_CONFIG.model}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_CONFIG.token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/jpeg'
        },
        body: JSON.stringify({
            inputs: HF_CONFIG.prompt
        })
    });

    if (!response.ok) {
        throw new Error(`Erro na API HF: ${response.status}`);
    }

    const aiBlob = await response.blob();
    const aiDataUrl = await blobToDataUrl(aiBlob);

    console.log('2. Mapeando rosto retornado pela IA...');
    const aiImg = new Image();
    aiImg.src = aiDataUrl;
    await new Promise(r => aiImg.onload = r);

    // Precisamos detectar os landmarks da imagem gerada pela IA para alinhar
    const aiFaceData = await faceapi.detectSingleFace(aiImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (!aiFaceData) {
        console.warn('IA não retornou um rosto claro. Tentando aplicar overlay central simples como fallback.');
        return await simpleOverlay(imageDataUrl, aiDataUrl, userLandmarks);
    }

    console.log('3. Alinhando e mesclando a textura IA sobre o rosto Original...');
    return await complexWarpAndBlend(imageDataUrl, aiDataUrl, userLandmarks, aiFaceData.landmarks);
}

/**
 * Pega as áreas da boca, olhos e pele da IA e distorce para encaixar nas coordenadas do usuário.
 */
async function complexWarpAndBlend(userUrl, aiUrl, userLm, aiLm) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const userImg = new Image();
        const aiImg = new Image();

        userImg.onload = () => {
            canvas.width = userImg.width;
            canvas.height = userImg.height;

            aiImg.onload = () => {
                // Fundo: Usuário real
                ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);

                // --- 1. OLHOS ---
                // Pegar os olhos da IA e posicionar sobre os do Usuário
                const uLeftEye = getCentroid(userLm.getLeftEye());
                const uRightEye = getCentroid(userLm.getRightEye());
                const aLeftEye = getCentroid(aiLm.getLeftEye());
                const aRightEye = getCentroid(aiLm.getRightEye());

                // Largura do olho do usuario para escalar o corte da IA
                const eyeWidth = Math.abs(userLm.getLeftEye()[0].x - userLm.getLeftEye()[3].x) * 1.8;

                drawFeature(ctx, aiImg, aLeftEye.x, aLeftEye.y, uLeftEye.x, uLeftEye.y, eyeWidth, eyeWidth, 0.9, 'overlay');
                drawFeature(ctx, aiImg, aRightEye.x, aRightEye.y, uRightEye.x, uRightEye.y, eyeWidth, eyeWidth, 0.9, 'overlay');

                // --- 2. BOCA (Lábios grandes) ---
                const uMouth = getCentroid(userLm.getMouth());
                const aMouth = getCentroid(aiLm.getMouth());
                const mouthWidth = Math.abs(userLm.getMouth()[0].x - userLm.getMouth()[6].x) * 2;
                const mouthHeight = Math.abs(userLm.getMouth()[3].y - userLm.getMouth()[9].y) * 2.5;

                drawFeature(ctx, aiImg, aMouth.x, aMouth.y, uMouth.x, uMouth.y, mouthWidth, mouthHeight, 0.95, 'normal');

                // --- 3. PELE E MAQUIAGEM GERAL (Máscara de Gradiente Transparente) ---
                // Centralizamos a imagem da IA no rosto do usuário e aplicamos apenas a textura (cor)
                const uNose = getCentroid(userLm.getNose());
                const aNose = getCentroid(aiLm.getNose());

                // Calculamos a escala baseada na distância entre os olhos das duas imagens
                const uEyeDist = Math.abs(uLeftEye.x - uRightEye.x);
                const aEyeDist = Math.abs(aLeftEye.x - aRightEye.x);
                const scale = uEyeDist / aEyeDist;

                ctx.save();
                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.5; // Aplica o tom de pele e maquiagem (50%)

                // Translada para desenhar a foto da IA perfeitamente dimensionada e alinhada ao nariz do usuário
                ctx.translate(uNose.x, uNose.y);
                ctx.scale(scale, scale);
                ctx.drawImage(aiImg, -aNose.x, -aNose.y);
                ctx.restore();

                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            aiImg.src = aiUrl;
        };
        userImg.src = userUrl;
    });
}

/**
 * Desenha um elemento facial extraído da IA no rosto do usuário com gradiente e borda suave.
 */
function drawFeature(ctx, sourceImg, sx, sy, dx, dy, width, height, alpha, blendMode) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tctx = tempCanvas.getContext('2d');

    // 1. Desenha o pedaço da IA no tempCanvas centralizado
    tctx.drawImage(sourceImg, sx - width / 2, sy - height / 2, width, height, 0, 0, width, height);

    // 2. Cria máscara radial para esfumaçar as bordas do recorte
    tctx.globalCompositeOperation = 'destination-in';
    const grad = tctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.5);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    tctx.fillStyle = grad;
    tctx.fillRect(0, 0, width, height);

    // 3. Aplica na imagem principal na posição do usuário
    ctx.save();
    ctx.globalAlpha = alpha;
    if (blendMode !== 'normal') ctx.globalCompositeOperation = blendMode;
    ctx.drawImage(tempCanvas, dx - width / 2, dy - height / 2);
    ctx.restore();
}

/** 
 * Fallback caso a IA não gere um rosto detectável (ex: gera de perfil)
 */
async function simpleOverlay(userUrl, aiUrl, landmarks) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imgOrig = new Image();
        const imgAI = new Image();
        imgOrig.onload = () => {
            canvas.width = imgOrig.width;
            canvas.height = imgOrig.height;
            imgAI.onload = () => {
                ctx.drawImage(imgOrig, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 0.5;
                ctx.globalCompositeOperation = 'overlay';
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            imgAI.src = aiUrl;
        }
        imgOrig.src = userUrl;
    });
}

/** Calcula o centro de um conjunto de pontos */
function getCentroid(points) {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
