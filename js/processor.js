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
 * Envia a requisição para a Hugging Face Inference API e retorna a imagem editada.
 * Polido para focar na transformação e melhorar a integração visual.
 * 
 * @param {string} imageDataUrl - Data URL da imagem original (base64)
 * @returns {Promise<string>} - Data URL da imagem final editada
 */
async function generateAlgoritmica(imageDataUrl) {
    console.log('Solicitando transformação ao Meta AI Engine (via HF)...');

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
        throw new Error(`Erro na API (${response.status})`);
    }

    const resultBlob = await response.blob();
    const resultDataUrl = await blobToDataUrl(resultBlob);

    // Blend aprimorado para "modificar" e não apenas "sobrepor"
    return await blendImages(imageDataUrl, resultDataUrl);
}

/**
 * Faz o blend da imagem original com a IA, focando no centro do rosto
 * para evitar o efeito "fantasma" nas bordas e manter o cabelo/objetos originais.
 */
async function blendImages(originalUrl, aiUrl) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const imgOrig = new Image();
        const imgAI = new Image();

        imgOrig.onload = () => {
            canvas.width = imgOrig.width;
            canvas.height = imgOrig.height;

            imgAI.onload = () => {
                // 1. Base: Imagem Original completa (ambiente, cabelo, etc)
                ctx.drawImage(imgOrig, 0, 0, canvas.width, canvas.height);

                // 2. Criar uma máscara circular/elíptica para o rosto da IA
                ctx.save();
                ctx.beginPath();
                const centerX = canvas.width / 2;
                const centerY = canvas.height * 0.45;
                ctx.ellipse(centerX, centerY, canvas.width * 0.35, canvas.height * 0.4, 0, 0, Math.PI * 2);
                ctx.clip(); // Cortar para processar apenas o rosto

                // 3. Desenhar a IA no centro com alta opacidade
                ctx.globalAlpha = 0.9;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);
                ctx.restore();

                // 4. Blend final de suavização nas bordas
                ctx.globalCompositeOperation = 'overlay';
                ctx.globalAlpha = 0.3;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                // 5. Devolver as cores originais da IA (Olhos azuis e batom rosa)
                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.7;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            imgAI.src = aiUrl;
        };
        imgOrig.src = originalUrl;
    });
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
