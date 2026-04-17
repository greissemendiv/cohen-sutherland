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

function acceptLine(code1, code2) {
    return code1 === 0 && code2 === 0;
}

function rejectLine(code1, code2) {
    return (code1 & code2) !== 0;
}

function trivialAccept(code1, code2) {
    return acceptLine(code1, code2);
}

function trivialReject(code1, code2) {
    return rejectLine(code1, code2);
}

// Debug info
function showDebugInfo(p1, p2) {
    const code1 = getRegionCode(p1.x, p1.y);
    const code2 = getRegionCode(p2.x, p2.y);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.fillText(`P1: ${code1.toString(2)}`, 10, 30);
    ctx.fillText(`P2: ${code2.toString(2)}`, 10, 55);
    
    if (trivialAccept(code1, code2)) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('✓ ACEPTADA (trivially)', 10, 80);
    } else if (trivialReject(code1, code2)) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText('✗ RECHAZADA (trivially)', 10, 80);
    } else {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('⚠️ Necesita recorte', 10, 80);
    }
}

// Modificar el event listener del click para mostrar debug
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!startPoint) {
        startPoint = { x, y };
        drawPoint(x, y, getRegionCode(x, y));
    } else {
        drawPoint(x, y, getRegionCode(x, y));
        drawLine(startPoint.x, startPoint.y, x, y, '#333');
        showDebugInfo(startPoint, {x, y});
        startPoint = null;
    }
});

function clipLine(x1, y1, x2, y2) {
    let code1 = getRegionCode(x1, y1);
    let code2 = getRegionCode(x2, y2);
    let accept = false;
    
    while (true) {
        if (trivialAccept(code1, code2)) {
            accept = true;
            break;
        } else if (trivialReject(code1, code2)) {
            break;
        }
        
        // Elegir punto de salida
        let x = 0, y = 0;
        const codeOut = code1 !== 0 ? code1 : code2;
        
        if ((codeOut & 8) !== 0) { // Arriba
            x = x1 + (x2 - x1) * (CLIP_WINDOW.y2 - y1) / (y2 - y1);
            y = CLIP_WINDOW.y2;
        } else if ((codeOut & 4) !== 0) { // Abajo
            x = x1 + (x2 - x1) * (CLIP_WINDOW.y1 - y1) / (y2 - y1);
            y = CLIP_WINDOW.y1;
        } else if ((codeOut & 2) !== 0) { // Derecha
            y = y1 + (y2 - y1) * (CLIP_WINDOW.x2 - x1) / (x2 - x1);
            x = CLIP_WINDOW.x2;
        } else if ((codeOut & 1) !== 0) { // Izquierda
            y = y1 + (y2 - y1) * (CLIP_WINDOW.x1 - x1) / (x2 - x1);
            x = CLIP_WINDOW.x1;
        }
        
        if (codeOut === code1) {
            x1 = x; y1 = y;
            code1 = getRegionCode(x1, y1);
        } else {
            x2 = x; y2 = y;
            code2 = getRegionCode(x2, y2);
        }
    }
    
    if (accept) {
        return { x1, y1, x2, y2, visible: true };
    }
    return { x1, y1, x2, y2, visible: false };
}
