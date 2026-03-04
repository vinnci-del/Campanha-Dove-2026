// BLOCO: Manipuladores de Estado e Arquivos
let uploadedImage = null;
let cropper = null;

const getCropper = () => cropper;

/**
 * Tenta detectar a melhor área para o recorte (usualmente o rosto)
 * Utiliza o framework SmartCrop para automação.
 */
async function autoDetectCrop(imgElement) {
    if (typeof smartcrop === 'undefined') return null;

    try {
        const result = await smartcrop.crop(imgElement, { width: 400, height: 500 });
        if (result && result.topCrop) {
            const crop = result.topCrop;
            return {
                x: crop.x,
                y: crop.y,
                width: crop.width,
                height: crop.height
            };
        }
    } catch (e) {
        console.warn("SmartCrop failed:", e);
    }
    return null;
}

function setUploadedImage(data) {
    uploadedImage = data;
    elements.previewImg.src = uploadedImage;
    elements.previewContainer.style.display = 'block';
    elements.uploadPrompt.style.display = 'none';
    elements.generateBtn.disabled = false;
    elements.resetBtn.style.display = 'inline-block';
    elements.sampleBtn.style.display = 'none';

    if (cropper) {
        cropper.destroy();
    }

    const imgElement = elements.previewImg;
    imgElement.onload = async () => {
        cropper = new Cropper(imgElement, {
            aspectRatio: 4 / 5,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: false,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready: async function () {
                // Tenta posicionar o recorte automaticamente usando inteligência de conteúdo
                const crop = await autoDetectCrop(imgElement);
                if (crop) {
                    // Converter coordenadas do SmartCrop (imagem original) para o canvas do cropper
                    const imageData = cropper.getImageData();
                    const ratio = imageData.width / imageData.naturalWidth;

                    cropper.setCropBoxData({
                        left: crop.x * ratio,
                        top: crop.y * ratio,
                        width: crop.width * ratio,
                        height: crop.height * ratio
                    });
                }
            }
        });
    };
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, envie uma imagem válida (PNG ou JPG).');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target.result);
    reader.readAsDataURL(file);
}

function resetApp() {
    uploadedImage = null;
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    elements.previewContainer.style.display = 'none';
    elements.uploadPrompt.style.display = 'block';
    elements.generateBtn.disabled = true;
    elements.generateBtn.style.display = 'inline-block';
    elements.resetBtn.style.display = 'none';
    elements.sampleBtn.style.display = 'inline-block';

    // Reset results and show placeholders
    elements.resultAlgo.src = '';
    elements.resultOriginal.src = '';
    elements.resultAlgo.style.display = 'none';
    elements.resultOriginal.style.display = 'none';
    document.querySelectorAll('.img-placeholder').forEach(p => p.style.display = 'flex');

    elements.statusMsg.innerText = '';
    elements.fileInput.value = '';
}

function deleteData() {
    uploadedImage = null;
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    elements.resultAlgo.src = '';
    elements.resultOriginal.src = '';
    elements.resultAlgo.style.display = 'none';
    elements.resultOriginal.style.display = 'none';
    document.querySelectorAll('.img-placeholder').forEach(p => p.style.display = 'flex');

    elements.previewImg.src = '';
    elements.previewContainer.style.display = 'none';
    elements.uploadPrompt.style.display = 'block';
    elements.generateBtn.disabled = true;
    elements.generateBtn.style.display = 'inline-block';
    elements.resetBtn.style.display = 'none';
    elements.sampleBtn.style.display = 'inline-block';
    elements.statusMsg.innerText = 'Todos os seus dados foram removidos.';
    elements.fileInput.value = '';
    setTimeout(() => { elements.statusMsg.innerText = ''; }, 3000);
}

function getCroppedImageData() {
    if (!cropper) return uploadedImage;
    return cropper.getCroppedCanvas({
        width: 800,
        height: 1000
    }).toDataURL('image/jpeg', 0.95);
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));
