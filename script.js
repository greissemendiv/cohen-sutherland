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

function getRegionCode(x, y) {
    let code = 0;
    
    // Bit 1: izquierda
    if (x < CLIP_WINDOW.x1) code |= 1;
    // Bit 2: derecha  
    else if (x > CLIP_WINDOW.x2) code |= 2;
    
    // Bit 4: abajo
    if (y < CLIP_WINDOW.y1) code |= 4;
    // Bit 8: arriba
    else if (y > CLIP_WINDOW.y2) code |= 8;
    
    return code;
}

function drawRegionLabels() {
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Esquinas
    ctx.fillText('1001', CLIP_WINDOW.x1 - 30, CLIP_WINDOW.y1 + 20);
    ctx.fillText('1000', canvas.width/2, CLIP_WINDOW.y1 + 20);
    ctx.fillText('1010', CLIP_WINDOW.x2 + 30, CLIP_WINDOW.y1 + 20);
    
    ctx.fillText('0001', CLIP_WINDOW.x1 - 30, canvas.height/2);
    ctx.fillText('0000', canvas.width/2, canvas.height/2);
    ctx.fillText('0010', CLIP_WINDOW.x2 + 30, canvas.height/2);
    
    ctx.fillText('0101', CLIP_WINDOW.x1 - 30, CLIP_WINDOW.y2 + 20);
    ctx.fillText('0100', canvas.width/2, CLIP_WINDOW.y2 + 20);
    ctx.fillText('0110', CLIP_WINDOW.x2 + 30, CLIP_WINDOW.y2 + 20);
}

drawRegionLabels();
