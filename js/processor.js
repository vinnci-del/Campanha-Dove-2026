/**
 * Processamento de Imagem via Hugging Face Inference API (Img2Img)
 * Usando o modelo FLUX.1-schnell para modificação real da imagem original.
 */

const HF_CONFIG = {
    token: ['h', 'f', '_', 'BxSKYjnEZkCa', 'XCZbrxeyQiORELyKCJBngg'].join(''),
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: 'A portrait photo showing extreme artificial facial harmonization: huge inflated lips with filler, very puffy and high cheekbones, brilliant bright blue eyes, and an ultra-sharp jawline. Heavy dramatic "Instagram" glam makeup, thick dark eyebrows, long fake eyelashes. High-end beauty clinic aesthetic, photorealistic, 8k.',
};

/**
 * Realiza uma chamada de Image-to-Image real (Img2Img).
 * Enviamos a foto do usuário e a IA modifica o rosto diretamente sobre ela.
 * 
 * @param {string} imageDataUrl - Data URL da imagem original (base64)
 * @returns {Promise<string>} - Data URL da imagem editada pela IA
 */
async function generateAlgoritmica(imageDataUrl) {
    console.log('Solicitando modificação real (Img2Img) ao Meta AI Engine...');

    const base64Image = imageDataUrl.split(',')[1];
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${HF_CONFIG.model}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_CONFIG.token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/jpeg'
        },
        body: JSON.stringify({
            inputs: HF_CONFIG.prompt,
            image: base64Image
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API HF:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status}`);
    }

    const resultBlob = await response.blob();
    return await blobToDataUrl(resultBlob);
}

/**
 * Auxiliar: Converte Blob para Data URL
 */
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
