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
            throw new Error('Erro no upload. Verifique o Unsigned Upload no painel do Cloudinary.');
        }

        const publicId = uploadData.public_id;
        const version = uploadData.version;
        const cloud = CLOUDINARY_CONFIG.cloudName;

        /**
         * 2. APLICAR TRANSFORMACÕES DE IA (O "Trabalho Duro")
         * e_gen_replace: Substitui partes da imagem usando IA Generativa.
         * q_auto,f_auto: Otimização básica.
         */
        const transformations = [
            'e_beauty:100', // Filtro de beleza IA
            'e_gen_replace:from_lips;to_big_plump_lips_with_lipstick', // IA nos lábios
            'e_gen_replace:from_eyes;to_bright_blue_eyes', // IA nos olhos
            'q_auto',
            'f_auto'
        ].join('/');

        // URL Final seguindo o padrão rigoroso do Cloudinary:
        // base_url / transformacoes / v_versao / public_id . jpg
        const finalUrl = `https://res.cloudinary.com/${cloud}/image/upload/${transformations}/v${version}/${publicId}.jpg`;

        console.log('URL Final Gerada:', finalUrl);
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
