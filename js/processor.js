/**
 * Orquestrador Principal do Processamento Algorítmico
 */
async function generateAlgoritmica(userImageData, userLandmarks) {
    // 1. Obter Textura da IA através do módulo ENGINE
    const aiDataUrl = await AIEngine.fetchTexture();

    // 2. Mapear o rosto gerado pela IA
    const aiImg = new Image();
    aiImg.src = aiDataUrl;
    await new Promise(r => aiImg.onload = r);

    const aiFaceData = await faceapi.detectSingleFace(aiImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (!aiFaceData) {
        console.warn('IA não retornou rosto claro. Usando fallback básico.');
        return aiDataUrl; // Fallback simples
    }

    // 3. Executar o Alinhamento e Blend através do módulo ALIGNER
    console.log('Executando fusão algorítmica...');
    return await FacialAligner.alignAndMerge(userImageData, aiDataUrl, userLandmarks, aiFaceData.landmarks);
}
