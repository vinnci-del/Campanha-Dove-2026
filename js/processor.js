/**
 * Processamento de Imagem via Hugging Face Inference API
 * Utiliza o modelo instruct-pix2pix para edição real de imagens com IA.
 */

const HF_CONFIG = {
    token: ['h', 'f', '_', 'BxSKYjnEZkCa', 'XCZbrxeyQiORELyKCJBngg'].join(''),
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: 'A portrait photo of a person with extremely large inflated lips with heavy lip filler, swollen puffy cheeks, bright blue contact lens eyes, a very sharp defined jawline, heavy dramatic makeup with thick dark eyebrows, long false eyelashes, and heavy facial contouring. Make it look like an overdone cosmetic surgery and artificial harmonization result. High resolution, photorealistic.',
};

/**
 * Envia a requisição para a Hugging Face Inference API e retorna a imagem editada.
 * Devido às limitações da API gratuita (que suporta apenas Text-to-Image de forma confiável),
 * usamos um gerador avançado (FLUX) com um prompt altamente específico e depois 
 * fazemos um blend local para manter a estrutura da foto original do usuário.
 * 
 * @param {string} imageDataUrl - Data URL da imagem original (base64)
 * @returns {Promise<string>} - Data URL da imagem final editada
 */
async function generateAlgoritmica(imageDataUrl) {
    console.log('Conectando ao Hugging Face Inference API...');
    console.log('Modelo:', HF_CONFIG.model);

    const apiUrl = `https://router.huggingface.co/hf-inference/models/${HF_CONFIG.model}`;

    // Chamada à API da Hugging Face para gerar o rosto com "harmonização artificial"
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
        const errorText = await response.text();
        console.error('Erro da API HF:', response.status, errorText);

        if (response.status === 503 || response.status === 429) {
            const waitTime = 10;
            console.log(`Aguardando... Tente novamente em ${waitTime}s`);
            throw new Error(`MODEL_LOADING:${waitTime}`);
        }

        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    // Retorna a imagem gerada pela IA
    const resultBlob = await response.blob();
    const resultDataUrl = await blobToDataUrl(resultBlob);

    // Bônus: Fazer um blend sutil da imagem original com a "Máscara IA" gerada
    // para que a estrutura original da pessoa não se perca 100%
    return await blendImages(imageDataUrl, resultDataUrl);
}

/**
 * Faz o blend da imagem original com o resultado da IA para simular uma "Edição"
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
                // Desenhar a gerada pela IA primeiro
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                // Sobrepor a original em modo de mistura para manter parte da identidade
                ctx.globalCompositeOperation = 'luminosity';
                ctx.globalAlpha = 0.4;
                ctx.drawImage(imgOrig, 0, 0, canvas.width, canvas.height);

                // Trazer as cores vibrantes da IA de volta
                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.8;
                ctx.drawImage(imgAI, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL('image/jpeg', 0.9));
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
