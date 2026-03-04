// BLOCO: Lógica Principal do App

// Inicializa Ícones
if (window.lucide) {
    lucide.createIcons();
}

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

// ===== Generation Logic =====
async function startGeneration() {
    elements.generateBtn.disabled = true;
    elements.scanLine.style.display = 'block';

    const steps = [
        'Processando prompt: "harmonização artificial exagerada"...',
        'Aplicando boca grande...',
        'Criando maçãs do rosto inchadas...',
        'Alterando cor natural para olhos azuis...',
        'Gerando queixo definido...',
        'Adicionando maquiagem pesada...',
        'Finalizando edição das características originais...'
    ];

    for (let i = 0; i < steps.length; i++) {
        elements.statusMsg.innerText = steps[i];
        await delay(800 + Math.random() * 600);
    }

    elements.statusMsg.innerText = 'Geração concluída.';
    elements.scanLine.style.display = 'none';

    showResults();
}

function showResults() {
    // Captura a imagem recortada do Cropper
    const finalImageData = getCroppedImageData();

    const img = new Image();
    img.onload = () => {
        try {
            elements.resultOriginal.src = finalImageData;
            elements.resultAlgo.src = generateAlgoritmica(img);

            elements.generateBtn.style.display = 'none';
            elements.resultSection.style.display = 'block';
            elements.resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Erro ao gerar resultados:', err);
            elements.statusMsg.innerText = 'Erro ao processar a imagem. Tente novamente com outra foto.';
        }
    };

    img.onerror = () => {
        elements.statusMsg.innerText = 'Erro ao carregar a imagem recortada. Tente novamente.';
    };

    img.src = finalImageData;
}
