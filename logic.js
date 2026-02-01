let state = {
    level: 1,
    problems: [],
    currentIndex: 0,
    totalCount: 20, // Default and fixed to 20
    isProcessing: false,
    strictC: true,
    currentKeyIndex: 0
};

// [New] 공통 AI 호출 함수 (채점 & 해설 전용)
async function callGeminiAI(promptText, retryCount = 0) {
    if (!CONFIG.API_KEYS || CONFIG.API_KEYS.length === 0) {
        if (CONFIG.API_KEY) CONFIG.API_KEYS = [CONFIG.API_KEY];
        else throw new Error("API 키가 설정되지 않았습니다.");
    }

    const prompt = {
        "contents": [{ "parts": [{ "text": promptText }] }]
    };

    try {
        const apiKey = CONFIG.API_KEYS[state.currentKeyIndex % CONFIG.API_KEYS.length];
        const response = await fetch(`${CONFIG.API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        if (response.status === 429) {
            console.warn(`API Key ${state.currentKeyIndex} rate limited. Switching key...`);
            state.currentKeyIndex++; 
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (retryCount < 5) return callGeminiAI(promptText, retryCount + 1);
            throw new Error("API 할당량이 모두 소진되었습니다 (Rate Limit). 잠시 후 다시 시도해 주세요.");
        }
        
        if (response.status === 401 || response.status === 403) {
            throw new Error("API 키가 올바르지 않거나 권한이 없습니다. config.js의 키 정보를 확인해 주세요.");
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`API 호출 실패 (${response.status}): ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("AI 응답 데이터 형식이 올바르지 않습니다.");
        }

        let rawText = data.candidates[0].content.parts[0].text;
        let cleanedText = rawText.replace(/```json|```/gi, '').trim();
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            throw new Error("AI 응답에서 유효한 JSON 구조를 찾을 수 없습니다.");
        }
        
        const jsonOnly = cleanedText.substring(firstBrace, lastBrace + 1);
        
        try {
            return JSON.parse(jsonOnly);
        } catch (parseError) {
            let fixedJson = jsonOnly.replace(/(":?\s*")([^"]*)(")/g, (match, p1, p2, p3) => {
                const fixedValue = p2.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
                return p1 + fixedValue + p3;
            });
            try {
                return JSON.parse(fixedJson);
            } catch (e2) {
                const fallback = jsonOnly.replace(/\\/g, '\\\\').replace(/\\\\"/g, '\\"');
                return JSON.parse(fallback);
            }
        }

    } catch (error) {
        console.error("AI API Call Error:", error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedStrict = localStorage.getItem('strictC');
    const chkStrict = document.getElementById('chk-strict-c');
    if (chkStrict && savedStrict !== null) {
        chkStrict.checked = (savedStrict === 'true');
    }

    // Populate Collection Dropdown
    const selCollection = document.getElementById('sel-collection');
    if (selCollection && window.generatedCollections) {
        selCollection.innerHTML = "";
        window.generatedCollections.forEach(col => {
            const opt = document.createElement('option');
            opt.value = col.id;
            opt.innerText = col.name;
            selCollection.appendChild(opt);
        });
        
        if(window.generatedCollections.length === 0) {
             const opt = document.createElement('option');
             opt.innerText = "No collections found";
             selCollection.appendChild(opt);
        }
    } else if (selCollection) {
        selCollection.innerHTML = "<option>Error loading collections</option>";
    }
    
    // Default to strict C Check
    if(chkStrict) chkStrict.checked = true;
});

async function startGame() {
    const chkStrict = document.getElementById('chk-strict-c');
    state.strictC = chkStrict ? chkStrict.checked : true;
    localStorage.setItem('strictC', state.strictC);

    const selCollection = document.getElementById('sel-collection');
    const collectionId = selCollection ? selCollection.value : null;
    
    let selectedCollection = null;
    if (window.generatedCollections && collectionId) {
        selectedCollection = window.generatedCollections.find(c => c.id === collectionId);
    }

    if (!selectedCollection) {
        alert("문제집 선택 오류: 데이터를 찾을 수 없습니다.");
        return;
    }

    // Load problems - already shuffled and organized in python, so just map them
    state.problems = selectedCollection.problems.map((p, idx) => ({
        id: idx + 1,
        level: p.level,
        latex: normalizeLatex(p.latex),
        solution: p.solution,
        explanation: "",
        userAnswer: ""
    }));
    
    state.totalCount = state.problems.length;
    state.currentIndex = 0;

    // Switch View
    document.getElementById('landing-view').style.display = 'none';
    document.getElementById('loading-view').style.display = 'block';

    setTimeout(() => {
        document.getElementById('loading-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'block';
        document.getElementById('result-view').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'block';
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-finish').classList.add('hidden');

        updateHeader();
        loadCurrentProblem();
    }, 500);
}

function updateHeader() {
    const currentProb = state.problems[state.currentIndex];
    const lv = currentProb ? currentProb.level : 1;
    document.getElementById('level-badge').innerText = `Level ${lv}`;
    const progressText = `${state.currentIndex + 1} / ${state.totalCount}`;
    const progressBadge = document.getElementById('progress-badge');
    if (progressBadge) {
        progressBadge.innerText = progressText;
    }
}

function loadCurrentProblem() {
    const problemArea = document.getElementById('problem-area');
    const inputField = document.getElementById('math-input');
    
    inputField.value = ""; 
    inputField.focus();

    inputField.onkeydown = (e) => {
        if (e.key === "Enter") {
            const nextBtn = document.getElementById('btn-next');
            const finishBtn = document.getElementById('btn-finish');
            if (state.currentIndex === state.totalCount - 1 && !finishBtn.classList.contains('hidden')) {
                finishTest();
            } else if (!nextBtn.classList.contains('hidden')) {
                nextProblem();
            }
        }
    };

    if (state.problems[state.currentIndex]) {
        const p = state.problems[state.currentIndex];
        inputField.value = p.userAnswer || ""; 
        renderMath(problemArea, p.latex);
        updateNavButtons();
    }
}

function renderMath(element, latex) {
    element.innerHTML = `$$${latex}$$`;
    // Force re-render just to be sure
    if (window.MathJax) {
         if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([element]).catch((err) => console.log('Typeset failed: ' + err.message));
        } else if (window.MathJax.typeset) {
            window.MathJax.typeset();
        }
    }
}

function saveCurrentAnswer() {
    const inputField = document.getElementById('math-input');
    if (state.problems[state.currentIndex]) {
        state.problems[state.currentIndex].userAnswer = inputField.value;
    }
}

function prevProblem() {
    if (state.currentIndex > 0) {
        saveCurrentAnswer();
        state.currentIndex--;
        updateHeader();
        loadCurrentProblem();
    }
}

function nextProblem() {
    saveCurrentAnswer();
    if (state.currentIndex < state.totalCount - 1) {
        state.currentIndex++;
        updateHeader();
        loadCurrentProblem();
    }
}

function updateNavButtons() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnFinish = document.getElementById('btn-finish');

    if (state.currentIndex === 0) btnPrev.classList.add('hidden');
    else btnPrev.classList.remove('hidden');

    if (state.currentIndex === state.totalCount - 1) {
        btnNext.classList.add('hidden');
        btnFinish.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnFinish.classList.add('hidden');
    }
}

async function finishTest() {
    saveCurrentAnswer();

    const unanswered = state.problems.filter(p => !p.userAnswer || p.userAnswer.trim() === "");
    if (unanswered.length > 0) {
        if(!confirm(`아직 풀지 않은 문제가 ${unanswered.length}개 있습니다. 그래도 제출하시겠습니까?`)) {
            return;
        }
    }

    document.getElementById('quiz-area').style.display = 'none';
    const resultView = document.getElementById('result-view');
    resultView.style.display = 'block';
    
    document.getElementById('score-area').innerHTML = "";
    document.getElementById('analysis-area').innerHTML = "<h3>AI가 채점 중입니다... (잠시만 기다려주세요)</h3>";
    document.getElementById('btn-toggle-detail').style.display = 'none'; 

    const problemsText = state.problems.map(p => 
        `Q${p.id} (Lv${p.level}). Problem: ${p.latex}, Solution: ${p.solution}, Student Answer: ${p.userAnswer}`
    ).join("\n");

    const prompt = `수학 채점관. 부정적분 문제를 채점해.
총 문제 수: ${state.totalCount}

[데이터]
${problemsText}

[지시사항]
1. 각 문제의 정오답을 판단해 (수학적 동치 확인).
2. **중요: 학생 답안이 비어있거나 공백이면 무조건 오답(X) 처리해.**
3. **[적분상수 옵션]: ${state.strictC ? "적분상수(C)가 없으면 오답 처리해." : "적분상수(C)가 없어도 수식이 맞으면 정답 처리해."}**
4. **[절댓값 엄격 체크]: 로그함수(ln)의 진수 조건에서 절댓값(| |) 유무를 엄격하게 구분해. (예: ln x 와 ln|x|는 다름)**
5. 틀린 문제는 구체적인 피드백을 제공해 (한국어).
   예: "x^3 대신 1/3 x^3이 되어야 합니다", "진수에 절댓값이 빠졌습니다."
6. 학생의 점수와 짧은 격려 메시지를 줘.
7. 반드시 JSON 형식으로 출력해. 마크다운 없이 순수 JSON만.

[JSON 형식]
{
    "score": "8/10",
    "comment": "전반적으로 훌륭합니다!",
    "details": [
       {"id": 1, "isCorrect": true, "feedback": "정답"},
       {"id": 2, "isCorrect": false, "feedback": "오답. 적분상수 C 누락"}
    ]
}`;

    let result;
    try {
        result = await callGeminiAI(prompt);
        
        const correctCount = result.details.filter(d => d.isCorrect).length;
        result.score = `${correctCount}/${state.totalCount}`;
    } catch (error) {
        console.error("AI 채점 API 호출 실패:", error);
        result = {
            score: "채점 보류",
            comment: "😓 <b>API 할당량 초과 또는 오류가 발생했습니다.</b><br>(채점 결과는 보이지 않지만, 해설 보기는 시도해볼 수 있습니다.)",
            details: state.problems.map(p => ({
                id: p.id,
                isCorrect: false,
                isApiError: true, 
                feedback: "채점 불가"
            }))
        };
    }

    try {
        const scoreColor = (result.score === "채점 보류") ? '#f39c12' : '#1a73e8';
        document.getElementById('score-area').innerHTML = `총점: <span style='color:${scoreColor}'>${result.score}</span>`;
        document.getElementById('analysis-area').innerHTML = `<p class='advice'>${result.comment}</p>`;
        
        const simpleList = document.getElementById('simple-result-list');
        let simpleHTML = "";
        result.details.forEach(item => {
            let color = item.isCorrect ? 'var(--success)' : 'var(--error)';
            let ox = item.isCorrect ? 'O' : 'X';
            
            if (item.isApiError) {
                color = '#95a5a6';
                ox = '?';
            }

            simpleHTML += `<div class="mini-badge" style="border-color:${color}; color:${color}">
                <span>Q${item.id}</span> <strong>${ox}</strong>
            </div>`;
        });
        simpleList.innerHTML = simpleHTML;

        const detailList = document.getElementById('detail-list');
        let listHTML = "<ul>";
        result.details.forEach(item => {
            const originalProb = state.problems.find(p => p.id === item.id);
            let color = item.isCorrect ? 'green' : '#e74c3c';
            let ox = item.isCorrect ? 'O' : 'X';
            
            if (item.isApiError) {
                color = '#7f8c8d';
                ox = 'UNK';
            }
            
            listHTML += `<li class="detail-item">
                <div class="detail-header">
                    <strong>Q${item.id} (Lv${originalProb.level})</strong> <span style="color:${color}; font-weight:bold; font-size:1.2em;">${ox}</span>
                </div>
                <div class="detail-body">
                    <p><b>문제:</b> $$${originalProb.latex}$$</p>
                    <p><b>정답:</b> $$${originalProb.solution}$$</p>
                    <p><b>내가 쓴 답:</b> ${originalProb.userAnswer || "(제출 안함)"}</p>
                    <p class="ai-feedback"><b>AI 조언:</b> ${item.feedback}</p>
                    <div class="explanation-container" id="exp-container-${item.id}">
                        <button class="btn secondary sm" onclick="toggleExplanation(${item.id})">해설 보기 (View Step-by-step)</button>
                        <div class="explanation-content" id="exp-content-${item.id}" style="display:none; margin-top:10px; padding:15px; background:#f0f7ff; border-radius:8px; border-left:4px solid var(--primary); font-size:0.95em;">
                            ${originalProb.explanation ? originalProb.explanation : "버튼을 누르면 AI가 상세 풀이를 생성합니다."}
                        </div>
                    </div>
                </div>
            </li>`;
        });
        listHTML += "</ul>";
        detailList.innerHTML = listHTML;
        
        if (window.MathJax) {
            MathJax.typesetPromise([detailList]);
        }

        const btnToggle = document.getElementById('btn-toggle-detail');
        btnToggle.style.display = 'inline-block';
        btnToggle.innerText = "자세히 보기 (View Details)";
        
    } catch (renderError) {
        console.error("렌더링 중 오류:", renderError);
        document.getElementById('analysis-area').innerHTML = `<p style='color:red'>결과 화면 구성 중 오류가 발생했습니다.<br><small>${renderError.message}</small></p>`;
    }
}

async function toggleExplanation(id) {
    const prob = state.problems.find(p => p.id === id);
    const content = document.getElementById(`exp-content-${id}`);
    const btn = event.target;

    if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.innerText = "해설 접기 (Hide Step-by-step)";
        
        if (!prob.explanation || prob.explanation.includes("버튼을 누르면")) {
            content.innerHTML = `<div class="loading-container">
                <div class="loader-spinner"></div>
                <span class="loading-text">AI 선생님이 풀이 과정을 작성 중입니다... (약 5~10초)</span>
            </div>`;
            
            const prompt = `당신은 친절한 수학 선생님입니다. 다음 적분 문제에 대해 상세하고 친절한 단계별 풀이(Step-by-step Explanation)를 만들어 주세요.
            
[문제 정보]
- 문제: \\int ${prob.latex} dx
- 정답: ${prob.solution}

[지시 사항]
1. 풀이 과정을 LaTeX로 상세히 적어주세요.
2. 각 과정마다 어떤 공식을 사용했는지(치환적분, 부분적분 등) 설명하고, 피적분 함수의 변환 과정을 보여주세요.
3. 한국어로 친절하게 설명하세요.
4. **[중요] JSON 이스케이프**: LaTeX 백슬래시(\)는 반드시 이중(\\\\)으로 작성하십시오 (예: "\\\\frac").
5. 반드시 아래 JSON 형식으로 답변하세요.

[JSON 형식]
{
  "explanation": "상세 풀이 내용 (LaTeX 포함)"
}`;

            try {
                const result = await callGeminiAI(prompt);
                prob.explanation = result.explanation;
                content.innerHTML = prob.explanation;
            } catch (error) {
                console.error(error);
                content.innerHTML = `<span style="color:red">해설 생성 중 오류가 발생했습니다: ${error.message}</span>`;
            }
        } else {
            content.innerHTML = prob.explanation;
        }

        if (window.MathJax) {
            MathJax.typesetPromise([content]);
        }
    } else {
        content.style.display = 'none';
        btn.innerText = "해설 보기 (View Step-by-step)";
    }
}

function toggleDetails() {
    const container = document.getElementById('result-view');
    const btn = document.getElementById('btn-toggle-detail');
    container.classList.toggle('expanded');
    if (container.classList.contains('expanded')) {
        btn.innerText = "접기 (Hide Details)";
    } else {
        btn.innerText = "자세히 보기 (View Details)";
    }
}

function normalizeLatex(latexExpression) {
    if (!latexExpression) return "";
    let latex = latexExpression.trim();
    latex = latex.replace(/^\\int\s*/gi, '');
    latex = latex.replace(/(\s*,\s*|\s*)dx\s*$/gi, '');
    latex = latex.trim();
    return `\\int ${latex} \\, dx`;
}

function goHome() {
    if(confirm("메인 화면으로 돌아가시겠습니까? (진행 중인 내용은 저장되지 않습니다)")) {
        location.reload();
    }
}

window.initTheme = function() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    if(window.updateThemeIcon) window.updateThemeIcon(saved);
};

window.updateThemeIcon = function(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if(theme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
};

window.toggleTheme = function() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if(window.updateThemeIcon) window.updateThemeIcon(next);
};

document.addEventListener('DOMContentLoaded', window.initTheme);
