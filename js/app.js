// BLOCO: Lógica Principal do App

// Inicializa Ícones e Modelos de Face Detection
if (window.lucide) {
    lucide.createIcons();
}

// Carregar modelos da face-api.js para economizar tokens (validação local)
async function loadFaceModels() {
    console.log('Carregando modelos de detecção facial...');
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('Modelos carregados!');
    } catch (e) {
        console.warn('Erro ao carregar face-api:', e);
    }
}
loadFaceModels();

// ===== Upload Handling =====
elements.dropZone.addEventListener('click', (e) => {
    // Só abre o seletor se não houver imagem ou se clicar fora do cropper
    if (!uploadedImage) {
        elements.fileInput.click();
    }
});

elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('dragging');
});

elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('dragging');
});

elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('dragging');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

elements.sampleBtn.addEventListener('click', () => {
    if (typeof SAMPLE_BASE64 !== 'undefined') {
        setUploadedImage(SAMPLE_BASE64);
    } else {
        alert('Imagem de demonstração não encontrada.');
    }
});

// ===== Toolbar Actions =====
elements.btnZoomIn.addEventListener('click', () => getCropper()?.zoom(0.1));
elements.btnZoomOut.addEventListener('click', () => getCropper()?.zoom(-0.1));
elements.btnRotateL.addEventListener('click', () => getCropper()?.rotate(-90));
elements.btnRotateR.addEventListener('click', () => getCropper()?.rotate(90));
elements.btnCropReset.addEventListener('click', () => getCropper()?.reset());

// ===== Consent Flow =====
elements.generateBtn.addEventListener('click', () => {
    elements.consentOverlay.classList.add('active');
});

elements.consentCancel.addEventListener('click', () => {
    elements.consentOverlay.classList.remove('active');
});

elements.consentAccept.addEventListener('click', async () => {
    elements.consentOverlay.classList.remove('active');
    await startGeneration();
});

// ===== Reset & Delete =====
elements.resetBtn.addEventListener('click', resetApp);
elements.deleteDataBtn.addEventListener('click', deleteData);

// ===== Generation Logic (Integração Hugging Face) =====
async function startGeneration() {
    elements.generateBtn.disabled = true;
    elements.scanLine.style.display = 'block';

    const steps = [
        'Conectando à IA generativa...',
        'Enviando sua foto para processamento...',
        'IA analisando características faciais...',
        'Aplicando harmonização artificial exagerada...',
        'Processando boca, olhos, maquiagem e contorno...',
        'Aguardando resultado da IA...'
    ];

    // Mostrar mensagens de progresso enquanto a API processa
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
            elements.statusMsg.innerText = steps[stepIndex];
            stepIndex++;
        } else {
            // Ciclar nas últimas mensagens enquanto aguarda
            elements.statusMsg.innerText = 'IA processando sua imagem... Aguarde...';
        }
    }, 3000);

    try {
        await showResults();
        clearInterval(stepInterval);
        elements.statusMsg.innerText = 'Geração concluída!';
    } catch (err) {
        clearInterval(stepInterval);
        console.error('Erro na geração:', err);

        if (err.message && err.message.startsWith('MODEL_LOADING:')) {
            const waitTime = parseInt(err.message.split(':')[1]);
            elements.statusMsg.innerText = `Modelo de IA carregando... Tentando novamente em ${waitTime}s`;

            // Tentar novamente após o modelo carregar
            await delay(waitTime * 1000);
            elements.statusMsg.innerText = 'Reenviando imagem para processamento...';

            try {
                await showResults();
                elements.statusMsg.innerText = 'Geração concluída!';
            } catch (retryErr) {
                console.error('Erro na segunda tentativa:', retryErr);
                elements.statusMsg.innerText = 'Erro ao processar a imagem. Tente novamente mais tarde.';
                elements.generateBtn.disabled = false;
            }
        } else {
            elements.statusMsg.innerText = 'Erro ao processar a imagem. Tente novamente.';
            elements.generateBtn.disabled = false;
        }
    }

    elements.scanLine.style.display = 'none';
}

async function showResults() {
    // Captura a imagem recortada do Cropper
    const finalImageData = getCroppedImageData();

    // 1. Validar e mapear o rosto original LOCALMENTE
    elements.statusMsg.innerText = 'Escaneando métricas faciais...';

    const img = new Image();
    img.src = finalImageData;
    await new Promise(r => img.onload = r);

    // Detectar rosto com seus "landmarks" (pontos estruturais)
    const result = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (!result) {
        elements.statusMsg.innerText = 'Rosto não detectado no recorte. Por favor, ajuste o seletor.';
        elements.generateBtn.disabled = false;
        elements.scanLine.style.display = 'none';
        throw new Error('FACE_NOT_DETECTED');
    }

    // Mostrar a imagem original imediatamente
    elements.resultOriginal.src = finalImageData;
    elements.resultOriginal.style.display = 'block';

    // 2. Chamar a IA e usar o Mapeamento Facial Híbrido
    const editedImageData = await generateAlgoritmica(finalImageData, result.landmarks);

    // Mostrar resultado final gerado pela IA
    elements.resultAlgo.src = editedImageData;
    elements.resultAlgo.style.display = 'block';

    document.querySelectorAll('.img-placeholder').forEach(p => p.style.display = 'none');

    elements.generateBtn.style.display = 'none';
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== Navigation Handling =====
function showData() {
    elements.mainContent.style.display = 'none';
    elements.resultSection.style.display = 'none';
    elements.dataSection.style.display = 'block';

    // Update active nav state
    elements.navData.classList.replace('fw-medium', 'fw-bold');
    elements.navData.classList.replace('text-secondary', 'text-primary');
    elements.navExperiment.classList.replace('fw-bold', 'fw-medium');
    elements.navExperiment.classList.replace('text-primary', 'text-secondary');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMain() {
    elements.dataSection.style.display = 'none';
    elements.mainContent.style.display = 'block';
    elements.resultSection.style.display = 'block';

    // Update active nav state
    elements.navExperiment.classList.replace('fw-medium', 'fw-bold');
    elements.navExperiment.classList.replace('text-secondary', 'text-primary');
    elements.navData.classList.replace('fw-bold', 'fw-medium');
    elements.navData.classList.replace('text-primary', 'text-secondary');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Expor para o escopo global (usado no onclick do HTML)
window.showData = showData;
window.showMain = showMain;
