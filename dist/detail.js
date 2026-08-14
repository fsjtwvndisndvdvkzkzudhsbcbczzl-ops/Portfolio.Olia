(function () {
  const params = new URLSearchParams(window.location.search);
  const requestedSection = params.get("section");
  const primarySections = ["projects", "internships", "competitions", "experience", "about"];
  const activeSection = primarySections.includes(requestedSection)
    ? requestedSection
    : requestedSection === "education" ? "" : "projects";
  document.querySelectorAll("[data-nav-section]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navSection === activeSection);
  });
  const numberedPages = (directory, count, pad = 2) => Array.from(
    { length: count },
    (_, index) => `${directory}/page-${String(index + 1).padStart(pad, "0")}.jpg`,
  );
  const numberedAlt = (label, count) => Array.from(
    { length: count },
    (_, index) => `${label}第 ${index + 1} 页`,
  );
  const projectData = {
    investment: {
      meta: "AI 产品 / FDE",
      title: "投前智能评审 Agent",
      summary: "围绕真实投资评审流程组织多专业 Agent 协作，把分散资料逐步转化为有来源、有判断、有版本的投前结论。",
      clientLabel: "业务对象",
      client: "某大型投资集团",
      period: "2026.07 - 至今",
      stage: "已上线脱敏 Demo",
      role: "FDE 前沿部署工程师 / 核心项目成员",
      posters: ["assets/projects/investment/poster-front.png", "assets/projects/investment/poster-back.png"],
      posterAlt: ["投资项目智能评审项目展示第 1 页", "投资项目智能评审项目展示第 2 页"],
      mediaTitle: "投资项目智能评审 / 项目展示",
      demo: "https://fde-demo.fineres.com:3000/",
      demoLabel: "访问投资 Demo ↗",
    },
    presales: {
      meta: "AI 产品 / 海外 B2B",
      title: "方案内容营销 Agent",
      summary: "理解海外客户自然语言需求，完成案例推荐、询价确认与商机同步，形成从需求到销售跟进的完整链路。",
      clientLabel: "业务对象",
      client: "古德设计网",
      period: "2026 · 业务验证",
      stage: "已完成方案、交互原型与可运行 Demo",
      role: "功能设计 / Agent 分工 / 交互原型 / 视觉界面 / Demo 搭建与测试",
      posters: ["assets/projects/presales/poster-front.png", "assets/projects/presales/poster-back.png"],
      posterAlt: ["方案内容营销 Agent 项目展示第 1 页", "方案内容营销 Agent 项目展示第 2 页"],
      mediaTitle: "方案内容营销 / 项目展示",
      demo: "https://fde-demo.fineres.com:3006/",
      demoLabel: "访问 B2B 营销 Demo ↗",
    },
    "multi-agent": {
      meta: "人智交互 / 多智能体",
      title: "多智能体角色组合研究",
      summary: "比较教师与同伴、教练、导师三种 Agent 角色组合，研究角色清晰度如何影响信任、满意度、社会临场感与认知投入。",
      clientLabel: "研究对象",
      client: "在线知识服务中的多智能体协作体验",
      period: "2026 · 研究推进中",
      stage: "已完成实验网页与中文研究稿",
      role: "研究设计 / 实验网页 / 用户体验与 EEG 评测",
      posters: ["assets/projects/previews/multi-agent-study-overview.png"],
      posterAlt: ["多智能体角色组合研究的研究动机、实验设计与数据收集概览"],
      mediaTitle: "多智能体角色组合研究 / 项目展示",
      demo: "",
    },
    "virtual-coach": {
      meta: "人智交互 / 情感化设计",
      title: "虚拟教练幽默表达研究",
      summary: "把幽默视作虚拟教练的社会线索，研究四类幽默风格如何影响运动意愿、情感依恋与持续使用意愿。",
      clientLabel: "研究对象",
      client: "健身中断情境下的用户与虚拟教练互动",
      period: "2026 · 英文研究稿",
      stage: "英文研究稿已完成",
      role: "形式分析 / 数据整理 / 研究可视化 / 论文写作",
      posters: [],
      mediaTitle: "虚拟教练幽默表达研究 / 项目展示",
      demo: "",
    },
    airway: {
      meta: "科研 / 医疗产品体验",
      title: "气道清除系统",
      summary: "以护理人员连续完成排痰与吸痰任务时的认知负荷为切入点，提出排吸一体化的医疗产品与交互系统方案。",
      clientLabel: "研究对象",
      client: "护理人员的连续排痰与吸痰任务",
      period: "2024 - 2026",
      stage: "论文已获《设计》杂志录用",
      role: "论文独立一作 / 医疗产品与体验研究",
      posters: [
        "assets/projects/product-experience/airway/01.web.jpg",
        "assets/projects/product-experience/airway/02.web.jpg",
        "assets/projects/product-experience/airway/03.web.jpg",
        "assets/projects/product-experience/airway/04.web.jpg",
        "assets/projects/product-experience/airway/05.web.jpg",
        "assets/projects/product-experience/airway/06.web.jpg",
      ],
      posterAlt: ["气道清除系统展示第 1 页", "气道清除系统展示第 2 页", "气道清除系统展示第 3 页", "气道清除系统展示第 4 页", "气道清除系统展示第 5 页", "气道清除系统展示第 6 页"],
      mediaTitle: "气道清除系统 / 项目展示",
      demo: "",
    },
    reboo: {
      meta: "产品体验 / 健身",
      title: "reboo 健身",
      summary: "围绕健身行为、产品服务与体验表达展开的智能健身产品设计。",
      clientLabel: "项目对象",
      client: "健身场景中的产品与服务体验",
      period: "产品设计项目",
      stage: "已完成项目设计与展示",
      role: "产品研究 / 体验设计 / 视觉表达",
      posters: [
        "assets/projects/product-experience/reboo/01.web.jpg",
        "assets/projects/product-experience/reboo/02.web.jpg",
        "assets/projects/product-experience/reboo/03.web.jpg",
        "assets/projects/product-experience/reboo/04.web.jpg",
        "assets/projects/product-experience/reboo/05.web.jpg",
        "assets/projects/product-experience/reboo/06.web.jpg",
      ],
      posterAlt: ["REBOO 健身展示第 1 页", "REBOO 健身展示第 2 页", "REBOO 健身展示第 3 页", "REBOO 健身展示第 4 页", "REBOO 健身展示第 5 页", "REBOO 健身展示第 6 页"],
      mediaTitle: "reboo 健身 / 项目展示",
      demo: "",
    },
    "grass-service": {
      meta: "产品体验 / 可持续服务",
      title: "以草代珍可持续交互服务",
      summary: "围绕材料替代与可持续行为建立交互服务方案，把环境议题转化为公众可以理解并参与的服务体验。",
      clientLabel: "项目对象",
      client: "可持续材料替代与公众参与服务",
      period: "可持续服务设计项目",
      stage: "已完成服务方案与场景表达",
      role: "可持续研究 / 服务设计 / 交互体验",
      posters: [
        "assets/projects/product-experience/grass-service/01.web.jpg",
        "assets/projects/product-experience/grass-service/02.web.jpg",
        "assets/projects/product-experience/grass-service/03.web.jpg",
        "assets/projects/product-experience/grass-service/04.web.jpg",
        "assets/projects/product-experience/grass-service/05.web.jpg",
        "assets/projects/product-experience/grass-service/06.web.jpg",
      ],
      posterAlt: ["以草代珍可持续交互服务展示第 1 页", "以草代珍可持续交互服务展示第 2 页", "以草代珍可持续交互服务展示第 3 页", "以草代珍可持续交互服务展示第 4 页", "以草代珍可持续交互服务展示第 5 页", "以草代珍可持续交互服务展示第 6 页"],
      mediaTitle: "以草代珍可持续交互服务 / 项目展示",
      demo: "",
    },
    "rescue-scissors": {
      meta: "产品体验 / 工业设计",
      title: "动物救援剪刀设计",
      summary: "面向动物救援操作重新定义专用工具的结构、握持方式与使用体验。",
      clientLabel: "项目对象",
      client: "动物救援人员与特殊救援操作",
      period: "工业设计项目",
      stage: "已完成产品方案与三维表达",
      role: "场景研究 / 产品定义 / 工业设计",
      posters: [
        "assets/projects/product-experience/rescue-scissors/01.web.jpg",
        "assets/projects/product-experience/rescue-scissors/02.web.jpg",
        "assets/projects/product-experience/rescue-scissors/03.web.jpg",
        "assets/projects/product-experience/rescue-scissors/04.web.jpg",
        "assets/projects/product-experience/rescue-scissors/05.web.jpg",
        "assets/projects/product-experience/rescue-scissors/06.web.jpg",
        "assets/projects/product-experience/rescue-scissors/07.web.jpg",
        "assets/projects/product-experience/rescue-scissors/08.web.jpg",
        "assets/projects/product-experience/rescue-scissors/09.web.jpg",
        "assets/projects/product-experience/rescue-scissors/10.web.jpg",
      ],
      posterAlt: ["动物救援剪刀展示第 1 页", "动物救援剪刀展示第 2 页", "动物救援剪刀展示第 3 页", "动物救援剪刀展示第 4 页", "动物救援剪刀展示第 5 页", "动物救援剪刀展示第 6 页", "动物救援剪刀展示第 7 页", "动物救援剪刀展示第 8 页", "动物救援剪刀展示第 9 页", "动物救援剪刀展示第 10 页"],
      mediaTitle: "动物救援剪刀设计 / 项目展示",
      demo: "",
    },
    "safety-helmet": {
      meta: "产品体验 / 安全装备",
      title: "地铁接触网工防护头盔",
      summary: "围绕地铁接触网作业中的高风险环境，建立兼顾防护、识别与佩戴体验的专业头盔方案。",
      clientLabel: "项目对象",
      client: "地铁接触网作业人员",
      period: "安全装备设计项目",
      stage: "已完成产品方案与三维表达",
      role: "用户研究 / 产品定义 / 工业设计",
      posters: [
        "assets/projects/product-experience/safety-helmet/01.web.jpg",
        "assets/projects/product-experience/safety-helmet/02.web.jpg",
        "assets/projects/product-experience/safety-helmet/03.web.jpg",
        "assets/projects/product-experience/safety-helmet/04.web.jpg",
        "assets/projects/product-experience/safety-helmet/05.web.jpg",
        "assets/projects/product-experience/safety-helmet/06.web.jpg",
        "assets/projects/product-experience/safety-helmet/07.web.jpg",
        "assets/projects/product-experience/safety-helmet/08.web.jpg",
      ],
      posterAlt: ["地铁接触网工防护头盔展示第 1 页", "地铁接触网工防护头盔展示第 2 页", "地铁接触网工防护头盔展示第 3 页", "地铁接触网工防护头盔展示第 4 页", "地铁接触网工防护头盔展示第 5 页", "地铁接触网工防护头盔展示第 6 页", "地铁接触网工防护头盔展示第 7 页", "地铁接触网工防护头盔展示第 8 页"],
      mediaTitle: "地铁接触网工防护头盔 / 项目展示",
      demo: "",
    },
    hoyoyo: {
      meta: "设计实践 / IP 文创",
      title: "HOYOYO 探古记",
      summary: "将国家考古遗址公园文化、生肖祝福与 HOYOYO IP 转化为潮玩、明信片和包装组成的收藏型文创套装。",
      clientLabel: "业务对象",
      client: "中国邮政文创项目",
      period: "2026.07",
      stage: "中国邮政文创招投标方案已提交",
      role: "主要项目贡献成员 / 潮玩设计与包装设计",
      posters: numberedPages("assets/projects/hoyoyo/proposal", 20),
      posterAlt: numberedAlt("HOYOYO 探古记文创提案", 20),
      mediaTitle: "HOYOYO 探古记 / 项目展示",
      demo: "",
    },
    manas: {
      meta: "文化视觉 / 数智文化",
      title: "“玛纳斯”史诗数智文化桌游",
      summary: "将《玛纳斯》史诗中的英雄精神、地域资源与部落协作转化为桌游规则，并探索 AR 与手机互动连接非遗传播。",
      clientLabel: "项目对象",
      client: "《玛纳斯》史诗的青年化传播",
      period: "2024 - 2025",
      stage: "完成实体原型并获全国一等奖",
      role: "文化研究 / 机制设计 / 视觉表达 / 展示协作",
      mediaSets: [
        {
          label: "游戏手册",
          title: "“玛纳斯”史诗数智文化桌游 / 游戏手册",
          sources: numberedPages("assets/projects/manas/handbook", 9, 1),
          alt: numberedAlt("“玛纳斯”史诗桌游游戏手册", 9),
        },
        {
          label: "游戏介绍",
          title: "“玛纳斯”史诗数智文化桌游 / 游戏介绍",
          sources: numberedPages("assets/projects/manas/introduction", 16),
          alt: numberedAlt("“玛纳斯”主题文化桌游介绍", 16),
        },
      ],
      posters: [],
      mediaTitle: "“玛纳斯”史诗数智文化桌游 / 项目展示",
      demo: "",
    },
    admission: {
      meta: "文化视觉 / 校园设计",
      title: "武汉大学研究生录取通知书",
      summary: "以珞珈四时景与武大古建筑群为文化母题，通过水蓝、芽黄和传统纹样建立清新典雅的录取通知书视觉系统。",
      clientLabel: "发布方",
      client: "武汉大学",
      period: "2024",
      stage: "已正式发布并投入录取使用",
      role: "团队设计成员 / 视觉系统与版式设计",
      posters: [
        "assets/projects/admission/01-luojia-four-seasons.png",
        "assets/projects/admission/02-product-photo.jpg",
        "assets/projects/admission/03-notice-front.jpg",
        "assets/projects/admission/04-notice-back.jpg",
      ],
      posterAlt: [
        "武汉大学研究生录取通知书珞珈四时设计页",
        "武汉大学研究生录取通知书实物拍摄全景",
        "武汉大学研究生录取通知书正面",
        "武汉大学研究生录取通知书背面",
      ],
      mediaTitle: "武汉大学研究生录取通知书 / 项目展示",
      demo: "",
    },
    "luojia-packaging": {
      meta: "文化视觉 / 包装",
      title: "珞珈十三景文创礼盒",
      summary: "围绕武汉大学建筑与校园景观，完成笔绘群像、文创礼盒与系列包装设计。",
      clientLabel: "项目对象",
      client: "武汉大学建筑与校园文化",
      period: "2022",
      stage: "已完成系列视觉与文创礼盒设计",
      role: "视觉设计 / 插画表达 / 包装设计",
      posters: [
        "assets/projects/luojia-packaging/01-gift-set.jpg",
        "assets/projects/luojia-packaging/02-product-poster.png",
        "assets/projects/luojia-packaging/03-detail-photo.jpg",
        "assets/projects/luojia-packaging/04-sales-poster.jpg",
      ],
      posterAlt: [
        "珞珈十三景文创礼盒全套展示",
        "珞珈十三景中秋礼盒产品海报",
        "珞珈十三景文创产品实物细节",
        "珞珈十三景文创礼盒销售长图",
      ],
      mediaTitle: "珞珈十三景文创礼盒 / 项目展示",
      demo: "",
    },
    "humanoid-book": {
      meta: "数智设计 / 专著研究",
      title: "人形机造型数智设计",
      summary: "围绕人形机器人造型、工业设计与生成式人工智能的协同方法，整理从创意到量产的数智设计工作流。",
      clientLabel: "出版单位",
      client: "武汉大学出版社",
      period: "数智设计研究",
      stage: "专著已成书",
      role: "专著研究与章节内容参与",
      posters: ["assets/projects/previews/humanoid-book-overview.png"],
      posterAlt: ["《人形机造型数智设计》专著与内容概览"],
      mediaTitle: "人形机造型数智设计 / 项目展示",
      demo: "",
    },
  };

  if (document.querySelector("#detail-title")) {
    const requestedCase = params.get("case") || "investment";
    const data = projectData[requestedCase] || projectData.investment;
    const enlargedDefaultCases = new Set([
      "airway",
      "reboo",
      "grass-service",
      "rescue-scissors",
      "safety-helmet",
      "admission",
      "hoyoyo",
      "luojia-packaging",
    ]);
    const defaultZoom = enlargedDefaultCases.has(requestedCase) ? 1.1 : 1;
    const returnCategory = params.get("from");
    const returnProject = params.get("project") || requestedCase;
    const backLink = document.querySelector(".case-back");
    if (backLink && returnCategory) {
      const backParams = new URLSearchParams({
        section: "projects",
        category: returnCategory,
        project: returnProject,
      });
      backLink.href = `explore.html?${backParams.toString()}`;
    }
    document.querySelector("#detail-meta").textContent = data.meta;
    document.querySelector("#detail-title").textContent = data.title;
    document.querySelector("#detail-summary").textContent = data.summary;
    document.querySelector("#detail-stage").textContent = data.stage;
    document.querySelector("#detail-client-label").textContent = data.clientLabel || "项目对象";
    document.querySelector("#detail-client").textContent = data.client;
    document.querySelector("#detail-period").textContent = data.period;
    document.querySelector("#detail-role").textContent = data.role;
    document.querySelector("#detail-media-title").textContent = data.mediaTitle;

    const demoLink = document.querySelector("#detail-demo-link");
    if (data.demo) {
      demoLink.href = data.demo;
      demoLink.textContent = data.demoLabel || "体验脱敏 Demo ↗";
    } else {
      demoLink.hidden = true;
    }

    const poster = document.querySelector("#detail-poster");
    const pdfFrame = document.querySelector("#detail-pdf");
    const posterCanvas = document.querySelector("#detail-poster-canvas");
    const posterStage = document.querySelector("#case-poster-stage");
    const posterPage = document.querySelector("#detail-poster-page");
    const mediaEmpty = document.querySelector("#detail-media-empty");
    const viewerTools = document.querySelector(".case-viewer-tools");
    const previousPage = document.querySelector("#detail-page-prev");
    const nextPage = document.querySelector("#detail-page-next");
    const zoomOut = document.querySelector("#detail-zoom-out");
    const zoomReset = document.querySelector("#detail-zoom-reset");
    const zoomIn = document.querySelector("#detail-zoom-in");
    const zoomValue = document.querySelector("#detail-zoom-value");
    const mediaSwitch = document.querySelector("#detail-media-switch");
    const mediaSets = Array.isArray(data.mediaSets) ? data.mediaSets : [];
    let activeMediaSet = 0;
    let activeMedia = 0;
    let zoom = defaultZoom;
    let mediaSources = mediaSets.length
      ? mediaSets[0].sources
      : Array.isArray(data.posters) ? data.posters : [];
    let mediaAlt = mediaSets.length
      ? mediaSets[0].alt
      : Array.isArray(data.posterAlt) ? data.posterAlt : [];

    if (!mediaSources.length) {
      poster.hidden = true;
      pdfFrame.hidden = true;
      posterCanvas.hidden = true;
      mediaEmpty.hidden = false;
      viewerTools.hidden = true;
      posterStage.classList.add("is-empty");
      posterStage.removeAttribute("tabindex");
      posterStage.setAttribute("aria-label", `${data.title} 项目展示`);
    }

    const applyZoom = () => {
      const fittedWidth = Math.max(260, Math.min(720, posterStage.clientWidth - 48));
      posterCanvas.style.setProperty("--viewer-width", `${Math.round(fittedWidth * zoom)}px`);
      posterCanvas.style.setProperty("--viewer-pdf-height", `${Math.round(fittedWidth * zoom * 1.414)}px`);
      zoomValue.textContent = `${Math.round(zoom * 100)}%`;
      zoomOut.disabled = zoom <= .6;
      zoomIn.disabled = zoom >= 2.4;
    };

    const setZoom = (nextZoom) => {
      zoom = Math.min(2.4, Math.max(.6, Math.round(nextZoom * 10) / 10));
      applyZoom();
    };

    const setMedia = (index) => {
      if (!mediaSources.length) return;
      activeMedia = (index + mediaSources.length) % mediaSources.length;
      posterStage.classList.add("is-changing");
      window.setTimeout(() => {
        const source = mediaSources[activeMedia];
        const isPdf = /\.pdf(?:$|[?#])/i.test(source);
        poster.hidden = isPdf;
        pdfFrame.hidden = !isPdf;
        if (isPdf) {
          pdfFrame.src = `${source}#page=1&view=FitH`;
        } else {
          poster.src = source;
          poster.alt = mediaAlt[activeMedia] || `${data.title} 项目页面 ${activeMedia + 1}`;
        }
        posterPage.textContent = `${String(activeMedia + 1).padStart(2, "0")} / ${String(mediaSources.length).padStart(2, "0")}`;
        previousPage.disabled = mediaSources.length < 2;
        nextPage.disabled = mediaSources.length < 2;
        posterStage.scrollTop = 0;
        posterStage.scrollLeft = 0;
        posterStage.classList.remove("is-changing");
      }, 110);
    };
    if (mediaSources.length) {
      previousPage.addEventListener("click", () => setMedia(activeMedia - 1));
      nextPage.addEventListener("click", () => setMedia(activeMedia + 1));
      zoomOut.addEventListener("click", () => setZoom(zoom - .1));
      zoomIn.addEventListener("click", () => setZoom(zoom + .1));
      zoomReset.addEventListener("click", () => setZoom(defaultZoom));
      posterStage.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") setMedia(activeMedia - 1);
        if (event.key === "ArrowRight") setMedia(activeMedia + 1);
        if (["+", "="].includes(event.key)) setZoom(zoom + .1);
        if (event.key === "-") setZoom(zoom - .1);
        if (event.key === "0") setZoom(defaultZoom);
      });
      window.addEventListener("resize", applyZoom, { passive: true });
      applyZoom();
      setMedia(0);
    }

    if (mediaSets.length > 1) {
      mediaSwitch.hidden = false;
      mediaSets.forEach((set, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = set.label;
        button.classList.toggle("is-active", index === 0);
        button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
        button.addEventListener("click", () => {
          if (index === activeMediaSet) return;
          activeMediaSet = index;
          mediaSources = set.sources;
          mediaAlt = set.alt;
          activeMedia = 0;
          zoom = defaultZoom;
          document.querySelector("#detail-media-title").textContent = set.title;
          mediaSwitch.querySelectorAll("button").forEach((item, itemIndex) => {
            const isActive = itemIndex === index;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
          applyZoom();
          setMedia(0);
        });
        mediaSwitch.appendChild(button);
      });
      document.querySelector("#detail-media-title").textContent = mediaSets[0].title;
    }
    document.title = `${data.title} | Olia.Shuyu`;
  }

  const exploreRoot = document.querySelector("#explore-list");
  if (exploreRoot) {
    const projectCatalog = [
      {
        id: "investment",
        type: "AI 产品 · FDE",
        title: "投前智能评审 Agent",
        period: "2026.07 - 至今",
        summary: "面向某大型投资集团的投前研判场景，组织多专业 Agent 协作，将分散材料转化为有来源、有判断、有版本的评审结论。",
        role: "方案设计 · Demo 设计 · 前端体验 · MCP 数据库 · 测试",
        caption: "多专家协作完成投前研究、质询与报告修订。",
        tone: "investment",
        image: "assets/projects/previews/investment-overview.jpg",
        imagePosition: "center top",
        imageSize: "auto 100%",
        imageSurface: "#f3f6ff",
        detailCase: "investment",
      },
      {
        id: "presales",
        type: "AI 产品 · 内容营销",
        title: "方案内容营销 Agent",
        period: "2026 · 业务验证",
        summary: "基于古德设计网真实业务，理解海外客户需求，完成案例推荐、询价确认与商机同步，验证从需求到销售跟进的完整链路。",
        role: "功能设计 · Agent 分工 · 交互原型 · 视觉界面 · Demo 搭建与测试",
        caption: "让海外客户需求更快进入案例匹配与销售跟进。",
        tone: "presales",
        image: "assets/projects/previews/presales-conversation.jpg",
        imagePosition: "center top",
        imageSize: "auto 100%",
        imageSurface: "#eff8f4",
        detailCase: "presales",
      },
      {
        id: "multi-agent",
        type: "人智交互 · 多智能体",
        title: "多智能体角色组合研究",
        period: "2026 · 研究稿",
        summary: "比较教师与同伴、教练、导师三种 Agent 角色组合，研究角色清晰度如何影响用户信任、满意度、社会临场感与认知投入。",
        role: "研究设计 · 网页实验 · 用户体验与 EEG 评测",
        caption: "从角色分工出发，验证多 Agent 协作中的体验差异。",
        tone: "teaching",
        image: "assets/projects/previews/multi-agent-study-overview.png",
        imagePosition: "left center",
        imageSize: "auto 100%",
        imageSurface: "#f7f9fd",
        detailCase: "multi-agent",
      },
      {
        id: "virtual-coach",
        type: "人智交互 · 情感化设计",
        title: "虚拟教练幽默表达研究",
        period: "2026 · 英文研究稿",
        summary: "以健身任务失败为情境，比较四种幽默风格如何通过感知愉悦和情感依恋影响运动意愿与持续使用意愿。",
        role: "数据分析 · 数据整理 · 研究可视化 · 论文写作",
        caption: "研究不同幽默风格如何改变人与虚拟教练的关系。",
        tone: "coach",
        image: "assets/projects/previews/virtual-coach-interface.jpg",
        imagePosition: "50% center",
        detailCase: "virtual-coach",
      },
      {
        id: "humanoid-book",
        type: "数智设计 · 专著研究",
        title: "人形机造型数智设计",
        period: "数智设计研究",
        summary: "围绕人形机器人造型、工业设计与生成式人工智能的协同方法，整理从创意到量产的数智设计工作流。",
        role: "专著研究 · 章节内容参与",
        caption: "连接人形机造型、生成式 AI 与全产业链设计方法。",
        tone: "publication",
        image: "assets/projects/previews/humanoid-book-overview.png",
        imagePosition: "left center",
        imageSize: "auto 100%",
        imageSurface: "#f4f8fb",
        detailCase: "humanoid-book",
      },
      {
        id: "airway",
        type: "产品体验 · 医疗",
        title: "气道清除系统",
        period: "2024 - 2026",
        summary: "以护理人员连续完成排痰与吸痰任务时的认知负荷为切入点，提出排吸一体化的医疗产品与交互系统方案。",
        role: "场景研究 · 产品定义 · 工业设计 · 交互界面",
        caption: "将临床连续任务转化为完整的软硬件产品体验。",
        tone: "medical",
        image: "assets/projects/previews/airway-product.jpg",
        imagePosition: "82% center",
        imageSize: "auto 132%",
        detailCase: "airway",
      },
      {
        id: "reboo",
        type: "产品体验 · 健身",
        title: "reboo 健身",
        period: "产品设计项目",
        summary: "围绕健身行为、产品服务与体验表达展开的智能健身产品设计。",
        role: "产品研究 · 体验设计 · 视觉表达",
        caption: "健身行为、产品服务与体验表达。",
        tone: "fitness",
        image: "assets/projects/previews/reboo-product.jpg",
        imagePosition: "48% top",
        imageSize: "auto 132%",
        detailCase: "reboo",
      },
      {
        id: "grass-service",
        type: "产品体验 · 可持续服务",
        title: "以草代珍可持续交互服务",
        period: "可持续服务设计项目",
        summary: "围绕材料替代与可持续行为建立交互服务方案，把环境议题转化为公众可参与的体验。",
        role: "可持续研究 · 服务设计 · 交互体验",
        caption: "把可持续材料议题转化为可参与的服务体验。",
        tone: "ecology",
        image: "assets/projects/previews/grass-service-space.jpg",
        imagePosition: "76% center",
        imageSize: "auto 128%",
        detailCase: "grass-service",
      },
      {
        id: "rescue-scissors",
        type: "产品体验 · 工业设计",
        title: "动物救援剪刀设计",
        period: "工业设计项目",
        summary: "面向动物救援操作重新定义专用工具的结构、握持方式与使用体验。",
        role: "场景研究 · 产品定义 · 工业设计",
        caption: "为特殊救援动作重新定义工具结构与握持体验。",
        tone: "rescue",
        image: "assets/projects/previews/rescue-scissors-main.png",
        imagePosition: "left center",
        imageSize: "cover",
        detailCase: "rescue-scissors",
      },
      {
        id: "safety-helmet",
        type: "产品体验 · 安全装备",
        title: "地铁接触网工防护头盔",
        period: "安全装备设计项目",
        summary: "面向地铁接触网作业人员的高风险环境，建立兼顾防护、识别与佩戴体验的专业头盔方案。",
        role: "用户研究 · 产品定义 · 工业设计",
        caption: "围绕高风险作业建立防护、识别与佩戴体验。",
        tone: "industrial",
        image: "assets/projects/previews/safety-helmet-render-main.png",
        imagePosition: "right center",
        imageSize: "cover",
        detailCase: "safety-helmet",
      },
      {
        id: "hoyoyo",
        type: "文化视觉 · IP 文创",
        title: "HOYOYO 探古记",
        period: "2026.07",
        summary: "面向中国邮政招投标场景，将国家考古遗址公园文化与 HOYOYO IP 结合，完成可销售、可收藏的文创套装方案。",
        role: "文化研究 · 产品定位 · 套装组合 · IP 造型 · 包装与效果图",
        caption: "考古文化、生肖叙事与潮玩产品的一体化表达。",
        tone: "hoyoyo",
        image: "assets/projects/previews/hoyoyo-character.jpg",
        imagePosition: "50% center",
        detailCase: "hoyoyo",
      },
      {
        id: "manas",
        type: "文化视觉 · 数智文化",
        title: "“玛纳斯”史诗数智文化桌游",
        period: "2025",
        summary: "将非遗史诗转化为可学习、可协作的桌游机制与数字互动体验，探索传统文化的年轻化传播。",
        role: "文化研究 · 机制设计 · 视觉表达 · 展示协作",
        caption: "用桌游机制与数字互动重构史诗文化体验。",
        tone: "heritage",
        image: "assets/projects/previews/manas-board-game.jpg",
        imagePosition: "50% center",
        detailCase: "manas",
      },
      {
        id: "admission",
        type: "文化视觉 · 校园设计",
        title: "武汉大学研究生录取通知书",
        period: "2024",
        summary: "参与武汉大学 2024 年研究生录取通知书设计，把校园文化、视觉识别与入学仪式感连接起来。",
        role: "团队设计 · 视觉系统与版式设计",
        caption: "以校园文化建立新生与武汉大学的第一份连接。",
        tone: "campus",
        image: "assets/projects/previews/admission-notice-artwork.jpg",
        imagePosition: "50% center",
        detailCase: "admission",
      },
      {
        id: "luojia-packaging",
        type: "文化视觉 · 包装",
        title: "珞珈十三景文创礼盒",
        period: "2022",
        summary: "围绕武汉大学建筑与校园景观，完成笔绘群像、文创礼盒与系列包装设计。",
        role: "视觉设计 · 插画表达 · 包装设计",
        caption: "把珞珈校园建筑转化为可收藏的视觉文化载体。",
        tone: "packaging",
        image: "assets/projects/previews/luojia-packaging.jpg",
        imagePosition: "50% center",
        detailCase: "luojia-packaging",
      },
    ];

    const projectGroups = {
      ai: ["investment", "presales"],
      product: ["airway", "reboo", "grass-service", "rescue-scissors", "safety-helmet"],
      culture: ["hoyoyo", "manas", "admission", "luojia-packaging"],
      hai: ["multi-agent", "virtual-coach", "humanoid-book"],
    };

    const projectGroupLabels = {
      ai: "AI PRODUCTS",
      product: "PRODUCT EXPERIENCE",
      culture: "CULTURAL & VISUAL",
      hai: "HUMAN-AI INTERACTION",
    };

    const projectById = new Map(projectCatalog.map((item) => [item.id, item]));
    const sections = {
      projects: {
        title: "项目全景",
        summary: "从企业智能体、人智交互到产品体验与文化创新。",
        layout: "project-showcase",
        items: projectCatalog,
      },
      experience: {
        title: "学生工作与公共实践",
        summary: "从校级组织管理到县域青年工作、班级建设、公益服务与公众传播。",
        layout: "internship-list",
        scrollable: true,
        honors: {
          title: "奖学金与荣誉",
          summary: "持续的学业表现、组织贡献与公共服务记录。",
          certificates: [
            { year: "2021", label: "优秀学生", image: "assets/honors/2021-outstanding-student.png" },
            { year: "2022", label: "三好学生", image: "assets/honors/2022-three-good-student.png" },
            { year: "2022", label: "优秀学生干部", image: "assets/honors/2022-outstanding-student-cadre.png" },
            { year: "2023", label: "优秀学生干部", image: "assets/honors/2023-outstanding-student-cadre.png" },
          ],
          records: [
            { year: "2021", title: "武汉大学乙等奖学金 · 三好学生 · 社团活动积极分子", note: "" },
            { year: "2022", title: "武汉大学乙等奖学金 · 三好学生 · 优秀学生干部", note: "" },
            { year: "2023", title: "武汉大学丙等奖学金 · 优秀学生 · 优秀学生干部", note: "" },
            { year: "2024", title: "城市设计学院优秀本科毕业生", note: "" },
            { year: "2026", title: "武汉大学树人奖学金", note: "全校 20 人" },
          ],
        },
        items: [
          {
            period: "2025.06 - 2026.06",
            company: "武汉大学校团委",
            position: "兼职团干部-武汉大学团委学生社团指导中心主任",
            duty: "全校校级及院级社团干部统筹管理。负责学生骨干招录分工、干部培养、组织考核及日常管理；统筹大型校园文化活动、组内团建、组织评优等专项工作与人员调配。管理学生社团指导中心骨干 290+ 人；2025 年校级社团联合招新协调参展社团 100 个，宣传推文获转 1800 余次、阅读 1.1w，当日人流量 2w 余人。",
          },
          {
            period: "2025.06 - 2026.06",
            company: "湖北省恩施州鹤峰县团委",
            position: "兼职副书记",
            duty: "负责县域青年人事联络、青年关系维护、团队组织建设及团建活动统筹。牵头“土家韵里 缘聚鹤峰”七夕主题活动，联动县域商家、基层干部及高校团队对接。开展多场县域“青年夜校”日常活动，累计覆盖基层群众及青年学生 3000+ 人次。",
          },
          {
            period: "2025.09 - 2026.06",
            company: "武汉大学城市设计学院<br>2024级硕士设计班",
            position: "班长 & 团支书",
            duty: "负责硕士班团支部建设与日常团务，配合学院推进党员发展，班内两名入党积极分子顺利发展为预备党员。累计传达课程、活动、材料、就业及离返校等通知 150+ 次，并在极端天气等关键节点逐一确认同学安全与实际需求。推动班级专业发展与成果孵化，班内 3 人次获校级荣誉，2 名同学获第二届“文化中国”大赛全国一等奖。",
          },
          {
            period: "2026.01 - 02",
            company: "武汉大学寒假“爱心托管班”社会实践",
            position: "项目负责人",
            duty: "开展武汉大学寒假“爱心托管”公益活动，负责志愿者团队招募、人员排班、学员管理。累计开展寒假爱心点位 5 个，系列公益活动 15 余天，服务儿童共计 150 余人次。",
          },
          {
            period: "2024.09 - 2025.06",
            company: "“武大选调”官方校园公众号",
            position: "运营小编",
            duty: "负责武大选调相关新媒体宣传运营。负责组织活动纪实、榜样人物宣传、内部文化建设文案编辑，全年累计产出宣传及主题推文 20+ 篇。",
          },
          {
            period: "2022.09 - 2023.06",
            company: "武汉大学学生社团指导中心",
            position: "品牌活动运营组负责人",
            duty: "负责举办武汉大学百团大战、樱花诗赛、樱花笔会等特色品牌文化活动。",
          },
          {
            period: "2021.09 - 2022.06",
            company: "武汉大学城市设计学院团委组织部",
            position: "部长",
            duty: "负责城市设计学院全院智慧团建平台维护、团日活动开展与团学引领等工作。",
          },
        ],
      },
      competitions: {
        title: "竞赛经历",
        summary: "国家级奖项 8 项、省级奖项 20+ 项，主要集中在产品、数字设计与文化创新。",
        layout: "competition-carousel",
        items: [
          {
            title: "第二届中国研究生“文化中国”两创大赛",
            award: "一等奖",
            year: "2025.12",
            image: "assets/certificates/web/culture-china-first-prize.png",
            summary: "作品《玛纳斯数智桌游》 · 团队成员：时心怡、郑淑玉、何雨暄、张御、许迪 · 指导教师：谢梦云、肖波",
          },
          {
            title: "第十六届蓝桥杯全国软件和信息技术专业人才大赛",
            award: "全国总决赛一等奖",
            year: "2025.07",
            image: "assets/certificates/web/lanqiao-vitabreathe-first-prize.jpg",
            summary: "视觉艺术设计赛・工业产品设计非命题组 · 作品《VitaBreathe 临床气道清除系统》 · 团队成员：黄舒涵、郑淑玉 · 指导老师：邓俊",
          },
          {
            title: "米兰设计周中国高校设计学科师生优秀作品展",
            award: "全国决赛二等奖",
            year: "2025.06",
            image: "assets/certificates/web/milan-design-week-second-prize.jpg",
            summary: "非命题赛场（图片类）· 作品《高频全胸震动排吸痰系统设计》 · 作者：郑淑玉、黄尔卓 · 指导老师：邓俊",
          },
          {
            title: "第十二届未来设计师・全国高校数字艺术设计大赛",
            award: "全国总决赛二等奖",
            year: "2024.08",
            image: "assets/certificates/web/ncda-2024-national-second-chest-clearance.jpg",
            summary: "工业产品设计 · 作品《高频全胸震动排吸痰系统设计》 · 作者：黄尔卓、郑淑玉 · 指导老师：邓俊、杨青",
          },
          {
            title: "第十二届未来设计师・全国高校数字艺术设计大赛",
            award: "湖北赛区三等奖",
            year: "2024.08",
            image: "assets/certificates/web/ncda-2024-hubei-third-reboo.jpg",
            summary: "工业产品设计 · 作品《REBOO——智能健身品牌产品设计》 · 作者：袁佳俊、郑淑玉、黄尔卓 · 指导老师：邓俊、杨青",
          },
          {
            title: "第十二届未来设计师・全国高校数字艺术设计大赛",
            award: "湖北赛区三等奖",
            year: "2024.08",
            image: "assets/certificates/web/ncda-2024-hubei-third-helmet.jpg",
            summary: "工业产品设计 · 作品《地铁接触网工防护头盔设计》 · 作者：郑淑玉 · 指导老师：邓俊",
          },
          {
            title: "第十六届中国大学生计算机设计大赛",
            award: "二等奖",
            year: "2023.07 - 08",
            image: "assets/certificates/web/computer-design-2023-second.jpg",
            orientation: "landscape",
            summary: "作品《以草代珍——基于孙思邈中医动物保护精神的可持续交互设计》 · 作者：郑淑玉、井义正 · 指导教师：黄敏、姜敏",
          },
          {
            title: "第十一届未来设计师・全国高校数字艺术设计大赛",
            award: "湖北赛区三等奖",
            year: "2023.08",
            image: "assets/certificates/web/ncda-clock-hubei-third-2023.jpg",
            summary: "视觉传达设计 · 作品《“本草” Clock 专注时钟助手》 · 作者：井义正、郑淑玉 · 指导老师：姜敏",
          },
          {
            title: "第十一届未来设计师・全国高校数字艺术设计大赛",
            award: "湖北赛区三等奖",
            year: "2023.08",
            image: "assets/certificates/web/ncda-dental-hubei-third-2023.jpg",
            summary: "工业产品设计 · 作品《齿间——智慧清洁口腔护理套装》 · 作者：郑淑玉、黄尔卓、袁佳俊 · 指导老师：邓俊",
          },
          {
            title: "第八届“两岸新锐设计竞赛・华灿奖”",
            award: "华中赛区二等奖",
            year: "2023.05",
            image: "assets/certificates/web/huacan-2022-central-second.jpg",
            orientation: "landscape",
            summary: "作品《齿间——智慧口腔清洁护理套装》 · 团队成员：郑淑玉、黄尔卓、姚昊敏睿、吴迪恒、袁佳俊",
          },
          {
            title: "第十四届蓝桥杯全国软件和信息技术专业人才大赛",
            award: "湖北赛区二等奖",
            year: "2023.06",
            image: "assets/certificates/web/lanqiao-ui-hubei-second-2023.jpg",
            summary: "视觉艺术设计赛・UI 设计类（APP）· 作品《花间——让每个人都成为花艺师》",
          },
          {
            title: "第十五届“高教杯”全国大学生先进成图技术与产品信息建模创新大赛",
            award: "机械类个人全能二等奖",
            year: "2022.08",
            image: "assets/certificates/web/advanced-graphics-2022-second.jpg",
            summary: "获奖者：郑淑玉 · 指导教师：陈俊昊、刘丽萍、刘天祺、夏唯",
          },
          {
            title: "“淮味千年”品牌农产品包装设计大赛",
            award: "银奖",
            year: "2022.06",
            image: "assets/certificates/web/packaging-silver-2022.jpg",
            orientation: "landscape",
            summary: "品牌农产品包装设计 · 获奖者：郑淑玉",
          },
          {
            title: "武汉大学第一届校园文创大赛",
            award: "一等奖",
            year: "2022.03",
            image: "assets/certificates/web/campus-cultural-creation-first-2022.jpg",
            summary: "作品《笔绘珞珈——武大建筑群像系列产品》 · 团队成员：刘嘉铭、井义正、唐佳伊、郑淑玉、时心怡",
          },
          {
            title: "第十四届“高教杯”全国大学生先进成图技术与产品信息建模创新大赛",
            award: "机械类个人全能二等奖",
            year: "2021.07",
            image: "assets/certificates/web/advanced-graphics-2021-second.jpg",
            summary: "获奖者：郑淑玉 · 指导教师：詹平、刘丽萍、赵鹏程、谢博能",
          },
        ],
      },
      internships: {
        title: "实习经历",
        summary: "从 UI/UX、工业设计走向企业 AI 产品与 FDE 落地。",
        layout: "internship-list",
        items: [
          {
            period: "2026.07 - 2026.10",
            company: "帆软软件有限公司",
            position: "FDE 前沿部署工程师",
            duty: "参与投前智能评审 Agent、方案内容营销 Agent 与壁仞科技 CEO 经营看板等真实业务项目；负责方案与 Demo 设计、前端体验、MCP 数据库、AI 定时任务及产品测试。",
          },
          {
            period: "2025.07 - 09",
            company: "深圳喜事文化传媒有限公司",
            position: "统筹",
            duty: "负责央视纪录片《喜事》第二季的演员统筹、档期协调等工作。该片已上线腾讯视频、央视频、中文国际频道等平台。",
            link: "https://v.qq.com/x/cover/mzc00200wcdzvz6/n4101s1ycgp.html",
            linkLabel: "观看《喜事》第二季",
          },
          {
            period: "2024.07 - 09",
            company: "深圳市浪尖设计有限公司",
            position: "工业设计师",
            duty: "参与失能老人诊疗设备与气道清除系统方案，完成场景研究、产品定义、工业设计与三维表达。",
          },
          {
            period: "2024.03 - 05",
            company: "武汉大势智慧科技有限公司",
            position: "UI/UX 设计师",
            duty: "负责海外官网、VI 与宣传物料的交互与视觉设计，支持产品对外传播与界面体验表达。",
            link: "https://www.daspatial.com/index.html#top",
            linkLabel: "访问大势智慧官网",
          },
        ],
      },
      method: {
        title: "工作方法",
        summary: "从问题定义到 Agent 方案、体验原型与落地验证。",
        items: ["业务理解", "Agent 设计", "体验原型", "落地验证"],
      },
      education: {
        title: "教育经历",
        summary: "从一般性产品设计方法、研究与思辨能力，走向人智交互与企业 AI 产品实践。",
        layout: "education",
        items: [
          {
            kicker: "2020 - 2024 · 本科",
            title: "武汉大学 · 产品设计专业",
            summary: "GPA 前 20% · 建立一般性产品设计方法",
            details: [
              ["主修课程", "概念设计 · 产品造型与形态语义 · CMF 设计 · 产品模具设计"],
              ["阶段能力", "产品定义 · 工业设计 · 界面表达 · 从概念到制造的完整视角"],
              ["使用工具", "Adobe Creative Cloud · Blender · Rhino · SolidWorks · KeyShot · 3D 打印"],
            ],
          },
          {
            kicker: "2024 - 2027 · 硕士",
            title: "武汉大学 · 设计学专业",
            summary: "GPA 前 5% · 形成研究与思辨能力",
            details: [
              ["主修课程", "感性设计 · 设计管理 · 人智交互 · 数智设计"],
              ["阶段能力", "学术研究 · 思辨分析 · 问题定义 · 实验设计 · 论文与专著写作"],
              ["使用工具", "Office · Figma · 研究文档组织 · 数据整理 · 原型与研究成果表达"],
            ],
          },
          {
            kicker: "2026 - 2027 · 实践阶段",
            title: "人智交互与 AI 产品实践",
            summary: "2027 年 6 月毕业 · 走向 AI 产品落地",
            details: [
              ["学习场景", "帆软 AI 产品经理训练营 · 企业 Agent 方案 · FDE 真实业务实践"],
              ["阶段能力", "业务理解 · Agent 方案 · 交互原型 · Demo 搭建 · 测试与迭代"],
              ["使用工具", "Figma · Codex · Claude Code · HTML / CSS · 可运行原型与前端实现"],
            ],
          },
        ],
      },
      about: {
        title: "关于我",
        summary: "设计学背景的 AI 产品与体验设计者，从美学判断、用户体验走向真实业务与产品落地。",
        layout: "about-overview",
        items: [
          {
            label: "PROFILE / 01",
            title: "个人简介",
            body: "设计学背景的 AI 产品与体验设计者，具备良好的审美判断，并有将复杂业务转化为可落地产品方案与 MVP 的实践经验。",
          },
          {
            label: "DIRECTION / 02",
            title: "求职方向",
            body: "AI 产品经理 / FDE 前沿部署工程师\nUI/UX 设计 / 体验设计",
            note: "接受出差与客户现场工作",
          },
          {
            label: "TOOLKIT / 03",
            title: "技能工具",
            body: "Figma · Adobe Creative Cloud · Office\nBlender · Rhino · SolidWorks · KeyShot · 3D 打印\nCodex · Claude Code · HTML / CSS",
          },
          {
            label: "TRAITS / 04",
            title: "性格关键词",
            keywords: ["坚韧", "负责", "情绪稳定"],
          },
          {
            label: "EDUCATION / 05",
            title: "教育经历",
            body: "2024 - 2027 · 武汉大学 设计学硕士 · GPA 前 5%\n2020 - 2024 · 武汉大学 产品设计本科 · GPA 前 20%",
            note: "2027 年 6 月毕业",
          },
          {
            label: "CONTACT / 06",
            title: "联系方式",
            body: "24 岁 · 现居湖北武汉",
            email: "2672640308@qq.com",
            note: "中文简历将在内容完善后提供下载",
          },
        ],
      },
    };
    const data = sections[params.get("section")] || sections.projects;
    document.body.classList.toggle("is-experience-hub", Boolean(data.honors));
    exploreRoot.classList.toggle("is-dense", data.items.length > 8 && !data.layout);
    exploreRoot.classList.toggle("is-education", data.layout === "education");
    exploreRoot.classList.toggle("is-project-showcase", data.layout === "project-showcase");
    exploreRoot.classList.toggle("is-internship-list", data.layout === "internship-list");
    exploreRoot.classList.toggle("is-experience-list", data.layout === "internship-list" && Boolean(data.scrollable));
    exploreRoot.classList.toggle("is-competition-carousel", data.layout === "competition-carousel");
    exploreRoot.classList.toggle("is-about-overview", data.layout === "about-overview");
    exploreRoot.dataset.count = String(data.items.length);
    exploreRoot.style.setProperty("--entry-count", String(data.items.length));
    document.querySelector("#explore-title").textContent = data.title;
    document.querySelector("#explore-summary").textContent = data.summary;
    const projectFocus = document.querySelector("#project-focus");
    const projectFilterRoot = document.querySelector("#project-filters");
    const experienceTabs = document.querySelector("#experience-tabs");
    if (projectFilterRoot) projectFilterRoot.hidden = data.layout !== "project-showcase";
    if (experienceTabs) experienceTabs.hidden = !(data.layout === "internship-list" && data.honors);

    if (data.layout === "project-showcase") {
      projectFocus.hidden = false;
      const filterButtons = Array.from(projectFilterRoot.querySelectorAll("[data-project-filter]"));
      const activeByCategory = Object.fromEntries(Object.keys(projectGroups).map((key) => [key, 0]));
      const requestedCategory = params.get("category");
      let activeCategory = Object.hasOwn(projectGroups, requestedCategory) ? requestedCategory : "ai";
      let activeItems = [];
      let panels = [];
      let categorySwitchTimer;
      let projectHoverTimer;
      let displayedProjectIndex = -1;
      const requestedProject = params.get("project");
      if (requestedProject) {
        const requestedIndex = projectGroups[activeCategory].indexOf(requestedProject);
        if (requestedIndex >= 0) activeByCategory[activeCategory] = requestedIndex;
      }

      const updateFilterIndicator = () => {
        const activeButton = projectFilterRoot.querySelector(`[data-project-filter="${activeCategory}"]`);
        if (!activeButton) return;
        projectFilterRoot.style.setProperty("--filter-indicator-x", `${activeButton.offsetLeft}px`);
        projectFilterRoot.style.setProperty("--filter-indicator-width", `${activeButton.offsetWidth}px`);
      };

      const updateFilterState = () => {
        filterButtons.forEach((button) => {
          const isActive = button.dataset.projectFilter === activeCategory;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
        });
        window.requestAnimationFrame(updateFilterIndicator);
      };

      const setActiveProject = (index, moveFocus = false) => {
        if (!activeItems.length) return;
        const normalizedIndex = (index + activeItems.length) % activeItems.length;
        if (normalizedIndex === displayedProjectIndex && !moveFocus) return;
        const item = activeItems[normalizedIndex];
        displayedProjectIndex = normalizedIndex;
        activeByCategory[activeCategory] = normalizedIndex;
        panels.forEach((panel, panelIndex) => {
          const isActive = panelIndex === normalizedIndex;
          panel.classList.toggle("is-active", isActive);
          panel.setAttribute("aria-pressed", String(isActive));
          panel.tabIndex = isActive ? 0 : -1;
        });
        document.querySelector("#project-focus-meta").textContent = `${projectGroupLabels[activeCategory]} · ${String(normalizedIndex + 1).padStart(2, "0")} / ${String(activeItems.length).padStart(2, "0")}`;
        document.querySelector("#project-focus-title").textContent = item.title;
        document.querySelector("#project-focus-summary").textContent = item.summary;
        document.querySelector("#project-focus-period").textContent = item.period;
        document.querySelector("#project-focus-role").textContent = item.role;
        projectFocus.getAnimations().forEach((animation) => animation.cancel());
        projectFocus.animate(
          [{ opacity: .55, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        if (moveFocus) panels[normalizedIndex].focus();
      };

      const renderProjectGroup = () => {
        activeItems = projectGroups[activeCategory].map((id) => projectById.get(id)).filter(Boolean);
        const activeIndex = Math.min(activeByCategory[activeCategory] || 0, activeItems.length - 1);
        displayedProjectIndex = -1;
        exploreRoot.dataset.projectCount = String(activeItems.length);
        exploreRoot.dataset.projectCategory = activeCategory;
        exploreRoot.innerHTML = activeItems.map((item, index) => `
          <${item.detailCase ? "a" : "button"} class="project-panel project-visual-${item.tone}${item.image ? " has-project-image" : ""}${index === activeIndex ? " is-active" : ""}" ${item.detailCase ? `href="project.html?case=${item.detailCase}&from=${activeCategory}&project=${item.id}"` : `type="button"`} data-project-index="${index}" aria-pressed="${index === activeIndex}" style="--panel-order:${index};${item.image ? `--project-image:url('${item.image}');--project-position:${item.imagePosition || "center"};--project-size:${item.imageSize || "cover"};--project-surface:${item.imageSurface || "#dce8f5"};` : ""}">
            <span class="project-image-label">${projectGroupLabels[activeCategory]} / ${String(index + 1).padStart(2, "0")}</span>
            <span class="project-panel-caption"><strong>${item.title}</strong><small>${item.caption}</small></span>
            <span class="project-panel-index">${String(index + 1).padStart(2, "0")}</span>
          </${item.detailCase ? "a" : "button"}>
        `).join("");

        panels = Array.from(exploreRoot.querySelectorAll(".project-panel"));
        panels.forEach((panel, index) => {
          panel.addEventListener("focus", () => setActiveProject(index));
          panel.addEventListener("click", () => setActiveProject(index));
          panel.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            setActiveProject(index + direction, true);
          });
        });
        setActiveProject(activeIndex);
      };

      exploreRoot.addEventListener("pointermove", (event) => {
        const panel = event.target.closest(".project-panel");
        if (!panel || !exploreRoot.contains(panel)) return;
        const index = Number(panel.dataset.projectIndex);
        if (!Number.isInteger(index) || index === displayedProjectIndex) return;
        window.clearTimeout(projectHoverTimer);
        const pointerX = event.clientX;
        const pointerY = event.clientY;
        projectHoverTimer = window.setTimeout(() => {
          const currentPanel = document.elementFromPoint(pointerX, pointerY)?.closest(".project-panel");
          if (currentPanel !== panel) return;
          setActiveProject(index);
        }, 90);
      });

      exploreRoot.addEventListener("pointerleave", () => window.clearTimeout(projectHoverTimer));

      const switchProjectCategory = (category, writeHistory = true) => {
        if (!Object.hasOwn(projectGroups, category) || category === activeCategory) return;
        window.clearTimeout(categorySwitchTimer);
        exploreRoot.classList.remove("is-filtering-in");
        exploreRoot.classList.add("is-filtering-out");
        projectFocus.classList.add("is-filtering-out");
        categorySwitchTimer = window.setTimeout(() => {
          activeCategory = category;
          renderProjectGroup();
          updateFilterState();
          exploreRoot.classList.remove("is-filtering-out");
          projectFocus.classList.remove("is-filtering-out");
          exploreRoot.classList.add("is-filtering-in");
          window.setTimeout(() => exploreRoot.classList.remove("is-filtering-in"), 560);
          if (writeHistory) {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set("section", "projects");
            nextUrl.searchParams.set("category", category);
            window.history.pushState({ category }, "", nextUrl);
          }
        }, 180);
      };

      filterButtons.forEach((button) => {
        button.addEventListener("click", () => switchProjectCategory(button.dataset.projectFilter));
      });
      window.addEventListener("resize", updateFilterIndicator, { passive: true });
      window.addEventListener("popstate", () => {
        const nextCategory = new URLSearchParams(window.location.search).get("category") || "ai";
        switchProjectCategory(nextCategory, false);
      });
      renderProjectGroup();
      updateFilterState();
    } else if (data.layout === "competition-carousel") {
      projectFocus.hidden = true;
      exploreRoot.innerHTML = `
        <div class="competition-stage">
          <div class="competition-deck" aria-label="竞赛证书切换区">
            ${data.items.map((item, index) => `
              <button class="competition-card" type="button" data-orientation="${item.orientation || "portrait"}" data-competition-index="${index}" aria-pressed="${index === 0}">
                ${item.image
                  ? `<img class="certificate-image" src="${item.image}" alt="${item.title}${item.award}证书" decoding="async">`
                  : `<span class="certificate-placeholder">
                      <span class="certificate-label">CERTIFICATE / ${String(index + 1).padStart(2, "0")}</span>
                      <span class="certificate-mark" aria-hidden="true">O</span>
                      <strong>${item.award}</strong>
                      <small>${item.year}</small>
                    </span>`}
              </button>
            `).join("")}
          </div>
          <div class="competition-caption" aria-live="polite">
            <div class="competition-caption-copy">
              <p id="competition-meta"></p>
              <h2 id="competition-title"></h2>
              <p id="competition-summary"></p>
            </div>
            <div class="competition-controls">
              <button id="competition-prev" type="button" aria-label="上一项竞赛">←</button>
              <button id="competition-next" type="button" aria-label="下一项竞赛">→</button>
              <span><strong id="competition-current">01</strong> / ${String(data.items.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      `;

      const cards = Array.from(exploreRoot.querySelectorAll(".competition-card"));
      const deck = exploreRoot.querySelector(".competition-deck");
      const currentLabel = document.querySelector("#competition-current");
      const caption = exploreRoot.querySelector(".competition-caption-copy");
      let activeCompetition = 0;

      const setActiveCompetition = (nextIndex, moveFocus = false) => {
        activeCompetition = (nextIndex + data.items.length) % data.items.length;
        cards.forEach((card, index) => {
          let offset = index - activeCompetition;
          if (offset > data.items.length / 2) offset -= data.items.length;
          if (offset < -data.items.length / 2) offset += data.items.length;
          const visibleOffset = Math.abs(offset) <= 3 ? String(offset) : "hidden";
          card.dataset.position = visibleOffset;
          card.classList.toggle("is-active", offset === 0);
          card.setAttribute("aria-pressed", String(offset === 0));
          card.tabIndex = offset === 0 ? 0 : -1;
        });
        const item = data.items[activeCompetition];
        deck.dataset.activeOrientation = item.orientation || "portrait";
        document.querySelector("#competition-meta").textContent = `${item.award} · ${item.year}`;
        const competitionTitle = document.querySelector("#competition-title");
        competitionTitle.textContent = item.title;
        competitionTitle.classList.toggle("is-long-title", item.title.length > 22);
        competitionTitle.classList.toggle("is-extra-long-title", item.title.length > 34);
        document.querySelector("#competition-summary").textContent = item.summary;
        currentLabel.textContent = String(activeCompetition + 1).padStart(2, "0");
        caption.getAnimations().forEach((animation) => animation.cancel());
        caption.animate(
          [{ opacity: .45, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        if (moveFocus) cards[activeCompetition].focus();
      };

      cards.forEach((card, index) => card.addEventListener("click", () => setActiveCompetition(index, true)));
      document.querySelector("#competition-prev").addEventListener("click", () => setActiveCompetition(activeCompetition - 1));
      document.querySelector("#competition-next").addEventListener("click", () => setActiveCompetition(activeCompetition + 1));
      exploreRoot.querySelector(".competition-stage").addEventListener("keydown", (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        setActiveCompetition(activeCompetition + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
      setActiveCompetition(0);
    } else if (data.layout === "internship-list") {
      projectFocus.hidden = true;
      const pageTitle = document.querySelector("#explore-title");
      const pageSummary = document.querySelector("#explore-summary");
      const renderWork = () => {
        exploreRoot.classList.remove("is-honors-view");
        exploreRoot.innerHTML = data.items.map((item, index) => `
          <article class="internship-entry">
            <div class="internship-meta">
              <span class="internship-number">${String(index + 1).padStart(2, "0")}</span>
              <time>${item.period}</time>
            </div>
            <div class="internship-identity">
              <h2>${item.company}</h2>
              <strong>${item.position}</strong>
            </div>
            <p>${item.duty}${item.link ? `<a class="internship-media-link" href="${item.link}" target="_blank" rel="noopener noreferrer">${item.linkLabel} <span aria-hidden="true">↗</span></a>` : ""}</p>
          </article>
        `).join("");
        pageTitle.textContent = data.title;
        pageSummary.textContent = data.summary;
      };
      const renderHonors = () => {
        const honors = data.honors;
        const certificates = honors.certificates || [];
        exploreRoot.classList.add("is-honors-view");
        exploreRoot.innerHTML = `
          <section class="honors-timeline" aria-label="奖学金与荣誉记录">
            ${honors.records.map((record) => `
              <article class="honor-record">
                <time>${record.year}</time>
                <div><h2>${record.title}</h2>${record.note ? `<p>${record.note}</p>` : ""}</div>
              </article>
            `).join("")}
          </section>
          <section class="honors-certificate-viewer" aria-label="荣誉证书查看器" tabindex="0">
            <div class="honors-certificate-stage">
              <img id="honors-certificate-image" src="${certificates[0]?.image || ""}" alt="${certificates[0]?.year || ""} ${certificates[0]?.label || ""}证书" />
              <button class="honors-certificate-arrow is-prev" id="honors-certificate-prev" type="button" aria-label="上一张证书">←</button>
              <button class="honors-certificate-arrow is-next" id="honors-certificate-next" type="button" aria-label="下一张证书">→</button>
            </div>
            <div class="honors-certificate-caption" aria-live="polite">
              <p><span id="honors-certificate-year">${certificates[0]?.year || ""}</span><strong id="honors-certificate-label">${certificates[0]?.label || ""}</strong></p>
              <span id="honors-certificate-page">01 / ${String(certificates.length).padStart(2, "0")}</span>
            </div>
          </section>
        `;
        let activeCertificate = 0;
        const certificateImage = exploreRoot.querySelector("#honors-certificate-image");
        const certificateYear = exploreRoot.querySelector("#honors-certificate-year");
        const certificateLabel = exploreRoot.querySelector("#honors-certificate-label");
        const certificatePage = exploreRoot.querySelector("#honors-certificate-page");
        const certificateViewer = exploreRoot.querySelector(".honors-certificate-viewer");
        const setCertificate = (index) => {
          if (!certificates.length) return;
          activeCertificate = (index + certificates.length) % certificates.length;
          const certificate = certificates[activeCertificate];
          certificateImage.classList.add("is-changing");
          window.setTimeout(() => {
            certificateImage.src = certificate.image;
            certificateImage.alt = `${certificate.year} ${certificate.label}证书`;
            certificateYear.textContent = certificate.year;
            certificateLabel.textContent = certificate.label;
            certificatePage.textContent = `${String(activeCertificate + 1).padStart(2, "0")} / ${String(certificates.length).padStart(2, "0")}`;
            certificateImage.classList.remove("is-changing");
          }, 130);
        };
        exploreRoot.querySelector("#honors-certificate-prev").addEventListener("click", () => setCertificate(activeCertificate - 1));
        exploreRoot.querySelector("#honors-certificate-next").addEventListener("click", () => setCertificate(activeCertificate + 1));
        certificateViewer.addEventListener("keydown", (event) => {
          if (event.key === "ArrowLeft") setCertificate(activeCertificate - 1);
          if (event.key === "ArrowRight") setCertificate(activeCertificate + 1);
        });
        pageTitle.textContent = honors.title;
        pageSummary.textContent = honors.summary;
      };
      renderWork();
      if (experienceTabs && data.honors) {
        experienceTabs.querySelectorAll("[data-experience-view]").forEach((button) => {
          button.addEventListener("click", () => {
            const view = button.dataset.experienceView;
            experienceTabs.querySelectorAll("[data-experience-view]").forEach((item) => {
              const active = item === button;
              item.classList.toggle("is-active", active);
              item.setAttribute("aria-pressed", String(active));
            });
            if (view === "honors") renderHonors();
            else renderWork();
          });
        });
      }
      if (data.scrollable) {
        let scrollIndicatorTimer;
        exploreRoot.addEventListener("scroll", () => {
          exploreRoot.classList.add("is-scrolling");
          window.clearTimeout(scrollIndicatorTimer);
          scrollIndicatorTimer = window.setTimeout(() => exploreRoot.classList.remove("is-scrolling"), 620);
        }, { passive: true });
      }
    } else if (data.layout === "about-overview") {
      projectFocus.hidden = true;
      exploreRoot.innerHTML = data.items.map((item, index) => `
        <article class="about-entry about-entry-${index + 1}">
          <span class="about-entry-label">${item.label}</span>
          <h2>${item.title}</h2>
          ${item.keywords ? `<div class="about-keywords">${item.keywords.map((keyword) => `<strong>${keyword}</strong>`).join("")}</div>` : ""}
          ${item.body ? `<p>${item.body.replaceAll("\n", "<br>")}</p>` : ""}
          ${item.email ? `<a class="about-email" href="mailto:${item.email}">${item.email} <span aria-hidden="true">↗</span></a>` : ""}
          ${item.note ? `<small>${item.note}</small>` : ""}
        </article>
      `).join("");
    } else {
      projectFocus.hidden = true;
      exploreRoot.innerHTML = data.items.map((item, index) => {
        if (typeof item === "string") return `<article><span>${String(index + 1).padStart(2, "0")}</span><h2>${item}</h2></article>`;
        const details = item.details.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
        return `<article class="education-stage-card"><span>${item.kicker}</span><h2>${item.title}</h2><p>${item.summary}</p><dl class="education-evidence">${details}</dl></article>`;
      }).join("");
    }
    document.title = `${data.title} | Olia.Shuyu`;
  }
})();
