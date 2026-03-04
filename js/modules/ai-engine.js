/**
 * Módulo de comunicação com motores de Inteligência Artificial
 */
const AIEngine = {
    async fetchTexture() {
        console.log('Solicitando textura ao motor de IA...');

        const apiUrl = `https://router.huggingface.co/hf-inference/models/${CONFIG.HF.model}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.HF.token}`,
                'Content-Type': 'application/json',
                'Accept': 'image/jpeg'
            },
            body: JSON.stringify({
                inputs: CONFIG.HF.prompt
            })
        });

        if (!response.ok) throw new Error(`Status IA: ${response.status}`);

        const blob = await response.blob();
        return await Utils.blobToDataUrl(blob);
    }
};
