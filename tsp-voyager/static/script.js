// Canvas and interaction state
let canvas, ctx;
let cities = [];
let route = [];
let mode = 'city'; // 'city' or 'pan'
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;

// Zoom and view state
let zoom = 1.0;
let offsetX = 0;
let offsetY = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;

// Grid configuration
const GRID_SIZE = 50; // Base grid size in graph units
let gridSpacing = GRID_SIZE;

// Canvas dimensions
let canvasWidth, canvasHeight;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('tspCanvas');
    ctx = canvas.getContext('2d');
    
    initializeCanvas();
    setupEventListeners();
    drawCanvas();
    
    // Initial render
    requestAnimationFrame(render);
});

function initializeCanvas() {
    const wrapper = document.getElementById('canvasWrapper');
    canvasWidth = wrapper.clientWidth;
    canvasHeight = wrapper.clientHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Center the view
    offsetX = canvasWidth / 2;
    offsetY = (canvasHeight / 2) - 13; // half footer height

}

function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn-compact').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn-compact').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            updateCanvasCursor();
        });
    });
    
    // Canvas interactions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        zoomAt(centerX, centerY, 1 + ZOOM_STEP);
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        zoomAt(centerX, centerY, 1 - ZOOM_STEP);
    });
    
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    
    // Action buttons
    document.getElementById('solveBtn').addEventListener('click', solveTSP);
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    
    // Window resize
    window.addEventListener('resize', () => {
        initializeCanvas();
        resetView();
    });
}

function updateCanvasCursor() {
    const wrapper = document.getElementById('canvasWrapper');
    wrapper.classList.toggle('pan-mode', mode === 'pan');
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    if (mode === 'city') {
        addCity(canvasX, canvasY);
    } else if (mode === 'pan') {
        isPanning = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Update cursor coordinates
    const graphCoords = canvasToGraph(canvasX, canvasY);
    document.getElementById('cursorCoords').textContent = 
        `X: ${graphCoords.x.toFixed(1)}, Y: ${graphCoords.y.toFixed(1)}`;
    
    if (isPanning && mode === 'pan') {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        
        offsetX += dx;
        offsetY += dy;
        
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        
        drawCanvas();
    }
}

function handleMouseUp() {
    isPanning = false;
}

function handleWheel(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY < 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP;
    zoomAt(mouseX, mouseY, zoomFactor);
}

function zoomAt(canvasX, canvasY, factor) {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
    
    if (newZoom !== zoom) {
        // Zoom towards the mouse position
        const graphBefore = canvasToGraph(canvasX, canvasY);
        
        zoom = newZoom;
        
        const graphAfter = canvasToGraph(canvasX, canvasY);
        
        // Adjust offset to keep the point under mouse stable
        offsetX += (graphAfter.x - graphBefore.x) * zoom;
        offsetY += (graphAfter.y - graphBefore.y) * zoom;
        
        updateZoomLevel();
        drawCanvas();
    }
}

function resetView() {
    zoom = 1.0;
    offsetX = canvasWidth / 2;
    offsetY = canvasHeight / 2;
    updateZoomLevel();
    drawCanvas();
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = `Zoom: ${(zoom * 100).toFixed(0)}%`;
}

// Coordinate conversion functions
function canvasToGraph(canvasX, canvasY) {
    const x = (canvasX - offsetX) / zoom;
    const y = (canvasY - offsetY) / zoom;
    return { x, y };
}

function graphToCanvas(graphX, graphY) {
    const x = graphX * zoom + offsetX;
    const y = graphY * zoom + offsetY;
    return { x, y };
}

// City management
function addCity(canvasX, canvasY) {
    const graphCoords = canvasToGraph(canvasX, canvasY);
    
    cities.push({
        x: graphCoords.x,
        y: graphCoords.y,
        id: cities.length
    });
    
    route = []; // Clear route when adding new city
    updateStats();
    drawCanvas();
}

function clearAll() {
    cities = [];
    route = [];
    updateStats();
    drawCanvas();
}

function updateStats() {
    document.getElementById('cityCount').textContent = cities.length;
    
    if (route.length > 0) {
        const distance = calculateRouteDistance();
        document.getElementById('totalDistance').textContent = distance.toFixed(2);
        
        // Update exploration flow
        updateExplorationFlow();
    } else {
        document.getElementById('totalDistance').textContent = '—';
        
        // Clear exploration flow
        const explorationContent = document.getElementById('explorationContent');
        if (explorationContent) {
            explorationContent.innerHTML = '<small class="text-muted">No route yet</small>';
        }
    }
}

function updateExplorationFlow() {
    const explorationContent = document.getElementById('explorationContent');
    if (!explorationContent || route.length === 0) return;

    let html = '';

    for (let i = 0; i < route.length; i++) {
        const fromIndex = route[i];
        const toIndex = route[(i + 1) % route.length];

        const from = cities[fromIndex];
        const to = cities[toIndex];

        const dist = Math.hypot(to.x - from.x, to.y - from.y).toFixed(2);

        html += `
            <div class="exploration-step">
                <span class="city-step">C${fromIndex}</span>
                <span class="city-arrow">→</span>
                <span class="distance-badge">${dist}</span>
                <span class="city-arrow">→</span>
                <span class="city-step">C${toIndex}</span>
            </div>
        `;
    }

    explorationContent.innerHTML = html;
}


function calculateRouteDistance() {
    if (route.length === 0) return 0;
    
    let total = 0;
    for (let i = 0; i < route.length; i++) {
        const current = cities[route[i]];
        const next = cities[route[(i + 1) % route.length]];
        total += Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
    }
    return total;
}

// TSP Solving
async function solveTSP() {
    if (cities.length < 2) {
        alert('Please add at least 2 cities to solve TSP');
        return;
    }
    
    const algorithm = document.getElementById('algorithmSelect').value;
    const overlay = document.getElementById('loadingOverlay');
    
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
    
    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cities: cities,
                algorithm: algorithm
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to solve TSP');
        }
        
        const data = await response.json();
        route = data.route;
        
        // Update algorithm badge
        const algorithmNames = {
            'nearest_neighbor': 'NEAREST',
            'held_karp': 'HELD-KARP',
            'brute_force': 'BRUTE FORCE'
        };
        document.getElementById('currentAlgorithm').textContent = algorithmNames[algorithm];
        
        updateStats();
        animateExploration();
        
    } catch (error) {
        console.error('Error solving TSP:', error);
        alert('Error solving TSP. Please try again.');
    } finally {
        overlay.classList.add('d-none');
        overlay.classList.remove('d-flex');
    }
}

async function animateExploration() {
    routeProgress = 0;

    for (let i = 1; i <= route.length; i++) {
        routeProgress = i / route.length;
        drawCanvas(routeProgress);
        updateExplorationFlow();
        await new Promise(r => setTimeout(r, 400));
    }
}


function animateRoute() {
    let progress = 0;
    const duration = 1000; // 1 second animation
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        drawCanvas(progress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Drawing functions
function drawCanvas(routeProgress = 1) {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid and axes
    drawGrid();
    drawAxes();
    
    // Draw route if exists
    if (route.length > 0 && routeProgress > 0) {
        drawRoute(routeProgress);
    }
    
    // Draw cities
    drawCities();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
    ctx.lineWidth = 1;
    
    // Calculate grid spacing based on zoom
    let spacing = GRID_SIZE;
    while (spacing * zoom < 30) {
        spacing *= 2;
    }
    while (spacing * zoom > 120) {
        spacing /= 2;
    }
    
    gridSpacing = spacing;
    
    // Calculate grid bounds in graph coordinates
    const topLeft = canvasToGraph(0, 0);
    const bottomRight = canvasToGraph(canvasWidth, canvasHeight);
    
    const startX = Math.floor(topLeft.x / spacing) * spacing;
    const endX = Math.ceil(bottomRight.x / spacing) * spacing;
    const startY = Math.floor(topLeft.y / spacing) * spacing;
    const endY = Math.ceil(bottomRight.y / spacing) * spacing;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += spacing) {
        const canvasPos = graphToCanvas(x, 0);
        ctx.beginPath();
        ctx.moveTo(canvasPos.x, 0);
        ctx.lineTo(canvasPos.x, canvasHeight);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += spacing) {
        const canvasPos = graphToCanvas(0, y);
        ctx.beginPath();
        ctx.moveTo(0, canvasPos.y);
        ctx.lineTo(canvasWidth, canvasPos.y);
        ctx.stroke();
    }
}

function drawAxes() {
    const origin = graphToCanvas(0, 0);
    
    // X-axis
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvasWidth, origin.y);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvasHeight);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#00ffcc';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Calculate label bounds
    const topLeft = canvasToGraph(0, 0);
    const bottomRight = canvasToGraph(canvasWidth, canvasHeight);
    
    const startX = Math.floor(topLeft.x / gridSpacing) * gridSpacing;
    const endX = Math.ceil(bottomRight.x / gridSpacing) * gridSpacing;
    
    // X-axis labels
    for (let x = startX; x <= endX; x += gridSpacing) {
        if (x === 0) continue;
        const canvasPos = graphToCanvas(x, 0);
        if (canvasPos.y >= 0 && canvasPos.y <= canvasHeight) {
            ctx.fillText(x.toFixed(0), canvasPos.x, canvasPos.y + 5);
        }
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const startY = Math.floor(topLeft.y / gridSpacing) * gridSpacing;
    const endY = Math.ceil(bottomRight.y / gridSpacing) * gridSpacing;
    
    for (let y = startY; y <= endY; y += gridSpacing) {
        if (y === 0) continue;
        const canvasPos = graphToCanvas(0, y);
        if (canvasPos.x >= 0 && canvasPos.x <= canvasWidth) {
            ctx.fillText(y.toFixed(0), canvasPos.x - 5, canvasPos.y);
        }
    }
}

function drawCities() {
    cities.forEach((city, index) => {
        const pos = graphToCanvas(city.x, city.y);
        
        // Skip if outside canvas
        if (pos.x < -50 || pos.x > canvasWidth + 50 || 
            pos.y < -50 || pos.y > canvasHeight + 50) {
            return;
        }
        
        // Draw city glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 15);
        gradient.addColorStop(0, 'rgba(0, 255, 204, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(pos.x - 15, pos.y - 15, 30, 30);
        
        // Draw city circle
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw city border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw city label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index, pos.x, pos.y);
    });
}

function drawRoute(progress = 1) {
    if (route.length < 2) return;
    
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    // Calculate total segments to draw based on progress
    const totalSegments = route.length;
    const segmentsToDraw = Math.floor(totalSegments * progress);
    const partialSegment = (totalSegments * progress) % 1;
    
    for (let i = 0; i < segmentsToDraw; i++) {
        const current = cities[route[i]];
        const next = cities[route[(i + 1) % route.length]];
        
        const start = graphToCanvas(current.x, current.y);
        const end = graphToCanvas(next.x, next.y);
        
        // Draw route segment with glow
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        /* ================================
        DISTANCE LABEL (PUT HERE)
        ================================ */
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        const dist = Math.hypot(
            next.x - current.x,
            next.y - current.y
        ).toFixed(1);

        ctx.save();
        ctx.fillStyle = '#ffcc00';
        ctx.font = `${10 / zoom}px JetBrains Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dist, midX, midY - (8 / zoom));
        ctx.restore();

    }
    
    // Draw partial segment if animating
    if (partialSegment > 0 && segmentsToDraw < totalSegments) {
        const current = cities[route[segmentsToDraw]];
        const next = cities[route[(segmentsToDraw + 1) % route.length]];
        
        const start = graphToCanvas(current.x, current.y);
        const end = graphToCanvas(next.x, next.y);
        
        const partialX = start.x + (end.x - start.x) * partialSegment;
        const partialY = start.y + (end.y - start.y) * partialSegment;
        
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(partialX, partialY);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    // Draw direction arrows
    if (progress >= 1) {
        drawRouteArrows();
    }
}

function drawRouteArrows() {
    ctx.fillStyle = '#ff00ff';
    
    for (let i = 0; i < route.length; i++) {
        const current = cities[route[i]];
        const next = cities[route[(i + 1) % route.length]];
        
        const start = graphToCanvas(current.x, current.y);
        const end = graphToCanvas(next.x, next.y);
        
        // Calculate midpoint
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Calculate angle
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        
        // Draw arrow
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -5);
        ctx.lineTo(-8, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

function render() {
    // Continuous render loop for smooth animations
    requestAnimationFrame(render);
}

// Initial stats update
updateStats();
updateZoomLevel();