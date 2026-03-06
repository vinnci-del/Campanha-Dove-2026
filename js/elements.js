// BLOCO: Elementos do DOM
const elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    previewContainer: document.getElementById('preview-container'),
    previewImg: document.getElementById('preview-img'),
    generateBtn: document.getElementById('generate-btn'),
    resetBtn: document.getElementById('reset-btn'),
    sampleBtn: document.getElementById('sample-btn'),
    sampleSection: document.getElementById('sample-section'),
    scanLine: document.getElementById('scan-line'),
    statusMsg: document.getElementById('status-msg'),
    resultSection: document.getElementById('result-section'),
    consentModal: document.getElementById('consentModal'),
    consentAccept: document.getElementById('consent-accept'),
    consentCancel: document.getElementById('consent-cancel'),
    deleteDataBtn: document.getElementById('delete-data'),
    uploadPrompt: document.getElementById('upload-prompt'),

    // Result images
    resultAlgo: document.getElementById('result-algo'),
    resultOriginal: document.getElementById('result-original'),

    // Sections & Navigation
    dataSection: document.getElementById('data-section'),
    privacySection: document.getElementById('privacy-section'),
    mainContent: document.querySelector('main > .col-lg-8'), // The tool area
    navData: document.getElementById('nav-data'),
    navExperiment: document.getElementById('nav-experiment'),
    navPrivacy: document.getElementById('nav-privacy'),
    navPrivacyFooter: document.getElementById('nav-privacy-footer'),
    heroTitleArea: document.getElementById('hero-title-area'),

    // Toolbar
    btnZoomIn: document.getElementById('crop-zoom-in'),
    btnZoomOut: document.getElementById('crop-zoom-out'),
    btnRotateL: document.getElementById('crop-rotate-l'),
    btnRotateR: document.getElementById('crop-rotate-r'),
    btnCropReset: document.getElementById('crop-reset'),
};
