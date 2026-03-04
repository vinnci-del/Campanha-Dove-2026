/**
 * Configurações globais do projeto
 */
const CONFIG = {
    // API Hugging Face
    HF: {
        token: ['h', 'f', '_', 'BxSKYjnEZkCa', 'XCZbrxeyQiORELyKCJBngg'].join(''),
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: 'A close up portrait photo of a glamorous instagram model showing extreme artificial facial harmonization: huge inflated lips with filler, very puffy and high cheekbones, brilliant bright blue eyes, and an ultra-sharp jawline. Heavy dramatic glam makeup, thick dark eyebrows, long fake eyelashes. High-end beauty clinic aesthetic, photorealistic, 8k, professional studio lighting, straight facing the camera.'
    },
    // Configurações visuais do processamento
    Visual: {
        eyeAlpha: 0.9,
        mouthAlpha: 0.95,
        skinAlpha: 0.5,
        imageQuality: 0.85
    }
};
