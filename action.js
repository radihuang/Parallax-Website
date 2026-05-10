const state = {
    water: 45,
    sun: 45,
    air: 45,
    growth: 0,
    unlockedColors: ["#f37aa2"],
    lastRewardAt: 0,
};

const colorRewards = [
    { at: 0, name: "粉紅", value: "#f37aa2" },
    { at: 24, name: "金黃", value: "#ffd166" },
    { at: 48, name: "紫色", value: "#a78bfa" },
    { at: 72, name: "珊瑚", value: "#fb7185" },
    { at: 96, name: "白雪", value: "#fff7ed" },
];

const stages = [
    { min: 0, className: "seedling", label: "幼苗正在伸懶腰", count: 3 },
    { min: 25, className: "sprout", label: "葉子變得更有精神了", count: 5 },
    { min: 50, className: "bud", label: "花苞悄悄冒出來了", count: 7 },
    { min: 75, className: "blooming", label: "鬱金香盛開中", count: 9 },
    { min: 100, className: "blooming", label: "送給媽媽的鬱金香花海完成！", count: 13 },
];

const elements = {
    garden: document.querySelector("#garden"),
    stageLabel: document.querySelector("#stageLabel"),
    hintText: document.querySelector("#hintText"),
    rewardList: document.querySelector("#rewardList"),
    progressText: document.querySelector("#progressText"),
    growthMeter: document.querySelector("#growthMeter"),
    resetGame: document.querySelector("#resetGame"),
    values: {
        water: document.querySelector("#waterValue"),
        sun: document.querySelector("#sunValue"),
        air: document.querySelector("#airValue"),
    },
    meters: {
        water: document.querySelector("#waterMeter"),
        sun: document.querySelector("#sunMeter"),
        air: document.querySelector("#airMeter"),
    },
};

function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
}

function getStage() {
    return stages.reduce((current, stage) => (state.growth >= stage.min ? stage : current), stages[0]);
}

function isBalanced() {
    return [state.water, state.sun, state.air].every((value) => value >= 35 && value <= 85);
}

function chooseFlowerColor(index) {
    return state.unlockedColors[index % state.unlockedColors.length];
}

function renderGarden() {
    const stage = getStage();
    elements.stageLabel.textContent = stage.label;
    elements.garden.innerHTML = "";

    for (let index = 0; index < stage.count; index += 1) {
        const plant = document.createElement("div");
        plant.className = `plant ${stage.className}`;
        plant.style.setProperty("--flower", chooseFlowerColor(index));
        plant.style.transform = `scale(${0.82 + (index % 4) * 0.08}) rotate(${(index - stage.count / 2) * 1.6}deg)`;
        plant.innerHTML = `
            <span class="stem"></span>
            <span class="leaf left"></span>
            <span class="leaf right"></span>
            <span class="bloom"></span>
        `;
        elements.garden.appendChild(plant);
    }
}

function renderRewards() {
    elements.rewardList.innerHTML = "";
    colorRewards.forEach((reward) => {
        const chip = document.createElement("span");
        const unlocked = state.unlockedColors.includes(reward.value);
        chip.className = "reward-chip";
        chip.style.opacity = unlocked ? "1" : "0.42";
        chip.innerHTML = `<span class="reward-dot" style="--chip-color: ${reward.value}"></span>${unlocked ? reward.name : `${reward.at}% 解鎖`}`;
        elements.rewardList.appendChild(chip);
    });
}

function renderStatus() {
    ["water", "sun", "air"].forEach((key) => {
        const value = Math.round(state[key]);
        elements.values[key].textContent = `${value}%`;
        elements.meters[key].style.width = `${value}%`;
    });

    const growth = Math.round(state.growth);
    elements.growthMeter.style.width = `${growth}%`;
    elements.progressText.textContent = `${growth} / 100`;

    if (state.growth >= 100) {
        elements.hintText.textContent = "完成！這片花海就是送給媽媽的母親節祝福。可以重新開始，再種出不同節奏的花園。";
    } else if (isBalanced()) {
        elements.hintText.textContent = "狀態剛剛好！花園正在快速長大，繼續保持這個照顧節奏。";
    } else {
        elements.hintText.textContent = "提示：三個狀態維持在 35%～85% 時，鬱金香會長得最快。太多或太少都要調整喔。";
    }
}

function unlockRewards() {
    colorRewards.forEach((reward) => {
        if (state.growth >= reward.at && !state.unlockedColors.includes(reward.value)) {
            state.unlockedColors.push(reward.value);
            state.lastRewardAt = reward.at;
            elements.garden.classList.remove("celebration");
            window.requestAnimationFrame(() => elements.garden.classList.add("celebration"));
        }
    });
}

function render() {
    unlockRewards();
    renderStatus();
    renderRewards();
    renderGarden();
}

function careForTulips(action) {
    const effects = {
        water: { water: 25, sun: -5, air: -2 },
        sun: { sun: 25, water: -7, air: -1 },
        air: { air: 25, water: -3, sun: -3 },
    };

    Object.entries(effects[action]).forEach(([key, amount]) => {
        state[key] = clamp(state[key] + amount);
    });

    const button = document.querySelector(`[data-action="${action}"]`);
    button.disabled = true;
    window.setTimeout(() => {
        button.disabled = false;
    }, 650);

    render();
}

function growTick() {
    state.water = clamp(state.water - 1.4);
    state.sun = clamp(state.sun - 1.1);
    state.air = clamp(state.air - 1.2);

    if (state.growth < 100) {
        state.growth = clamp(state.growth + (isBalanced() ? 2.7 : 0.55));
    }

    render();
}

function resetGame() {
    state.water = 45;
    state.sun = 45;
    state.air = 45;
    state.growth = 0;
    state.unlockedColors = ["#f37aa2"];
    state.lastRewardAt = 0;
    render();
}

document.querySelectorAll(".care-button").forEach((button) => {
    button.addEventListener("click", () => careForTulips(button.dataset.action));
});

elements.resetGame.addEventListener("click", resetGame);

render();
window.setInterval(growTick, 1600);
