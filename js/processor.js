/**
 * Processamento de Imagem via Cloudinary Generative AI
 * Solução Profissional: A IA do Cloudinary identifica o rosto e aplica 
 * as transformações neurais (Suavização, preenchimento e cor) de forma nativa.
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'dfbvfjkpk',
    apiKey: '986978843838947',
    apiSecret: 'RnQySn6_aGtG5e0JaeHEmmsmJWY',
    uploadPreset: 'ml_default' // Padrão do Cloudinary
};

/**
 * Realiza o upload para o Cloudinary e retorna a imagem com TRANSFORMACÕES DE IA.
 * @param {string} imageDataUrl - Imagem base64 do usuário
 * @returns {Promise<string>} - URL da imagem editada pela IA
 */
async function generateAlgoritmica(imageDataUrl) {
    console.log('Subindo imagem para o motor de IA do Cloudinary...');

    // 1. Preparar o Upload (Assinado para segurança ou Simples para teste)
    // Para simplificar a integração imediata, usamos o endpoint de upload
    const formData = new FormData();
    formData.append('file', imageDataUrl);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', (Date.now() / 1000) | 0);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadRes.json();

        if (uploadData.error) {
            console.error('Erro Cloudinary:', uploadData.error);
            // Fallback caso o preset não esteja configurado como "unsigned"
            throw new Error('Erro no upload. Verifique as configurações de Unsigned Upload no Cloudinary.');
        }

        const publicId = uploadData.public_id;
        const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

        /**
         * 2. APLICAR TRANSFORMACÕES DE IA (O "Trabalho Duro")
         * e_gen_replace: Substitui partes da imagem usando IA Generativa
         * e_beauty: Suaviza a pele e melhora traços faciais
         * e_vies: Aumenta a vivacidade das cores
         */
        const transformations = [
            'e_beauty', // IA: Suavização de pele profissional
            'e_gen_replace:from_lips;to_extremely_large_plump_lips_with_filler', // IA: Redesenha os lábios
            'e_gen_replace:from_eyes;to_vibrant_bright_blue_eyes', // IA: Muda a cor dos olhos
            'e_gen_replace:from_cheeks;to_high_puffy_swollen_cheekbones', // IA: Harmonização facial
            'q_auto', // Otimização de qualidade
            'f_auto'  // Formato automático
        ].join('/');

        const finalUrl = `${baseUrl}/${transformations}/${publicId}`;

        console.log('IA Processando: ', finalUrl);

        // Retornamos a URL. O navegador vai carregar a imagem já editada pela IA.
        return finalUrl;

    } catch (err) {
        console.error('Falha na integração Cloudinary:', err);
        throw err;
    }
}

/** 
 * Helper para exibir erros amigáveis
 */
function handleAIErrors(err) {
    if (err.message.includes('Unsigned')) {
        return 'Configure o "Unsigned Upload" no seu painel Cloudinary (Settings > Upload).';
    }
    return 'Erro na IA. Tente novamente em instantes.';
}
