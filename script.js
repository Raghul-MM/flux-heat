// ============================================================
// JARVIS — BIOLOGICAL TRANSPORT SIMULATOR
// THERMAL TISSUE MODULE
// Cylindrical biological tissue with metabolic heat generation
// ============================================================
//
// Scientific model:
//
// T(r) = Ts + (Qm R² / 4k) [1 - (r/R)²]
//
// ΔTmax = Qm R² / 4k
//
// qr = Qm r / 2
//
// ============================================================


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const heatGeneration = document.getElementById("heatGeneration");
const conductivity = document.getElementById("conductivity");
const radius = document.getElementById("radius");
const surfaceTemp = document.getElementById("surfaceTemp");

const sValue = document.getElementById("sValue");
const kValue = document.getElementById("kValue");
const rValue = document.getElementById("rValue");
const tsValue = document.getElementById("tsValue");

const liveS = document.getElementById("liveS");
const liveK = document.getElementById("liveK");
const liveR = document.getElementById("liveR");
const liveTs = document.getElementById("liveTs");

const maxTemperature = document.getElementById("maxTemperature");
const temperatureRise = document.getElementById("temperatureRise");
const calcResult = document.getElementById("calcResult");

const jarvisMessage = document.getElementById("jarvisMessage");

const tissueCanvas = document.getElementById("tissueCanvas");
const temperatureGraph = document.getElementById("temperatureGraph");

const visualHeat = document.getElementById("visualHeat");
const visualConductivity = document.getElementById("visualConductivity");
const visualRadius = document.getElementById("visualRadius");


// ============================================================
// CANVAS CONTEXTS
// ============================================================

const tissueCtx = tissueCanvas
    ? tissueCanvas.getContext("2d")
    : null;

const graphCtx = temperatureGraph
    ? temperatureGraph.getContext("2d")
    : null;


// ============================================================
// SCIENTIFIC FUNCTIONS
// ============================================================

// Temperature at radial position r

function temperatureAtRadius(r, Qm, k, R, Ts) {

    return (
        Ts +
        (Qm * R * R) / (4 * k) *
        (1 - (r * r) / (R * R))
    );

}


// Maximum temperature occurs at r = 0

function maximumTemperature(Qm, k, R, Ts) {

    return Ts + (Qm * R * R) / (4 * k);

}


// Temperature rise

function temperatureRiseValue(Qm, k, R) {

    return (Qm * R * R) / (4 * k);

}


// Radial heat flux

function heatFlux(r, Qm) {

    return (Qm * r) / 2;

}


// ============================================================
// CANVAS RESIZE
// ============================================================

function resizeCanvas(canvas, ctx) {

    if (!canvas || !ctx) {
        return null;
    }

    const rect = canvas.getBoundingClientRect();

    const width = Math.max(
        300,
        rect.width || canvas.clientWidth || 800
    );

    const height = Math.max(
        250,
        rect.height || canvas.clientHeight || 500
    );

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    return {
        width: width,
        height: height
    };
}


// ============================================================
// DRAW ROUNDED RECTANGLE
// ============================================================

function roundedRect(ctx, x, y, width, height, radius) {

    ctx.beginPath();

    if (typeof ctx.roundRect === "function") {

        ctx.roundRect(
            x,
            y,
            width,
            height,
            radius
        );

    } else {

        // Fallback for older browsers

        ctx.rect(
            x,
            y,
            width,
            height
        );
    }
}


// ============================================================
// DRAW TISSUE
// ============================================================

function drawTissue(Qm, k, R, Ts) {

    if (!tissueCtx) {
        return;
    }

    const size = resizeCanvas(
        tissueCanvas,
        tissueCtx
    );

    if (!size) {
        return;
    }

    const width = size.width;
    const height = size.height;

    tissueCtx.clearRect(
        0,
        0,
        width,
        height
    );


    // --------------------------------------------------------
    // CENTRE
    // --------------------------------------------------------

    const cx = width * 0.50;
    const cy = height * 0.50;


    // --------------------------------------------------------
    // RADIUS VISUAL SCALING
    // --------------------------------------------------------

    const minR = 0.005;
    const maxR = 0.050;

    const radiusFraction = Math.max(
        0,
        Math.min(
            1,
            (R - minR) / (maxR - minR)
        )
    );

    const visualScale =
        0.72 +
        radiusFraction * 0.28;

    const rx =
        Math.min(width * 0.37, 300) *
        visualScale;

    const ry =
        Math.min(height * 0.31, 210) *
        visualScale;


    // --------------------------------------------------------
    // TEMPERATURE
    // --------------------------------------------------------

    const deltaT =
        temperatureRiseValue(
            Qm,
            k,
            R
        );

    const Tmax =
        maximumTemperature(
            Qm,
            k,
            R,
            Ts
        );


    // --------------------------------------------------------
    // VISUAL HEAT INTENSITY
    // --------------------------------------------------------

    const heatIntensity = Math.min(
        1,
        deltaT / 1.0
    );


    // --------------------------------------------------------
    // CONDUCTIVITY EFFECT
    // Higher k = better heat spreading
    // --------------------------------------------------------

    const conductivityFraction =
        Math.max(
            0,
            Math.min(
                1,
                (k - 0.1) / 1.9
            )
        );

    const spreading =
        1 - conductivityFraction;


    // --------------------------------------------------------
    // BACKGROUND GLOW
    // --------------------------------------------------------

    const glow = tissueCtx.createRadialGradient(
        cx,
        cy,
        10,
        cx,
        cy,
        rx * 1.45
    );

    glow.addColorStop(
        0,
        `rgba(
            255,
            55,
            25,
            ${0.12 + heatIntensity * 0.35}
        )`
    );

    glow.addColorStop(
        0.55,
        `rgba(
            255,
            70,
            30,
            ${0.05 + heatIntensity * 0.15}
        )`
    );

    glow.addColorStop(
        1,
        "rgba(255,50,30,0)"
    );

    tissueCtx.beginPath();

    tissueCtx.ellipse(
        cx,
        cy,
        rx * 1.18,
        ry * 1.18,
        0,
        0,
        Math.PI * 2
    );

    tissueCtx.fillStyle = glow;
    tissueCtx.fill();


    // --------------------------------------------------------
    // TISSUE BODY
    // --------------------------------------------------------

    const tissueGradient =
        tissueCtx.createRadialGradient(
            cx,
            cy,
            5,
            cx,
            cy,
            rx
        );


    const redCentre =
        Math.round(
            35 +
            heatIntensity * 200
        );

    const greenCentre =
        Math.round(
            85 -
            heatIntensity * 45
        );

    const blueCentre =
        Math.round(
            105 -
            heatIntensity * 55
        );


    tissueGradient.addColorStop(
        0,
        `rgba(
            ${redCentre},
            ${greenCentre},
            ${blueCentre},
            0.98
        )`
    );


    tissueGradient.addColorStop(
        0.45,
        `rgba(
            ${40 + heatIntensity * 120},
            ${85 - heatIntensity * 25},
            ${105 - heatIntensity * 30},
            0.94
        )`
    );


    tissueGradient.addColorStop(
        1,
        "rgba(20,65,78,0.96)"
    );


    tissueCtx.beginPath();

    tissueCtx.ellipse(
        cx,
        cy,
        rx,
        ry,
        0,
        0,
        Math.PI * 2
    );

    tissueCtx.fillStyle =
        tissueGradient;

    tissueCtx.fill();


    // --------------------------------------------------------
    // TISSUE BORDER
    // --------------------------------------------------------

    tissueCtx.beginPath();

    tissueCtx.ellipse(
        cx,
        cy,
        rx,
        ry,
        0,
        0,
        Math.PI * 2
    );

    tissueCtx.strokeStyle =
        "rgba(95,210,230,0.75)";

    tissueCtx.lineWidth = 2;

    tissueCtx.stroke();


    // --------------------------------------------------------
    // TISSUE CELLS
    // --------------------------------------------------------

    const spacing = Math.max(
        28,
        38 - radiusFraction * 7
    );


    for (
        let y = cy - ry + 20;
        y < cy + ry;
        y += spacing
    ) {

        for (
            let x = cx - rx + 20;
            x < cx + rx;
            x += spacing
        ) {

            const dx =
                (x - cx) / rx;

            const dy =
                (y - cy) / ry;

            if (
                dx * dx +
                dy * dy >
                0.88
            ) {
                continue;
            }


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const localHeat =
                Math.max(
                    0,
                    1 - distance
                ) *
                heatIntensity;


            const red =
                Math.round(
                    55 +
                    localHeat *
                    150 *
                    (0.75 + spreading * 0.25)
                );


            const green =
                Math.round(
                    125 -
                    localHeat * 65
                );


            const blue =
                Math.round(
                    145 -
                    localHeat * 75
                );


            // Cell

            tissueCtx.beginPath();

            tissueCtx.arc(
                x,
                y,
                13,
                0,
                Math.PI * 2
            );

            tissueCtx.fillStyle =
                `rgba(
                    ${red},
                    ${green},
                    ${blue},
                    0.92
                )`;

            tissueCtx.fill();


            tissueCtx.strokeStyle =
                "rgba(150,215,225,0.35)";

            tissueCtx.lineWidth = 1.2;

            tissueCtx.stroke();


            // Nucleus

            tissueCtx.beginPath();

            tissueCtx.arc(
                x,
                y,
                3.5,
                0,
                Math.PI * 2
            );

            tissueCtx.fillStyle =
                "rgba(0,225,245,0.60)";

            tissueCtx.fill();

        }
    }


    // --------------------------------------------------------
    // BLOOD VESSELS
    // --------------------------------------------------------

    drawBloodVessels(
        cx,
        cy,
        rx,
        ry
    );


    // --------------------------------------------------------
    // METABOLIC HEAT SOURCE
    // --------------------------------------------------------

    const heatSource =
        tissueCtx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            rx * 0.45
        );


    heatSource.addColorStop(
        0,
        `rgba(
            255,
            65,
            25,
            ${0.20 + heatIntensity * 0.65}
        )`
    );


    heatSource.addColorStop(
        0.45,
        `rgba(
            255,
            60,
            25,
            ${0.08 + heatIntensity * 0.30}
        )`
    );


    heatSource.addColorStop(
        1,
        "rgba(255,50,30,0)"
    );


    tissueCtx.beginPath();

    tissueCtx.arc(
        cx,
        cy,
        rx * 0.45,
        0,
        Math.PI * 2
    );

    tissueCtx.fillStyle =
        heatSource;

    tissueCtx.fill();


    // --------------------------------------------------------
    // HEAT FLUX ARROWS
    // --------------------------------------------------------

    drawHeatFlux(
        cx,
        cy,
        rx,
        ry,
        Qm,
        R
    );


    // --------------------------------------------------------
    // CENTRE TEMPERATURE
    // --------------------------------------------------------

    drawCentreTemperature(
        cx,
        cy,
        Tmax
    );


    // --------------------------------------------------------
    // VISUAL RESPONSE
    // --------------------------------------------------------

    updateVisualResponse(
        Qm,
        k,
        R
    );


    // --------------------------------------------------------
    // LABELS
    // --------------------------------------------------------

    tissueCtx.textAlign = "left";

    tissueCtx.font =
        "bold 12px Arial";

    tissueCtx.fillStyle =
        "#ff5738";

    tissueCtx.fillText(
        "METABOLIC HEAT",
        Math.max(15, cx - rx * 0.72),
        Math.min(
            height - 20,
            cy + ry * 0.88
        )
    );


    tissueCtx.fillStyle =
        "#ff4160";

    tissueCtx.fillText(
        "BLOOD VESSEL",
        Math.min(
            width - 120,
            cx + rx * 0.35
        ),
        Math.max(
            25,
            cy - ry * 0.72
        )
    );
}


// ============================================================
// BLOOD VESSELS
// ============================================================

function drawBloodVessels(
    cx,
    cy,
    rx,
    ry
) {

    const vessels = [

        [
            cx - rx * 0.82,
            cy - 15,
            cx + rx * 0.82,
            cy + 18
        ],

        [
            cx - rx * 0.38,
            cy + ry * 0.72,
            cx + rx * 0.22,
            cy - ry * 0.72
        ],

        [
            cx - rx * 0.12,
            cy - ry * 0.68,
            cx + rx * 0.70,
            cy - ry * 0.12
        ]

    ];


    vessels.forEach(
        (vessel, index) => {

            const [
                x1,
                y1,
                x2,
                y2
            ] = vessel;


            tissueCtx.beginPath();

            tissueCtx.moveTo(
                x1,
                y1
            );

            tissueCtx.lineTo(
                x2,
                y2
            );


            tissueCtx.strokeStyle =
                "rgba(255,45,90,0.88)";

            tissueCtx.lineWidth =
                index === 0 ? 7 : 5;

            tissueCtx.lineCap =
                "round";

            tissueCtx.stroke();


            // Vessel highlight

            tissueCtx.beginPath();

            tissueCtx.moveTo(
                x1,
                y1 - 1
            );

            tissueCtx.lineTo(
                x2,
                y2 - 1
            );

            tissueCtx.strokeStyle =
                "rgba(255,150,165,0.55)";

            tissueCtx.lineWidth = 2;

            tissueCtx.stroke();

        }
    );
}


// ============================================================
// HEAT FLUX
// ============================================================

function drawHeatFlux(
    cx,
    cy,
    rx,
    ry,
    Qm,
    R
) {

    const surfaceFlux =
        heatFlux(
            R,
            Qm
        );


    // Visual normalization only.
    // Scientific value remains Qm*R/2.

    const intensity =
        Math.min(
            1,
            surfaceFlux / 12.5
        );


    const arrowCount =
        Math.round(
            6 +
            intensity * 8
        );


    for (
        let i = 0;
        i < arrowCount;
        i++
    ) {

        const angle =
            (i / arrowCount) *
            Math.PI *
            2;


        const startScale = 0.18;

        const endScale =
            0.42 +
            intensity * 0.40;


        const x1 =
            cx +
            Math.cos(angle) *
            rx *
            startScale;


        const y1 =
            cy +
            Math.sin(angle) *
            ry *
            startScale;


        const x2 =
            cx +
            Math.cos(angle) *
            rx *
            endScale;


        const y2 =
            cy +
            Math.sin(angle) *
            ry *
            endScale;


        // Main arrow

        tissueCtx.beginPath();

        tissueCtx.moveTo(
            x1,
            y1
        );

        tissueCtx.lineTo(
            x2,
            y2
        );


        tissueCtx.strokeStyle =
            `rgba(
                0,
                225,
                250,
                ${0.20 + intensity * 0.70}
            )`;

        tissueCtx.lineWidth =
            1.5 +
            intensity * 2;

        tissueCtx.stroke();


        // Arrow head

        const head =
            5 +
            intensity * 5;


        tissueCtx.beginPath();

        tissueCtx.moveTo(
            x2,
            y2
        );

        tissueCtx.lineTo(
            x2 -
            head *
            Math.cos(
                angle - Math.PI / 6
            ),
            y2 -
            head *
            Math.sin(
                angle - Math.PI / 6
            )
        );


        tissueCtx.moveTo(
            x2,
            y2
        );

        tissueCtx.lineTo(
            x2 -
            head *
            Math.cos(
                angle + Math.PI / 6
            ),
            y2 -
            head *
            Math.sin(
                angle + Math.PI / 6
            )
        );


        tissueCtx.strokeStyle =
            "#00eaff";

        tissueCtx.lineWidth = 2;

        tissueCtx.stroke();

    }
}


// ============================================================
// CENTRE TEMPERATURE BOX
// ============================================================

function drawCentreTemperature(
    cx,
    cy,
    Tmax
) {

    const boxWidth = 180;
    const boxHeight = 68;


    roundedRect(
        tissueCtx,
        cx - boxWidth / 2,
        cy - boxHeight / 2,
        boxWidth,
        boxHeight,
        10
    );


    tissueCtx.fillStyle =
        "rgba(3,15,23,0.94)";

    tissueCtx.fill();


    tissueCtx.strokeStyle =
        "rgba(0,225,245,0.80)";

    tissueCtx.lineWidth = 1.5;

    tissueCtx.stroke();


    tissueCtx.textAlign =
        "center";


    tissueCtx.font =
        "11px Arial";

    tissueCtx.fillStyle =
        "#9ab2bd";

    tissueCtx.fillText(
        "TISSUE CENTRE",
        cx,
        cy - 11
    );


    tissueCtx.font =
        "bold 20px Arial";

    tissueCtx.fillStyle =
        "#00eaff";

    tissueCtx.fillText(
        Tmax.toFixed(2) + " °C",
        cx,
        cy + 18
    );
}


// ============================================================
// UPDATE HTML VISUAL RESPONSE
// ============================================================

function updateVisualResponse(
    Qm,
    k,
    R
) {

    const heatPercent =
        Math.round(
            (Qm / 500) * 100
        );


    const conductivityPercent =
        Math.round(
            ((k - 0.1) / 1.9) * 100
        );


    const radiusPercent =
        Math.round(
            ((R - 0.005) / 0.045) * 100
        );


    if (visualHeat) {

        visualHeat.textContent =
            "Qₘ → heat intensity: " +
            heatPercent +
            "%";

    }


    if (visualConductivity) {

        visualConductivity.textContent =
            "k → heat spreading: " +
            conductivityPercent +
            "%";

    }


    if (visualRadius) {

        visualRadius.textContent =
            "R → tissue size: " +
            radiusPercent +
            "%";

    }
}


// ============================================================
// TEMPERATURE GRAPH
// ============================================================

function drawTemperatureGraph(
    Qm,
    k,
    R,
    Ts
) {

    if (!graphCtx) {
        return;
    }


    const size =
        resizeCanvas(
            temperatureGraph,
            graphCtx
        );


    if (!size) {
        return;
    }


    const width = size.width;
    const height = size.height;


    graphCtx.clearRect(
        0,
        0,
        width,
        height
    );


    // --------------------------------------------------------
    // GRAPH MARGINS
    // --------------------------------------------------------

    const left = 52;
    const right = 20;
    const top = 28;
    const bottom = 38;


    const graphWidth =
        width -
        left -
        right;


    const graphHeight =
        height -
        top -
        bottom;


    // --------------------------------------------------------
    // SCIENTIFIC VALUES
    // --------------------------------------------------------

    const deltaT =
        temperatureRiseValue(
            Qm,
            k,
            R
        );


    const Tmax =
        Ts +
        deltaT;


    // --------------------------------------------------------
    // ADAPTIVE GRAPH SCALE
    //
    // This is only display scaling.
    // Scientific values are unchanged.
    // --------------------------------------------------------

    const range =
        Math.max(
            0.02,
            deltaT * 1.35
        );


    const graphMin =
        Ts -
        range * 0.12;


    const graphMax =
        Ts +
        range;


    // --------------------------------------------------------
    // GRID
    // --------------------------------------------------------

    graphCtx.strokeStyle =
        "rgba(90,130,145,0.20)";

    graphCtx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            top +
            (i / 4) *
            graphHeight;


        graphCtx.beginPath();

        graphCtx.moveTo(
            left,
            y
        );

        graphCtx.lineTo(
            width - right,
            y
        );

        graphCtx.stroke();

    }


    // --------------------------------------------------------
    // AXES
    // --------------------------------------------------------

    graphCtx.strokeStyle =
        "rgba(130,170,185,0.65)";

    graphCtx.lineWidth = 1.2;


    graphCtx.beginPath();

    graphCtx.moveTo(
        left,
        top
    );

    graphCtx.lineTo(
        left,
        height - bottom
    );

    graphCtx.lineTo(
        width - right,
        height - bottom
    );

    graphCtx.stroke();


    // --------------------------------------------------------
    // TEMPERATURE CURVE
    // --------------------------------------------------------

    graphCtx.beginPath();


    const points = 120;


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const r =
            R *
            (i / points);


        const T =
            temperatureAtRadius(
                r,
                Qm,
                k,
                R,
                Ts
            );


        const x =
            left +
            (i / points) *
            graphWidth;


        const y =
            top +
            (
                (graphMax - T) /
                (graphMax - graphMin)
            ) *
            graphHeight;


        if (i === 0) {

            graphCtx.moveTo(
                x,
                y
            );

        } else {

            graphCtx.lineTo(
                x,
                y
            );

        }

    }


    graphCtx.strokeStyle =
        "#00eaff";

    graphCtx.lineWidth = 3;

    graphCtx.shadowColor =
        "#00eaff";

    graphCtx.shadowBlur = 8;

    graphCtx.stroke();

    graphCtx.shadowBlur = 0;


    // --------------------------------------------------------
    // CENTRE POINT
    // --------------------------------------------------------

    const centreY =
        top +
        (
            (graphMax - Tmax) /
            (graphMax - graphMin)
        ) *
        graphHeight;


    drawGraphPoint(
        left,
        centreY
    );


    // --------------------------------------------------------
    // SURFACE POINT
    // --------------------------------------------------------

    drawGraphPoint(
        width - right,
        height - bottom
    );


    // --------------------------------------------------------
    // GRAPH TITLE
    // --------------------------------------------------------

    graphCtx.textAlign = "left";

    graphCtx.font =
        "bold 10px Arial";

    graphCtx.fillStyle =
        "#00eaff";

    graphCtx.fillText(
        "LIVE TEMPERATURE PROFILE",
        left + 5,
        14
    );


    graphCtx.font =
        "10px Arial";

    graphCtx.fillStyle =
        "#9eb4be";

    graphCtx.fillText(
        "T (°C)",
        5,
        14
    );


    // --------------------------------------------------------
    // X LABELS
    // --------------------------------------------------------

    graphCtx.textAlign = "left";

    graphCtx.fillText(
        "r = 0",
        left - 10,
        height - 10
    );


    graphCtx.textAlign = "right";

    graphCtx.fillText(
        "r = R",
        width - right,
        height - 10
    );


    // --------------------------------------------------------
    // TEMPERATURE VALUES
    // --------------------------------------------------------

    graphCtx.font =
        "bold 10px Arial";

    graphCtx.textAlign = "left";

    graphCtx.fillStyle =
        "#00eaff";

    graphCtx.fillText(
        Tmax.toFixed(2) + " °C",
        left + 7,
        Math.max(
            top + 12,
            centreY - 8
        )
    );


    graphCtx.textAlign = "right";

    graphCtx.fillStyle =
        "#91aab5";

    graphCtx.fillText(
        Ts.toFixed(2) + " °C",
        width - right - 4,
        height - bottom - 7
    );
}


// ============================================================
// GRAPH POINT
// ============================================================

function drawGraphPoint(
    x,
    y
) {

    graphCtx.beginPath();

    graphCtx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
    );


    graphCtx.fillStyle =
        "#ffffff";

    graphCtx.fill();


    graphCtx.strokeStyle =
        "#00eaff";

    graphCtx.lineWidth = 2;

    graphCtx.stroke();
}


// ============================================================
// JARVIS EXPLANATION
// ============================================================

function updateJarvis(
    Qm,
    k,
    R,
    Ts,
    deltaT
) {

    if (!jarvisMessage) {
        return;
    }


    if (deltaT > 1) {

        jarvisMessage.textContent =
            "A strong thermal field has developed. " +
            "Metabolic heat generation and tissue radius " +
            "are producing a larger centre-to-surface " +
            "temperature difference.";

        return;
    }


    if (k <= 0.3) {

        jarvisMessage.textContent =
            "Low thermal conductivity detected. " +
            "Heat is conducted less effectively, " +
            "increasing the centre temperature.";

        return;
    }


    if (R >= 0.04) {

        jarvisMessage.textContent =
            "The tissue radius is large. " +
            "Because the maximum temperature rise varies " +
            "with R², increasing radius strongly increases " +
            "the centre temperature.";

        return;
    }


    if (Qm >= 400) {

        jarvisMessage.textContent =
            "High metabolic heat generation detected. " +
            "More heat is produced inside the tissue, " +
            "increasing radial heat transport.";

        return;
    }


    if (Ts !== 37) {

        jarvisMessage.textContent =
            "The surface temperature has changed. " +
            "The entire tissue temperature field shifts " +
            "with the boundary temperature.";

        return;
    }


    jarvisMessage.textContent =
        "Adjust Qₘ, k, R or Ts. " +
        "JARVIS recalculates the temperature field " +
        "and radial heat transport in real time.";
}


// ============================================================
// MAIN SIMULATION
// ============================================================

function runSimulation() {

    if (
        !heatGeneration ||
        !conductivity ||
        !radius ||
        !surfaceTemp
    ) {

        console.error(
            "JARVIS: Required controls not found."
        );

        return;
    }


    // --------------------------------------------------------
    // READ PARAMETERS
    // --------------------------------------------------------

    const Qm =
        Number(
            heatGeneration.value
        );


    const k =
        Number(
            conductivity.value
        );


    const R =
        Number(
            radius.value
        );


    const Ts =
        Number(
            surfaceTemp.value
        );


    // --------------------------------------------------------
    // SCIENTIFIC CALCULATIONS
    // --------------------------------------------------------

    const deltaT =
        temperatureRiseValue(
            Qm,
            k,
            R
        );


    const Tmax =
        maximumTemperature(
            Qm,
            k,
            R,
            Ts
        );


    const surfaceFlux =
        heatFlux(
            R,
            Qm
        );


    // --------------------------------------------------------
    // LEFT CONTROL VALUES
    // --------------------------------------------------------

    if (sValue) {

        sValue.textContent =
            Qm;

    }


    if (kValue) {

        kValue.textContent =
            k.toFixed(1);

    }


    if (rValue) {

        rValue.textContent =
            R.toFixed(3);

    }


    if (tsValue) {

        tsValue.textContent =
            Ts;

    }


    // --------------------------------------------------------
    // LIVE PARAMETERS
    // --------------------------------------------------------

    if (liveS) {

        liveS.textContent =
            Qm +
            " W/m³";

    }


    if (liveK) {

        liveK.textContent =
            k.toFixed(1) +
            " W/m·K";

    }


    if (liveR) {

        liveR.textContent =
            R.toFixed(3) +
            " m";

    }


    if (liveTs) {

        liveTs.textContent =
            Ts +
            " °C";

    }


    // --------------------------------------------------------
    // RESULTS
    // --------------------------------------------------------

    if (maxTemperature) {

        maxTemperature.textContent =
            Tmax.toFixed(2) +
            " °C";

    }


    if (temperatureRise) {

        temperatureRise.textContent =
            deltaT.toFixed(4) +
            " °C";

    }


    if (calcResult) {

        calcResult.textContent =
            deltaT.toFixed(4);

    }


    // --------------------------------------------------------
    // DRAW TISSUE
    // --------------------------------------------------------

    drawTissue(
        Qm,
        k,
        R,
        Ts
    );


    // --------------------------------------------------------
    // DRAW GRAPH
    // --------------------------------------------------------

    drawTemperatureGraph(
        Qm,
        k,
        R,
        Ts
    );


    // --------------------------------------------------------
    // JARVIS
    // --------------------------------------------------------

    updateJarvis(
        Qm,
        k,
        R,
        Ts,
        deltaT
    );


    // --------------------------------------------------------
    // DEBUG INFORMATION
    // --------------------------------------------------------

    console.log(
        "JARVIS simulation:",
        {
            Qm: Qm,
            k: k,
            R: R,
            Ts: Ts,
            Tmax: Tmax,
            deltaT: deltaT,
            surfaceHeatFlux: surfaceFlux
        }
    );
}


// ============================================================
// SLIDER EVENTS
// ============================================================

if (heatGeneration) {

    heatGeneration.addEventListener(
        "input",
        runSimulation
    );

}


if (conductivity) {

    conductivity.addEventListener(
        "input",
        runSimulation
    );

}


if (radius) {

    radius.addEventListener(
        "input",
        runSimulation
    );

}


if (surfaceTemp) {

    surfaceTemp.addEventListener(
        "input",
        runSimulation
    );

}


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    runSimulation
);


// ============================================================
// START SIMULATION
// ============================================================

runSimulation();
// ============================================================
// JARVIS — CHARGE FLUX MODULE
// CO3: ENERGY & CHARGE CONSERVATION
//
// Core equation:
// ∂ρe/∂t + ∇·J = 0
//
// Constitutive relation:
// J = σE
//
// Electric field:
// E = -∇V
//
// Lorentz force:
// F = q(E + v × B)
// ============================================================


// ============================================================
// CREATE CHARGE FLUX MODULE
// ============================================================

function createChargeFluxModule() {

    // Prevent duplicate creation
    if (document.getElementById("jarvisChargeModule")) {
        return;
    }


    // --------------------------------------------------------
    // MAIN CONTAINER
    // --------------------------------------------------------

    const module = document.createElement("section");

    module.id = "jarvisChargeModule";

    module.style.margin = "40px auto";
    module.style.maxWidth = "1200px";
    module.style.padding = "30px";
    module.style.borderRadius = "20px";
    module.style.background =
        "linear-gradient(145deg, #07131f, #0b1e2e)";
    module.style.border =
        "1px solid rgba(0,217,255,0.25)";
    module.style.boxShadow =
        "0 0 35px rgba(0,217,255,0.08)";


    // ========================================================
    // TITLE
    // ========================================================

    module.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:20px;
            flex-wrap:wrap;
            margin-bottom:25px;
        ">

            <div>

                <h2 style="
                    margin:0;
                    color:#00d9ff;
                    font-size:28px;
                ">
                    ⚡ Charge Flux
                </h2>

                <p style="
                    margin:8px 0 0;
                    color:#9fb8c9;
                ">
                    Charge transport and conservation in biological media
                </p>

            </div>


            <div style="
                padding:8px 14px;
                border-radius:20px;
                border:1px solid rgba(0,217,255,0.3);
                color:#00d9ff;
                font-size:13px;
            ">
                CO3 • CHARGE CONSERVATION
            </div>

        </div>


        <!-- ==================================================
             EQUATION
             ================================================== -->

        <div style="
            padding:22px;
            margin-bottom:25px;
            border-radius:15px;
            background:rgba(0,0,0,0.25);
            text-align:center;
        ">

            <div style="
                color:#8ba8bb;
                font-size:13px;
                margin-bottom:10px;
            ">
                DIFFERENTIAL FORM OF CHARGE CONSERVATION
            </div>

            <div style="
                color:#ffffff;
                font-size:28px;
                font-weight:bold;
            ">
                ∂ρₑ/∂t + ∇ · J = 0
            </div>

            <div style="
                margin-top:12px;
                color:#8ba8bb;
                font-size:14px;
            ">
                Charge accumulation + net charge outflow = 0
            </div>

        </div>


        <!-- ==================================================
             CONTROLS
             ================================================== -->

        <div style="
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
            gap:18px;
            margin-bottom:25px;
        ">


            <!-- CHARGE DENSITY -->

            <div style="
                padding:20px;
                border-radius:15px;
                background:rgba(255,255,255,0.035);
            ">

                <label style="
                    display:block;
                    color:#ffffff;
                    font-weight:bold;
                    margin-bottom:12px;
                ">
                    Charge Density ρₑ
                    <span id="chargeDensityValue"
                          style="color:#00d9ff;">
                        1.00
                    </span>
                    C/m³
                </label>

                <input
                    id="chargeDensitySlider"
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value="1"
                    style="width:100%;"
                >

            </div>


            <!-- CURRENT IN -->

            <div style="
                padding:20px;
                border-radius:15px;
                background:rgba(255,255,255,0.035);
            ">

                <label style="
                    display:block;
                    color:#ffffff;
                    font-weight:bold;
                    margin-bottom:12px;
                ">
                    Incoming Flux Jᵢₙ
                    <span id="chargeJinValue"
                          style="color:#00d9ff;">
                        2.00
                    </span>
                    A/m²
                </label>

                <input
                    id="chargeJinSlider"
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value="2"
                    style="width:100%;"
                >

            </div>


            <!-- CURRENT OUT -->

            <div style="
                padding:20px;
                border-radius:15px;
                background:rgba(255,255,255,0.035);
            ">

                <label style="
                    display:block;
                    color:#ffffff;
                    font-weight:bold;
                    margin-bottom:12px;
                ">
                    Outgoing Flux Jₒᵤₜ
                    <span id="chargeJoutValue"
                          style="color:#00d9ff;">
                        1.00
                    </span>
                    A/m²
                </label>

                <input
                    id="chargeJoutSlider"
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value="1"
                    style="width:100%;"
                >

            </div>


            <!-- CONTROL VOLUME LENGTH -->

            <div style="
                padding:20px;
                border-radius:15px;
                background:rgba(255,255,255,0.035);
            ">

                <label style="
                    display:block;
                    color:#ffffff;
                    font-weight:bold;
                    margin-bottom:12px;
                ">
                    Control Volume Δx
                    <span id="chargeDxValue"
                          style="color:#00d9ff;">
                        0.010
                    </span>
                    m
                </label>

                <input
                    id="chargeDxSlider"
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.001"
                    value="0.01"
                    style="width:100%;"
                >

            </div>

        </div>


        <!-- ==================================================
             RESULTS
             ================================================== -->

        <div style="
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(200px,1fr));
            gap:15px;
            margin-bottom:25px;
        ">


            <div style="
                padding:18px;
                border-radius:14px;
                background:rgba(0,217,255,0.06);
                border:1px solid rgba(0,217,255,0.15);
            ">

                <div style="
                    color:#8ba8bb;
                    font-size:12px;
                ">
                    NET FLUX
                </div>

                <div id="chargeNetFlux"
                     style="
                     color:#ffffff;
                     font-size:23px;
                     font-weight:bold;
                     margin-top:6px;
                ">
                    1.00 A/m²
                </div>

            </div>


            <div style="
                padding:18px;
                border-radius:14px;
                background:rgba(0,217,255,0.06);
                border:1px solid rgba(0,217,255,0.15);
            ">

                <div style="
                    color:#8ba8bb;
                    font-size:12px;
                ">
                    CHARGE ACCUMULATION
                </div>

                <div id="chargeAccumulation"
                     style="
                     color:#ffffff;
                     font-size:23px;
                     font-weight:bold;
                     margin-top:6px;
                ">
                    -100 C/m³/s
                </div>

            </div>


            <div style="
                padding:18px;
                border-radius:14px;
                background:rgba(0,217,255,0.06);
                border:1px solid rgba(0,217,255,0.15);
            ">

                <div style="
                    color:#8ba8bb;
                    font-size:12px;
                ">
                    CONSERVATION CHECK
                </div>

                <div id="chargeConservationStatus"
                     style="
                     color:#00ff9d;
                     font-size:23px;
                     font-weight:bold;
                     margin-top:6px;
                ">
                    BALANCED
                </div>

            </div>

        </div>


        <!-- ==================================================
             VISUALIZATION
             ================================================== -->

        <div style="
            padding:15px;
            border-radius:15px;
            background:#020b12;
            margin-bottom:25px;
        ">

            <canvas
                id="chargeFluxCanvas"
                style="
                    width:100%;
                    height:300px;
                    display:block;
                    border-radius:12px;
                "
            ></canvas>

        </div>


        <!-- ==================================================
             CONSTITUTIVE RELATION
             ================================================== -->

        <div style="
            padding:22px;
            margin-bottom:18px;
            border-radius:15px;
            background:rgba(255,255,255,0.035);
        ">

            <div style="
                color:#00d9ff;
                font-weight:bold;
                margin-bottom:12px;
            ">
                📐 Constitutive Equation
            </div>

            <div style="
                color:#ffffff;
                font-size:23px;
                text-align:center;
                padding:10px;
            ">
                J = σE
            </div>

            <div style="
                color:#8ba8bb;
                text-align:center;
                font-size:14px;
            ">
                Charge flux is related to electrical conductivity
                and electric field.
            </div>

        </div>


        <!-- ==================================================
             ELECTRIC FIELD
             ================================================== -->

        <div style="
            padding:22px;
            margin-bottom:18px;
            border-radius:15px;
            background:rgba(255,255,255,0.035);
        ">

            <div style="
                color:#00d9ff;
                font-weight:bold;
                margin-bottom:12px;
            ">
                ⚡ Electric Field Relation
            </div>

            <div style="
                color:#ffffff;
                font-size:23px;
                text-align:center;
                padding:10px;
            ">
                E = −∇V
            </div>

            <div style="
                color:#8ba8bb;
                text-align:center;
                font-size:14px;
            ">
                Electric field is related to the spatial
                gradient of electric potential.
            </div>

        </div>


        <!-- ==================================================
             LORENTZ FORCE
             ================================================== -->

        <div style="
            padding:22px;
            margin-bottom:18px;
            border-radius:15px;
            background:rgba(255,255,255,0.035);
        ">

            <div style="
                color:#00d9ff;
                font-weight:bold;
                margin-bottom:12px;
            ">
                🧲 Lorentz Force Law
            </div>

            <div style="
                color:#ffffff;
                font-size:23px;
                text-align:center;
                padding:10px;
            ">
                F = q(E + v × B)
            </div>

            <div style="
                color:#8ba8bb;
                text-align:center;
                font-size:14px;
            ">
                Electric and magnetic fields can act on a charged particle.
            </div>

        </div>


        <!-- ==================================================
             MAXWELL EQUATIONS
             ================================================== -->

        <details style="
            padding:20px;
            border-radius:15px;
            background:rgba(255,255,255,0.035);
        ">

            <summary style="
                cursor:pointer;
                color:#00d9ff;
                font-weight:bold;
            ">
                🧠 Maxwell's Equations — Differential Form
            </summary>

            <div style="
                margin-top:20px;
                display:grid;
                gap:12px;
            ">

                <div style="
                    padding:15px;
                    background:rgba(0,0,0,0.2);
                    border-radius:10px;
                    color:#ffffff;
                    text-align:center;
                ">
                    ∇ · E = ρₑ / ε
                </div>

                <div style="
                    padding:15px;
                    background:rgba(0,0,0,0.2);
                    border-radius:10px;
                    color:#ffffff;
                    text-align:center;
                ">
                    ∇ · B = 0
                </div>

                <div style="
                    padding:15px;
                    background:rgba(0,0,0,0.2);
                    border-radius:10px;
                    color:#ffffff;
                    text-align:center;
                ">
                    ∇ × E = −∂B/∂t
                </div>

                <div style="
                    padding:15px;
                    background:rgba(0,0,0,0.2);
                    border-radius:10px;
                    color:#ffffff;
                    text-align:center;
                ">
                    ∇ × B = μJ + με∂E/∂t
                </div>

            </div>

        </details>


        <!-- ==================================================
             JARVIS
             ================================================== -->

        <div style="
            margin-top:22px;
            padding:22px;
            border-radius:15px;
            background:
                linear-gradient(
                    135deg,
                    rgba(0,217,255,0.08),
                    rgba(0,0,0,0.2)
                );
            border:1px solid rgba(0,217,255,0.15);
        ">

            <div style="
                color:#00d9ff;
                font-weight:bold;
                font-size:18px;
                margin-bottom:10px;
            ">
                🤖 JARVIS — Charge Analysis
            </div>

            <p id="chargeJarvisMessage"
               style="
               margin:0;
               color:#d6e8f2;
               line-height:1.7;
            ">
                Charge conservation is being evaluated.
            </p>

        </div>

    `;


    // ========================================================
    // INSERT AFTER THERMAL CONTENT
    // ========================================================
const main =
    document.querySelector("main");

if (main) {

    // Make Charge Flux span the complete application width
    module.style.gridColumn = "1 / -1";
    module.style.width = "100%";
    module.style.boxSizing = "border-box";

    main.appendChild(module);

} else {

    document.body.appendChild(module);

}


    // ========================================================
    // GET ELEMENTS
    // ========================================================

    const densitySlider =
        document.getElementById(
            "chargeDensitySlider"
        );

    const jinSlider =
        document.getElementById(
            "chargeJinSlider"
        );

    const joutSlider =
        document.getElementById(
            "chargeJoutSlider"
        );

    const dxSlider =
        document.getElementById(
            "chargeDxSlider"
        );


    // ========================================================
    // DISPLAY ELEMENTS
    // ========================================================

    const densityValue =
        document.getElementById(
            "chargeDensityValue"
        );

    const jinValue =
        document.getElementById(
            "chargeJinValue"
        );

    const joutValue =
        document.getElementById(
            "chargeJoutValue"
        );

    const dxValue =
        document.getElementById(
            "chargeDxValue"
        );

    const netFlux =
        document.getElementById(
            "chargeNetFlux"
        );

    const accumulation =
        document.getElementById(
            "chargeAccumulation"
        );

    const conservationStatus =
        document.getElementById(
            "chargeConservationStatus"
        );

    const jarvis =
        document.getElementById(
            "chargeJarvisMessage"
        );

    const canvas =
        document.getElementById(
            "chargeFluxCanvas"
        );

    const ctx =
        canvas ?
        canvas.getContext("2d") :
        null;


    // ========================================================
    // SCIENTIFIC CALCULATION
    //
    // ∂ρ/∂t + ∇·J = 0
    //
    // Therefore:
    //
    // ∂ρ/∂t = -∇·J
    //
    // In 1D:
    //
    // ∇·J ≈ (Jout - Jin) / Δx
    // ========================================================

    function updateChargeSimulation() {

        if (
            !densitySlider ||
            !jinSlider ||
            !joutSlider ||
            !dxSlider
        ) {
            return;
        }


        const rho =
            Number(
                densitySlider.value
            );

        const Jin =
            Number(
                jinSlider.value
            );

        const Jout =
            Number(
                joutSlider.value
            );

        const dx =
            Number(
                dxSlider.value
            );


        // ----------------------------------------------------
        // NET FLUX
        // ----------------------------------------------------

        const divergence =
            (Jout - Jin) / dx;


        // ----------------------------------------------------
        // CHARGE ACCUMULATION
        // ----------------------------------------------------

        const drhoDt =
            -divergence;


        // ----------------------------------------------------
        // UPDATE VALUES
        // ----------------------------------------------------

        densityValue.textContent =
            rho.toFixed(2);

        jinValue.textContent =
            Jin.toFixed(2);

        joutValue.textContent =
            Jout.toFixed(2);

        dxValue.textContent =
            dx.toFixed(3);


        netFlux.textContent =
            (Jout - Jin).toFixed(2) +
            " A/m²";


        accumulation.textContent =
            drhoDt.toFixed(2) +
            " C/m³/s";


        // ----------------------------------------------------
        // CONSERVATION INTERPRETATION
        // ----------------------------------------------------

        if (Math.abs(Jout - Jin) < 0.05) {

            conservationStatus.textContent =
                "NO ACCUMULATION";

            conservationStatus.style.color =
                "#00ff9d";

            jarvis.textContent =
                "Incoming and outgoing charge flux are approximately equal. Therefore, the net charge flux is near zero and the local charge density remains approximately unchanged.";

        }

        else if (Jout > Jin) {

            conservationStatus.textContent =
                "CHARGE LEAVING";

            conservationStatus.style.color =
                "#ff9f43";

            jarvis.textContent =
                "More charge is leaving the control volume than entering it. The divergence of charge flux is positive, so local charge density decreases according to the conservation equation.";

        }

        else {

            conservationStatus.textContent =
                "CHARGE ACCUMULATING";

            conservationStatus.style.color =
                "#ff4d6d";

            jarvis.textContent =
                "More charge is entering the control volume than leaving it. The divergence of charge flux is negative, producing positive local charge accumulation.";

        }


        // ----------------------------------------------------
        // DRAW
        // ----------------------------------------------------

        drawChargeFlux(
            rho,
            Jin,
            Jout,
            dx
        );

    }


    // ========================================================
    // CHARGE FLUX VISUALIZATION
    // ========================================================

    function drawChargeFlux(
        rho,
        Jin,
        Jout,
        dx
    ) {

        if (!canvas || !ctx) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const width =
            Math.max(
                500,
                rect.width || 800
            );


        const height =
            300;


        const dpr =
            window.devicePixelRatio || 1;


        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        // ----------------------------------------------------
        // BACKGROUND
        // ----------------------------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        ctx.fillStyle =
            "#020b12";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        // ----------------------------------------------------
        // CONTROL VOLUME
        // ----------------------------------------------------

        const boxWidth =
            Math.min(
                400,
                width * 0.48
            );

        const boxHeight =
            120;

        const boxX =
            (width - boxWidth) / 2;

        const boxY =
            90;


        ctx.strokeStyle =
            "#00d9ff";

        ctx.lineWidth =
            2;


        ctx.strokeRect(
            boxX,
            boxY,
            boxWidth,
            boxHeight
        );


        // ----------------------------------------------------
        // CONTROL VOLUME LABEL
        // ----------------------------------------------------

        ctx.fillStyle =
            "#00d9ff";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "BIOLOGICAL CONTROL VOLUME",
            width / 2,
            boxY - 18
        );


        // ----------------------------------------------------
        // CHARGE PARTICLES
        // ----------------------------------------------------

        const particleCount =
            18;


        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            const px =
                boxX +
                25 +
                (
                    i *
                    (
                        boxWidth - 50
                    ) /
                    (
                        particleCount - 1
                    )
                );

            const py =
                boxY +
                boxHeight / 2 +
                Math.sin(i * 1.7) * 20;


            ctx.beginPath();

            ctx.arc(
                px,
                py,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#00d9ff";

            ctx.fill();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "10px Arial";

            ctx.fillText(
                "+",
                px,
                py + 3
            );

        }


        // ----------------------------------------------------
        // ARROW FUNCTION
        // ----------------------------------------------------

        function drawArrow(
            x1,
            y1,
            x2,
            y2,
            label
        ) {

            const angle =
                Math.atan2(
                    y2 - y1,
                    x2 - x1
                );


            ctx.strokeStyle =
                "#00ff9d";

            ctx.fillStyle =
                "#00ff9d";

            ctx.lineWidth =
                3;


            ctx.beginPath();

            ctx.moveTo(
                x1,
                y1
            );

            ctx.lineTo(
                x2,
                y2
            );

            ctx.stroke();


            const head =
                10;


            ctx.beginPath();

            ctx.moveTo(
                x2,
                y2
            );

            ctx.lineTo(
                x2 -
                head *
                Math.cos(angle - Math.PI / 6),

                y2 -
                head *
                Math.sin(angle - Math.PI / 6)
            );

            ctx.lineTo(
                x2 -
                head *
                Math.cos(angle + Math.PI / 6),

                y2 -
                head *
                Math.sin(angle + Math.PI / 6)
            );

            ctx.closePath();

            ctx.fill();


            ctx.font =
                "bold 13px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                label,
                (x1 + x2) / 2,
                y1 - 12
            );

        }


        // ----------------------------------------------------
        // INCOMING ARROW
        // ----------------------------------------------------

        drawArrow(
            boxX - 100,
            boxY + boxHeight / 2,
            boxX - 10,
            boxY + boxHeight / 2,
            "Jᵢₙ = " + Jin.toFixed(1)
        );


        // ----------------------------------------------------
        // OUTGOING ARROW
        // ----------------------------------------------------

        drawArrow(
            boxX + boxWidth + 10,
            boxY + boxHeight / 2,
            boxX + boxWidth + 100,
            boxY + boxHeight / 2,
            "Jₒᵤₜ = " + Jout.toFixed(1)
        );


        // ----------------------------------------------------
        // CHARGE DENSITY
        // ----------------------------------------------------

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "ρₑ = " + rho.toFixed(2) + " C/m³",
            width / 2,
            boxY + boxHeight + 40
        );


        // ----------------------------------------------------
        // CONSERVATION EQUATION
        // ----------------------------------------------------

        ctx.fillStyle =
            "#8ba8bb";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            "∂ρₑ/∂t = −(Jₒᵤₜ − Jᵢₙ)/Δx",
            width / 2,
            height - 22
        );

    }


    // ========================================================
    // EVENTS
    // ========================================================

    densitySlider.addEventListener(
        "input",
        updateChargeSimulation
    );

    jinSlider.addEventListener(
        "input",
        updateChargeSimulation
    );

    joutSlider.addEventListener(
        "input",
        updateChargeSimulation
    );

    dxSlider.addEventListener(
        "input",
        updateChargeSimulation
    );


    // ========================================================
    // WINDOW RESIZE
    // ========================================================

    window.addEventListener(
        "resize",
        updateChargeSimulation
    );


    // ========================================================
    // INITIAL RUN
    // ========================================================

    updateChargeSimulation();

}


// ============================================================
// START CHARGE MODULE AFTER PAGE LOAD
// ============================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        createChargeFluxModule
    );

}

else {

    createChargeFluxModule();

}
// ============================================================
// JARVIS — LIVE CHARGE PARTICLE ANIMATION
// ============================================================
//
// This adds real-time movement to the Charge Flux visualization.
//
// Jin  -> particles enter the control volume
// Jout -> particles leave the control volume
//
// The particle speed responds to the slider values.
// ============================================================


// ============================================================
// JARVIS — PARAMETER-DRIVEN CHARGE FLUX ANIMATION
// ============================================================
//
// Jin  -> incoming charge flux
// Jout -> outgoing charge flux
// rho  -> charge density
// dx   -> control-volume length
//
// Visual behavior is driven directly by the parameters.
// ============================================================


// ============================================================
// JARVIS CHARGE FLUX — CONSTITUTIVE LAW DRIVER
// Connects:
// ΔV → E → J
//
// E = ΔV / Δx
// J = σE
// ============================================================

(function chargeConstitutiveDriver() {

    // --------------------------------------------------------
    // CREATE SECTION
    // --------------------------------------------------------

    const module = document.createElement("section");

    module.id = "constitutiveDriver";

    module.style.gridColumn = "1 / -1";
    module.style.width = "100%";
    module.style.boxSizing = "border-box";
    module.style.marginTop = "20px";
    module.style.padding = "24px";
    module.style.border = "1px solid rgba(0,225,255,0.25)";
    module.style.borderRadius = "16px";
    module.style.background =
        "linear-gradient(145deg, rgba(5,20,30,0.96), rgba(2,10,18,0.96))";
    module.style.boxShadow =
        "0 0 30px rgba(0,200,255,0.08)";

    module.innerHTML = `

        <h2 style="
            margin-top:0;
            color:#00eaff;
            font-size:24px;
        ">
            ⚡ Constitutive Charge Transport
        </h2>

        <p style="
            color:#9fb7c2;
            margin-bottom:20px;
        ">
            JARVIS connects electrical potential, electric field,
            conductivity and charge flux in real time.
        </p>


        <!-- EQUATIONS -->

        <div style="
            padding:18px;
            margin-bottom:22px;
            border-radius:12px;
            background:rgba(0,0,0,0.25);
            border:1px solid rgba(0,225,255,0.12);
        ">

            <div style="
                color:#00eaff;
                font-size:20px;
                margin-bottom:10px;
            ">
                E = ΔV / Δx
            </div>

            <div style="
                color:#00eaff;
                font-size:20px;
            ">
                J = σE
            </div>

        </div>


        <!-- CONTROLS -->

        <div style="
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
            gap:18px;
        ">

            <!-- CONDUCTIVITY -->

            <div>

                <label style="
                    display:block;
                    color:#c8dce3;
                    margin-bottom:8px;
                ">
                    Conductivity σ
                    <strong id="constitutiveSigmaValue">
                        1.00
                    </strong>
                    S/m
                </label>

                <input
                    id="constitutiveSigma"
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value="1"
                    style="width:100%;"
                >

            </div>


            <!-- POTENTIAL -->

            <div>

                <label style="
                    display:block;
                    color:#c8dce3;
                    margin-bottom:8px;
                ">
                    Potential Difference ΔV
                    <strong id="constitutiveVoltageValue">
                        0.10
                    </strong>
                    V
                </label>

                <input
                    id="constitutiveVoltage"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value="0.10"
                    style="width:100%;"
                >

            </div>


            <!-- DISTANCE -->

            <div>

                <label style="
                    display:block;
                    color:#c8dce3;
                    margin-bottom:8px;
                ">
                    Distance Δx
                    <strong id="constitutiveDistanceValue">
                        0.010
                    </strong>
                    m
                </label>

                <input
                    id="constitutiveDistance"
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.001"
                    value="0.010"
                    style="width:100%;"
                >

            </div>

        </div>


        <!-- RESULTS -->

        <div style="
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(180px,1fr));
            gap:14px;
            margin-top:24px;
        ">

            <div style="
                padding:18px;
                border-radius:12px;
                background:rgba(0,0,0,0.25);
            ">

                <div style="
                    color:#8da8b3;
                    font-size:12px;
                ">
                    ELECTRIC FIELD
                </div>

                <strong
                    id="constitutiveE"
                    style="
                        display:block;
                        margin-top:7px;
                        color:#00eaff;
                        font-size:22px;
                    "
                >
                    10.00 V/m
                </strong>

            </div>


            <div style="
                padding:18px;
                border-radius:12px;
                background:rgba(0,0,0,0.25);
            ">

                <div style="
                    color:#8da8b3;
                    font-size:12px;
                ">
                    CURRENT DENSITY
                </div>

                <strong
                    id="constitutiveJ"
                    style="
                        display:block;
                        margin-top:7px;
                        color:#00eaff;
                        font-size:22px;
                    "
                >
                    10.00 A/m²
                </strong>

            </div>


            <div style="
                padding:18px;
                border-radius:12px;
                background:rgba(0,0,0,0.25);
            ">

                <div style="
                    color:#8da8b3;
                    font-size:12px;
                ">
                    TRANSPORT STATE
                </div>

                <strong
                    id="constitutiveState"
                    style="
                        display:block;
                        margin-top:7px;
                        color:#00eaff;
                        font-size:18px;
                    "
                >
                    ACTIVE
                </strong>

            </div>

        </div>


        <!-- JARVIS EXPLANATION -->

        <div
            id="constitutiveJarvis"
            style="
                margin-top:22px;
                padding:18px;
                border-left:3px solid #00eaff;
                background:rgba(0,225,255,0.04);
                color:#b9d1d9;
                line-height:1.6;
                border-radius:8px;
            "
        >
            JARVIS:
            Increasing conductivity increases current density
            for the same electric field.
        </div>

    `;


    // --------------------------------------------------------
    // INSERT AFTER EXISTING CHARGE FLUX MODULE
    // --------------------------------------------------------

    const main =
        document.querySelector("main");

    if (!main) {
        console.error(
            "JARVIS: main element not found."
        );
        return;
    }

    main.appendChild(module);


    // --------------------------------------------------------
    // GET ELEMENTS
    // --------------------------------------------------------

    const sigmaSlider =
        document.getElementById(
            "constitutiveSigma"
        );

    const voltageSlider =
        document.getElementById(
            "constitutiveVoltage"
        );

    const distanceSlider =
        document.getElementById(
            "constitutiveDistance"
        );


    const sigmaValue =
        document.getElementById(
            "constitutiveSigmaValue"
        );

    const voltageValue =
        document.getElementById(
            "constitutiveVoltageValue"
        );

    const distanceValue =
        document.getElementById(
            "constitutiveDistanceValue"
        );


    const electricField =
        document.getElementById(
            "constitutiveE"
        );

    const currentDensity =
        document.getElementById(
            "constitutiveJ"
        );

    const state =
        document.getElementById(
            "constitutiveState"
        );

    const jarvis =
        document.getElementById(
            "constitutiveJarvis"
        );


    // --------------------------------------------------------
    // EXISTING CHARGE FLUX CONTROLS
    // --------------------------------------------------------

    const jinSlider =
        document.getElementById(
            "chargeJinSlider"
        );

    const joutSlider =
        document.getElementById(
            "chargeJoutSlider"
        );


    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    function updateConstitutiveLaw() {

        const sigma =
            Number(
                sigmaSlider.value
            );

        const deltaV =
            Number(
                voltageSlider.value
            );

        const deltaX =
            Number(
                distanceSlider.value
            );


        // ----------------------------------------------------
        // ELECTRIC FIELD
        // ----------------------------------------------------

        const E =
            deltaX > 0
                ? deltaV / deltaX
                : 0;


        // ----------------------------------------------------
        // CURRENT DENSITY
        // ----------------------------------------------------

        const J =
            sigma * E;


        // ----------------------------------------------------
        // DISPLAY
        // ----------------------------------------------------

        sigmaValue.textContent =
            sigma.toFixed(2);

        voltageValue.textContent =
            deltaV.toFixed(2);

        distanceValue.textContent =
            deltaX.toFixed(3);


        electricField.textContent =
            E.toFixed(2) +
            " V/m";


        currentDensity.textContent =
            J.toFixed(2) +
            " A/m²";


        // ----------------------------------------------------
        // TRANSPORT STATE
        // ----------------------------------------------------

        if (J <= 0.001) {

            state.textContent =
                "NO CURRENT";

            jarvis.textContent =
                "JARVIS: The electric field is effectively zero, " +
                "so the constitutive current density is negligible.";

        }

        else if (sigma >= 3) {

            state.textContent =
                "HIGH CONDUCTIVITY";

            jarvis.textContent =
                "JARVIS: High conductivity allows stronger charge " +
                "transport for the applied electric field.";

        }

        else if (E >= 50) {

            state.textContent =
                "STRONG ELECTRIC FIELD";

            jarvis.textContent =
                "JARVIS: The potential changes rapidly across the " +
                "distance, producing a strong electric field and " +
                "increased charge flux.";

        }

        else {

            state.textContent =
                "ACTIVE";

            jarvis.textContent =
                "JARVIS: Charge flux follows J = σE. " +
                "Changing conductivity or potential gradient " +
                "changes the predicted current density.";

        }


        // ----------------------------------------------------
        // CONNECT TO EXISTING CHARGE-FLUX MODULE
        //
        // Keep the existing animation alive.
        // We feed the calculated J into the incoming/outgoing
        // flux controls so the visual flow responds.
        // ----------------------------------------------------

        if (
            jinSlider &&
            joutSlider
        ) {

            const visualJ =
                Math.min(
                    10,
                    Math.max(
                        0,
                        J
                    )
                );


            jinSlider.value =
                visualJ.toFixed(2);

            joutSlider.value =
                visualJ.toFixed(2);


            jinSlider.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:true
                    }
                )
            );

            joutSlider.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:true
                    }
                )
            );

        }

    }


    // --------------------------------------------------------
    // LISTEN FOR CHANGES
    // --------------------------------------------------------

    sigmaSlider.addEventListener(
        "input",
        updateConstitutiveLaw
    );

    voltageSlider.addEventListener(
        "input",
        updateConstitutiveLaw
    );

    distanceSlider.addEventListener(
        "input",
        updateConstitutiveLaw
    );


    // --------------------------------------------------------
    // INITIAL RUN
    // --------------------------------------------------------

    updateConstitutiveLaw();

})();
// ============================================================
// ============================================================
// JARVIS — LIVE CONSTITUTIVE → CHARGE FLUX CONNECTION
// Waits for both dynamically-created modules to exist.
// ============================================================

(function liveConstitutiveChargeConnection() {

    let connected = false;

    function connectChargeTransport() {

        const sigmaSlider =
            document.getElementById("constitutiveSigma");

        const voltageSlider =
            document.getElementById("constitutiveVoltage");

        const distanceSlider =
            document.getElementById("constitutiveDistance");

        const jinSlider =
            document.getElementById("chargeJinSlider");

        const joutSlider =
            document.getElementById("chargeJoutSlider");


        // ----------------------------------------------------
        // If modules are not created yet, wait and try again.
        // ----------------------------------------------------

        if (
            !sigmaSlider ||
            !voltageSlider ||
            !distanceSlider ||
            !jinSlider ||
            !joutSlider
        ) {
            return;
        }


        // ----------------------------------------------------
        // Increase Charge Flux range so constitutive J values
        // such as 145.6 A/m² can be represented.
        // ----------------------------------------------------

        jinSlider.max = "200";
        joutSlider.max = "200";

        jinSlider.step = "0.1";
        joutSlider.step = "0.1";


        function updateConnection() {

            const sigma =
                Number(sigmaSlider.value);

            const deltaV =
                Number(voltageSlider.value);

            const deltaX =
                Number(distanceSlider.value);


            // ------------------------------------------------
            // ELECTRIC FIELD
            //
            // E = ΔV / Δx
            // ------------------------------------------------

            const E =
                deltaX > 0
                    ? deltaV / deltaX
                    : 0;


            // ------------------------------------------------
            // CONSTITUTIVE EQUATION
            //
            // J = σE
            // ------------------------------------------------

            const J =
                sigma * E;


            // ------------------------------------------------
            // Store J globally.
            // The particle animation will use this later.
            // ------------------------------------------------

            window.JARVIS_CURRENT_DENSITY = J;


            // ------------------------------------------------
            // Keep J within our visual slider range.
            // ------------------------------------------------

            const safeJ =
                Math.min(
                    200,
                    Math.max(
                        0,
                        J
                    )
                );


            // ------------------------------------------------
            // STEADY UNIFORM CHARGE TRANSPORT
            //
            // Jin = Jout = J
            //
            // Therefore:
            //
            // ∇ · J = 0
            //
            // ∂ρe/∂t = 0
            // ------------------------------------------------

            jinSlider.value =
                safeJ.toFixed(1);

            joutSlider.value =
                safeJ.toFixed(1);


            // ------------------------------------------------
            // IMPORTANT:
            //
            // Setting .value with JavaScript does NOT itself
            // fire an input event.
            //
            // So explicitly trigger the Charge Flux update.
            // ------------------------------------------------

            jinSlider.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );

            joutSlider.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );


            // ------------------------------------------------
            // Update constitutive display
            // ------------------------------------------------

            const electricFieldDisplay =
                document.getElementById(
                    "constitutiveE"
                );

            const currentDensityDisplay =
                document.getElementById(
                    "constitutiveJ"
                );


            if (electricFieldDisplay) {

                electricFieldDisplay.textContent =
                    E.toFixed(2) +
                    " V/m";

            }


            if (currentDensityDisplay) {

                currentDensityDisplay.textContent =
                    J.toFixed(2) +
                    " A/m²";

            }


            // ------------------------------------------------
            // Update JARVIS explanation
            // ------------------------------------------------

            const jarvis =
                document.getElementById(
                    "constitutiveJarvis"
                );


            if (jarvis) {

                jarvis.textContent =
                    "JARVIS: Current density is determined by " +
                    "J = σE. Here σ = " +
                    sigma.toFixed(2) +
                    " S/m and E = " +
                    E.toFixed(2) +
                    " V/m, giving J = " +
                    J.toFixed(2) +
                    " A/m². " +
                    "The same J is applied at the inlet and outlet " +
                    "for steady uniform charge transport.";

            }


            // ------------------------------------------------
            // Mark as successfully connected
            // ------------------------------------------------

            if (!connected) {

                connected = true;

                console.log(
                    "JARVIS: Constitutive Charge Transport connected to Charge Flux."
                );

            }

        }


        // ----------------------------------------------------
        // Listen to constitutive parameters.
        // ----------------------------------------------------

        sigmaSlider.addEventListener(
            "input",
            updateConnection
        );

        voltageSlider.addEventListener(
            "input",
            updateConnection
        );

        distanceSlider.addEventListener(
            "input",
            updateConnection
        );


        // ----------------------------------------------------
        // Initial update
        // ----------------------------------------------------

        updateConnection();


        // ----------------------------------------------------
        // Stop searching once connected.
        // ----------------------------------------------------

        return true;

    }


    // ========================================================
    // MODULES ARE CREATED DYNAMICALLY.
    //
    // Therefore check repeatedly until both modules exist.
    // ========================================================

    const connectionTimer =
        setInterval(
            function () {

                const success =
                    connectChargeTransport();

                if (success) {

                    clearInterval(
                        connectionTimer
                    );

                }

            },
            100
        );


})();
/* =========================================================
   JARVIS — PHYSICALLY DRIVEN CHARGE PARTICLE ANIMATION
   FIXED: use CSS-pixel coordinates + DPR transform
   ========================================================= */

(function jarvisPhysicalChargeAnimation() {

    function waitForChargeCanvas() {

        const canvas = document.getElementById("chargeFluxCanvas");

        if (!canvas) {
            setTimeout(waitForChargeCanvas, 300);
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particles = [];
        let lastTime = performance.now();

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();

            const width = Math.max(500, rect.width || 800);
            const height = Math.max(280, rect.height || 300);
            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);

            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            ctx.setTransform(
                dpr, 0, 0, dpr, 0, 0
            );

            return { width, height };
        }

        let size = resizeCanvas();

        window.addEventListener("resize", () => {
            size = resizeCanvas();
        });

        function getValues() {

            const rhoSlider =
                document.getElementById("chargeDensitySlider");

            const jinSlider =
                document.getElementById("chargeJinSlider");

            const joutSlider =
                document.getElementById("chargeJoutSlider");

            const rho =
                rhoSlider ? Number(rhoSlider.value) : 1;

            const jin =
                jinSlider ? Number(jinSlider.value) : 0;

            const jout =
                joutSlider ? Number(joutSlider.value) : 0;

            const J =
                Number(window.JARVIS_CURRENT_DENSITY || 0);

            return { rho, jin, jout, J };
        }

        function createParticle(direction) {

            const y =
                90 + Math.random() * 80;

            return {
                x: direction === "in"
                    ? -12
                    : size.width + 12,

                y,
                direction,
                size: 2.5 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2,
                age: Math.random() * 4
            };
        }

        function updateParticleCount(rho, jin, jout) {

            const densityCount =
                Math.min(
                    35,
                    Math.max(
                        5,
                        Math.round(7 + Math.abs(rho) * 5)
                    )
                );

            const totalFlux =
                Math.abs(jin) + Math.abs(jout);

            const desired =
                Math.min(
                    50,
                    densityCount +
                    Math.round(totalFlux * 0.7)
                );

            while (particles.length < desired) {

                particles.push(
                    createParticle(
                        Math.abs(jin) >= Math.abs(jout)
                            ? "in"
                            : "out"
                    )
                );
            }

            while (particles.length > desired) {
                particles.pop();
            }
        }

        function drawBackground() {

            const { width, height } = size;
            const { jin, jout } = getValues();

            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "#020b12";
            ctx.fillRect(0, 0, width, height);

            const boxWidth =
                Math.min(700, width * 0.68);

            const boxHeight = 150;

            const boxX =
                (width - boxWidth) / 2;

            const boxY = 55;

            /* Control volume */

            ctx.strokeStyle =
                "rgba(120,180,255,0.8)";

            ctx.lineWidth = 2;

            ctx.strokeRect(
                boxX,
                boxY,
                boxWidth,
                boxHeight
            );

            /* Internal divider */

            ctx.strokeStyle =
                "rgba(255,255,255,0.18)";

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.moveTo(
                width / 2,
                boxY
            );

            ctx.lineTo(
                width / 2,
                boxY + boxHeight
            );

            ctx.stroke();

            /* Control volume label */

            ctx.fillStyle =
                "#00d9ff";

            ctx.font =
                "bold 14px Arial";

            ctx.textAlign = "center";

            ctx.fillText(
                "BIOLOGICAL CONTROL VOLUME",
                width / 2,
                boxY - 18
            );

            /* Incoming / outgoing arrows */

            drawArrow(
                Math.max(25, boxX - 105),
                boxY + boxHeight / 2,
                "right",
                Math.abs(jin)
            );

            drawArrow(
                Math.min(width - 25, boxX + boxWidth + 105),
                boxY + boxHeight / 2,
                "left",
                Math.abs(jout)
            );
        }

        function drawArrow(x, y, direction, magnitude) {

            const length =
                Math.min(
                    80,
                    25 + magnitude * 3
                );

            const endX =
                direction === "right"
                    ? x + length
                    : x - length;

            ctx.strokeStyle =
                "#00ff9d";

            ctx.fillStyle =
                "#00ff9d";

            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, y);
            ctx.stroke();

            ctx.beginPath();

            if (direction === "right") {

                ctx.moveTo(endX, y);

                ctx.lineTo(
                    endX - 10,
                    y - 6
                );

                ctx.lineTo(
                    endX - 10,
                    y + 6
                );

            } else {

                ctx.moveTo(endX, y);

                ctx.lineTo(
                    endX + 10,
                    y - 6
                );

                ctx.lineTo(
                    endX + 10,
                    y + 6
                );
            }

            ctx.closePath();
            ctx.fill();

            ctx.font =
                "bold 13px Arial";

            ctx.textAlign = "center";

            const labelX =
                direction === "right"
                    ? (x + endX) / 2
                    : (x + endX) / 2;

            ctx.fillText(
                direction === "right"
                    ? "Jᵢₙ = " + Math.abs(magnitude).toFixed(1)
                    : "Jₒᵤₜ = " + Math.abs(magnitude).toFixed(1),
                labelX,
                y - 12
            );
        }

        function drawParticles() {

            const { rho } = getValues();

            particles.forEach(p => {

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    p.size,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    rho >= 0
                        ? "rgba(80,220,255,0.95)"
                        : "rgba(255,120,180,0.95)";

                ctx.shadowBlur = 10;
                ctx.shadowColor =
                    rho >= 0
                        ? "rgba(80,220,255,0.7)"
                        : "rgba(255,120,180,0.7)";

                ctx.fill();

                ctx.shadowBlur = 0;
            });
        }

        function updateParticles(dt) {

            const {
                jin,
                jout,
                J
            } = getValues();

            const incomingSpeed =
                20 + Math.abs(jin) * 4;

            const outgoingSpeed =
                20 + Math.abs(jout) * 4;

            const physicalSpeed =
                Math.min(
                    260,
                    25 + Math.abs(J) * 1.8
                );

            particles.forEach(p => {

                p.age += dt;

                if (p.direction === "in") {

                    p.x +=
                        Math.max(
                            incomingSpeed,
                            physicalSpeed * 0.35
                        ) * dt;

                } else {

                    p.x -=
                        Math.max(
                            outgoingSpeed,
                            physicalSpeed * 0.35
                        ) * dt;
                }

                p.y +=
                    Math.sin(
                        p.age * 3 +
                        p.phase
                    ) * 0.15;

                if (p.x > size.width + 15) {

                    p.x = -10;

                    p.y =
                        90 +
                        Math.random() * 80;
                }

                if (p.x < -15) {

                    p.x =
                        size.width + 10;

                    p.y =
                        90 +
                        Math.random() * 80;
                }
            });
        }

        function drawLabels() {

            const {
                rho,
                J
            } = getValues();

            const { width, height } = size;

            ctx.textAlign = "center";

            ctx.font =
                "bold 15px Arial";

            ctx.fillStyle =
                "#ffffff";

            ctx.fillText(
                "ρₑ = " +
                rho.toFixed(2) +
                " C/m³",
                width / 2,
                247
            );

            ctx.fillStyle =
                "rgba(150,220,255,0.9)";

            ctx.font =
                "13px Arial";

            ctx.fillText(
                "J = " +
                J.toFixed(1) +
                " A/m²",
                width / 2,
                height - 22
            );

            ctx.fillStyle =
                "#8ba8bb";

            ctx.font =
                "12px Arial";

            ctx.fillText(
                "∂ρₑ/∂t = −(Jₒᵤₜ − Jᵢₙ)/Δx",
                width / 2,
                height - 5
            );
        }

        function animate(currentTime) {

            const dt =
                Math.min(
                    0.05,
                    (currentTime - lastTime) / 1000
                );

            lastTime = currentTime;

            const {
                rho,
                jin,
                jout
            } = getValues();

            updateParticleCount(
                rho,
                jin,
                jout
            );

            drawBackground();
            updateParticles(dt);
            drawParticles();
            drawLabels();

            requestAnimationFrame(animate);
        }

        updateParticleCount(1, 1, 1);

        requestAnimationFrame(animate);
    }

    waitForChargeCanvas();

})();

/* =========================================================
   JARVIS — MEMBRANE AS CAPACITOR
   ========================================================= */

(function jarvisMembraneCapacitor() {

    function createMembraneModule() {

        // Prevent duplicate module
        if (document.getElementById("membraneCapacitorModule")) {
            return;
        }

        const module = document.createElement("section");

        module.id = "membraneCapacitorModule";

        module.style.gridColumn = "1 / -1";
        module.style.width = "100%";
        module.style.boxSizing = "border-box";
        module.style.marginTop = "20px";
        module.style.padding = "24px";
        module.style.borderRadius = "18px";
        module.style.background = "rgba(10,20,35,0.92)";
        module.style.border = "1px solid rgba(100,200,255,0.25)";
        module.style.boxShadow = "0 10px 35px rgba(0,0,0,0.25)";

        module.innerHTML = `

            <h2 style="
                color:#8fe8ff;
                margin-top:0;
                margin-bottom:8px;
            ">
                🧫 Membrane as a Capacitor
            </h2>

            <p style="
                color:#b9c9d8;
                margin-top:0;
            ">
                The biological membrane behaves like a thin dielectric
                separating conductive ionic regions.
            </p>


            <!-- EQUATIONS -->

            <div style="
                padding:16px;
                margin:16px 0;
                border-radius:12px;
                background:rgba(255,255,255,0.04);
                text-align:center;
            ">

                <div style="
                    font-size:22px;
                    color:#ffffff;
                    margin-bottom:8px;
                ">
                    C = ε₀ εᵣ A / d
                </div>

                <div style="
                    font-size:22px;
                    color:#ffffff;
                ">
                    Q = CV
                </div>

            </div>


            <!-- CONTROLS -->

            <div style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(220px,1fr));
                gap:14px;
            ">


                <!-- Dielectric -->

                <div style="
                    padding:14px;
                    background:rgba(255,255,255,0.04);
                    border-radius:12px;
                ">

                    <label>
                        Relative Permittivity εᵣ
                    </label>

                    <input
                        id="membraneEpsilon"
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value="2.1"
                        style="width:100%;"
                    >

                    <div>
                        εᵣ =
                        <span id="membraneEpsilonValue">
                            2.1
                        </span>
                    </div>

                </div>


                <!-- Area -->

                <div style="
                    padding:14px;
                    background:rgba(255,255,255,0.04);
                    border-radius:12px;
                ">

                    <label>
                        Membrane Area A (µm²)
                    </label>

                    <input
                        id="membraneArea"
                        type="range"
                        min="1"
                        max="500"
                        step="1"
                        value="100"
                        style="width:100%;"
                    >

                    <div>
                        A =
                        <span id="membraneAreaValue">
                            100
                        </span>
                        µm²
                    </div>

                </div>


                <!-- Thickness -->

                <div style="
                    padding:14px;
                    background:rgba(255,255,255,0.04);
                    border-radius:12px;
                ">

                    <label>
                        Membrane Thickness d (nm)
                    </label>

                    <input
                        id="membraneThickness"
                        type="range"
                        min="2"
                        max="20"
                        step="0.5"
                        value="5"
                        style="width:100%;"
                    >

                    <div>
                        d =
                        <span id="membraneThicknessValue">
                            5.0
                        </span>
                        nm
                    </div>

                </div>


                <!-- Voltage -->

                <div style="
                    padding:14px;
                    background:rgba(255,255,255,0.04);
                    border-radius:12px;
                ">

                    <label>
                        Membrane Voltage V (mV)
                    </label>

                    <input
                        id="membraneVoltage"
                        type="range"
                        min="-150"
                        max="150"
                        step="1"
                        value="-70"
                        style="width:100%;"
                    >

                    <div>
                        V =
                        <span id="membraneVoltageValue">
                            -70
                        </span>
                        mV
                    </div>

                </div>

            </div>


            <!-- RESULTS -->

            <div style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(180px,1fr));
                gap:12px;
                margin-top:18px;
            ">


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(70,160,255,0.10);
                ">

                    <small>CAPACITANCE</small>

                    <div
                        id="membraneCapacitance"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(120,220,180,0.10);
                ">

                    <small>STORED CHARGE</small>

                    <div
                        id="membraneCharge"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(255,190,100,0.10);
                ">

                    <small>ELECTRIC FIELD</small>

                    <div
                        id="membraneField"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(220,130,255,0.10);
                ">

                    <small>ENERGY STORED</small>

                    <div
                        id="membraneEnergy"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>

            </div>


            <!-- VISUALIZATION -->

            <div style="
                margin-top:20px;
                padding:12px;
                border-radius:14px;
                background:rgba(0,0,0,0.20);
            ">

                <canvas
                    id="membraneCanvas"
                    width="900"
                    height="300"
                    style="
                        width:100%;
                        max-width:900px;
                        display:block;
                        margin:auto;
                    "
                ></canvas>

            </div>


            <!-- JARVIS -->

            <div
                id="membraneJarvis"
                style="
                    margin-top:16px;
                    padding:16px;
                    border-radius:12px;
                    background:rgba(80,180,255,0.08);
                    color:#d9f5ff;
                "
            >
                JARVIS is calculating membrane capacitance...
            </div>

        `;


        const main =
            document.querySelector("main");

        if (main) {
            main.appendChild(module);
        } else {
            document.body.appendChild(module);
        }


        setupMembraneSimulation();
    }


    function setupMembraneSimulation() {

        const epsilon =
            document.getElementById("membraneEpsilon");

        const area =
            document.getElementById("membraneArea");

        const thickness =
            document.getElementById("membraneThickness");

        const voltage =
            document.getElementById("membraneVoltage");

        const canvas =
            document.getElementById("membraneCanvas");

        const ctx =
            canvas.getContext("2d");


        function update() {

            const er =
                Number(epsilon.value);

            const A_um2 =
                Number(area.value);

            const d_nm =
                Number(thickness.value);

            const V_mV =
                Number(voltage.value);


            /*
             * Physical conversions
             */

            const epsilon0 =
                8.854e-12;

            const A =
                A_um2 * 1e-12;

            const d =
                d_nm * 1e-9;

            const V =
                V_mV * 1e-3;


            /*
             * Capacitance
             *
             * C = ε0 εr A / d
             */

            const C =
                epsilon0 *
                er *
                A /
                d;


            /*
             * Charge
             *
             * Q = CV
             */

            const Q =
                C * V;


            /*
             * Electric field
             *
             * E = V/d
             */

            const E =
                V / d;


            /*
             * Stored electrical energy
             *
             * U = 1/2 CV²
             */

            const U =
                0.5 *
                C *
                V *
                V;


            /*
             * Display controls
             */

            document.getElementById(
                "membraneEpsilonValue"
            ).textContent =
                er.toFixed(1);


            document.getElementById(
                "membraneAreaValue"
            ).textContent =
                A_um2.toFixed(0);


            document.getElementById(
                "membraneThicknessValue"
            ).textContent =
                d_nm.toFixed(1);


            document.getElementById(
                "membraneVoltageValue"
            ).textContent =
                V_mV.toFixed(0);


            /*
             * Display capacitance
             */

            let capacitanceText;

            if (C >= 1e-12) {

                capacitanceText =
                    (C * 1e12).toFixed(3)
                    + " pF";

            } else {

                capacitanceText =
                    C.toExponential(3)
                    + " F";
            }


            document.getElementById(
                "membraneCapacitance"
            ).textContent =
                capacitanceText;


            /*
             * Display charge
             */

            document.getElementById(
                "membraneCharge"
            ).textContent =
                Q.toExponential(3)
                + " C";


            /*
             * Display electric field
             */

            document.getElementById(
                "membraneField"
            ).textContent =
                E.toExponential(3)
                + " V/m";


            /*
             * Display energy
             */

            document.getElementById(
                "membraneEnergy"
            ).textContent =
                U.toExponential(3)
                + " J";


            /*
             * JARVIS explanation
             */

            let message =
                "JARVIS: ";

            if (Math.abs(V_mV) > 0) {

                message +=
                    "The membrane stores electrical charge " +
                    "because the lipid bilayer separates " +
                    "conductive ionic regions. ";
            }

            message +=
                "Increasing membrane area or relative " +
                "permittivity increases capacitance, while " +
                "increasing membrane thickness decreases it. ";

            message +=
                "The stored charge follows Q = CV.";


            document.getElementById(
                "membraneJarvis"
            ).textContent =
                message;


            drawMembrane(
                er,
                A_um2,
                d_nm,
                V_mV,
                Q
            );
        }


        /*
         * MEMBRANE VISUALIZATION
         */

        function drawMembrane(
            er,
            A,
            d,
            V,
            Q
        ) {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            const cx =
                canvas.width / 2;


            /*
             * Outside and inside
             */

            ctx.font =
                "bold 16px Arial";

            ctx.fillStyle =
                "#9bdcff";

            ctx.fillText(
                "OUTSIDE",
                80,
                35
            );


            ctx.fillText(
                "INSIDE",
                760,
                35
            );


            /*
             * Membrane
             */

            const membraneX =
                cx - 35;

            const membraneWidth =
                70;


            ctx.fillStyle =
                "rgba(255,210,120,0.28)";

            ctx.fillRect(
                membraneX,
                60,
                membraneWidth,
                170
            );


            ctx.strokeStyle =
                "rgba(255,220,150,0.9)";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                membraneX,
                60,
                membraneWidth,
                170
            );


            ctx.fillStyle =
                "#ffe0a0";

            ctx.font =
                "bold 14px Arial";

            ctx.fillText(
                "LIPID",
                membraneX + 13,
                135
            );

            ctx.fillText(
                "BILAYER",
                membraneX + 3,
                155
            );


            /*
             * Charge visualization
             */

            const chargeIntensity =
                Math.min(
                    1,
                    Math.abs(Q) / 1e-14
                );


            const particleCount =
                Math.min(
                    18,
                    Math.max(
                        4,
                        Math.round(
                            4 +
                            chargeIntensity * 14
                        )
                    )
                );


            /*
             * Outside charges
             */

            for (
                let i = 0;
                i < particleCount;
                i++
            ) {

                const y =
                    75 +
                    i *
                    (145 / particleCount);


                drawCharge(
                    230,
                    y,
                    V < 0 ? "+" : "-"
                );


                drawCharge(
                    670,
                    y,
                    V < 0 ? "-" : "+"
                );
            }


            /*
             * Electric field arrows
             */

            const arrowDirection =
                V >= 0
                    ? 1
                    : -1;


            ctx.strokeStyle =
                "rgba(100,220,255,0.8)";

            ctx.fillStyle =
                "rgba(100,220,255,0.8)";

            ctx.lineWidth = 2;


            for (
                let y = 80;
                y < 220;
                y += 35
            ) {

                const startX =
                    arrowDirection > 0
                        ? membraneX - 55
                        : membraneX + membraneWidth + 55;

                const endX =
                    arrowDirection > 0
                        ? membraneX + membraneWidth + 35
                        : membraneX - 35;


                ctx.beginPath();

                ctx.moveTo(
                    startX,
                    y
                );

                ctx.lineTo(
                    endX,
                    y
                );

                ctx.stroke();


                ctx.beginPath();

                if (arrowDirection > 0) {

                    ctx.moveTo(
                        endX,
                        y
                    );

                    ctx.lineTo(
                        endX - 8,
                        y - 5
                    );

                    ctx.lineTo(
                        endX - 8,
                        y + 5
                    );

                } else {

                    ctx.moveTo(
                        endX,
                        y
                    );

                    ctx.lineTo(
                        endX + 8,
                        y - 5
                    );

                    ctx.lineTo(
                        endX + 8,
                        y + 5
                    );
                }

                ctx.closePath();

                ctx.fill();
            }


            /*
             * Labels
             */

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "13px Arial";

            ctx.fillText(
                "εᵣ = " + er.toFixed(1),
                20,
                270
            );

            ctx.fillText(
                "A = " + A.toFixed(0) + " µm²",
                180,
                270
            );

            ctx.fillText(
                "d = " + d.toFixed(1) + " nm",
                390,
                270
            );

            ctx.fillText(
                "V = " + V.toFixed(0) + " mV",
                570,
                270
            );
        }


        function drawCharge(
            x,
            y,
            sign
        ) {

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                7,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                sign === "+"
                    ? "rgba(80,220,255,0.9)"
                    : "rgba(255,130,100,0.9)";

            ctx.fill();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 10px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                sign,
                x,
                y
            );


            ctx.textAlign =
                "left";

            ctx.textBaseline =
                "alphabetic";
        }


        /*
         * Live controls
         */

        epsilon.addEventListener(
            "input",
            update
        );

        area.addEventListener(
            "input",
            update
        );

        thickness.addEventListener(
            "input",
            update
        );

        voltage.addEventListener(
            "input",
            update
        );


        /*
         * Initial calculation
         */

        update();
    }


    /*
     * Start
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            createMembraneModule
        );

    } else {

        createMembraneModule();
    }

})();
/* =========================================================
   JARVIS — IONS IN SOLUTION
   CHARGE RELAXATION TIME
   Based directly on Unit III_2 section 5.7
   ========================================================= */

(function jarvisIonChargeRelaxation() {

    function createIonRelaxationModule() {

        if (document.getElementById("ionRelaxationModule")) {
            return;
        }

        const module = document.createElement("section");

        module.id = "ionRelaxationModule";

        module.style.gridColumn = "1 / -1";
        module.style.width = "100%";
        module.style.boxSizing = "border-box";
        module.style.marginTop = "20px";
        module.style.padding = "24px";
        module.style.borderRadius = "18px";
        module.style.background = "rgba(10,20,35,0.94)";
        module.style.border =
            "1px solid rgba(100,200,255,0.25)";
        module.style.boxShadow =
            "0 10px 35px rgba(0,0,0,0.25)";


        module.innerHTML = `

            <h2 style="
                color:#8fe8ff;
                margin-top:0;
            ">
                🧪 Ions in Solution — Charge Relaxation
            </h2>

            <p style="
                color:#b9c9d8;
            ">
                An electrolytic solution contains oppositely
                charged ions. In a conducting medium, an initial
                charge density relaxes toward electroneutrality.
            </p>


            <!-- EQUATIONS -->

            <div style="
                padding:18px;
                margin:18px 0;
                border-radius:12px;
                background:rgba(255,255,255,0.04);
                text-align:center;
            ">

                <div style="
                    font-size:21px;
                    color:#ffffff;
                    margin-bottom:10px;
                ">
                    J = kₑE
                </div>

                <div style="
                    font-size:21px;
                    color:#ffffff;
                    margin-bottom:10px;
                ">
                    τᵣ = ε / kₑ
                </div>

                <div style="
                    font-size:21px;
                    color:#ffffff;
                ">
                    ρ(t) = ρ₀ e<sup>−t/τᵣ</sup>
                </div>

            </div>


            <!-- CONTROLS -->

            <div style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
                gap:14px;
            ">


                <!-- INITIAL CHARGE -->

                <div style="
                    padding:14px;
                    border-radius:12px;
                    background:rgba(255,255,255,0.04);
                ">

                    <label>
                        Initial Charge Density ρ₀
                    </label>

                    <input
                        id="ionRho0"
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value="5"
                        style="width:100%;"
                    >

                    <div>
                        ρ₀ =
                        <span id="ionRho0Value">
                            5.0
                        </span>
                        C/m³
                    </div>

                </div>


                <!-- CONDUCTIVITY -->

                <div style="
                    padding:14px;
                    border-radius:12px;
                    background:rgba(255,255,255,0.04);
                ">

                    <label>
                        Conductivity kₑ
                    </label>

                    <input
                        id="ionConductivity"
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value="1"
                        style="width:100%;"
                    >

                    <div>
                        kₑ =
                        <span id="ionConductivityValue">
                            1.0
                        </span>
                        S/m
                    </div>

                </div>


                <!-- PERMITTIVITY -->

                <div style="
                    padding:14px;
                    border-radius:12px;
                    background:rgba(255,255,255,0.04);
                ">

                    <label>
                        Permittivity ε
                    </label>

                    <input
                        id="ionPermittivity"
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value="10"
                        style="width:100%;"
                    >

                    <div>
                        εᵣ =
                        <span id="ionPermittivityValue">
                            10
                        </span>
                    </div>

                </div>


                <!-- TIME -->

                <div style="
                    padding:14px;
                    border-radius:12px;
                    background:rgba(255,255,255,0.04);
                ">

                    <label>
                        Time
                    </label>

                    <input
                        id="ionTime"
                        type="range"
                        min="0"
                        max="5"
                        step="0.01"
                        value="0"
                        style="width:100%;"
                    >

                    <div>
                        t =
                        <span id="ionTimeValue">
                            0.00
                        </span>
                        s
                    </div>

                </div>

            </div>


            <!-- RESULTS -->

            <div style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(180px,1fr));
                gap:12px;
                margin-top:18px;
            ">


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(70,160,255,0.10);
                ">

                    <small>RELAXATION TIME</small>

                    <div
                        id="ionTau"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(120,220,180,0.10);
                ">

                    <small>CURRENT CHARGE DENSITY</small>

                    <div
                        id="ionCurrentRho"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(255,190,100,0.10);
                ">

                    <small>CHARGE REMAINING</small>

                    <div
                        id="ionRemaining"
                        style="
                            font-size:22px;
                            font-weight:bold;
                            margin-top:6px;
                        "
                    >
                        --
                    </div>

                </div>


                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:rgba(220,130,255,0.10);
                ">

                    <small>STATE</small>

                    <div
                        id="ionState"
                        style="
                            font-size:18px;
                            font-weight:bold;
                            margin-top:8px;
                        "
                    >
                        --
                    </div>

                </div>

            </div>


            <!-- VISUALIZATION -->

            <div style="
                margin-top:20px;
                padding:12px;
                border-radius:14px;
                background:rgba(0,0,0,0.20);
            ">

                <canvas
                    id="ionRelaxationCanvas"
                    width="900"
                    height="300"
                    style="
                        width:100%;
                        max-width:900px;
                        display:block;
                        margin:auto;
                    "
                ></canvas>

            </div>


            <!-- JARVIS -->

            <div
                id="ionJarvis"
                style="
                    margin-top:16px;
                    padding:16px;
                    border-radius:12px;
                    background:rgba(80,180,255,0.08);
                    color:#d9f5ff;
                "
            >
                JARVIS is calculating charge relaxation...
            </div>

        `;


        const main =
            document.querySelector("main");

        if (main) {
            main.appendChild(module);
        } else {
            document.body.appendChild(module);
        }


        setupIonRelaxation();
    }


    function setupIonRelaxation() {

        const rho0Slider =
            document.getElementById("ionRho0");

        const conductivitySlider =
            document.getElementById(
                "ionConductivity"
            );

        const permittivitySlider =
            document.getElementById(
                "ionPermittivity"
            );

        const timeSlider =
            document.getElementById("ionTime");

        const canvas =
            document.getElementById(
                "ionRelaxationCanvas"
            );

        const ctx =
            canvas.getContext("2d");


        function update() {

            const rho0 =
                Number(rho0Slider.value);

            const ke =
                Number(
                    conductivitySlider.value
                );

            const epsilonRelative =
                Number(
                    permittivitySlider.value
                );

            const time =
                Number(timeSlider.value);


            /*
             * Vacuum permittivity
             */

            const epsilon0 =
                8.854e-12;


            /*
             * Absolute permittivity
             *
             * ε = ε0 εr
             */

            const epsilon =
                epsilon0 *
                epsilonRelative;


            /*
             * Charge relaxation time
             *
             * τr = ε / ke
             */

            const tau =
                epsilon / ke;


            /*
             * Charge relaxation equation
             *
             * ρ(t) = ρ0 exp(-t/τ)
             */

            let rho;

            /*
 * TIME IS NOW EXPRESSED IN RELAXATION-TIME UNITS
 *
 * time = 0      → ρ = ρ₀
 * time = 1      → ρ = ρ₀/e  ≈ 36.8%
 * time = 2      → ρ ≈ 13.5%
 * time = 3      → ρ ≈ 5.0%
 * time = 5      → ρ ≈ 0.67%
 *
 * This keeps the physical equation exact:
 *
 * ρ(t) = ρ₀ exp(-t/τᵣ)
 */

const actualTime =
    time * tau;

rho =
    rho0 *
    Math.exp(
        -actualTime / tau
    );

            const remaining =
                (rho / rho0) * 100;


            /*
             * Update displayed values
             */

            document.getElementById(
                "ionRho0Value"
            ).textContent =
                rho0.toFixed(1);


            document.getElementById(
                "ionConductivityValue"
            ).textContent =
                ke.toFixed(1);


            document.getElementById(
                "ionPermittivityValue"
            ).textContent =
                epsilonRelative.toFixed(0);


            document.getElementById(
    "ionTimeValue"
).textContent =
    time.toFixed(2) + " τᵣ";


            /*
             * Relaxation time display
             */

            document.getElementById(
                "ionTau"
            ).textContent =
                tau.toExponential(3)
                + " s";


            /*
             * Current charge density
             */

            document.getElementById(
                "ionCurrentRho"
            ).textContent =
                rho.toExponential(3)
                + " C/m³";


            /*
             * Percentage remaining
             */

            document.getElementById(
                "ionRemaining"
            ).textContent =
                remaining.toFixed(2)
                + " %";


            /*
             * State
             */

            let state;

            if (remaining > 75) {

                state =
                    "INITIAL CHARGE";

            } else if (remaining > 25) {

                state =
                    "RELAXING";

            } else if (remaining > 5) {

                state =
                    "NEAR ELECTRONEUTRALITY";

            } else {

                state =
                    "ELECTRONEUTRAL";
            }


            document.getElementById(
                "ionState"
            ).textContent =
                state;


            /*
             * JARVIS explanation
             */

            let message =
                "JARVIS: ";


            message +=
                "The charge relaxation time is τᵣ = ε/kₑ. ";


            if (ke > 2) {

                message +=
                    "Higher conductivity allows charge " +
                    "to relax more rapidly. ";

            } else {

                message +=
                    "Lower conductivity produces slower " +
                    "charge relaxation. ";
            }


            if (remaining < 5) {

                message +=
                    "The solution is approaching " +
                    "electroneutrality.";

            } else {

                message +=
                    "The remaining charge follows " +
                    "ρ(t) = ρ₀e⁻ᵗ⁄τᵣ.";
            }


            document.getElementById(
                "ionJarvis"
            ).textContent =
                message;


            drawIonSolution(
                rho0,
                rho,
                remaining,
                ke,
                epsilonRelative
            );
        }


        function drawIonSolution(
            rho0,
            rho,
            remaining,
            ke,
            epsilonRelative
        ) {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
             * Solution chamber
             */

            ctx.fillStyle =
                "rgba(50,150,210,0.08)";

            ctx.fillRect(
                60,
                45,
                780,
                190
            );


            ctx.strokeStyle =
                "rgba(120,210,255,0.8)";

            ctx.lineWidth = 2;

            ctx.strokeRect(
                60,
                45,
                780,
                190
            );


            /*
             * Labels
             */

            ctx.fillStyle =
                "#9bdcff";

            ctx.font =
                "bold 16px Arial";

            ctx.fillText(
                "ELECTROLYTIC SOLUTION",
                330,
                30
            );


            ctx.font =
                "13px Arial";

            ctx.fillStyle =
                "#ffffff";

            ctx.fillText(
                "Conductivity kₑ = " +
                ke.toFixed(1) +
                " S/m",
                80,
                270
            );


            ctx.fillText(
                "εᵣ = " +
                epsilonRelative.toFixed(0),
                380,
                270
            );


            ctx.fillText(
                "Charge remaining = " +
                remaining.toFixed(1) +
                "%",
                570,
                270
            );


            /*
             * Number of charged particles
             * decreases as charge relaxes.
             */

            const count =
                Math.max(
                    2,
                    Math.round(
                        30 *
                        remaining /
                        100
                    )
                );


            /*
             * Positive and negative ions
             */

            for (
                let i = 0;
                i < count;
                i++
            ) {

                const x =
                    90 +
                    (
                        (i * 137) %
                        720
                    );

                const y =
                    70 +
                    (
                        (i * 67) %
                        145
                    );


                const positive =
                    i % 2 === 0;


                drawIon(
                    x,
                    y,
                    positive
                        ? "+"
                        : "-"
                );
            }


            /*
             * Neutrality indicator
             */

            ctx.beginPath();

            ctx.arc(
                450,
                140,
                42,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "rgba(255,255,255,0.25)";

            ctx.stroke();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 14px Arial";

            ctx.textAlign =
                "center";

            if (remaining < 5) {

                ctx.fillText(
                    "≈ 0 NET CHARGE",
                    450,
                    145
                );

            } else {

                ctx.fillText(
                    "CHARGE RELAXING",
                    450,
                    145
                );
            }


            ctx.textAlign =
                "left";
        }


        function drawIon(
            x,
            y,
            sign
        ) {

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                8,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                sign === "+"
                    ? "rgba(80,220,255,0.9)"
                    : "rgba(255,130,100,0.9)";


            ctx.fill();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 11px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                sign,
                x,
                y
            );


            ctx.textAlign =
                "left";

            ctx.textBaseline =
                "alphabetic";
        }


        /*
         * Live sliders
         */

        rho0Slider.addEventListener(
            "input",
            update
        );

        conductivitySlider.addEventListener(
            "input",
            update
        );

        permittivitySlider.addEventListener(
            "input",
            update
        );

        timeSlider.addEventListener(
            "input",
            update
        );


        /*
         * Initial state
         */

        update();
    }


    /*
     * Start after page is ready
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            createIonRelaxationModule
        );

    } else {

        createIonRelaxationModule();
    }

})();
/* =========================================================
   JARVIS 3D LAB — LARGE VIEW + LIVE PARAMETER RAIL
   ========================================================= */

(function setupLarge3DLab() {

    function build3DLab() {

        const module = document.getElementById("jarvis3DModule");
        const canvas = document.getElementById("jarvis3DCanvas");

        const heat = document.getElementById("heatGeneration");
        const conductivity = document.getElementById("conductivity");
        const radius = document.getElementById("radius");
        const surfaceTemp = document.getElementById("surfaceTemp");

        if (
            !module ||
            !canvas ||
            !heat ||
            !conductivity ||
            !radius ||
            !surfaceTemp
        ) {
            setTimeout(build3DLab, 300);
            return;
        }

        /* Prevent duplicate creation */
        if (document.getElementById("jarvis3DParamRail")) {
            return;
        }

        /* -----------------------------------------------------
           LARGE 3D CANVAS
           ----------------------------------------------------- */

        canvas.style.width = "100%";
        canvas.style.height = "680px";
        canvas.style.minHeight = "600px";
        canvas.style.display = "block";

        /* -----------------------------------------------------
           PARAMETER PANEL
           ----------------------------------------------------- */

        const rail = document.createElement("div");

        rail.id = "jarvis3DParamRail";

        rail.innerHTML = `

            <h3>⚙ LIVE 3D PARAMETERS</h3>

            <div class="jarvis3d-param">

                <label>
                    <span>Metabolic Heat Qₘ</span>
                    <strong id="j3dHeatValue"></strong>
                </label>

                <input
                    type="range"
                    id="j3dHeat"
                >

            </div>


            <div class="jarvis3d-param">

                <label>
                    <span>Conductivity k</span>
                    <strong id="j3dKValue"></strong>
                </label>

                <input
                    type="range"
                    id="j3dK"
                >

            </div>


            <div class="jarvis3d-param">

                <label>
                    <span>Tissue Radius R</span>
                    <strong id="j3dRValue"></strong>
                </label>

                <input
                    type="range"
                    id="j3dR"
                >

            </div>


            <div class="jarvis3d-param">

                <label>
                    <span>Surface Temperature</span>
                    <strong id="j3dTsValue"></strong>
                </label>

                <input
                    type="range"
                    id="j3dTs"
                >

            </div>


            <div class="jarvis3d-info">

                <strong>THERMAL MODEL</strong><br><br>

                T(r) = Tₛ +
                QₘR²/(4k)
                [1 − (r/R)²]

                <br><br>

                <strong>MAXIMUM TEMPERATURE</strong>

                <br>

                <span id="j3dTmax">
                    --
                </span>

            </div>


            <div class="jarvis3d-info">

                <strong>3D INTERACTION</strong>

                <br><br>

                🖱 Drag → Rotate tissue

                <br>

                🔍 Scroll → Zoom

                <br>

                🔥 Qₘ → Heat intensity

                <br>

                ⚡ Charge flux → Electrical activity

            </div>
        `;


        /* -----------------------------------------------------
           COPY ORIGINAL SLIDER SETTINGS
           ----------------------------------------------------- */

        function copySlider(original, clone) {

            clone.min = original.min;
            clone.max = original.max;
            clone.step = original.step;
            clone.value = original.value;

        }


        const j3dHeat =
            rail.querySelector("#j3dHeat");

        const j3dK =
            rail.querySelector("#j3dK");

        const j3dR =
            rail.querySelector("#j3dR");

        const j3dTs =
            rail.querySelector("#j3dTs");


        copySlider(heat, j3dHeat);
        copySlider(conductivity, j3dK);
        copySlider(radius, j3dR);
        copySlider(surfaceTemp, j3dTs);


        /* -----------------------------------------------------
           UPDATE DISPLAY
           ----------------------------------------------------- */

        function update3DParameterDisplay() {

            const Qm =
                Number(heat.value);

            const k =
                Number(conductivity.value);

            const R =
                Number(radius.value);

            const Ts =
                Number(surfaceTemp.value);


            document.getElementById("j3dHeatValue")
                .textContent =
                Qm.toFixed(0) + " W/m³";


            document.getElementById("j3dKValue")
                .textContent =
                k.toFixed(1) + " W/m·K";


            document.getElementById("j3dRValue")
                .textContent =
                R.toFixed(3) + " m";


            document.getElementById("j3dTsValue")
                .textContent =
                Ts.toFixed(0) + " °C";


            /* Same scientific equation used by thermal module */

            const deltaT =
                (Qm * R * R) /
                (4 * k);


            const Tmax =
                Ts + deltaT;


            document.getElementById("j3dTmax")
                .textContent =
                Tmax.toFixed(2) + " °C";

        }


        /* -----------------------------------------------------
           3D SLIDER → ORIGINAL SCIENTIFIC SLIDER
           ----------------------------------------------------- */

        j3dHeat.addEventListener(
            "input",
            function () {

                heat.value =
                    j3dHeat.value;

                heat.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                update3DParameterDisplay();

            }
        );


        j3dK.addEventListener(
            "input",
            function () {

                conductivity.value =
                    j3dK.value;

                conductivity.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                update3DParameterDisplay();

            }
        );


        j3dR.addEventListener(
            "input",
            function () {

                radius.value =
                    j3dR.value;

                radius.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                update3DParameterDisplay();

            }
        );


        j3dTs.addEventListener(
            "input",
            function () {

                surfaceTemp.value =
                    j3dTs.value;

                surfaceTemp.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                update3DParameterDisplay();

            }
        );


        /* -----------------------------------------------------
           ORIGINAL SLIDER → 3D PANEL
           ----------------------------------------------------- */

        function syncFromOriginal() {

            j3dHeat.value =
                heat.value;

            j3dK.value =
                conductivity.value;

            j3dR.value =
                radius.value;

            j3dTs.value =
                surfaceTemp.value;

            update3DParameterDisplay();

        }


        heat.addEventListener(
            "input",
            syncFromOriginal
        );

        conductivity.addEventListener(
            "input",
            syncFromOriginal
        );

        radius.addEventListener(
            "input",
            syncFromOriginal
        );

        surfaceTemp.addEventListener(
            "input",
            syncFromOriginal
        );


        /* -----------------------------------------------------
           ADD PANEL TO 3D MODULE
           ----------------------------------------------------- */

        module.appendChild(rail);


        /* -----------------------------------------------------
           FORCE LARGE 3D LAYOUT
           ----------------------------------------------------- */

        module.style.width =
            "100%";

        module.style.maxWidth =
            "1500px";

        module.style.margin =
            "35px auto";

        module.style.boxSizing =
            "border-box";

        module.style.display =
            "grid";

        module.style.gridTemplateColumns =
            "minmax(0, 1fr) 310px";

        module.style.gap =
            "20px";


        canvas.style.gridColumn =
            "1";

        canvas.style.gridRow =
            "1";


        rail.style.gridColumn =
            "2";

        rail.style.gridRow =
            "1";


        /* Status underneath */

        const status =
            document.getElementById("jarvis3DStatus");

        if (status) {

            status.style.gridColumn =
                "1 / -1";

        }


        update3DParameterDisplay();

        console.log(
            "JARVIS: Large 3D laboratory layout activated."
        );

    }


    build3DLab();

})();
/* =========================================================
   JARVIS 3D — FORCE CORRECT RESIZE AFTER PARAMETER RAIL
   ========================================================= */

(function fixJARVIS3DLayout() {

    function resizeJARVIS3D() {

        const canvas =
            document.getElementById("jarvis3DCanvas");

        if (!canvas) {
            return;
        }

        /*
         * Force the browser to finish the new grid layout
         * before Three.js measures the canvas.
         */
        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                const width =
                    canvas.clientWidth;

                const height =
                    canvas.clientHeight;

                if (
                    width <= 0 ||
                    height <= 0
                ) {
                    return;
                }

                /*
                 * Trigger the resize handler already
                 * present in the Three.js module.
                 */
                window.dispatchEvent(
                    new Event("resize")
                );

            });

        });

    }


    /*
     * Wait until the 3D parameter rail has been created.
     */
    const waitFor3D = setInterval(() => {

        const module =
            document.getElementById("jarvis3DModule");

        const canvas =
            document.getElementById("jarvis3DCanvas");

        const rail =
            document.getElementById("jarvis3DParamRail");


        if (
            module &&
            canvas &&
            rail
        ) {

            clearInterval(waitFor3D);

            resizeJARVIS3D();

            /*
             * Resize again if the layout changes.
             */
            if (
                typeof ResizeObserver !==
                "undefined"
            ) {

                const observer =
                    new ResizeObserver(() => {
                        resizeJARVIS3D();
                    });

                observer.observe(module);
                observer.observe(canvas);

            }

        }

    }, 100);

})();
/* =========================================================
   JARVIS 3D — FINAL TWO COLUMN LAYOUT FIX
   ========================================================= */

(function final3DLayoutFix() {

    function fixLayout() {

        const module =
            document.getElementById("jarvis3DModule");

        const canvas =
            document.getElementById("jarvis3DCanvas");

        const rail =
            document.getElementById("jarvis3DParamRail");

        const status =
            document.getElementById("jarvis3DStatus");

        if (
            !module ||
            !canvas ||
            !rail
        ) {
            setTimeout(fixLayout, 200);
            return;
        }

        /* -----------------------------------------
           THE CANVAS'S PARENT IS THE REAL GRID ITEM
           ----------------------------------------- */

        const canvasBox =
            canvas.parentElement;

        if (!canvasBox) {
            return;
        }


        /* -----------------------------------------
           MODULE GRID
           ----------------------------------------- */

        module.style.display = "grid";

        module.style.gridTemplateColumns =
            "minmax(0, 1fr) 310px";

        module.style.gridTemplateRows =
            "auto auto 1fr auto";

        module.style.columnGap = "20px";

        module.style.rowGap = "16px";

        module.style.width = "100%";

        module.style.maxWidth = "1500px";

        module.style.boxSizing = "border-box";


        /* -----------------------------------------
           TITLE
           ----------------------------------------- */

        const title =
            module.querySelector("h2");

        if (title) {

            title.style.gridColumn =
                "1 / -1";

            title.style.gridRow =
                "1";
        }


        /* -----------------------------------------
           DESCRIPTION
           ----------------------------------------- */

        const description =
            module.querySelector("h2 + p");

        if (description) {

            description.style.gridColumn =
                "1 / -1";

            description.style.gridRow =
                "2";

            description.style.marginBottom =
                "0";
        }


        /* -----------------------------------------
           LARGE 3D VIEW
           ----------------------------------------- */

        canvasBox.style.gridColumn =
            "1";

        canvasBox.style.gridRow =
            "3";

        canvasBox.style.width =
            "100%";

        canvasBox.style.height =
            "680px";

        canvasBox.style.minHeight =
            "680px";

        canvasBox.style.position =
            "relative";

        canvasBox.style.overflow =
            "hidden";

        canvasBox.style.borderRadius =
            "18px";


        /* -----------------------------------------
           CANVAS
           ----------------------------------------- */

        canvas.style.width =
            "100%";

        canvas.style.height =
            "100%";

        canvas.style.display =
            "block";


        /* -----------------------------------------
           PARAMETER RAIL
           ----------------------------------------- */

        rail.style.gridColumn =
            "2";

        rail.style.gridRow =
            "3";

        rail.style.width =
            "100%";

        rail.style.height =
            "680px";

        rail.style.boxSizing =
            "border-box";

        rail.style.alignSelf =
            "stretch";


        /* -----------------------------------------
           STATUS BAR
           ----------------------------------------- */

        if (status) {

            status.style.gridColumn =
                "1 / -1";

            status.style.gridRow =
                "4";

            status.style.width =
                "100%";

            status.style.boxSizing =
                "border-box";
        }


        /* -----------------------------------------
           FORCE THREE.JS TO RECALCULATE
           ----------------------------------------- */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                window.dispatchEvent(
                    new Event("resize")
                );

            });

        });

    }


    /* Wait for 3D module */

    const timer =
        setInterval(() => {

            const module =
                document.getElementById(
                    "jarvis3DModule"
                );

            const canvas =
                document.getElementById(
                    "jarvis3DCanvas"
                );

            const rail =
                document.getElementById(
                    "jarvis3DParamRail"
                );

            if (
                module &&
                canvas &&
                rail
            ) {

                clearInterval(timer);

                fixLayout();

            }

        }, 100);


    /* -----------------------------------------
       RESPONSIVE LAYOUT
       ----------------------------------------- */

    window.addEventListener(
        "resize",
        () => {

            const module =
                document.getElementById(
                    "jarvis3DModule"
                );

            const canvas =
                document.getElementById(
                    "jarvis3DCanvas"
                );

            const rail =
                document.getElementById(
                    "jarvis3DParamRail"
                );

            if (
                !module ||
                !canvas ||
                !rail
            ) {
                return;
            }


            if (window.innerWidth < 950) {

                module.style.gridTemplateColumns =
                    "1fr";

                canvas.parentElement.style.gridColumn =
                    "1";

                canvas.parentElement.style.gridRow =
                    "3";

                rail.style.gridColumn =
                    "1";

                rail.style.gridRow =
                    "4";

                rail.style.height =
                    "auto";

            } else {

                module.style.gridTemplateColumns =
                    "minmax(0, 1fr) 310px";

                canvas.parentElement.style.gridColumn =
                    "1";

                canvas.parentElement.style.gridRow =
                    "3";

                rail.style.gridColumn =
                    "2";

                rail.style.gridRow =
                    "3";

                rail.style.height =
                    "680px";

            }

        }
    );

})();
/* =========================================================
   JARVIS TONY STARK GESTURE CONTROL
   POINT → PINCH → GRAB → DRAG → RELEASE
   ========================================================= */

/* =========================================================
   J.A.R.V.I.S. — UNIFIED GESTURE SYSTEM
   This REPLACES every other hand-gesture script. Only load
   this one. Remove: JARVISHandGestureFixed, any
   setupTonyStarkGestureControl copies, JARVISHandGestureHeavy —
   whatever you had before, delete it. One camera, one system.

   ┌─────────────────────────────────────────────────────┐
   │  GESTURES                                            │
   ├─────────────────────────────────────────────────────┤
   │  ✋ open hand, moving over 3D view   → rotate (inertial)
   │  🤏 pinch empty space in 3D view     → zoom
   │  🤏 pinch the TISSUE mesh + drag ↕   → scrubs Radius R
   │  🤏 pinch the HEAT core + drag ↕     → scrubs Qₘ
   │  🤏 pinch the MEMBRANE ring + drag ↕ → scrubs Conductivity k
   │  🤏 pinch a panel's title + drag     → moves that panel
   │      → drag into the trash reticle   → removes it
   │        (bottom-right; restore tray appears at bottom)
   │  ✊ fist                             → reset 3D view
   │  ☝️ point, held ~0.9s                → toggle auto-rotate
   │  ✌️ peace sign                       → cycle zoom preset
   │  👍 / 👎 thumbs up/down              → power Qₘ up/down
   └─────────────────────────────────────────────────────┘

   Needs (optional, for the 3D-grab feature only):
     window.JARVIS_3D_CAMERA   — already exposed by your module script
     window.JARVIS_3D_SCENE    — already exposed by your module script
     window.JARVIS_3D_RAYCAST(ndcX, ndcY) — see
       paste-into-module-script.js (5-line hook). Without it,
       pinching the 3D view just always zooms — everything
       else in this file still works fine.
   ========================================================= */

(function JARVISUnifiedGestureSystem() {

    /* =====================================================
       STYLES
       ===================================================== */

    const style = document.createElement("style");

    style.textContent = `

        #jarvisHandGesturePanel {
            position: relative;
        }

        #jarvisHandGesturePanel .jarvis-camera-box {
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            box-shadow:
                0 0 0 1px rgba(0,234,255,0.35),
                0 0 40px rgba(0,200,255,0.18),
                inset 0 0 60px rgba(0,200,255,0.06);
            transition: filter 0.4s ease, opacity 0.4s ease;
        }

        #jarvisHandGesturePanel.jarvis-hand-offline .jarvis-camera-box {
            filter: grayscale(1) brightness(0.55);
            opacity: 0.75;
        }

        #jarvisHandGesturePanel .jarvis-corner {
            position: absolute;
            width: 26px;
            height: 26px;
            border: 2px solid rgba(0,234,255,0.85);
            z-index: 5;
            pointer-events: none;
            filter: drop-shadow(0 0 6px rgba(0,234,255,0.8));
        }

        #jarvisHandGesturePanel .jarvis-corner.tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
        #jarvisHandGesturePanel .jarvis-corner.tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
        #jarvisHandGesturePanel .jarvis-corner.bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
        #jarvisHandGesturePanel .jarvis-corner.br { bottom: 6px; right: 6px; border-left: none; border-top: none; }

        #jarvisHandGesturePanel .jarvis-scanline {
            position: absolute;
            left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(0,234,255,0.9), transparent);
            box-shadow: 0 0 12px rgba(0,234,255,0.8);
            z-index: 4;
            pointer-events: none;
            animation: jarvisScan 3.2s linear infinite;
        }

        @keyframes jarvisScan {
            0%   { top: 0%; opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }

        #jarvisHandGesturePanel .jarvis-hand-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            text-shadow: 0 0 10px rgba(0,234,255,0.6);
            letter-spacing: 1px;
        }

        #jarvisHandToggleBtn {
            padding: 5px 12px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 20px;
            border: 1px solid rgba(0,234,255,0.45);
            background: rgba(0,234,255,0.08);
            color: #7fe8ff;
            cursor: pointer;
            white-space: nowrap;
        }

        #jarvisHandToggleBtn.off {
            border-color: rgba(255,130,100,0.5);
            color: #ff9d7a;
            background: rgba(255,100,80,0.08);
        }

        #jarvisHandGesturePanel .jarvis-hand-info strong {
            text-shadow: 0 0 6px rgba(0,234,255,0.4);
        }

        /* Virtual page cursor (fingertip proxy across the whole page) */

        #jarvisVirtualCursor {
            position: fixed;
            width: 34px;
            height: 34px;
            margin-left: -17px;
            margin-top: -17px;
            border-radius: 50%;
            border: 2px solid rgba(0,234,255,0.9);
            box-shadow: 0 0 14px rgba(0,234,255,0.6);
            pointer-events: none;
            z-index: 100000;
            display: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        #jarvisVirtualCursor::before,
        #jarvisVirtualCursor::after {
            content: "";
            position: absolute;
            background: rgba(0,234,255,0.9);
        }

        #jarvisVirtualCursor::before {
            left: 50%; top: -6px; width: 1px; height: 8px; transform: translateX(-50%);
        }

        #jarvisVirtualCursor::after {
            top: 50%; left: -6px; height: 1px; width: 8px; transform: translateY(-50%);
        }

        #jarvisVirtualCursor.grabbing {
            border-color: rgba(255,159,67,0.95);
            box-shadow: 0 0 18px rgba(255,159,67,0.7);
        }

        #jarvisVirtualCursor .jarvis-cursor-label {
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            font: bold 10px 'Courier New', monospace;
            color: #ffd27d;
            text-shadow: 0 0 6px rgba(255,159,67,0.9);
            white-space: nowrap;
            letter-spacing: 1px;
        }

        .jarvis-grabbed-panel {
            box-shadow:
                0 0 0 2px rgba(0,234,255,0.85),
                0 0 35px rgba(0,200,255,0.4) !important;
            transition: box-shadow 0.15s ease;
        }

        .jarvis-slider-grabbed {
            box-shadow: 0 0 0 3px rgba(255,159,67,0.55);
            border-radius: 6px;
        }

        /* Trash drop zone */

        #jarvisTrashZone {
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 74px;
            height: 74px;
            border-radius: 50%;
            border: 2px dashed rgba(255,90,90,0.6);
            background: rgba(40,5,5,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            color: rgba(255,140,140,0.9);
            z-index: 99998;
            opacity: 0;
            pointer-events: none;
            transform: scale(0.8);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        #jarvisTrashZone.active {
            opacity: 1;
            transform: scale(1);
        }

        #jarvisTrashZone.hover {
            border-color: rgba(255,60,60,0.95);
            background: rgba(80,10,10,0.7);
            transform: scale(1.12);
        }

        /* Restore tray */

        #jarvisRestoreTray {
            position: fixed;
            left: 50%;
            bottom: 14px;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            max-width: 90vw;
            z-index: 99997;
        }

        .jarvis-restore-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 12px;
            border-radius: 20px;
            background: rgba(5,10,18,0.92);
            border: 1px solid rgba(0,234,255,0.35);
            color: #9fd8e6;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            backdrop-filter: blur(6px);
        }

        .jarvis-restore-chip:hover {
            background: rgba(0,234,255,0.14);
            color: #ffffff;
        }

    `;

    document.head.appendChild(style);


    /* -----------------------------------------------------
       ROTATION STATE
       ----------------------------------------------------- */

    let lastX = null;
    let lastY = null;

    let targetRotationX = 0;
    let targetRotationY = 0;

    let smoothRotationX = 0;
    let smoothRotationY = 0;

    let velocityX = 0;
    let velocityY = 0;

    const ROTATION_SENSITIVITY = 4.5;
    const ROTATION_SMOOTHING = 0.14;
    const INERTIA_DAMPING = 0.94;
    const MAX_TILT = 0.9;
    const AUTO_ROTATE_SPEED = 0.006;

    let handPresent = false;
    let currentGesture = "none";
    let previousGesture = "none";

    let videoTrack = null;
    let handSystemStarted = false;
    let gestureEnabledFlag = true;

    const palmTrail = [];
    const TRAIL_LENGTH = 18;

    let dwellX = null;
    let dwellY = null;
    let dwellStart = 0;
    let dwellTriggered = false;
    const DWELL_TIME = 900;
    const DWELL_DEAD_ZONE = 0.01;

    let autoRotate = false;

    const ZOOM_PRESETS = [0.6, 1.0, 1.6];
    let zoomPresetIndex = 1;
    let baseCameraDistance = null;

    let lastThumbActionTime = 0;
    const THUMB_COOLDOWN = 450;
    const HEAT_STEP = 15;

    let activeToast = null;
    const TOAST_DURATION = 1600;

    let burstParticles = [];
    let sweepAngle = 0;

    /* Virtual page cursor (index fingertip mapped to viewport) */
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let lastCursorX = cursorX;
    let lastCursorY = cursorY;

    /* Unified pinch/grab state */
    let grabMode = null; // null | 'zoom' | 'radius' | 'heat' | 'conductivity' | 'panel'
    let grabPanelEl = null;
    let grabPanelOriginalStyle = "";

    const hiddenPanels = []; // { el, label, originalStyle }

    const SLIDER_IDS = {
        radius: "radius",
        heat: "heatGeneration",
        conductivity: "conductivity"
    };

    const GRAB_SENSITIVITY = {
        radius: 0.00006,
        heat: 0.7,
        conductivity: 0.0035
    };

    const GRAB_LABELS = {
        radius: "TISSUE RADIUS",
        heat: "METABOLIC HEAT",
        conductivity: "CONDUCTIVITY"
    };


    /* =====================================================
       ENABLED-STATE HELPER
       ===================================================== */

    function gestureEnabled() {
        return gestureEnabledFlag;
    }


    /* =====================================================
       LOAD EXTERNAL SCRIPT
       ===================================================== */

    function loadScript(src) {

        return new Promise((resolve, reject) => {

            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);

        });

    }


    /* =====================================================
       CREATE UI: hand panel, virtual cursor, trash zone, tray
       ===================================================== */

    function createPanel() {

        if (document.getElementById("jarvisHandGesturePanel")) {
            return;
        }

        const module = document.getElementById("jarvis3DModule");

        if (!module) {
            setTimeout(createPanel, 300);
            return;
        }

        const panel = document.createElement("div");
        panel.id = "jarvisHandGesturePanel";

        panel.innerHTML = `

            <div class="jarvis-hand-header">
                <span>🖐️ J.A.R.V.I.S. — GESTURE INTERFACE</span>
                <button id="jarvisHandToggleBtn">ON</button>
            </div>

            <div class="jarvis-hand-content">

                <div class="jarvis-camera-box">
                    <div class="jarvis-corner tl"></div>
                    <div class="jarvis-corner tr"></div>
                    <div class="jarvis-corner bl"></div>
                    <div class="jarvis-corner br"></div>
                    <div class="jarvis-scanline"></div>
                    <video id="jarvisHandVideo" autoplay playsinline muted></video>
                    <canvas id="jarvisHandOverlay"></canvas>
                </div>

                <div class="jarvis-hand-info">
                    <div><span>UPLINK</span><strong id="jarvisHandStatus">Initializing...</strong></div>
                    <div><span>GESTURE</span><strong id="jarvisGestureStatus">Standby — scanning for hand</strong></div>
                    <div><span>AUTO-ROTATE</span><strong id="jarvisAutoRotateStatus">OFF</strong></div>
                    <div><span>CONTROLS</span><strong>
                        ✋ Rotate &nbsp; 🤏 Zoom / Grab &nbsp; ✊ Reset<br>
                        ☝️ Hold → Auto-rotate &nbsp; ✌️ Zoom preset<br>
                        👍 / 👎 Power Qₘ &nbsp; 🤏 title → Move panel
                    </strong></div>
                </div>

            </div>

        `;

        module.appendChild(panel);

        const cursor = document.createElement("div");
        cursor.id = "jarvisVirtualCursor";
        cursor.innerHTML = `<span class="jarvis-cursor-label"></span>`;
        document.body.appendChild(cursor);

        const trash = document.createElement("div");
        trash.id = "jarvisTrashZone";
        trash.textContent = "🗑";
        document.body.appendChild(trash);

        const tray = document.createElement("div");
        tray.id = "jarvisRestoreTray";
        document.body.appendChild(tray);

        const toggleBtn = document.getElementById("jarvisHandToggleBtn");

        if (toggleBtn) {

            toggleBtn.addEventListener("click", () => {
                setGestureEnabled(!gestureEnabledFlag);
            });

        }

        startTracking();
        startRenderLoop();

    }


    function setGestureEnabled(enabled) {

        gestureEnabledFlag = enabled;

        const panel = document.getElementById("jarvisHandGesturePanel");
        const status = document.getElementById("jarvisHandStatus");
        const gestureStatus = document.getElementById("jarvisGestureStatus");
        const overlay = document.getElementById("jarvisHandOverlay");
        const toggleBtn = document.getElementById("jarvisHandToggleBtn");
        const cursor = document.getElementById("jarvisVirtualCursor");

        if (toggleBtn) {
            toggleBtn.textContent = enabled ? "ON" : "OFF";
            toggleBtn.classList.toggle("off", !enabled);
        }

        if (!enabled) {

            if (panel) panel.classList.add("jarvis-hand-offline");
            if (status) status.textContent = "Disabled — mouse/touch active";
            if (gestureStatus) gestureStatus.textContent = "Gesture tracking paused";
            if (overlay) {
                const ctx = overlay.getContext("2d");
                ctx.clearRect(0, 0, overlay.width, overlay.height);
            }
            if (cursor) cursor.style.display = "none";

            releasePanelGrab(false);
            handPresent = false;
            lastX = null;
            lastY = null;
            palmTrail.length = 0;

        } else {

            if (panel) panel.classList.remove("jarvis-hand-offline");
            if (status) status.textContent = "Reconnecting...";

            handSystemStarted = false;
            startTracking();

        }

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(text) {
        activeToast = { text, time: performance.now() };
        spawnBurst();
    }

    function spawnBurst() {
        burstParticles = [];
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            burstParticles.push({ angle, radius: 4, speed: 2.4 + Math.random() * 1.6, born: performance.now() });
        }
    }

    function drawBurst(ctx, width, height) {
        if (burstParticles.length === 0) return;
        const cx = width / 2, cy = height / 2, now = performance.now(), life = 550;
        burstParticles = burstParticles.filter(p => now - p.born < life);
        burstParticles.forEach(p => {
            const t = (now - p.born) / life;
            const r = p.radius + t * p.speed * 40;
            const alpha = 1 - t;
            const x = cx + Math.cos(p.angle) * r;
            const y = cy + Math.sin(p.angle) * r * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,234,255,${alpha * 0.9})`;
            ctx.fill();
        });
    }

    function drawToast(ctx, width, height) {

        if (!activeToast) return;

        const elapsed = performance.now() - activeToast.time;
        if (elapsed > TOAST_DURATION) { activeToast = null; return; }

        const fadeIn = Math.min(1, elapsed / 140);
        const fadeOut = Math.max(0, 1 - (elapsed - (TOAST_DURATION - 450)) / 450);
        const alpha = Math.min(fadeIn, fadeOut);
        const progress = 1 - elapsed / TOAST_DURATION;
        const text = activeToast.text;
        const bannerY = 40;

        ctx.save();
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.textAlign = "center";

        const textWidth = ctx.measureText(text).width;
        const paddingX = 24;
        const boxWidth = Math.min(width - 20, textWidth + paddingX * 2);
        const boxX = width / 2 - boxWidth / 2;
        const boxY = bannerY - 24;
        const boxHeight = 42;

        ctx.shadowColor = "rgba(0,234,255,0.9)";
        ctx.shadowBlur = 18 * alpha;
        ctx.fillStyle = `rgba(3,15,23,${0.82 * alpha})`;
        ctx.strokeStyle = `rgba(0,234,255,${0.95 * alpha})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
        } else {
            ctx.rect(boxX, boxY, boxWidth, boxHeight);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = `rgba(160,240,255,${alpha})`;
        ctx.fillText(text, width / 2, bannerY + 1);

        const barWidth = boxWidth - 20;
        const barX = width / 2 - barWidth / 2;
        const barY = boxY + boxHeight - 6;

        ctx.fillStyle = `rgba(0,234,255,${0.18 * alpha})`;
        ctx.fillRect(barX, barY, barWidth, 2.5);
        ctx.fillStyle = `rgba(0,234,255,${0.95 * alpha})`;
        ctx.fillRect(barX, barY, barWidth * progress, 2.5);

        ctx.restore();
        drawBurst(ctx, width, height);

    }


    /* =====================================================
       CONTINUOUS RENDER LOOP (rotation/autorotate + drag)
       ===================================================== */

    function startRenderLoop() {

        function tick() {

            if (gestureEnabled()) {

                const scene = window.JARVIS_3D_SCENE;
                const manuallyRotating = handPresent && currentGesture === "open" && grabMode === null;

                if (autoRotate && !manuallyRotating && grabMode === null) {
                    targetRotationY += AUTO_ROTATE_SPEED;
                } else if (!handPresent) {
                    targetRotationY += velocityY;
                    targetRotationX += velocityX;
                    velocityX *= INERTIA_DAMPING;
                    velocityY *= INERTIA_DAMPING;
                    targetRotationX = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetRotationX));
                }

                smoothRotationX += (targetRotationX - smoothRotationX) * ROTATION_SMOOTHING;
                smoothRotationY += (targetRotationY - smoothRotationY) * ROTATION_SMOOTHING;

                if (scene && grabMode !== "panel") {
                    scene.rotation.x = smoothRotationX;
                    scene.rotation.y = smoothRotationY;
                }

                updateVirtualCursor();
                updatePanelDrag();
                updateTrashZoneHover();

            }

            sweepAngle += 0.06;
            requestAnimationFrame(tick);

        }

        requestAnimationFrame(tick);

    }


    /* =====================================================
       VIRTUAL CURSOR
       ===================================================== */

    function updateVirtualCursor() {

        const cursor = document.getElementById("jarvisVirtualCursor");
        if (!cursor) return;

        if (!handPresent) {
            cursor.style.display = "none";
            return;
        }

        cursor.style.display = "block";
        cursor.style.left = cursorX + "px";
        cursor.style.top = cursorY + "px";

        const label = cursor.querySelector(".jarvis-cursor-label");

        if (grabMode && grabMode !== "zoom" && grabMode !== "panel") {
            cursor.classList.add("grabbing");
            if (label) label.textContent = GRAB_LABELS[grabMode] || "";
        } else if (grabMode === "panel") {
            cursor.classList.add("grabbing");
            if (label) label.textContent = "MOVING PANEL";
        } else {
            cursor.classList.remove("grabbing");
            if (label) label.textContent = "";
        }

    }


    /* =====================================================
       START HAND TRACKING (restartable)
       ===================================================== */

    async function startTracking() {

        if (handSystemStarted) return;
        handSystemStarted = true;

        const status = document.getElementById("jarvisHandStatus");

        try {

            if (status) status.textContent = "Loading vision model...";

            if (typeof Hands === "undefined") {
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
            }

            const video = document.getElementById("jarvisHandVideo");
            const overlay = document.getElementById("jarvisHandOverlay");
            if (!video || !overlay) return;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                audio: false
            });

            video.srcObject = stream;
            videoTrack = stream.getVideoTracks()[0];

            try {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities && capabilities.torch) {
                    await videoTrack.applyConstraints({ advanced: [{ torch: false }] });
                }
            } catch (torchError) {
                console.log("Torch control not supported:", torchError);
            }

            if (status) status.textContent = "Camera online — flash OFF";

            const hands = new Hands({
                locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.65,
                minTrackingConfidence: 0.65
            });

            hands.onResults(processResults);

            async function processFrame() {
                if (gestureEnabled() && video.readyState >= 2) {
                    try { await hands.send({ image: video }); } catch (e) { /* ignore */ }
                }
                requestAnimationFrame(processFrame);
            }

            processFrame();

        } catch (error) {
            console.error("JARVIS camera error:", error);
            if (status) status.textContent = "Camera permission denied";
        }

    }


    /* =====================================================
       GESTURE CLASSIFICATION
       ===================================================== */

    function dist(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function fingerExtended(hand, tipIdx, pipIdx) {
        const wrist = hand[0];
        return dist(wrist, hand[tipIdx]) > dist(wrist, hand[pipIdx]) * 1.15;
    }

    function classifyGesture(hand) {

        const wrist = hand[0];
        const indexExt = fingerExtended(hand, 8, 6);
        const middleExt = fingerExtended(hand, 12, 10);
        const ringExt = fingerExtended(hand, 16, 14);
        const pinkyExt = fingerExtended(hand, 20, 18);
        const thumbExt = fingerExtended(hand, 4, 3);
        const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

        if (!indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) return "fist";
        if (indexExt && !middleExt && !ringExt && !pinkyExt) return "point";
        if (indexExt && middleExt && !ringExt && !pinkyExt) return "peace";

        if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) {
            const thumbTip = hand[4];
            if (thumbTip.y < wrist.y - 0.08) return "thumbsUp";
            if (thumbTip.y > wrist.y + 0.08) return "thumbsDown";
            return "none";
        }

        if (extendedCount >= 3) return "open";
        return "none";

    }


    /* =====================================================
       HUD OVERLAY DRAWING (small camera-widget canvas)
       ===================================================== */

    const HAND_CONNECTIONS = [
        [0,1],[1,2],[2,3],[3,4],
        [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],
        [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],
        [5,9],[9,13],[13,17]
    ];

    function drawSkeleton(ctx, width, height, hand) {
        ctx.save();
        ctx.shadowColor = "rgba(0,234,255,0.9)";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "rgba(0,234,255,0.65)";
        ctx.lineWidth = 2.5;
        HAND_CONNECTIONS.forEach(([a, b]) => {
            ctx.beginPath();
            ctx.moveTo(hand[a].x * width, hand[a].y * height);
            ctx.lineTo(hand[b].x * width, hand[b].y * height);
            ctx.stroke();
        });
        hand.forEach((point, i) => {
            const isTip = [4, 8, 12, 16, 20].includes(i);
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, isTip ? 6 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isTip ? "rgba(0,234,255,1)" : "rgba(0,234,255,0.55)";
            ctx.fill();
        });
        ctx.restore();
    }

    function drawPalmReticle(ctx, width, height, hand, pinching) {

        const palm = hand[9];
        const px = palm.x * width, py = palm.y * height;
        const size = pinching ? 34 : 48;
        const accent = pinching ? "rgba(255,159,67,0.95)" : "rgba(0,234,255,0.95)";

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(sweepAngle);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 7]);
        ctx.beginPath();
        ctx.arc(0, 0, size + 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(px, py, size * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        const corner = size * 0.35;
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
            const cx = px + sx * size, cy = py + sy * size;
            ctx.beginPath();
            ctx.moveTo(cx, cy - sy * corner);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx - sx * corner, cy);
            ctx.stroke();
        });

        palmTrail.push({ x: px, y: py });
        if (palmTrail.length > TRAIL_LENGTH) palmTrail.shift();
        palmTrail.forEach((p, i) => {
            const alpha = (i / palmTrail.length) * 0.4;
            const r = 1 + (i / palmTrail.length) * 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,234,255,${alpha})`;
            ctx.fill();
        });

    }

    function drawTargetingReticle(ctx, width, height, hand, dwellProgress) {

        const tip = hand[8];
        const px = tip.x * width, py = tip.y * height;
        const wrist = hand[0];
        const wx = wrist.x * width, wy = wrist.y * height;
        const dx = px - wx, dy = py - wy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ex = px + (dx / len) * 500, ey = py + (dy / len) * 500;

        ctx.save();
        ctx.shadowColor = "rgba(255,204,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(255,204,0,0.65)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,204,0,0.85)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (dwellProgress > 0) {
            ctx.beginPath();
            ctx.arc(px, py, 20, -Math.PI / 2, -Math.PI / 2 + dwellProgress * Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.95)";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,204,0,1)";
        ctx.fill();

    }


    /* =====================================================
       SIMPLE GESTURE ACTIONS
       ===================================================== */

    function ensureBaseCameraDistance() {
        const camera = window.JARVIS_3D_CAMERA;
        if (camera && baseCameraDistance === null) baseCameraDistance = camera.position.length();
    }

    function resetView() {
        targetRotationX = 0;
        targetRotationY = 0;
        velocityX = 0;
        velocityY = 0;
        const camera = window.JARVIS_3D_CAMERA;
        if (camera && baseCameraDistance !== null) camera.position.setLength(baseCameraDistance);
        zoomPresetIndex = 1;
        autoRotate = false;
        updateAutoRotateLabel();
        showToast("🔒 SYSTEMS RESET — VIEW RESTORED");
    }

    function cycleZoomPreset() {
        zoomPresetIndex = (zoomPresetIndex + 1) % ZOOM_PRESETS.length;
        const camera = window.JARVIS_3D_CAMERA;
        if (camera && baseCameraDistance !== null) {
            camera.position.setLength(baseCameraDistance * ZOOM_PRESETS[zoomPresetIndex]);
        }
        const labels = ["CLOSE-UP", "STANDARD", "WIDE"];
        showToast("✌️ ZOOM PRESET — " + labels[zoomPresetIndex]);
    }

    function toggleAutoRotate() {
        autoRotate = !autoRotate;
        updateAutoRotateLabel();
        showToast(autoRotate ? "☝️ LOCK-ON — AUTO-ROTATE ENGAGED" : "☝️ AUTO-ROTATE DISENGAGED");
    }

    function updateAutoRotateLabel() {
        const el = document.getElementById("jarvisAutoRotateStatus");
        if (el) el.textContent = autoRotate ? "ON" : "OFF";
    }

    function adjustHeat(direction) {
        const now = performance.now();
        if (now - lastThumbActionTime < THUMB_COOLDOWN) return;
        lastThumbActionTime = now;
        const heat = document.getElementById("heatGeneration");
        if (!heat) return;
        const min = Number(heat.min) || 0, max = Number(heat.max) || 500;
        let value = Number(heat.value) + direction * HEAT_STEP;
        value = Math.max(min, Math.min(max, value));
        heat.value = value;
        heat.dispatchEvent(new Event("input", { bubbles: true }));
        showToast(direction > 0
            ? "👍 POWER UP — Qₘ " + value.toFixed(0) + " W/m³"
            : "👎 POWER DOWN — Qₘ " + value.toFixed(0) + " W/m³");
    }

    function handleGestureTransition(gesture) {
        if (gesture === previousGesture) return;
        if (gesture === "fist") resetView();
        if (gesture === "peace") cycleZoomPreset();
        if (gesture !== "point") { dwellX = null; dwellY = null; dwellStart = 0; dwellTriggered = false; }
        previousGesture = gesture;
    }

    function handlePointDwell(hand) {
        const tip = hand[8];
        const now = performance.now();
        if (dwellX === null) { dwellX = tip.x; dwellY = tip.y; dwellStart = now; return 0; }
        const moved = Math.sqrt((tip.x - dwellX) ** 2 + (tip.y - dwellY) ** 2);
        if (moved > DWELL_DEAD_ZONE) { dwellX = tip.x; dwellY = tip.y; dwellStart = now; dwellTriggered = false; return 0; }
        const progress = Math.min(1, (now - dwellStart) / DWELL_TIME);
        if (progress >= 1 && !dwellTriggered) { dwellTriggered = true; toggleAutoRotate(); }
        return progress;
    }


    /* =====================================================
       UNIFIED PINCH: 3D grab / panel drag / zoom
       ===================================================== */

    function findDragTarget(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        const isHandle = el.closest("h2, .simulation-header, .jarvis-hand-header, .visual-title");
        if (!isHandle) return null;
        return isHandle.closest(
            ".control-panel, .simulation, #jarvis3DModule, #jarvisChargeModule, " +
            "#constitutiveDriver, #membraneCapacitorModule, #ionRelaxationModule, " +
            "#jarvisHandGesturePanel, .equation-card, .jarvis-card"
        );
    }

    function beginPinch() {

        const canvas = document.getElementById("jarvis3DCanvas");
        const overCanvas = canvas && document.elementFromPoint(cursorX, cursorY) === canvas;

        if (overCanvas) {

            if (typeof window.JARVIS_3D_RAYCAST === "function") {

                const rect = canvas.getBoundingClientRect();
                const ndcX = ((cursorX - rect.left) / rect.width) * 2 - 1;
                const ndcY = -((cursorY - rect.top) / rect.height) * 2 + 1;
                const hitParam = window.JARVIS_3D_RAYCAST(ndcX, ndcY);

                if (hitParam && SLIDER_IDS[hitParam]) {

                    grabMode = hitParam;
                    const slider = document.getElementById(SLIDER_IDS[hitParam]);
                    if (slider) slider.classList.add("jarvis-slider-grabbed");
                    showToast("🤏 GRABBED — " + GRAB_LABELS[hitParam]);
                    return;

                }

            }

            grabMode = "zoom";
            return;

        }

        const target = findDragTarget(cursorX, cursorY);

        if (target) {

            grabMode = "panel";
            grabPanelEl = target;
            grabPanelOriginalStyle = target.getAttribute("style") || "";

            const rect = target.getBoundingClientRect();

            target.style.position = "fixed";
            target.style.left = rect.left + "px";
            target.style.top = rect.top + "px";
            target.style.width = rect.width + "px";
            target.style.margin = "0";
            target.style.zIndex = "9998";
            target.classList.add("jarvis-grabbed-panel");

            const trash = document.getElementById("jarvisTrashZone");
            if (trash) trash.classList.add("active");

            showToast("🤏 PANEL GRABBED — DRAG TO MOVE");
            return;

        }

        grabMode = null;

    }

    function updatePanelDrag() {

        if (grabMode !== "panel" || !grabPanelEl) return;

        const dx = cursorX - lastCursorX;
        const dy = cursorY - lastCursorY;

        const currentLeft = parseFloat(grabPanelEl.style.left) || 0;
        const currentTop = parseFloat(grabPanelEl.style.top) || 0;

        grabPanelEl.style.left = (currentLeft + dx) + "px";
        grabPanelEl.style.top = (currentTop + dy) + "px";

    }

    function updateTrashZoneHover() {

        const trash = document.getElementById("jarvisTrashZone");
        if (!trash) return;

        if (grabMode !== "panel") {
            trash.classList.remove("hover");
            return;
        }

        const rect = trash.getBoundingClientRect();
        const over =
            cursorX >= rect.left && cursorX <= rect.right &&
            cursorY >= rect.top && cursorY <= rect.bottom;

        trash.classList.toggle("hover", over);

    }

    function isOverTrash() {
        const trash = document.getElementById("jarvisTrashZone");
        if (!trash) return false;
        const rect = trash.getBoundingClientRect();
        return cursorX >= rect.left && cursorX <= rect.right &&
               cursorY >= rect.top && cursorY <= rect.bottom;
    }

    function removePanel(el, originalStyle) {

        const labelSource = el.querySelector("h2, .simulation-header, .jarvis-hand-header");
        const label = labelSource ? labelSource.textContent.trim().replace(/\s+/g, " ").slice(0, 28) : "Panel";

        el.style.transition = "opacity 0.25s ease";
        el.style.opacity = "0";

        setTimeout(() => { el.style.display = "none"; }, 260);

        hiddenPanels.push({ el, label, originalStyle });
        renderRestoreTray();
        showToast("🗑 REMOVED — " + label);

    }

    function renderRestoreTray() {

        const tray = document.getElementById("jarvisRestoreTray");
        if (!tray) return;

        tray.innerHTML = "";

        hiddenPanels.forEach((entry, index) => {

            const chip = document.createElement("div");
            chip.className = "jarvis-restore-chip";
            chip.innerHTML = `↩ ${entry.label}`;

            chip.addEventListener("click", () => {
                entry.el.style.opacity = "";
                entry.el.style.transition = "";
                entry.el.style.display = "";
                entry.el.setAttribute("style", entry.originalStyle);
                entry.el.classList.remove("jarvis-grabbed-panel");
                hiddenPanels.splice(index, 1);
                renderRestoreTray();
                showToast("↩ RESTORED — " + entry.label);
            });

            tray.appendChild(chip);

        });

    }

    function releasePanelGrab(checkTrash) {

        if (grabMode === "panel" && grabPanelEl) {

            grabPanelEl.classList.remove("jarvis-grabbed-panel");

            if (checkTrash && isOverTrash()) {
                removePanel(grabPanelEl, grabPanelOriginalStyle);
            }

            grabPanelEl = null;
            grabPanelOriginalStyle = "";

        }

        Object.values(SLIDER_IDS).forEach(id => {
            const slider = document.getElementById(id);
            if (slider) slider.classList.remove("jarvis-slider-grabbed");
        });

        const trash = document.getElementById("jarvisTrashZone");
        if (trash) { trash.classList.remove("active"); trash.classList.remove("hover"); }

        grabMode = null;

    }

    function updateGrabValue() {

        if (grabMode === "zoom") {

            const camera = window.JARVIS_3D_CAMERA;
            if (!camera) return;

            const dy = cursorY - lastCursorY;
            camera.position.multiplyScalar(1 + dy * 0.0025);
            return;

        }

        if (grabMode && SLIDER_IDS[grabMode]) {

            const slider = document.getElementById(SLIDER_IDS[grabMode]);
            if (!slider) return;

            const dy = cursorY - lastCursorY;
            const min = Number(slider.min), max = Number(slider.max);
            const range = max - min;

            let value = Number(slider.value) - dy * GRAB_SENSITIVITY[grabMode] * range;
            value = Math.max(min, Math.min(max, value));

            slider.value = value;
            slider.dispatchEvent(new Event("input", { bubbles: true }));

        }

    }


    /* =====================================================
       PROCESS HAND LANDMARKS
       ===================================================== */

    function processResults(results) {

        if (!gestureEnabled()) return;

        const video = document.getElementById("jarvisHandVideo");
        const overlay = document.getElementById("jarvisHandOverlay");
        const gestureStatus = document.getElementById("jarvisGestureStatus");

        if (!video || !overlay) return;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        overlay.width = width;
        overlay.height = height;

        const ctx = overlay.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        ensureBaseCameraDistance();

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {

            handPresent = false;
            currentGesture = "none";
            previousGesture = "none";
            lastX = null;
            lastY = null;
            palmTrail.length = 0;
            dwellX = null; dwellY = null; dwellTriggered = false;

            releasePanelGrab(true);

            if (gestureStatus) gestureStatus.textContent = "Standby — scanning for hand";
            drawToast(ctx, width, height);
            return;

        }

        handPresent = true;
        const hand = results.multiHandLandmarks[0];

        const palm = hand[9];
        const x = palm.x, y = palm.y;

        const thumb = hand[4], index = hand[8];
        const pinchDx = thumb.x - index.x, pinchDy = thumb.y - index.y;
        const pinchDistance = Math.sqrt(pinchDx * pinchDx + pinchDy * pinchDy);
        const pinching = pinchDistance < 0.075;

        const gesture = pinching ? "pinch" : classifyGesture(hand);
        currentGesture = gesture;

        drawSkeleton(ctx, width, height, hand);
        drawPalmReticle(ctx, width, height, hand, pinching);

        handleGestureTransition(gesture);

        /* Update the whole-page virtual cursor from the index fingertip,
           mirrored so it feels like a mirror, not a inverted camera. */
        lastCursorX = cursorX;
        lastCursorY = cursorY;
        cursorX = (1 - index.x) * window.innerWidth;
        cursorY = index.y * window.innerHeight;

        if (gesture === "pinch") {

            if (grabMode === null) {
                beginPinch();
            } else {
                updateGrabValue();
                if (grabMode === "panel") updatePanelDrag();
            }

            if (gestureStatus) {
                gestureStatus.textContent =
                    grabMode === "panel" ? "🤏 DRAGGING PANEL" :
                    grabMode && SLIDER_IDS[grabMode] ? "🤏 SCRUBBING — " + GRAB_LABELS[grabMode] :
                    "🤏 PINCH LOCKED — ZOOM ENGAGED";
            }

            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;

        }

        if (grabMode !== null) {
            releasePanelGrab(true);
        }

        if (gesture === "fist") {
            if (gestureStatus) gestureStatus.textContent = "✊ FIST — VIEW RESET";
            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;
        }

        if (gesture === "point") {
            const progress = handlePointDwell(hand);
            drawTargetingReticle(ctx, width, height, hand, progress);
            if (gestureStatus) {
                gestureStatus.textContent = progress > 0
                    ? "☝️ TARGETING — LOCKING " + Math.round(progress * 100) + "%"
                    : "☝️ POINT — HOLD TO TOGGLE AUTO-ROTATE";
            }
            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;
        }

        if (gesture === "peace") {
            if (gestureStatus) gestureStatus.textContent = "✌️ PEACE — ZOOM PRESET CYCLED";
            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;
        }

        if (gesture === "thumbsUp") {
            adjustHeat(1);
            if (gestureStatus) gestureStatus.textContent = "👍 THUMBS UP — POWERING UP";
            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;
        }

        if (gesture === "thumbsDown") {
            adjustHeat(-1);
            if (gestureStatus) gestureStatus.textContent = "👎 THUMBS DOWN — POWERING DOWN";
            lastX = x; lastY = y;
            drawToast(ctx, width, height);
            return;
        }

        if (gesture === "open") {

            if (lastX !== null && lastY !== null) {

                const dxMove = x - lastX, dyMove = y - lastY;
                const deadZone = 0.003;

                if (Math.abs(dxMove) > deadZone || Math.abs(dyMove) > deadZone) {

                    const stepY = dxMove * ROTATION_SENSITIVITY;
                    const stepX = dyMove * ROTATION_SENSITIVITY;

                    targetRotationY += stepY;
                    targetRotationX += stepX;
                    targetRotationX = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetRotationX));

                    velocityY = stepY;
                    velocityX = stepX;

                } else {
                    velocityX *= 0.5;
                    velocityY *= 0.5;
                }

            }

            if (gestureStatus) gestureStatus.textContent = "✋ TRACKING LOCKED — ROTATIONAL CONTROL";

        }

        lastX = x; lastY = y;
        drawToast(ctx, width, height);

    }


    /* =====================================================
       START
       ===================================================== */

    createPanel();

})();