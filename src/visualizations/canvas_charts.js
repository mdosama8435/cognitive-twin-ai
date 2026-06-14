/**
 * Custom Canvas Charting Library (High-DPI, Sleek, Futuristic Dark Theme)
 */

// Helper to setup HDPI canvas
function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Check if we need to scale
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    
    return { ctx, width: rect.width, height: rect.height };
}

/**
 * Draws a Cognitive Radar Chart
 * @param {HTMLCanvasElement} canvas
 * @param {object} values - { conceptualGrasp, quantitativePrecision, roteMemory, attentionSpan, verbosity }
 */
export const drawRadarChart = (canvas, values) => {
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const axes = [
        { label: "Conceptual", val: values.conceptualGrasp },
        { label: "Quantitative", val: values.quantitativePrecision },
        { label: "Rote Memory", val: values.roteMemory },
        { label: "Attention Span", val: values.attentionSpan },
        { label: "Verbosity", val: values.verbosity }
    ];
    
    const numAxes = axes.length;
    
    // 1. Draw Concentric Polygons (Grid)
    const levels = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    
    for (let l = 1; l <= levels; l++) {
        const levelRadius = radius * (l / levels);
        ctx.beginPath();
        for (let i = 0; i < numAxes; i++) {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const x = centerX + levelRadius * Math.cos(angle);
            const y = centerY + levelRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // 2. Draw Axis Lines & Labels
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillStyle = "#94a3b8"; // Slate-400
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    axes.forEach((axis, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const outerX = centerX + radius * Math.cos(angle);
        const outerY = centerY + radius * Math.sin(angle);
        
        // Axis line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
        
        // Label position (pushed slightly past the radius)
        const labelX = centerX + (radius + 20) * Math.cos(angle);
        const labelY = centerY + (radius + 12) * Math.sin(angle);
        ctx.fillText(axis.label, labelX, labelY);
    });
    
    // 3. Draw Student Data Polygon
    ctx.beginPath();
    axes.forEach((axis, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const valRatio = (axis.val || 10) / 100;
        const valRadius = radius * valRatio;
        const x = centerX + valRadius * Math.cos(angle);
        const y = centerY + valRadius * Math.sin(angle);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    
    // Fill with semi-translucent neon amber
    const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(245, 158, 11, 0.1)");
    gradient.addColorStop(1, "rgba(245, 158, 11, 0.3)");
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = "#f59e0b"; // Amber-500
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw data points
    axes.forEach((axis, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const valRatio = (axis.val || 10) / 100;
        const valRadius = radius * valRatio;
        const x = centerX + valRadius * Math.cos(angle);
        const y = centerY + valRadius * Math.sin(angle);
        
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
};

/**
 * Draws real-time timeline metrics
 * @param {HTMLCanvasElement} canvas
 * @param {Array} history - Array of { attention, fatigue, stress, confidence }
 */
export const drawTimelineChart = (canvas, history) => {
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    
    const paddingLeft = 35;
    const paddingBottom = 20;
    const paddingTop = 10;
    const paddingRight = 10;
    
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;
    
    // Draw background grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
        const y = paddingTop + chartH * (i / 4);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        
        // Y-axis labels
        ctx.fillStyle = "#475569"; // Slate-600
        ctx.font = "8px monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(`${100 - i * 25}%`, paddingLeft - 5, y);
    }
    
    if (history.length < 2) return;
    
    // Lines Config
    const lines = [
        { key: "attention", color: "#06b6d4", label: "Attention" },
        { key: "fatigue", color: "#f43f5e", label: "Fatigue" },
        { key: "stress", color: "#a855f7", label: "Stress" },
        { key: "confidence", color: "#f59e0b", label: "Confidence" }
    ];
    
    lines.forEach(line => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        
        history.forEach((point, i) => {
            const ratioX = i / (history.length - 1);
            const ratioY = (point[line.key] || 0) / 100;
            
            const x = paddingLeft + ratioX * chartW;
            const y = paddingTop + chartH * (1 - ratioY);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    });
};

/**
 * Draws circular Twin Accuracy Gauge
 * @param {HTMLCanvasElement} canvas
 * @param {number} percentage - 0 to 100
 */
export const drawTwinGauge = (canvas, percentage) => {
    if (!canvas) return;
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 1.35;
    const radius = Math.min(width, height) * 0.5;
    
    // 1. Draw Background Track (Semi-circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();
    
    // 2. Draw Value Bar
    const progressAngle = Math.PI + (percentage / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, progressAngle);
    
    // Glow color based on accuracy score
    let color = "#ef4444"; // Rose
    if (percentage > 85) color = "#10b981"; // Emerald
    else if (percentage > 60) color = "#f59e0b"; // Amber
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();
    
    // 3. Draw Percentage Text
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`${percentage}%`, centerX, centerY - 15);
    
    ctx.fillStyle = "#64748b";
    ctx.font = "9px Inter, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("COGNITIVE TWIN ACCURACY", centerX, centerY - 10);
};
