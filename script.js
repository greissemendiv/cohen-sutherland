const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

// Configuración de la ventana de recorte
const CLIP_WINDOW = {
    x1: 100,
    y1: 100,
    x2: 700,
    y2: 500
};

function drawClipWindow() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(CLIP_WINDOW.x1, CLIP_WINDOW.y1, 
                   CLIP_WINDOW.x2 - CLIP_WINDOW.x1, 
                   CLIP_WINDOW.y2 - CLIP_WINDOW.y1);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClipWindow();
}

clearBtn.addEventListener('click', clearCanvas);
clearCanvas();
