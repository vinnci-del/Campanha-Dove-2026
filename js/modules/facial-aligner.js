/**
 * Módulo de Alinhamento e Warp Facial via Canvas
 */
const FacialAligner = {
    /** 
     * Faz o blend do rosto IA sobre o rosto do usuário 
     */
    async alignAndMerge(userUrl, aiUrl, userLm, aiLm) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const userImg = new Image();
            const aiImg = new Image();

            userImg.onload = () => {
                canvas.width = userImg.width;
                canvas.height = userImg.height;

                aiImg.onload = () => {
                    ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);

                    // 1. Olhos
                    this._processEyes(ctx, aiImg, userLm, aiLm);

                    // 2. Boca
                    this._processMouth(ctx, aiImg, userLm, aiLm);

                    // 3. Pele/Maquiagem
                    this._processSkinTone(ctx, aiImg, userLm, aiLm);

                    resolve(canvas.toDataURL('image/jpeg', CONFIG.Visual.imageQuality));
                };
                aiImg.onerror = () => reject(new Error('ERR_LOADING_AI_IMAGE'));
                aiImg.src = aiUrl;
            };
            userImg.onerror = () => reject(new Error('ERR_LOADING_USER_IMAGE'));
            userImg.src = userUrl;
        });
    },

    _processEyes(ctx, aiImg, userLm, aiLm) {
        const uLeft = Utils.getCentroid(userLm.getLeftEye());
        const uRight = Utils.getCentroid(userLm.getRightEye());
        const aLeft = Utils.getCentroid(aiLm.getLeftEye());
        const aRight = Utils.getCentroid(aiLm.getRightEye());

        const width = Math.abs(userLm.getLeftEye()[0].x - userLm.getLeftEye()[3].x) * 1.8;

        this._drawFeature(ctx, aiImg, aLeft, uLeft, width, width, CONFIG.Visual.eyeAlpha, 'overlay');
        this._drawFeature(ctx, aiImg, aRight, uRight, width, width, CONFIG.Visual.eyeAlpha, 'overlay');
    },

    _processMouth(ctx, aiImg, userLm, aiLm) {
        const uMouth = Utils.getCentroid(userLm.getMouth());
        const aMouth = Utils.getCentroid(aiLm.getMouth());
        const w = Math.abs(userLm.getMouth()[0].x - userLm.getMouth()[6].x) * 2;
        const h = Math.abs(userLm.getMouth()[3].y - userLm.getMouth()[9].y) * 2.5;

        this._drawFeature(ctx, aiImg, aMouth, uMouth, w, h, CONFIG.Visual.mouthAlpha, 'normal');
    },

    _processSkinTone(ctx, aiImg, userLm, aiLm) {
        const uNose = Utils.getCentroid(userLm.getNose());
        const aNose = Utils.getCentroid(aiLm.getNose());

        const uDist = Math.abs(userLm.getLeftEye()[0].x - userLm.getRightEye()[0].x);
        const aDist = Math.abs(aiLm.getLeftEye()[0].x - aiLm.getRightEye()[0].x);
        const scale = uDist / aDist;

        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.globalAlpha = CONFIG.Visual.skinAlpha;
        ctx.translate(uNose.x, uNose.y);
        ctx.scale(scale, scale);
        ctx.drawImage(aiImg, -aNose.x, -aNose.y);
        ctx.restore();
    },

    _drawFeature(ctx, src, sPos, dPos, w, h, alpha, blend) {
        const tC = document.createElement('canvas');
        tC.width = w; tC.height = h;
        const tCtx = tC.getContext('2d');

        tCtx.drawImage(src, sPos.x - w / 2, sPos.y - h / 2, w, h, 0, 0, w, h);
        tCtx.globalCompositeOperation = 'destination-in';
        const grad = tCtx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.5);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        tCtx.fillStyle = grad;
        tCtx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = alpha;
        if (blend !== 'normal') ctx.globalCompositeOperation = blend;
        ctx.drawImage(tC, dPos.x - w / 2, dPos.y - h / 2);
        ctx.restore();
    }
};
