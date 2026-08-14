(function () {
  const projectRow = document.querySelector("#project-row");
  const panel = document.querySelector(".ai-panel");
  const aiContexts = {
    hero: {
      title: "Olia.Shuyu",
      summary: "设计学背景的 AI 产品与体验设计者，关注真实业务、复杂协作与可落地体验。",
      questions: ["她为什么适合 AI 产品经理？", "FDE 经历带来了什么优势？", "用一分钟介绍她。"],
    },
    projects: {
      title: "项目内容",
      summary: "从 AI Agent 产品方案到交互、视觉与可运行 Demo，覆盖真实 B 端业务与设计研究。",
      questions: ["哪些项目最能证明 AI 产品能力？", "她如何把设计能力用在 Agent 中？", "哪些项目有可运行 Demo？"],
    },
    internship: {
      title: "实习经历",
      summary: "经历从 UI/UX、工业设计延伸到 FDE，当前聚焦企业 AI 产品方案与 Demo 落地。",
      questions: ["FDE 实习中她具体负责什么？", "设计实习如何支撑 AI 产品能力？", "她的经历主线是什么？"],
    },
  };
  const localBridge = "http://127.0.0.1:8765";
  const aiBase = window.location.protocol === "file:" ? localBridge : "";
  const aiEndpoint = `${aiBase}/api/chat`;
  const chatLog = document.querySelector("#ai-chat-log");
  const followupsHost = document.querySelector("#ai-followups-host");
  const aiForm = document.querySelector("#ai-form");
  const aiInput = document.querySelector("#ai-input");
  let activeAiContext = aiContexts.hero;
  let activeAiContextKey = "hero";
  let chatHistory = [];
  let conversationId = null;
  let aiIsReplying = false;

  if (projectRow) {
    document.querySelectorAll("[data-project-card]").forEach((card) => {
      card.addEventListener("pointerenter", () => {
        projectRow.classList.remove("expand-investment", "expand-presales");
        projectRow.classList.add(card.dataset.projectCard === "projects" ? "expand-investment" : "expand-presales");
      });
    });
    projectRow.addEventListener("pointerleave", () => projectRow.classList.remove("expand-investment", "expand-presales"));
  }

  const educationStages = [
    {
      period: "2020 - 2024",
      school: "武汉大学 · 城市设计学院",
      major: "产品设计专业 · 本科",
      stat: "GPA 前 20%",
      title: "建立产品设计方法",
    },
    {
      period: "2024 - 2027",
      school: "武汉大学 · 城市设计学院",
      major: "设计学专业 · 硕士",
      stat: "GPA 前 5%",
      title: "形成研究与思辨能力",
    },
    {
      period: "2026 - 2027",
      school: "武汉大学 × 企业真实实践",
      major: "人智交互与 AI 产品实践",
      stat: "2027.06 毕业",
      title: "走向 AI 产品落地",
    },
  ];

  const educationCard = document.querySelector(".education-card");
  const educationWheel = document.querySelector("#education-wheel");
  const dialScale = educationWheel?.querySelector(".dial-scale");
  const educationRotations = [-34, 0, 34];
  let educationIndex = 0;
  let dragStartY = 0;
  let dragDelta = 0;
  let wheelLocked = false;

  function renderEducation() {
    const stage = educationStages[educationIndex];
    document.querySelector("#education-period").textContent = stage.period;
    document.querySelector("#education-title").textContent = stage.title;
    document.querySelector("#education-school").textContent = stage.school;
    document.querySelector("#education-major").textContent = stage.major;
    document.querySelector("#education-stat").textContent = stage.stat;
    document.querySelector("#dial-year").textContent = stage.period.slice(0, 4);
    document.querySelectorAll("[data-education-index]").forEach((node) => node.classList.toggle("is-active", Number(node.dataset.educationIndex) === educationIndex));
    dialScale?.style.setProperty("--dial-rotation", `${educationRotations[educationIndex]}deg`);
    educationWheel?.setAttribute("aria-valuenow", String(educationIndex + 1));
    educationWheel?.setAttribute("aria-valuetext", `${stage.period} ${stage.title}`);

    ["#education-title", "#education-period", "#education-school", "#education-major", "#education-stat", "#dial-year"].forEach((selector) => {
      document.querySelector(selector)?.animate(
        [{ opacity: .38, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    });
  }

  document.querySelectorAll("[data-education-index]").forEach((node) => node.addEventListener("click", () => {
    educationIndex = Number(node.dataset.educationIndex);
    renderEducation();
  }));

  educationWheel?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) return;
    dragStartY = event.clientY;
    dragDelta = 0;
    educationWheel.classList.add("is-dragging");
    educationWheel.setPointerCapture(event.pointerId);
  });

  educationWheel?.addEventListener("pointermove", (event) => {
    if (!educationWheel.classList.contains("is-dragging")) return;
    dragDelta = event.clientY - dragStartY;
    const previewRotation = educationRotations[educationIndex] + Math.max(-38, Math.min(38, dragDelta * .22));
    dialScale.style.setProperty("--dial-rotation", `${previewRotation}deg`);
  });

  function finishEducationDrag() {
    if (!educationWheel?.classList.contains("is-dragging")) return;
    educationWheel.classList.remove("is-dragging");
    if (Math.abs(dragDelta) > 34) educationIndex = (educationIndex + (dragDelta < 0 ? 1 : -1) + educationStages.length) % educationStages.length;
    renderEducation();
  }

  educationWheel?.addEventListener("pointerup", finishEducationDrag);
  educationWheel?.addEventListener("pointercancel", finishEducationDrag);
  educationWheel?.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (wheelLocked || Math.abs(event.deltaY) < 4) return;
    educationIndex = (educationIndex + (event.deltaY > 0 ? 1 : -1) + educationStages.length) % educationStages.length;
    wheelLocked = true;
    renderEducation();
    window.setTimeout(() => { wheelLocked = false; }, 420);
  }, { passive: false });
  educationWheel?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    educationIndex = (educationIndex + (event.key === "ArrowRight" ? 1 : -1) + educationStages.length) % educationStages.length;
    renderEducation();
  });

  if (educationCard) renderEducation();

  function getPageContext(contextKey) {
    const baseContext = aiContexts[contextKey] || aiContexts.hero;
    const detailTitle = document.querySelector("#detail-title")?.textContent.trim();
    const detailSummary = document.querySelector("#detail-summary")?.textContent.trim();
    if (!detailTitle) return baseContext;
    return {
      ...baseContext,
      title: detailTitle,
      summary: detailSummary || baseContext.summary,
      questions: ["这个项目解决了什么问题？", "Olia 在项目中负责什么？", "这个项目体现了哪些能力？"],
    };
  }

  function renderSuggestions(questions) {
    if (!followupsHost) return;
    const wrapper = document.createElement("div");
    wrapper.className = "ai-followups";
    const label = document.createElement("span");
    label.textContent = "你可以这样问";
    wrapper.append(label);
    questions.forEach((question) => {
      const button = document.createElement("button");
      button.className = "ai-suggestion";
      button.type = "button";
      button.textContent = question;
      wrapper.append(button);
    });
    followupsHost.replaceChildren(wrapper);
    followupsHost.hidden = false;
  }

  function resetConversation() {
    chatHistory = [];
    conversationId = null;
    chatLog?.replaceChildren();
    if (chatLog) chatLog.hidden = true;
    followupsHost?.replaceChildren();
    if (followupsHost) followupsHost.hidden = true;
    panel?.classList.remove("has-conversation");
  }

  function openPanel(contextKey) {
    const nextContextKey = contextKey || "hero";
    if (nextContextKey !== activeAiContextKey) resetConversation();
    activeAiContextKey = nextContextKey;
    activeAiContext = getPageContext(nextContextKey);
    const context = activeAiContext;
    document.querySelector("#ai-context-title").textContent = context.title;
    document.querySelector("#ai-context-summary").textContent = context.summary;
    if (!chatHistory.length) renderSuggestions(context.questions);
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    document.querySelector(".ai-close").focus();
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function appendChatMessage(role, text, options = {}) {
    if (!chatLog) return null;
    chatLog.hidden = false;
    panel?.classList.add("has-conversation");
    const message = document.createElement("article");
    message.className = `ai-message is-${role}${options.loading ? " is-loading" : ""}`;
    if (options.loading) {
      message.setAttribute("aria-label", "AI 正在回答");
      const dots = document.createElement("span");
      dots.className = "ai-typing";
      dots.innerHTML = "<i></i><i></i><i></i>";
      message.append(dots);
    } else {
      const body = document.createElement("p");
      body.textContent = text;
      message.append(body);
    }
    chatLog.append(message);
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    return message;
  }

  function getFollowupQuestions(question) {
    let contextual = [];
    if (/负责|贡献|参与|做了什么/.test(question)) {
      contextual = ["这个项目最终产生了什么结果？", "它体现了哪些岗位能力？"];
    } else if (/适合|匹配|优势|为什么/.test(question)) {
      contextual = ["哪些项目可以证明这些能力？", "用一句话总结她的差异化优势。"];
    } else if (/联系|邮箱|求职|岗位/.test(question)) {
      contextual = ["她目前最匹配哪些岗位？", "她是否接受客户现场工作？"];
    } else if (/项目|Agent|设计|研究/.test(question)) {
      contextual = ["Olia 在其中具体负责什么？", "这个项目的成果和验证是什么？"];
    }
    return [...new Set([...contextual, ...(activeAiContext.questions || [])])]
      .filter((item) => item && item !== question)
      .slice(0, 2);
  }

  function appendFollowups(question) {
    if (!followupsHost) return;
    const questions = getFollowupQuestions(question);
    if (!questions.length) return;
    const wrapper = document.createElement("div");
    wrapper.className = "ai-followups";
    const label = document.createElement("span");
    label.textContent = "继续了解";
    wrapper.append(label);
    questions.forEach((item) => {
      const button = document.createElement("button");
      button.className = "ai-suggestion ai-followup";
      button.type = "button";
      button.textContent = item;
      wrapper.append(button);
    });
    followupsHost.replaceChildren(wrapper);
    followupsHost.hidden = false;
  }

  function getPublicPageContext() {
    const projectTitle = document.querySelector("#detail-title")?.textContent.trim() || "";
    const projectMeta = Array.from(document.querySelectorAll(".detail-meta strong, .detail-role strong"))
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .slice(0, 8);
    return {
      key: activeAiContextKey,
      title: activeAiContext.title,
      summary: activeAiContext.summary,
      projectTitle,
      projectMeta,
      page: `${window.location.pathname}${window.location.search}`,
    };
  }

  function localPreviewAnswer(question) {
    const title = activeAiContext.title;
    if (activeAiContextKey === "internship") {
      return `当前为本地预览。围绕“${question}”，可以先从这条经历主线理解：Olia 从 UI/UX、工业设计走向 FDE，在真实企业场景中参与方案、原型、Demo 与体验落地。部署后，这里会由 Dora 结合完整经历继续回答。`;
    }
    if (activeAiContextKey === "projects" || document.querySelector("#detail-title")) {
      return `当前为本地预览。这个问题关联「${title}」：${activeAiContext.summary} 部署后，Dora 会进一步结合项目材料、个人分工与结果证据回答。`;
    }
    return `当前为本地预览。围绕“${question}”，可以先这样认识 Olia：她是设计学背景的 AI 产品与体验设计者，关注真实业务、复杂协作与可落地体验。部署后，这里会由 Dora 结合完整简历与项目资料回答。`;
  }

  async function fetchDoraAnswer(question) {
    const response = await fetch(aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        conversationId,
        context: getPublicPageContext(),
        history: chatHistory.slice(0, -1).slice(-8),
      }),
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    if (!data || typeof data.answer !== "string" || !data.answer.trim()) throw new Error("AI response is empty");
    conversationId = data.conversationId || conversationId;
    return data.answer.trim();
  }

  async function askAi(question) {
    if (!question || aiIsReplying) return;
    aiIsReplying = true;
    followupsHost?.querySelectorAll("button").forEach((button) => button.setAttribute("disabled", ""));
    appendChatMessage("user", question);
    chatHistory.push({ role: "user", content: question });
    const loadingMessage = appendChatMessage("assistant", "", { loading: true });
    aiInput.disabled = true;
    aiForm?.querySelector("button")?.setAttribute("disabled", "");

    let answer;
    try {
      answer = await fetchDoraAnswer(question);
    } catch (error) {
      console.warn("Dora connection is not ready:", error);
      answer = localPreviewAnswer(question);
    } finally {
      loadingMessage?.remove();
      appendChatMessage("assistant", answer);
      chatHistory.push({ role: "assistant", content: answer });
      appendFollowups(question);
      aiIsReplying = false;
      aiInput.disabled = false;
      aiForm?.querySelector("button")?.removeAttribute("disabled");
      aiInput.focus();
    }
  }

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest(".js-ai-open");
    if (openButton) openPanel(openButton.dataset.context);
    if (event.target.closest(".js-ai-close")) closePanel();
    const suggestion = event.target.closest(".ai-suggestion");
    if (suggestion) askAi(suggestion.textContent.trim());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) closePanel();
  });

  aiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = aiInput.value.trim();
    if (!question) return aiInput.focus();
    aiInput.value = "";
    askAi(question);
  });

})();
