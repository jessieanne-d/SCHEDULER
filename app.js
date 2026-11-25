// ==========================================
// 🔊 USER-TRIGGERED SOUND EFFECTS & MARIO BGM
// ==========================================
let audioCtx = null;
let soundEnabled = false;
let marioBgmTimer = null;
let marioBgmIndex = 0;

// Tuloy-tuloy na Super Mario Overworld melody loop
const MARIO_BGM_MELODY = [
    [659.25, 0.12], [659.25, 0.12], [0, 0.12], [659.25, 0.12], [0, 0.12], [523.25, 0.12], [659.25, 0.18],
    [783.99, 0.24], [0, 0.24], [392.00, 0.24], [0, 0.24],
    [523.25, 0.18], [0, 0.12], [392.00, 0.18], [0, 0.12], [329.63, 0.18],
    [0, 0.12], [440.00, 0.14], [0, 0.08], [493.88, 0.14], [0, 0.08], [466.16, 0.12], [440.00, 0.18],
    [392.00, 0.15], [659.25, 0.15], [783.99, 0.15], [880.00, 0.18], [0, 0.08], [698.46, 0.12], [783.99, 0.14],
    [0, 0.10], [659.25, 0.15], [0, 0.08], [523.25, 0.12], [587.33, 0.12], [493.88, 0.18], [0, 0.20]
];

function unlockAudio() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function startMarioContinuousBGM() {
    if (marioBgmTimer || !soundEnabled) return;
    unlockAudio();

    const stepNote = () => {
        if (!soundEnabled) {
            stopMarioContinuousBGM();
            return;
        }
        const [freq, dur] = MARIO_BGM_MELODY[marioBgmIndex % MARIO_BGM_MELODY.length];
        if (freq > 0) {
            playTone(freq, dur, "square", 0.04, 0);
        }
        marioBgmIndex++;
        marioBgmTimer = setTimeout(stepNote, Math.max(110, dur * 1000));
    };

    stepNote();
}

function stopMarioContinuousBGM() {
    if (marioBgmTimer) {
        clearTimeout(marioBgmTimer);
        marioBgmTimer = null;
    }
}

window.addEventListener("pointerdown", () => {
    if (soundEnabled && !marioBgmTimer) {
        startMarioContinuousBGM();
    }
});

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        unlockAudio();
        playCoinSFX();
        startMarioContinuousBGM();
    } else {
        stopMarioContinuousBGM();
    }
    syncSoundButtons();
}

function syncSoundButtons() {
    const label = soundEnabled ? "🔊 SOUND: ON" : "🔇 SOUND: OFF";
    ["login-sound-btn", "sound-toggle-btn"].forEach((id) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.textContent = label;
        btn.classList.toggle("btn-yellow", soundEnabled);
    });
}

function playTone(freq, duration = 0.09, type = "square", volume = 0.06, delay = 0) {
    if (!soundEnabled || !freq || freq <= 0) return;
    unlockAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
}

function playCoinSFX() {
    playTone(987.77, 0.07, "square", 0.07, 0);
    playTone(1318.51, 0.18, "square", 0.07, 0.065);
}

function playJumpSFX() {
    playTone(240, 0.08, "square", 0.06, 0);
    playTone(480, 0.1, "square", 0.06, 0.05);
}

function playPowerUpSFX() {
    [330, 392, 523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
        playTone(n, 0.08, "square", 0.065, i * 0.055);
    });
}

function playStageClearSFX() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((n, i) => {
        const delays = [0, 0.1, 0.2, 0.3, 0.44, 0.58];
        playTone(n, 0.16, "square", 0.075, delays[i]);
    });
}

// ==========================================
// 🗺️ 8 STAGES & SCHEDULING ALGORITHMS
// ==========================================
const STAGES = [
    {
        id: "fcfs",
        number: "1-1",
        shortName: "FCFS",
        name: "First-Come, First-Served (FCFS)",
        stageName: "Mushroom Kingdom Stage",
        mode: "Non-Preemptive",
        accent: "#ef4444",
        badge: "🍄",
        description: "Executes processes strictly in order of Arrival Time (AT)."
    },
    {
        id: "sjf",
        number: "1-2",
        shortName: "SJF",
        name: "Shortest Job First (SJF)",
        stageName: "Yoshi's Island Stage",
        mode: "Non-Preemptive",
        accent: "#16a34a",
        badge: "🦖",
        description: "Picks the available process with the shortest Burst Time (BT) and finishes it."
    },
    {
        id: "srtf",
        number: "1-3",
        shortName: "SRTF",
        name: "Shortest Remaining Time First (SRTF)",
        stageName: "Underground Stage",
        mode: "Preemptive",
        accent: "#2563eb",
        badge: "🧱",
        description: "Preemptive SJF: switches immediately if an arriving process has less remaining time."
    },
    {
        id: "npp",
        number: "2-1",
        shortName: "Priority (NP)",
        name: "Priority Scheduling (Non-Preemptive)",
        stageName: "Bowser's Castle",
        mode: "Non-Preemptive",
        accent: "#7c3aed",
        badge: "🏰",
        description: "Runs the highest-priority ready process (lowest priority number) to completion."
    },
    {
        id: "pp",
        number: "2-2",
        shortName: "Priority (P)",
        name: "Priority Scheduling (Preemptive)",
        stageName: "Lava World",
        mode: "Preemptive",
        accent: "#ea580c",
        badge: "🌋",
        description: "Preempts the active process whenever a higher-priority process arrives."
    },
    {
        id: "rr",
        number: "3-1",
        shortName: "Round Robin",
        name: "Round Robin (RR)",
        stageName: "Rainbow Road",
        mode: "Preemptive",
        accent: "#db2777",
        badge: "🌈",
        description: "Cycles through ready processes using a fixed Time Quantum."
    },
    {
        id: "mlq",
        number: "4-1",
        shortName: "MLQ",
        name: "Multilevel Queue (MLQ)",
        stageName: "World Map Stage",
        mode: "Fixed Queues",
        accent: "#0891b2",
        badge: "🗺️",
        description: "Processes stay in their assigned queue; each queue follows its own policy and configured priority."
    },
    {
        id: "mlfq",
        number: "STAR",
        shortName: "MLFQ",
        name: "Multilevel Feedback Queue (MLFQ)",
        stageName: "Special Challenge Stage",
        mode: "Adaptive Feedback",
        accent: "#ca8a04",
        badge: "⭐",
        description: "Processes begin in their selected queue and follow its scheduling policy, quantum, and demotion rule."
    }
];

const BLOCK_COLORS = ["#e11d48", "#16a34a", "#2563eb", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4f46e5"];

const SAMPLE_SETS = [
    [
        { id: "P1", at: 0, bt: 6, priority: 3, queue: 1 },
        { id: "P2", at: 2, bt: 4, priority: 1, queue: 1 },
        { id: "P3", at: 4, bt: 2, priority: 2, queue: 2 },
        { id: "P4", at: 5, bt: 5, priority: 4, queue: 2 }
    ],
    [
        { id: "P1", at: 3, bt: 3, priority: 2, queue: 1 },
        { id: "P2", at: 5, bt: 2, priority: 1, queue: 2 },
        { id: "P3", at: 14, bt: 4, priority: 3, queue: 1 }
    ]
];

let currentPlayer = "Mario";
let selectedAlgoId = "fcfs";
let processes = [
    { id: "P1", at: 0, bt: 5, priority: 2, queue: 1 },
    { id: "P2", at: 1, bt: 3, priority: 1, queue: 1 },
    { id: "P3", at: 2, bt: 4, priority: 3, queue: 2 },
    { id: "P4", at: 4, bt: 2, priority: 2, queue: 2 }
];
let sampleIndex = 0;
let lastComputedResult = null;
let championshipOpen = false;
let warpTimer = null;
let mlfqQueueCount = 3;
const MLFQ_CONFIG = [
    { policy: "rr", quantum: 2, demotion: "quantum" },
    { policy: "rr", quantum: 4, demotion: "quantum" },
    { policy: "fcfs", quantum: 8, demotion: "quantum" }
];
let mlqQueueCount = 2;
const MLQ_CONFIG = {
    priorityRule: "lower",
    preemptLower: true,
    queues: [
        { policy: "rr", priority: 1 },
        { policy: "fcfs", priority: 2 }
    ]
};

window.addEventListener("DOMContentLoaded", () => {
    renderStageSelector();
    renderProcessTable();
    syncParamBoxes();
    syncStageInfo();
    const initial = runAlgorithm(selectedAlgoId, processes);
    lastComputedResult = initial;
    updateDashboardStats(initial);
});

function handleLogin(event) {
    event.preventDefault();
    const userInput = document.getElementById("login-username").value.trim();
    const passInput = document.getElementById("login-password").value.trim();
    const errEl = document.getElementById("login-error");

    if (!userInput || !passInput) {
        errEl.textContent = "Please enter both Player Username and Stage Passcode.";
        errEl.classList.remove("hidden");
        return;
    }

    errEl.classList.add("hidden");
    currentPlayer = userInput;
    playPowerUpSFX();

    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("simulator-screen").classList.remove("hidden");
    document.getElementById("welcome-heading").textContent = `WELCOME BACK, ${currentPlayer.toUpperCase()}!`;

    const res = runAlgorithm(selectedAlgoId, processes);
    lastComputedResult = res;
    updateDashboardStats(res);
    renderResults(res, false);
}

function handleLogout() {
    playJumpSFX();
    document.getElementById("simulator-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
}

function getStageById(id) {
    return STAGES.find((s) => s.id === id) || STAGES[0];
}

function renderStageSelector() {
    const grid = document.getElementById("stages-grid");
    const select = document.getElementById("algorithm-select");
    grid.innerHTML = "";
    select.innerHTML = "";

    STAGES.forEach((stage) => {
        const isActive = stage.id === selectedAlgoId;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `stage-card ${isActive ? "active-stage" : ""}`;
        btn.onclick = () => {
            playJumpSFX();
            selectStage(stage.id);
        };
        btn.innerHTML = `
            <div class="stage-banner" style="background-color: ${stage.accent};">
                <span>WORLD ${stage.number}</span>
                <span>${stage.badge}</span>
            </div>
            <div class="stage-title">${stage.shortName}</div>
            <div class="stage-sub">${stage.stageName} • ${stage.mode}</div>
        `;
        grid.appendChild(btn);

        const opt = document.createElement("option");
        opt.value = stage.id;
        opt.selected = isActive;
        opt.textContent = `${stage.name} (${stage.stageName})`;
        select.appendChild(opt);
    });
}

function syncStageInfo() {
    const stage = getStageById(selectedAlgoId);
    document.getElementById("hud-player-info").textContent =
        `PLAYER: ${currentPlayer.toUpperCase()} • WORLD ${stage.number} (${stage.stageName})`;
    document.getElementById("calc-stage-tag").textContent = `WORLD ${stage.number}`;
    document.getElementById("calc-stage-title").textContent = `${stage.name} — ${stage.stageName}`;
    document.getElementById("stage-description").textContent = stage.description;
}

function syncParamBoxes() {
    const mlqUsesRoundRobin = selectedAlgoId === "mlq" && MLQ_CONFIG.queues.slice(0, mlqQueueCount).some((queue) => queue.policy === "rr");
    document.getElementById("param-rr-box").classList.toggle("hidden", selectedAlgoId !== "rr" && !mlqUsesRoundRobin);
    document.getElementById("rr-quantum-label").textContent = selectedAlgoId === "mlq" ? "ROUND ROBIN QUANTUM (MLQ)" : "ROUND ROBIN TIME QUANTUM";
    document.getElementById("mlq-config").classList.toggle("hidden", selectedAlgoId !== "mlq");
    document.getElementById("mlfq-config").classList.toggle("hidden", selectedAlgoId !== "mlfq");
    document.getElementById("mlfq-queue-count").value = String(mlfqQueueCount);
    document.getElementById("mlq-queue-count").value = String(mlqQueueCount);
    document.getElementById("mlq-priority-rule").value = MLQ_CONFIG.priorityRule;
    document.getElementById("mlq-preempt-lower").value = String(MLQ_CONFIG.preemptLower);
    renderMlfqQueueControls();
    renderMlqQueueControls();
}

function getQueuePriorityLabel(queueNumber, count = mlfqQueueCount) {
    if (queueNumber === 1) return "Highest priority";
    if (queueNumber === count) return "Lowest priority";
    const labels = {
        3: ["Medium priority"],
        4: ["High priority", "Low priority"],
        5: ["High priority", "Medium priority", "Low priority"],
        6: ["High priority", "Medium-high priority", "Medium-low priority", "Low priority"],
        7: ["High priority", "Medium-high priority", "Medium priority", "Medium-low priority", "Low priority"],
        8: ["High priority", "Medium-high priority", "Medium priority", "Medium-low priority", "Low priority", "Very low priority"]
    };
    return (labels[count] || [])[queueNumber - 2] || "Intermediate priority";
}

function ensureMlfqQueueConfig(count) {
    while (MLFQ_CONFIG.length < count) {
        const index = MLFQ_CONFIG.length;
        MLFQ_CONFIG.push({ policy: "rr", quantum: (index + 1) * 2, demotion: "quantum" });
    }
}

const QUEUE_POLICY_OPTIONS = [
    ["fcfs", "FCFS · First Come, First Served"],
    ["sjf", "SJF · Shortest Job First"],
    ["npp", "NPP · Non-preemptive Priority"],
    ["srtf", "SRTF · Shortest Remaining Time"],
    ["pp", "PP · Preemptive Priority"],
    ["rr", "RR · Round Robin"]
];

function ensureMlqQueueConfig(count) {
    while (MLQ_CONFIG.queues.length < count) {
        const index = MLQ_CONFIG.queues.length;
        MLQ_CONFIG.queues.push({ policy: "fcfs", priority: index + 1 });
    }
}

function renderMlqQueueControls() {
    ensureMlqQueueConfig(mlqQueueCount);
    const grid = document.getElementById("mlq-config-grid");
    if (!grid) return;
    grid.innerHTML = "";
    MLQ_CONFIG.queues.slice(0, mlqQueueCount).forEach((config, index) => {
        const queueNumber = index + 1;
        const card = document.createElement("fieldset");
        card.className = "mlfq-config-card";
        card.innerHTML = `
            <legend>Queue ${queueNumber}</legend>
            <label for="mlq-q${queueNumber}-policy">Scheduling policy</label>
            <select id="mlq-q${queueNumber}-policy" onchange="updateMlqQueue(${queueNumber}, 'policy', this.value)">${QUEUE_POLICY_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select>
            <label for="mlq-q${queueNumber}-priority">Queue priority</label>
            <input id="mlq-q${queueNumber}-priority" type="number" min="1" step="1" value="${config.priority}" onchange="updateMlqQueue(${queueNumber}, 'priority', this.value)">
        `;
        card.querySelector(`#mlq-q${queueNumber}-policy`).value = config.policy;
        grid.appendChild(card);
    });
}

function updateMlqQueue(queueNumber, field, value) {
    const config = MLQ_CONFIG.queues[queueNumber - 1];
    if (!config) return;
    if (field === "policy" && QUEUE_POLICY_OPTIONS.some(([policy]) => policy === value)) config.policy = value;
    if (field === "priority") config.priority = Math.max(1, Math.floor(Number(value) || queueNumber));
    renderMlqQueueControls();
    syncParamBoxes();
    renderProcessTable();
    recomputeIfVisible();
}

function updateMlqSettings(field, value) {
    if (field === "priorityRule" && ["lower", "higher"].includes(value)) MLQ_CONFIG.priorityRule = value;
    if (field === "preemptLower") MLQ_CONFIG.preemptLower = Boolean(value);
    recomputeIfVisible();
}

function setMlqQueueCount(value) {
    mlqQueueCount = Math.max(1, Math.min(8, Math.floor(Number(value) || 1)));
    ensureMlqQueueConfig(mlqQueueCount);
    const reassigned = processes.filter((p) => p.queue > mlqQueueCount);
    reassigned.forEach((p) => { p.queue = mlqQueueCount; });
    document.getElementById("mlq-queue-notice").textContent = reassigned.length
        ? `${reassigned.map((p) => p.id).join(", ")} ${reassigned.length === 1 ? "was" : "were"} reassigned to Queue ${mlqQueueCount}.`
        : "";
    renderMlqQueueControls();
    syncParamBoxes();
    renderProcessTable();
    recomputeIfVisible();
}

function processPriorityIsRequired(algoId = selectedAlgoId) {
    if (algoId === "npp" || algoId === "pp") return true;
    if (algoId === "mlq") return true;
    if (algoId === "mlfq") return MLFQ_CONFIG.slice(0, mlfqQueueCount).some((q) => q.policy === "npp" || q.policy === "pp");
    return false;
}

function renderMlfqQueueControls() {
    ensureMlfqQueueConfig(mlfqQueueCount);
    const grid = document.getElementById("mlfq-config-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (let queueNumber = 1; queueNumber <= mlfqQueueCount; queueNumber++) {
        const config = MLFQ_CONFIG[queueNumber - 1];
        const isLast = queueNumber === mlfqQueueCount;
        const card = document.createElement("fieldset");
        card.className = "mlfq-config-card";
        card.innerHTML = `
            <legend>Queue ${queueNumber} · ${getQueuePriorityLabel(queueNumber)}</legend>
            <label for="mlfq-q${queueNumber}-policy">Scheduling policy</label>
            <select id="mlfq-q${queueNumber}-policy" onchange="updateMlfqConfig(${queueNumber}, 'policy', this.value)">${QUEUE_POLICY_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select>
            <label for="mlfq-q${queueNumber}-quantum">Time quantum / demotion duration</label>
            <input id="mlfq-q${queueNumber}-quantum" type="number" min="1" step="1" value="${config.quantum}" onchange="updateMlfqConfig(${queueNumber}, 'quantum', this.value)">
            <label for="mlfq-q${queueNumber}-demotion">Demotion rule</label>
            <select id="mlfq-q${queueNumber}-demotion" ${isLast ? "disabled" : `onchange="updateMlfqConfig(${queueNumber}, 'demotion', this.value)"`}>
                ${isLast ? `<option value="none" selected>No automatic demotion</option>` : `<option value="quantum" ${config.demotion === "quantum" ? "selected" : ""}>After a full quantum</option><option value="duration" ${config.demotion === "duration" ? "selected" : ""}>After the configured duration</option><option value="none" ${config.demotion === "none" ? "selected" : ""}>No automatic demotion</option>`}
            </select>
        `;
        card.querySelector(`#mlfq-q${queueNumber}-policy`).value = config.policy;
        const quantumInput = card.querySelector(`#mlfq-q${queueNumber}-quantum`);
        quantumInput.disabled = config.policy !== "rr" && config.demotion === "none";
        grid.appendChild(card);
    }
}

function setMlfqQueueCount(value) {
    const nextCount = Math.max(2, Math.min(8, Math.floor(Number(value) || 3)));
    const previousCount = mlfqQueueCount;
    if (nextCount > previousCount) ensureMlfqQueueConfig(nextCount);
    mlfqQueueCount = nextCount;
    const reassigned = processes.filter((p) => p.queue > nextCount);
    reassigned.forEach((p) => { p.queue = nextCount; });
    const notice = document.getElementById("mlfq-queue-notice");
    notice.textContent = reassigned.length
        ? `${reassigned.map((p) => p.id).join(", ")} ${reassigned.length === 1 ? "was" : "were"} reassigned to Queue ${nextCount}, the new lowest queue.`
        : "";
    renderMlfqQueueControls();
    renderProcessTable();
    recomputeIfVisible();
}

function updateMlfqConfig(queueNumber, field, value) {
    const config = MLFQ_CONFIG[queueNumber - 1];
    if (!config) return;
    if (field === "quantum") config.quantum = Math.max(1, Math.floor(Number(value) || 1));
    else if (field === "policy" && QUEUE_POLICY_OPTIONS.some(([policy]) => policy === value)) config.policy = value;
    else if (field === "demotion" && ["quantum", "duration", "none"].includes(value)) config.demotion = value;
    renderMlfqQueueControls();
    renderProcessTable();
    recomputeIfVisible();
}

function selectStage(algoId) {
    selectedAlgoId = algoId;
    renderStageSelector();
    syncStageInfo();
    syncParamBoxes();
    renderProcessTable();

    const res = runAlgorithm(selectedAlgoId, processes);
    lastComputedResult = res;
    updateDashboardStats(res);
    if (!document.getElementById("results-panel").classList.contains("hidden")) {
        renderResults(res, false);
    }
    if (championshipOpen) {
        renderChampionship();
    }
}

function renderProcessTable() {
    const tbody = document.getElementById("process-tbody");
    tbody.innerHTML = "";
    const header = document.getElementById("process-table-header");
    header.innerHTML = "";
    const showQueue = selectedAlgoId === "mlq" || selectedAlgoId === "mlfq";
    const showPriority = processPriorityIsRequired();
    const columns = [{ key: "id", label: "PROCESS" }, { key: "at", label: "ARRIVAL TIME (AT)" }, { key: "bt", label: "BURST TIME (BT)" }];
    if (showQueue) columns.push({ key: "queue", label: "QUEUE / QLEVEL" });
    if (showPriority) columns.push({ key: "priority", label: "PROCESS PRIORITY (1=HIGH)" });
    columns.push({ key: "remove", label: "REMOVE" });
    columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column.label;
        header.appendChild(th);
    });

    processes.forEach((p, idx) => {
        const tr = document.createElement("tr");
        columns.forEach(({ key }) => {
            const td = document.createElement("td");
            if (key === "id") {
                const strong = document.createElement("strong");
                strong.textContent = p.id;
                td.appendChild(strong);
            } else if (key === "at" || key === "bt" || key === "priority") {
                const input = document.createElement("input");
                input.type = "number";
                input.min = key === "at" ? "0" : "1";
                input.value = String(p[key]);
                input.style.width = "86px";
                input.setAttribute("aria-label", `${p.id} ${key === "at" ? "arrival time" : key === "bt" ? "burst time" : "priority"}`);
                input.onchange = () => updateProcField(idx, key, input.value);
                td.appendChild(input);
            } else if (key === "queue") {
                const select = document.createElement("select");
                select.style.width = "112px";
                select.setAttribute("aria-label", `${p.id} queue assignment`);
                const count = selectedAlgoId === "mlq" ? mlqQueueCount : mlfqQueueCount;
                for (let queue = 1; queue <= count; queue++) {
                    const option = document.createElement("option");
                    option.value = String(queue);
                    option.textContent = `Queue ${queue}`;
                    option.selected = p.queue === queue;
                    select.appendChild(option);
                }
                select.onchange = () => updateProcField(idx, "queue", select.value);
                td.appendChild(select);
            } else if (key === "remove") {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn btn-red";
                button.textContent = "✖";
                button.disabled = processes.length <= 1;
                button.onclick = () => removeProcessRow(idx);
                td.appendChild(button);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const coinText = String(processes.length);
    document.getElementById("hud-coin-count").textContent = coinText;
    document.getElementById("dash-coins").textContent = coinText;
}

function updateProcField(idx, field, val) {
    const n = Number(val);
    if (!processes[idx]) return;
    if (field === "at") processes[idx].at = Math.max(0, isNaN(n) ? 0 : n);
    if (field === "bt") processes[idx].bt = Math.max(1, isNaN(n) ? 1 : n);
    if (field === "priority") processes[idx].priority = Math.max(1, isNaN(n) ? 1 : n);
    if (field === "queue") processes[idx].queue = Math.max(1, Math.min(selectedAlgoId === "mlfq" ? mlfqQueueCount : 2, n || 1));
    recomputeIfVisible();
}

function addProcessRow() {
    playCoinSFX();
    processes.push({
        id: `P${processes.length + 1}`,
        at: 0,
        bt: 3,
        priority: 1,
        queue: 1
    });
    renderProcessTable();
    recomputeIfVisible();
}

function removeProcessRow(idx) {
    if (processes.length <= 1) return;
    playJumpSFX();
    processes = processes
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, id: `P${i + 1}` }));
    renderProcessTable();
    recomputeIfVisible();
}

function generateSampleData() {
    playPowerUpSFX();
    const preset = SAMPLE_SETS[sampleIndex % SAMPLE_SETS.length];
    sampleIndex++;
    processes = preset.map((p) => ({ ...p }));
    renderProcessTable();
    recomputeIfVisible();
}

function clearAllProcesses() {
    playJumpSFX();
    processes = [{ id: "P1", at: 0, bt: 4, priority: 1, queue: 1 }];
    renderProcessTable();
    document.getElementById("results-panel").classList.add("hidden");
    championshipOpen = false;
    document.getElementById("championship-panel").classList.add("hidden");
    const res = runAlgorithm(selectedAlgoId, processes);
    lastComputedResult = res;
    updateDashboardStats(res);
}

function recomputeIfVisible() {
    const res = runAlgorithm(selectedAlgoId, processes);
    lastComputedResult = res;
    updateDashboardStats(res);
    if (!document.getElementById("results-panel").classList.contains("hidden")) {
        renderResults(res, false);
    }
    if (championshipOpen) {
        renderChampionship();
    }
}

function calculateWithTransition() {
    if (warpTimer) clearTimeout(warpTimer);
    playJumpSFX();
    const stage = getStageById(selectedAlgoId);
    const banner = document.getElementById("warp-banner");
    banner.textContent = `🟢 WARPING THROUGH ${stage.stageName.toUpperCase()}...`;
    banner.classList.remove("hidden");

    warpTimer = setTimeout(() => {
        banner.classList.add("hidden");
        const res = runAlgorithm(selectedAlgoId, processes);
        lastComputedResult = res;
        updateDashboardStats(res);
        renderResults(res, true);
        playStageClearSFX();
    }, 340);
}

function updateDashboardStats(res) {
    document.getElementById("dash-coins").textContent = String(processes.length);
    document.getElementById("dash-wt").textContent = res.avgWt.toFixed(2);
    document.getElementById("dash-tat").textContent = res.avgTat.toFixed(2);
    document.getElementById("dash-util").textContent = `${res.cpuUtilization.toFixed(1)}%`;
}

function appendSegment(segments, seg) {
    if (seg.end <= seg.start) return;
    // Every scheduling event stays as its own interval, including adjacent slices
    // of the same process at a quantum or policy boundary.
    segments.push({ ...seg, duration: Number((seg.end - seg.start).toFixed(4)) });
}

function normalizeProcs(algoId = selectedAlgoId) {
    return processes.map((p, idx) => ({
        id: p.id || `P${idx + 1}`,
        order: idx,
        at: Math.max(0, Number(p.at) || 0),
        bt: Math.max(1, Number(p.bt) || 1),
        priority: Math.max(1, Number(p.priority) || 1),
        queue: Math.max(1, Math.min(algoId === "mlfq" ? mlfqQueueCount : algoId === "mlq" ? mlqQueueCount : 8, Number(p.queue) || 1)),
        color: BLOCK_COLORS[idx % BLOCK_COLORS.length]
    }));
}

function finalizeSim(procs, segments) {
    const totalTime = segments.length ? segments[segments.length - 1].end : 0;
    const totalBurst = procs.reduce((s, p) => s + p.bt, 0);
    const totalTat = procs.reduce((s, p) => s + p.tat, 0);
    const totalWt = procs.reduce((s, p) => s + p.wt, 0);
    const totalRt = procs.reduce((s, p) => s + p.rt, 0);
    const n = Math.max(1, procs.length);

    const enriched = segments.map((seg, idx, arr) => {
        const prev = idx > 0 ? arr[idx - 1] : null;
        const preemptedAfterPrev = Boolean(
            prev &&
            prev.type === "process" &&
            seg.type === "process" &&
            prev.processId !== seg.processId &&
            prev.remainingAfter > 0
        );
        return { ...seg, preemptedAfterPrev };
    });

    return {
        processes: [...procs].sort((a, b) => a.order - b.order),
        segments: enriched,
        totalTime,
        avgTat: totalTat / n,
        avgWt: totalWt / n,
        avgRt: totalRt / n,
        cpuUtilization: totalTime > 0 ? (totalBurst / totalTime) * 100 : 0,
        throughput: totalTime > 0 ? procs.length / totalTime : 0
    };
}

function runAlgorithm(algoId, rawProcs) {
    const base = normalizeProcs(rawProcs, algoId);
    const qRR = Math.max(1, Number(document.getElementById("rr-quantum")?.value) || 2);

    if (algoId === "fcfs") {
        const procs = base.map((p) => ({ ...p, startTime: null }));
        const order = [...procs].sort((a, b) => a.at - b.at || a.order - b.order);
        const segs = [];
        let t = 0;
        for (const p of order) {
            if (t < p.at) {
                appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: p.at, remainingAfter: 0, queueTag: "" });
                t = p.at;
            }
            p.startTime = t;
            p.rt = p.startTime - p.at;
            const end = t + p.bt;
            appendSegment(segs, { type: "process", processId: p.id, label: p.id, start: t, end, color: p.color, remainingAfter: 0, queueTag: "" });
            t = end;
            p.ct = t;
            p.tat = p.ct - p.at;
            p.wt = p.tat - p.bt;
        }
        return finalizeSim(procs, segs);
    }

    if (algoId === "sjf" || algoId === "npp") {
        const usePrio = algoId === "npp";
        const procs = base.map((p) => ({ ...p, done: false, startTime: null }));
        const segs = [];
        let t = 0, doneCount = 0;
        while (doneCount < procs.length) {
            const ready = procs.filter((p) => !p.done && p.at <= t);
            if (!ready.length) {
                const nextAt = Math.min(...procs.filter((p) => !p.done).map((p) => p.at));
                appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: nextAt, remainingAfter: 0, queueTag: "" });
                t = nextAt;
                continue;
            }
            ready.sort((a, b) => usePrio ? (a.priority - b.priority || a.at - b.at || a.order - b.order) : (a.bt - b.bt || a.at - b.at || a.order - b.order));
            const cur = ready[0];
            cur.startTime = t;
            cur.rt = cur.startTime - cur.at;
            const end = t + cur.bt;
            appendSegment(segs, { type: "process", processId: cur.id, label: cur.id, start: t, end, color: cur.color, remainingAfter: 0, queueTag: usePrio ? `P${cur.priority}` : "" });
            t = end;
            cur.ct = t;
            cur.tat = cur.ct - cur.at;
            cur.wt = cur.tat - cur.bt;
            cur.done = true;
            doneCount++;
        }
        return finalizeSim(procs, segs);
    }

    if (algoId === "srtf" || algoId === "pp") {
        const usePrio = algoId === "pp";
        const procs = base.map((p) => ({ ...p, rem: p.bt, startTime: null }));
        const segs = [];
        let t = 0, doneCount = 0;
        while (doneCount < procs.length) {
            const ready = procs.filter((p) => p.rem > 0 && p.at <= t);
            if (!ready.length) {
                const nextAt = Math.min(...procs.filter((p) => p.rem > 0).map((p) => p.at));
                appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: nextAt, remainingAfter: 0, queueTag: "" });
                t = nextAt;
                continue;
            }
            ready.sort((a, b) => usePrio ? (a.priority - b.priority || a.at - b.at || a.order - b.order) : (a.rem - b.rem || a.at - b.at || a.order - b.order));
            const cur = ready[0];
            if (cur.startTime === null) { cur.startTime = t; cur.rt = cur.startTime - cur.at; }
            const nextArrival = Math.min(...procs.filter((p) => p.rem > 0 && p.at > t).map((p) => p.at), Infinity);
            const end = Math.min(t + cur.rem, nextArrival);
            const delta = end - t;
            cur.rem -= delta;
            t = end;
            appendSegment(segs, { type: "process", processId: cur.id, label: cur.id, start: end - delta, end, color: cur.color, remainingAfter: cur.rem, queueTag: usePrio ? `P${cur.priority}` : "" });
            if (cur.rem === 0) {
                cur.ct = t;
                cur.tat = cur.ct - cur.at;
                cur.wt = cur.tat - cur.bt;
                doneCount++;
            }
        }
        return finalizeSim(procs, segs);
    }

    if (algoId === "rr") {
        const procs = base.map((p) => ({ ...p, rem: p.bt, startTime: null }));
        const arrivals = [...procs].sort((a, b) => a.at - b.at || a.order - b.order);
        const queue = [], segs = [];
        let t = 0, arrIdx = 0, doneCount = 0;
        const enqueue = (now) => { while (arrIdx < arrivals.length && arrivals[arrIdx].at <= now) { queue.push(arrivals[arrIdx++]); } };
        while (doneCount < procs.length) {
            enqueue(t);
            if (!queue.length) {
                const nextAt = arrivals[arrIdx].at;
                appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: nextAt, remainingAfter: 0, queueTag: "" });
                t = nextAt;
                enqueue(t);
            }
            const cur = queue.shift();
            if (cur.startTime === null) { cur.startTime = t; cur.rt = cur.startTime - cur.at; }
            const delta = Math.min(qRR, cur.rem);
            const end = t + delta;
            cur.rem -= delta;
            t = end;
            appendSegment(segs, { type: "process", processId: cur.id, label: cur.id, start: end - delta, end, color: cur.color, remainingAfter: cur.rem, queueTag: `Q=${qRR}` });
            enqueue(t);
            if (cur.rem > 0) queue.push(cur);
            else { cur.ct = t; cur.tat = cur.ct - cur.at; cur.wt = cur.tat - cur.bt; doneCount++; }
        }
        return finalizeSim(procs, segs);
    }

    if (algoId === "mlq") {
        ensureMlqQueueConfig(mlqQueueCount);
        const procs = base.map((p) => ({ ...p, rem: p.bt, startTime: null, queueUsed: 0 }));
        const arrivals = [...procs].sort((a, b) => a.at - b.at || a.order - b.order);
        const queues = Array.from({ length: mlqQueueCount }, () => []);
        const segs = [];
        const queueOrder = Array.from({ length: mlqQueueCount }, (_, level) => level).sort((a, b) => {
            const pa = MLQ_CONFIG.queues[a].priority, pb = MLQ_CONFIG.queues[b].priority;
            const priorityDelta = MLQ_CONFIG.priorityRule === "lower" ? pa - pb : pb - pa;
            return priorityDelta || a - b;
        });
        const rank = Array(mlqQueueCount);
        queueOrder.forEach((level, position) => { rank[level] = position; });
        let t = 0, arrIdx = 0, doneCount = 0;
        const enqueue = (now) => {
            while (arrIdx < arrivals.length && arrivals[arrIdx].at <= now) {
                const process = arrivals[arrIdx++];
                queues[process.queue - 1].push(process);
            }
        };
        const finish = (process) => {
            process.ct = t;
            process.tat = process.ct - process.at;
            process.wt = process.tat - process.bt;
            doneCount++;
        };
        while (doneCount < procs.length) {
            enqueue(t);
            const level = queueOrder.find((queueLevel) => queues[queueLevel].length > 0);
            if (level === undefined) {
                const nextAt = arrivals[arrIdx].at;
                appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: nextAt, remainingAfter: 0, queueTag: "" });
                t = nextAt;
                continue;
            }
            const config = MLQ_CONFIG.queues[level];
            const queue = queues[level];
            const processPriorityDelta = (a, b) => MLQ_CONFIG.priorityRule === "lower"
                ? a.priority - b.priority
                : b.priority - a.priority;
            const compare = {
                sjf: (a, b) => a.bt - b.bt || a.at - b.at || a.order - b.order,
                srtf: (a, b) => a.rem - b.rem || a.at - b.at || a.order - b.order,
                npp: (a, b) => processPriorityDelta(a, b) || a.at - b.at || a.order - b.order,
                pp: (a, b) => processPriorityDelta(a, b) || a.at - b.at || a.order - b.order
            }[config.policy];
            if (compare) queue.sort(compare);
            const cur = queue.shift();
            if (cur.startTime === null) { cur.startTime = t; cur.rt = t - cur.at; }

            const rrRemaining = config.policy === "rr" ? Math.max(0, qRR - cur.queueUsed) : Infinity;
            let runFor = Math.min(cur.rem, rrRemaining);
            const higherQueueArrival = MLQ_CONFIG.preemptLower
                ? Math.min(...arrivals.slice(arrIdx).filter((p) => rank[p.queue - 1] < rank[level]).map((p) => p.at), Infinity)
                : Infinity;
            if (Number.isFinite(higherQueueArrival)) runFor = Math.min(runFor, Math.max(0, higherQueueArrival - t));
            const sameQueuePreemptive = config.policy === "srtf" || config.policy === "pp";
            const sameQueueArrival = sameQueuePreemptive
                ? Math.min(...arrivals.slice(arrIdx).filter((p) => p.queue - 1 === level).map((p) => p.at), Infinity)
                : Infinity;
            if (Number.isFinite(sameQueueArrival)) runFor = Math.min(runFor, Math.max(0, sameQueueArrival - t));
            if (runFor <= 0) { enqueue(t); queue.unshift(cur); continue; }

            const start = t;
            cur.rem -= runFor;
            if (config.policy === "rr") cur.queueUsed += runFor;
            t += runFor;
            const quantumExpired = config.policy === "rr" && cur.queueUsed + 1e-9 >= qRR;
            const sameQueueBoundary = sameQueuePreemptive && Math.abs(t - sameQueueArrival) < 1e-9;
            appendSegment(segs, { type: "process", processId: cur.id, label: cur.id, start, end: t, color: cur.color, remainingAfter: cur.rem, queueTag: `Q${level + 1}-${config.policy.toUpperCase()}` });
            enqueue(t);

            if (cur.rem <= 0) finish(cur);
            else if (quantumExpired) { cur.queueUsed = 0; queue.push(cur); }
            else if (sameQueueBoundary) queue.push(cur);
            else queue.unshift(cur);
        }
        return finalizeSim(procs, segs);
    }

    // MLFQ: each process enters its selected queue and follows that queue's policy.
    const procs = base.map((p) => ({ ...p, rem: p.bt, startTime: null, level: p.queue - 1, queueUsed: 0 }));
    const arrivals = [...procs].sort((a, b) => a.at - b.at || a.order - b.order);
    ensureMlfqQueueConfig(mlfqQueueCount);
    const queues = Array.from({ length: mlfqQueueCount }, () => []);
    const segs = [];
    let t = 0, arrIdx = 0, doneCount = 0;
    const enqueueArrivals = (now) => {
        while (arrIdx < arrivals.length && arrivals[arrIdx].at <= now) {
            const p = arrivals[arrIdx++];
            queues[p.level].push(p);
        }
    };
    const finish = (p) => {
        p.ct = t;
        p.tat = p.ct - p.at;
        p.wt = p.tat - p.bt;
        doneCount++;
    };
    while (doneCount < procs.length) {
        enqueueArrivals(t);
        const level = queues.findIndex((q) => q.length > 0);
        if (level < 0) {
            const nextAt = arrivals[arrIdx].at;
            appendSegment(segs, { type: "idle", processId: "IDLE", label: "IDLE", start: t, end: nextAt, remainingAfter: 0, queueTag: "" });
            t = nextAt;
            continue;
        }

        const config = MLFQ_CONFIG[level];
        const queue = queues[level];
        const compare = {
            sjf: (a, b) => a.bt - b.bt || a.at - b.at || a.order - b.order,
            srtf: (a, b) => a.rem - b.rem || a.at - b.at || a.order - b.order,
            npp: (a, b) => a.priority - b.priority || a.at - b.at || a.order - b.order,
            pp: (a, b) => a.priority - b.priority || a.at - b.at || a.order - b.order
        }[config.policy];
        if (compare) queue.sort(compare);
        const cur = queue.shift();
        if (cur.startTime === null) { cur.startTime = t; cur.rt = cur.startTime - cur.at; }

        const thresholdEnabled = config.demotion !== "none" && level < mlfqQueueCount - 1;
        const thresholdLeft = thresholdEnabled ? Math.max(0, config.quantum - cur.queueUsed) : Infinity;
        const rrLeft = config.policy === "rr" ? Math.max(0, config.quantum - cur.queueUsed) : Infinity;
        let runFor = Math.min(cur.rem, thresholdLeft, rrLeft);
        const higherArrival = Math.min(...arrivals.slice(arrIdx).filter((p) => p.level < level).map((p) => p.at), Infinity);
        if (Number.isFinite(higherArrival)) runFor = Math.min(runFor, Math.max(0, higherArrival - t));
        if (config.policy === "srtf" || config.policy === "pp") {
            const sameQueueArrival = Math.min(...arrivals.slice(arrIdx).filter((p) => p.level === level).map((p) => p.at), Infinity);
            if (Number.isFinite(sameQueueArrival)) runFor = Math.min(runFor, Math.max(0, sameQueueArrival - t));
        }
        // A zero-length boundary means an arrival is ready now; enqueue it before selecting again.
        if (runFor <= 0) { enqueueArrivals(t); queue.unshift(cur); continue; }

        const start = t;
        cur.rem -= runFor;
        cur.queueUsed += runFor;
        t += runFor;
        const quantumExpired = cur.queueUsed + 1e-9 >= config.quantum;
        appendSegment(segs, { type: "process", processId: cur.id, label: cur.id, start, end: t, color: cur.color, remainingAfter: cur.rem, queueTag: `Q${level + 1}-${config.policy.toUpperCase()}` });
        enqueueArrivals(t);

        if (cur.rem <= 0) {
            finish(cur);
        } else if (thresholdEnabled && quantumExpired) {
            cur.level++;
            cur.queueUsed = 0;
            queues[cur.level].push(cur);
        } else if (config.policy === "rr" && quantumExpired) {
            cur.queueUsed = 0;
            queue.push(cur);
        } else {
            // It was preempted by a higher queue or SRTF arrival; preserve its place and budget.
            queue.unshift(cur);
        }
    }
    return finalizeSim(procs, segs);
}

function renderResults(res, shouldScroll = true) {
    const stage = getStageById(selectedAlgoId);
    document.getElementById("results-panel").classList.remove("hidden");
    document.getElementById("results-heading").textContent = `GANTT CHART & PERFORMANCE STATS (${stage.shortName})`;
    document.getElementById("celebrate-banner").innerHTML =
        `🍄 STAGE CLEARED! All <strong>${res.processes.length}</strong> processes scheduled in <strong>${res.totalTime}</strong> time units.`;

    const track = document.getElementById("gantt-track");
    track.innerHTML = "";
    res.segments.forEach((seg, idx) => {
        const widthPx = Math.max(seg.duration * 44, 62);
        const div = document.createElement("div");
        div.className = `gantt-seg ${seg.type === "idle" ? "idle-seg" : ""}`;
        div.style.width = `${widthPx}px`;
        if (seg.type !== "idle") div.style.backgroundColor = seg.color;
        div.title = `${seg.label}: ${seg.start} → ${seg.end} (${seg.duration}u)`;

        div.innerHTML = `
            ${seg.preemptedAfterPrev ? `<span class="preempt-mark">PREEMPT</span>` : ""}
            <span>${seg.type === "idle" ? `IDLE (${seg.duration})` : seg.label}</span>
            ${seg.queueTag ? `<span style="font-size:0.66rem;opacity:0.92;">${seg.queueTag}</span>` : ""}
            ${idx === 0 ? `<span class="t-mark-start">${seg.start}</span>` : ""}
            <span class="t-mark-end">${seg.end}</span>
        `;
        track.appendChild(div);
    });

    renderMlfqTimelines(res);

    const flag = document.createElement("div");
    flag.className = "flag-pole";
    flag.innerHTML = `🚩<span>GOAL</span>`;
    track.appendChild(flag);

    document.getElementById("res-avg-tat").textContent = res.avgTat.toFixed(2);
    document.getElementById("res-avg-wt").textContent = res.avgWt.toFixed(2);
    document.getElementById("res-avg-rt").textContent = res.avgRt.toFixed(2);
    document.getElementById("res-util-tp").textContent =
        `${res.cpuUtilization.toFixed(1)}% • ${res.throughput.toFixed(2)}/t`;

    const tbody = document.getElementById("metrics-tbody");
    tbody.innerHTML = "";
    res.processes.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.at}</td>
            <td>${p.bt}</td>
            <td><strong>${p.ct}</strong></td>
            <td>${p.tat}</td>
            <td>${p.wt}</td>
            <td>${p.rt}</td>
        `;
        tbody.appendChild(tr);
    });

    if (shouldScroll) {
        document.getElementById("results-panel").scrollIntoView({ behavior: "smooth" });
    }
}

function renderMlfqTimelines(res) {
    const section = document.getElementById("mlfq-timelines");
    const rows = document.getElementById("mlfq-timeline-rows");
    if (!section || !rows) return;
    rows.innerHTML = "";
    section.classList.toggle("hidden", selectedAlgoId !== "mlfq");
    if (selectedAlgoId !== "mlfq") return;

    const queueNumber = (seg) => {
        const match = /^Q(\d+)(?:$|-)/.exec(seg.queueTag || "");
        return match ? Number(match[1]) : null;
    };
    const queueCount = mlfqQueueCount;
    const endTime = res.totalTime;
    const scale = 48;
    const policyNames = { rr: "RR", fcfs: "FCFS", sjf: "SJF", npp: "NPP", srtf: "SRTF", pp: "PP" };
    const queuePolicies = MLFQ_CONFIG.slice(0, queueCount).map((config, index) => {
        const demotionText = config.demotion === "none" || index === queueCount - 1 ? "no automatic demotion" : config.demotion === "duration" ? `demote after ${config.quantum} CPU units` : `demote after a full ${config.quantum}-unit quantum`;
        return `${policyNames[config.policy]}${config.policy === "rr" ? ` · quantum ${config.quantum}` : ""} · ${demotionText}`;
    });
    const lanes = [{ title: "CPU", subtitle: "Overall execution", queue: null }];
    for (let q = 1; q <= queueCount; q++) {
        lanes.push({ title: `Queue ${q}`, subtitle: getQueuePriorityLabel(q, queueCount), queue: q });
    }

    lanes.forEach((lane) => {
        const row = document.createElement("div");
        row.className = "mlfq-timeline-row";
        const heading = document.createElement("div");
        heading.className = "mlfq-row-heading";
        heading.innerHTML = `<strong>${lane.title}</strong><span>${lane.subtitle}</span>${lane.queue ? `<small>${queuePolicies[lane.queue - 1] || ""}</small>` : ""}`;
        row.appendChild(heading);

        const scroller = document.createElement("div");
        scroller.className = "mlfq-lane-scroll";
        const trackEl = document.createElement("div");
        trackEl.className = "mlfq-lane-track";
        trackEl.style.width = `${Math.max(endTime * scale, 1)}px`;
        const segments = res.segments.map((seg) => {
            const belongs = lane.queue === null ? seg.type === "process" : seg.type === "process" && queueNumber(seg) === lane.queue;
            return { ...seg, visible: belongs };
        });
        segments.forEach((seg) => {
            if (seg.end <= seg.start) return;
            const block = document.createElement("div");
            const visible = seg.visible;
            block.className = `mlfq-lane-block ${visible ? "is-process" : "is-idle"}`;
            block.style.left = `${seg.start * scale}px`;
            block.style.width = `${(seg.end - seg.start) * scale}px`;
            if (visible) block.style.backgroundColor = seg.color;
            const queueLabel = visible ? (lane.queue === null ? `Queue ${queueNumber(seg)}` : lane.title) : "Idle";
            block.title = `${visible ? seg.label : "Idle"} · ${seg.start} → ${seg.end} · ${(seg.end - seg.start)} time units · ${queueLabel}${visible ? ` · ${queuePolicies[queueNumber(seg) - 1]}` : ""}`;
            block.setAttribute("aria-label", block.title);
            block.tabIndex = 0;
            block.innerHTML = visible ? `<span>${seg.label}</span>${lane.queue === null ? `<small>${queueNumber(seg) ? `Q${queueNumber(seg)}` : ""}</small>` : ""}` : `<span>${lane.queue === null ? "IDLE" : "—"}</span>`;
            trackEl.appendChild(block);
        });
        const axis = document.createElement("div");
        axis.className = "mlfq-time-axis";
        axis.style.width = `${Math.max(endTime * scale, 1)}px`;
        res.segments.forEach((seg) => {
            if (seg.end <= seg.start) return;
            const tick = document.createElement("span");
            tick.className = "mlfq-time-tick";
            tick.style.left = `${seg.end * scale}px`;
            tick.textContent = String(seg.end);
            axis.appendChild(tick);
        });
        scroller.append(trackEl, axis);
        row.appendChild(scroller);
        rows.appendChild(row);
    });
}

function toggleChampionship(forceState) {
    championshipOpen = typeof forceState === "boolean" ? forceState : !championshipOpen;
    if (championshipOpen) playPowerUpSFX();
    document.getElementById("championship-panel").classList.toggle("hidden", !championshipOpen);
    if (championshipOpen) {
        renderChampionship();
        document.getElementById("championship-panel").scrollIntoView({ behavior: "smooth" });
    }
}

function renderChampionship() {
    const rows = STAGES.map((stage) => ({
        ...stage,
        ...runAlgorithm(stage.id, processes)
    }))
        .sort((a, b) => a.avgWt - b.avgWt || a.avgTat - b.avgTat || b.cpuUtilization - a.cpuUtilization)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const tbody = document.getElementById("championship-tbody");
    tbody.innerHTML = "";
    rows.forEach((r) => {
        const medal = r.rank === 1 ? "👑 #1" : r.rank === 2 ? "🥈 #2" : r.rank === 3 ? "🥉 #3" : `#${r.rank}`;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${medal}</strong></td>
            <td>${r.badge} <strong>${r.shortName}</strong> (${r.stageName})</td>
            <td>${r.avgWt.toFixed(2)}</td>
            <td>${r.avgTat.toFixed(2)}</td>
            <td>${r.avgRt.toFixed(2)}</td>
            <td>${r.cpuUtilization.toFixed(1)}% (${r.throughput.toFixed(2)}/t)</td>
            <td style="min-width:140px;">
                <div class="champ-bar-track">
                    <div class="champ-bar-fill" style="width:${Math.min(100, Math.max(8, r.cpuUtilization))}%;"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function exportResultsCSV() {
    const res = lastComputedResult || runAlgorithm(selectedAlgoId, processes);
    const headers = ["Process ID", "AT", "BT", "Priority", "Queue", "CT", "TAT", "WT", "RT"];
    const lines = [
        headers.join(","),
        ...res.processes.map((p) => [p.id, p.at, p.bt, p.priority, p.queue, p.ct, p.tat, p.wt, p.rt].join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mario-cpu-${selectedAlgoId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
