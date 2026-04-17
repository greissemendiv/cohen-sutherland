const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const clipBtn = document.getElementById('clipBtn');

let startPoint = null;
let lines = [];

const CLIP_WINDOW = {
    x1: 100, y1: 100,
    x2: 700, y2: 500
};

// --- Funciones de Dibujo Auxiliares ---
function drawPoint(x, y) {
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color, width = 1, dashed = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed) ctx.setLineDash([5, 5]);
    else ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawClipWindow() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(CLIP_WINDOW.x1, CLIP_WINDOW.y1, 
                   CLIP_WINDOW.x2 - CLIP_WINDOW.x1, 
                   CLIP_WINDOW.y2 - CLIP_WINDOW.y1);
}

// --- Lógica del Algoritmo ---
function getRegionCode(x, y) {
    let code = 0;
    if (x < CLIP_WINDOW.x1) code |= 1; // Izquierda
    else if (x > CLIP_WINDOW.x2) code |= 2; // Derecha
    if (y < CLIP_WINDOW.y1) code |= 4; // Abajo (en Canvas Y aumenta hacia abajo)
    else if (y > CLIP_WINDOW.y2) code |= 8; // Arriba
    return code;
}

function clipLine(x1, y1, x2, y2) {
    let code1 = getRegionCode(x1, y1);
    let code2 = getRegionCode(x2, y2);
    let accept = false;

    while (true) {
        if ((code1 | code2) === 0) { // Trivialmente dentro
            accept = true;
            break;
        } else if ((code1 & code2) !== 0) { // Trivialmente fuera
            break;
        } else {
            let x, y;
            const codeOut = code1 !== 0 ? code1 : code2;

            if (codeOut & 8) { // Arriba
                x = x1 + (x2 - x1) * (CLIP_WINDOW.y2 - y1) / (y2 - y1);
                y = CLIP_WINDOW.y2;
            } else if (codeOut & 4) { // Abajo
                x = x1 + (x2 - x1) * (CLIP_WINDOW.y1 - y1) / (y2 - y1);
                y = CLIP_WINDOW.y1;
            } else if (codeOut & 2) { // Derecha
                y = y1 + (y2 - y1) * (CLIP_WINDOW.x2 - x1) / (x2 - x1);
                x = CLIP_WINDOW.x2;
            } else if (codeOut & 1) { // Izquierda
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
    }
    return { x1, y1, x2, y2, visible: accept };
}

// --- Manejadores de Eventos ---
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!startPoint) {
        startPoint = { x, y };
        drawPoint(x, y);
    } else {
        const endPoint = { x, y };
        drawLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, '#333');
        lines.push({ x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y, clipped: false });
        startPoint = null;
        updateStats();
    }
});

clipBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClipWindow();
    
    let clippedCount = 0;
    let rejectedCount = 0;

    lines.forEach(line => {
        const result = clipLine(line.x1, line.y1, line.x2, line.y2);
        if (result.visible) {
            drawLine(result.x1, result.y1, result.x2, result.y2, '#2ecc71', 4);
            clippedCount++;
        } else {
            rejectedCount++;
        }
    });

    document.getElementById('clippedLines').textContent = clippedCount;
    document.getElementById('rejectedLines').textContent = rejectedCount;
});

function updateStats() {
    document.getElementById('totalLines').textContent = lines.length;
}

clearBtn.addEventListener('click', () => {
    lines = [];
    startPoint = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClipWindow();
    updateStats();
    document.getElementById('clippedLines').textContent = '0';
    document.getElementById('rejectedLines').textContent = '0';
});

// Inicializar
drawClipWindow();