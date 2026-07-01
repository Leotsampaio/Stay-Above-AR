// Estado simples do prototipo. Nada e salvo permanentemente.
const appState = {
  participant: "Participante",
  risksMarked: 0
};

const cameraState = {
  stream: null,
  lastBase64: null,
  analyzing: false
};

const modules = [
  {
    title: "Introducao a Seguranca do Trabalho",
    description: "Conceitos basicos de prevencao, cultura de seguranca e responsabilidade coletiva.",
    status: "concluido"
  },
  {
    title: "NR-35",
    description: "Principais exigencias para atividades executadas em altura com risco de queda.",
    status: "concluido"
  },
  {
    title: "Identificacao de Riscos",
    description: "Analise visual de perigos antes da liberacao da tarefa.",
    status: "em andamento",
    target: "module-content"
  },
  {
    title: "EPIs e EPCs",
    description: "Uso correto de equipamentos individuais e protecoes coletivas.",
    status: "concluido"
  },
  {
    title: "Planejamento Seguro",
    description: "Organizacao da atividade, APR e permissao de trabalho.",
    status: "em andamento"
  },
  {
    title: "Realidade Aumentada",
    description: "Inspecao guiada por marcacoes digitais sobre o ambiente.",
    status: "em andamento",
    target: "ar-simulation"
  },
  {
    title: "Emergencias e Resgate",
    description: "Condutas iniciais e fluxo de resposta a incidentes.",
    status: "bloqueado"
  },
  {
    title: "Avaliacao Final",
    description: "Questionario objetivo para validar a aprendizagem.",
    status: "bloqueado",
    target: "quiz"
  }
];

const questions = [
  {
    text: "Segundo a NR-35, trabalho em altura ocorre acima de quantos metros com risco de queda?",
    options: ["1 metro", "2 metros", "3 metros", "5 metros"],
    answer: "2 metros"
  },
  {
    text: "Qual situacao representa condicao insegura?",
    options: ["Guarda-corpo instalado", "Abertura no piso sem protecao", "Linha de vida adequada", "EPI inspecionado"],
    answer: "Abertura no piso sem protecao"
  },
  {
    text: "Qual documento identifica riscos antes da atividade?",
    options: ["APR", "Holerite", "Nota fiscal", "Ficha de presenca"],
    answer: "APR"
  },
  {
    text: "Qual e a funcao da Realidade Aumentada no curso?",
    options: ["Substituir todos os EPIs", "Simular a identificacao de riscos", "Emitir certificado real", "Eliminar supervisao tecnica"],
    answer: "Simular a identificacao de riscos"
  },
  {
    text: "O que fazer ao identificar um talabarte danificado?",
    options: ["Continuar usando com cuidado", "Guardar para outra equipe", "Retirar de uso e substituir", "Usar apenas em baixa altura"],
    answer: "Retirar de uso e substituir"
  }
];

const screens = document.querySelectorAll(".screen");
const topbar = document.getElementById("topbar");
const participantLabels = document.querySelectorAll("[data-participant]");
const navButtons = document.querySelectorAll("[data-target]");

function showScreen(screenId) {
  if (screenId !== "ar-camera" && cameraState.stream) {
    stopCamera();
  }

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  topbar.classList.toggle("hidden", screenId === "login");

  document.querySelectorAll(".main-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === screenId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateParticipantName(name) {
  appState.participant = name || "Participante";
  participantLabels.forEach((label) => {
    label.textContent = appState.participant;
  });
}

function statusClass(status) {
  if (status === "concluido") return "success";
  if (status === "bloqueado") return "danger";
  return "warning";
}

function renderModules() {
  const modulesGrid = document.getElementById("modulesGrid");
  modulesGrid.innerHTML = modules.map((module) => {
    const locked = module.status === "bloqueado";
    const target = module.target || "module-content";

    return `
      <article class="module-card ${locked ? "locked" : ""}">
        <span class="module-status ${statusClass(module.status)}">${module.status}</span>
        <h3>${module.title}</h3>
        <p>${module.description}</p>
        <button class="${locked ? "secondary-button" : "primary-button"}" data-module-target="${target}" ${locked ? "disabled" : ""}>
          Acessar modulo
        </button>
      </article>
    `;
  }).join("");

  modulesGrid.querySelectorAll("[data-module-target]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.moduleTarget));
  });
}

function renderQuiz() {
  const quizForm = document.getElementById("quizForm");
  quizForm.innerHTML = questions.map((question, index) => `
    <fieldset class="question-card">
      <legend>${index + 1}. ${question.text}</legend>
      <div class="answers">
        ${question.options.map((option) => `
          <label>
            <input type="radio" name="question-${index}" value="${option}">
            <span>${option}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");

  quizForm.insertAdjacentHTML("beforeend", '<button class="primary-button" type="submit">Finalizar questionario</button>');
}

function setupNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (target) showScreen(target);
    });
  });
}

function setupLogin() {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("participantName");
    updateParticipantName(input.value.trim());
    showScreen("dashboard");
  });
}

function setupArSimulation() {
  const hintBox = document.getElementById("hintBox");
  const result = document.getElementById("inspectionResult");
  const checklistItems = document.querySelectorAll(".checklist input");

  document.getElementById("hintButton").addEventListener("click", () => {
    hintBox.classList.toggle("hidden");
  });

  document.getElementById("markRiskButton").addEventListener("click", () => {
    appState.risksMarked = Math.min(appState.risksMarked + 1, checklistItems.length);
    if (checklistItems[appState.risksMarked - 1]) {
      checklistItems[appState.risksMarked - 1].checked = true;
    }
  });

  document.getElementById("finishInspectionButton").addEventListener("click", () => {
    result.classList.remove("hidden");
    hintBox.classList.add("hidden");
  });
}

function setupQuiz() {
  document.getElementById("quizForm").addEventListener("submit", (event) => {
    event.preventDefault();

    let correct = 0;
    questions.forEach((question, index) => {
      const selected = document.querySelector(`input[name="question-${index}"]:checked`);
      if (selected && selected.value === question.answer) {
        correct += 1;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const feedback = percentage >= 70
      ? "Bom desempenho. Voce demonstrou dominio dos conceitos principais."
      : "Revise os modulos de riscos, NR-35 e uso de EPIs antes de repetir a avaliacao.";

    document.getElementById("quizScore").textContent = `Nota: ${correct}/${questions.length} - ${percentage}% de acertos.`;
    document.getElementById("quizFeedback").textContent = feedback;
    document.getElementById("quizResult").classList.remove("hidden");
  });
}

function stopCamera() {
  if (cameraState.stream) {
    cameraState.stream.getTracks().forEach((t) => t.stop());
    cameraState.stream = null;
  }
  const video = document.getElementById("cameraFeed");
  if (video) video.srcObject = null;

  document.getElementById("cameraFeed").classList.add("hidden");
  document.getElementById("cameraPlaceholder").classList.remove("hidden");
  document.getElementById("cameraCorners").classList.add("hidden");
  document.getElementById("cameraScanline").classList.add("hidden");
  document.getElementById("captureButton").classList.add("hidden");
  document.getElementById("previewRow").classList.add("hidden");

  const startBtn = document.getElementById("startCameraButton");
  startBtn.textContent = "Iniciar câmera";
  startBtn.disabled = false;

  cameraState.lastBase64 = null;
  showAnalysisPanel("idle");
}

function showAnalysisPanel(state) {
  ["stateIdle", "stateLoading", "stateResult", "stateError"].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
  const map = { idle: "stateIdle", loading: "stateLoading", result: "stateResult", error: "stateError" };
  document.getElementById(map[state]).classList.remove("hidden");
}

function setupAiCamera() {
  document.getElementById("startCameraButton").addEventListener("click", () => {
    const apiKey = document.getElementById("geminiApiKey").value.trim();
    if (!apiKey) {
      showAnalysisPanel("error");
      document.getElementById("errorMsg").textContent = "Insira sua chave da API Gemini antes de iniciar.";
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showAnalysisPanel("error");
      document.getElementById("errorMsg").textContent = "Câmera não disponível neste navegador. Use Chrome ou Safari em HTTPS.";
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        cameraState.stream = stream;
        const video = document.getElementById("cameraFeed");
        video.srcObject = stream;
        video.classList.remove("hidden");
        document.getElementById("cameraPlaceholder").classList.add("hidden");
        document.getElementById("cameraCorners").classList.remove("hidden");
        document.getElementById("cameraScanline").classList.remove("hidden");
        document.getElementById("captureButton").classList.remove("hidden");

        const startBtn = document.getElementById("startCameraButton");
        startBtn.textContent = "Câmera ativa";
        startBtn.disabled = true;
      })
      .catch((err) => {
        showAnalysisPanel("error");
        document.getElementById("errorMsg").textContent = "Não foi possível acessar a câmera: " + err.message;
      });
  });

  document.getElementById("captureButton").addEventListener("click", () => {
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("captureCanvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    cameraState.lastBase64 = dataUrl.split(",")[1];

    document.getElementById("capturedImg").src = dataUrl;
    document.getElementById("previewRow").classList.remove("hidden");

    callGemini(cameraState.lastBase64);
  });

  document.getElementById("retakeButton").addEventListener("click", () => {
    document.getElementById("previewRow").classList.add("hidden");
    cameraState.lastBase64 = null;
    showAnalysisPanel("idle");
  });

  document.getElementById("newAnalysisButton").addEventListener("click", () => {
    document.getElementById("previewRow").classList.add("hidden");
    cameraState.lastBase64 = null;
    showAnalysisPanel("idle");
  });

  document.getElementById("retryButton").addEventListener("click", () => {
    if (cameraState.lastBase64) {
      callGemini(cameraState.lastBase64);
    } else {
      showAnalysisPanel("idle");
    }
  });
}

async function callGemini(base64) {
  if (cameraState.analyzing) return;
  cameraState.analyzing = true;
  showAnalysisPanel("loading");

  const apiKey = document.getElementById("geminiApiKey").value.trim();
  const prompt = `Você é um especialista em Higiene e Segurança do Trabalho (HST) com foco na NR-35 (prevenção de quedas em altura).

Analise a imagem e responda SEMPRE em português, seguindo este formato exato:

**RISCOS IDENTIFICADOS:**
Liste cada risco visível com:
- Descrição do risco
- Gravidade: CRÍTICO / ALTO / MÉDIO / BAIXO
- Medida corretiva necessária

**AVALIAÇÃO GERAL:**
Informe se o ambiente está: LIBERADO / REQUER ATENÇÃO / PARALISADO (conforme NR-35).

**OBSERVAÇÕES:**
Detalhes sobre EPIs, EPCs, ancoragem, guarda-corpos, aberturas no piso, materiais soltos, sinalização ou posicionamento de trabalhadores.

Se a imagem não mostrar um ambiente de trabalho em altura, informe isso claramente e descreva o que vê.`;

  const body = {
    contents: [{ parts: [
      { text: prompt },
      { inline_data: { mime_type: "image/jpeg", data: base64 } }
    ]}],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1200 }
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Resposta vazia da IA.");

    renderAnalysisResult(text);
  } catch (err) {
    showAnalysisPanel("error");
    document.getElementById("errorMsg").textContent = err.message;
  } finally {
    cameraState.analyzing = false;
  }
}

function renderAnalysisResult(text) {
  showAnalysisPanel("result");

  const badge = document.getElementById("resultBadge");
  if (/PARALISADO/i.test(text)) {
    badge.textContent = "PARALISADO";
    badge.className = "result-badge badge-critico";
  } else if (/REQUER ATENÇÃO/i.test(text)) {
    badge.textContent = "REQUER ATENÇÃO";
    badge.className = "result-badge badge-atencao";
  } else if (/LIBERADO/i.test(text)) {
    badge.textContent = "LIBERADO";
    badge.className = "result-badge badge-liberado";
  } else {
    badge.textContent = "ANALISADO";
    badge.className = "result-badge badge-atencao";
  }

  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
  document.getElementById("resultBody").innerHTML = html;
}

renderModules();
renderQuiz();
setupNavigation();
setupLogin();
setupArSimulation();
setupQuiz();
setupAiCamera();
