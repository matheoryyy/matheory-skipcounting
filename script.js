let currentStep = 2;
let score = 0;
let combo = 0;
let sequenceList = [];
let currentTargetIndex = 0;
let maxTime = 10; // 每題 10 秒倒數
let timeLeft = 10;
let timerInterval = null;
let gameActive = false;

// 開始遊戲
function startGame(stepSize, title) {
    currentStep = stepSize;
    score = 0;
    combo = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('combo').innerText = combo;

    document.getElementById('mode-section').classList.add('hidden');
    document.getElementById('play-section').classList.remove('hidden');
    document.getElementById('current-mode-title').innerText = `模式：${title}`;

    nextRound();
}

// 進入新的一題/產生新序列
function nextRound() {
    // 隨機決定起始基數，讓題目有變化
    let baseMultiplier = Math.floor(Math.random() * 5) + 1; // 1 到 5 之間
    sequenceList = [];
    
    // 建立 5 個連續序列
    for (let i = 0; i < 5; i++) {
        sequenceList.push((baseMultiplier + i) * currentStep);
    }
    
    // 隨機挖空其中一個（從第 2 個或第 3 個開始考）
    currentTargetIndex = Math.floor(Math.random() * 3) + 1; 

    gameActive = true;
    renderGame();
    startTimer();
}

// 渲染畫面
function renderGame() {
    const displayContainer = document.getElementById('sequence-display');
    displayContainer.innerHTML = '';

    sequenceList.forEach((num, index) => {
        const item = document.createElement('div');
        if (index === currentTargetIndex) {
            item.className = 'sequence-item current';
            item.innerHTML = '?';
        } else {
            item.className = 'sequence-item';
            item.innerHTML = num;
        }
        displayContainer.appendChild(item);
    });

    generateOptions();
}

// 產生選項（包含一個正確答案與兩個干擾項）
function generateOptions() {
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const correctAnswer = sequenceList[currentTargetIndex];
    let options = [correctAnswer];

    while (options.length < 3) {
        let randomOffset = (Math.random() > 0.5 ? 1 : -1) * currentStep * (Math.floor(Math.random() * 2) + 1);
        let wrongAnswer = correctAnswer + randomOffset;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }

    // 打亂選項
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, correctAnswer);
        container.appendChild(btn);
    });

    document.getElementById('speech-text').innerText = `快找出「?」是多少！`;
}

// 啟動計時器
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = maxTime;
    updateTimerBar();

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerBar();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver("⏰ 時間用完啦！");
        }
    }, 100);
}

// 更新畫面計時條
function updateTimerBar() {
    const bar = document.getElementById('timer-bar');
    let percentage = (timeLeft / maxTime) * 100;
    bar.style.width = percentage + '%';
    
    if (percentage > 50) {
        bar.style.background = '#00b894';
    } else if (percentage > 20) {
        bar.style.background = '#fdcb6e';
    } else {
        bar.style.background = '#d63031';
    }
}

// 檢查答案
function checkAnswer(selected, correct) {
    if (!gameActive) return;

    const monster = document.getElementById('monster-avatar');

    if (selected === correct) {
        // 答對了
        clearInterval(timerInterval);
        combo++;
        score += 10 + (combo * 2); // 連擊越多加分越多！
        
        document.getElementById('score').innerText = score;
        document.getElementById('combo').innerText = combo;

        monster.className = 'monster-happy';
        document.getElementById('speech-text').innerText = `太棒了！連續 COMBO x${combo} 🔥`;

        gameActive = false;
        setTimeout(() => {
            monster.className = 'monster-normal';
            nextRound();
        }, 500);

    } else {
        // 答錯了扣 combo 懲罰
        combo = 0;
        document.getElementById('combo').innerText = combo;
        monster.className = 'monster-hurt';
        document.getElementById('speech-text').innerText = `哎呀！答錯囉，再試一次！❌`;
        
        setTimeout(() => {
            monster.className = 'monster-normal';
        }, 400);
    }
}

// 遊戲結束
function gameOver(reason) {
    gameActive = false;
    clearInterval(timerInterval);
    
    document.getElementById('result-title').innerText = reason;
    document.getElementById('result-message').innerText = `太厲害了！你總共獲得了 ${score} 分，最高連擊 ${combo} COMBO！`;
    document.getElementById('result-modal').classList.remove('hidden');
}

// 重新開始
function restartGame() {
    document.getElementById('result-modal').classList.add('hidden');
    startGame(currentStep, document.getElementById('current-mode-title').innerText.replace('模式：', ''));
}

// 返回主選單
function backToMenu() {
    clearInterval(timerInterval);
    document.getElementById('play-section').classList.add('hidden');
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('mode-section').classList.remove('hidden');
}