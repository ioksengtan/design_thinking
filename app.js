(function () {
  "use strict";

  const tally = document.getElementById("stage-tally");
  const summary = document.getElementById("result-summary");
  const empty = document.getElementById("empty");
  const root = document.getElementById("stage-root");
  const searchInput = document.getElementById("search");
  const clearButton = document.getElementById("clear-filters");
  const form = document.getElementById("finder-form");

  const state = {
    situation: null,
    stage: "all",
    query: ""
  };

  const CARD_ALT = {
    shadowing: "一個人拿著記錄板，跟著另一個人走路",
    "fly-on-the-wall": "一個人從牆邊探出頭，看兩個人在現場說話",
    "stakeholder-map": "一個人把不同角色畫進同心圓",
    "love-breakup-letter": "一個人寫信，信上有完整的心和撕開的心",
    "competitor-analysis": "一個人對著兩件產品做比較",
    "desk-research": "一個人坐在電腦和書本前面查資料",
    interview: "兩人面對面坐下，一人發問、一人記錄",
    persona: "一個人整理使用者肖像和旁邊的特質卡",
    "customer-journey-map": "一條路徑標著笑臉、平靜和皺眉，有人走在起點",
    "point-of-view": "兩人看著板上被圈起來的使用者",
    "how-might-we": "三個人看著寫了問號的卡片",
    brainstorming: "兩人把便利貼貼到白板",
    "method-635": "幾個人圍著一張寫了點子的紙，把紙傳下去",
    "crazy-8": "一個人看著計時器，在八格紙上畫",
    "six-thinking-hats": "一個人戴著帽子，上方還有另外五頂不同顏色的帽子",
    "pen-teller-poker": "一人在畫，一人張嘴說故事，一人的氣泡裡是問號",
    "dot-voting": "兩人在貼滿點子的紙上貼圓點",
    "idea-portfolio": "兩人把便利貼放到十字分成的四格",
    storyboard: "一連串格子畫著使用過程，一個人在補最後一格",
    "role-playing": "一人站在櫃台後，一人提著袋子來當客人，另一人在記錄",
    "low-fidelity-prototype": "一個人用厚紙板和膠帶做出粗糙的物品",
    "ab-testing": "一個人看著兩份並排、按鈕形狀不同的樣品",
    "desirability-testing": "一個人從皺眉、平靜和笑臉的卡片裡往上指",
    "critical-incident": "一個人看著畫了叉的螢幕，另一人在旁記錄",
    laddering: "兩人說話，問號分成三層往上疊",
    "guerrilla-testing": "咖啡桌旁，一人把紙樣品拿給提著袋子的人看",
    "wizard-of-oz": "一人看著螢幕，布幕後面有人在操作"
  };

  let deck = null;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  fetch("data/cards.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      return response.json();
    })
    .then(function (data) {
      deck = data;
      paintHero();
      paintCards();
      bindFinder();
      applyFilters();
      openHash();
    })
    .catch(function () {
      tally.textContent = "方法卡讀取失敗。";
      summary.textContent = "請用本機伺服器開啟這個網站，例如在資料夾執行 python3 -m http.server，再用瀏覽器打開網址。";
    });

  function paintHero() {
    const parts = deck.stages.map(function (stage) {
      const count = deck.cards.filter(function (card) {
        return card.stage === stage.id;
      }).length;
      const link = document.querySelector('[data-stage-link="' + stage.id + '"]');
      if (link) {
        link.querySelector(".stage-name").textContent = stage.name;
        link.querySelector(".stage-summary").textContent = stage.summary;
        link.querySelector(".stage-total").textContent = count + " 張";
      }
      return stage.name + " " + count;
    });
    tally.textContent = parts.join(" · ");
    document.documentElement.dataset.renderedCards = String(deck.cards.length);
    document.documentElement.dataset.stageCounts = parts.join(",");
  }

  function paintCards() {
    const stageOf = {};
    deck.stages.forEach(function (stage) {
      stageOf[stage.id] = stage;
    });
    root.replaceChildren();

    deck.stages.forEach(function (stage) {
      const section = document.createElement("section");
      section.className = "stage-block";
      section.id = "stage-" + stage.id;
      section.dataset.stage = stage.id;

      const head = document.createElement("div");
      head.className = "stage-head";
      const titleWrap = document.createElement("div");
      titleWrap.className = "stage-title";
      const icon = document.createElement("img");
      icon.className = "stage-icon";
      icon.src = "illustrations/stages/" + stage.id + ".svg";
      icon.alt = "";
      icon.width = 40;
      icon.height = 40;
      const title = document.createElement("h2");
      title.textContent = stage.name;
      titleWrap.append(icon, title);
      const intro = document.createElement("p");
      intro.textContent = stage.summary;
      const count = document.createElement("p");
      count.className = "stage-count";
      head.append(titleWrap, intro, count);

      const grid = document.createElement("div");
      grid.className = "card-grid";
      deck.cards.forEach(function (card, index) {
        if (card.stage !== stage.id) return;
        grid.append(renderCard(card, stageOf[card.stage], index));
      });

      section.append(head, grid);
      root.append(section);
    });
  }

  function renderCard(card, stage, index) {
    const article = document.createElement("article");
    article.className = "card";
    article.id = "card-" + card.id;
    article.dataset.stage = card.stage;
    article.dataset.id = card.id;

    const top = document.createElement("div");
    top.className = "card-top";
    const number = document.createElement("p");
    number.className = "index";
    number.textContent = String(index + 1).padStart(2, "0");
    const pill = document.createElement("p");
    pill.className = "stage-pill";
    pill.textContent = stage ? stage.name : "";
    top.append(number, pill);

    const name = document.createElement("h3");
    name.textContent = card.name;
    const english = document.createElement("p");
    english.className = "english";
    english.lang = "en";
    english.textContent = card.english ? "（" + card.english + "）" : "";

    const art = document.createElement("img");
    art.className = "card-art";
    art.src = "illustrations/cards/" + card.id + ".svg";
    art.width = 320;
    art.height = 200;
    art.alt = CARD_ALT[card.id] || card.name;

    article.append(
      art,
      top,
      name,
      english,
      field("適用時機", card.when),
      field("準備材料", card.materials),
      proseField("說明", card.description),
      field("小技巧", card.tips),
      referenceField(card)
    );
    return article;
  }

  function field(label, items) {
    const block = document.createElement("div");
    block.className = "field";
    const heading = document.createElement("h4");
    heading.textContent = label;
    const list = document.createElement("ul");
    (items || []).forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    block.append(heading, list);
    return block;
  }

  function proseField(label, text) {
    const block = document.createElement("div");
    block.className = "field";
    const heading = document.createElement("h4");
    heading.textContent = label;
    const paragraph = document.createElement("p");
    paragraph.textContent = text || "";
    block.append(heading, paragraph);
    return block;
  }

  function referenceField(card) {
    const block = document.createElement("div");
    block.className = "field";
    const heading = document.createElement("h4");
    heading.textContent = "參考連結";
    block.append(heading);
    if (card.reference) {
      const link = document.createElement("a");
      link.href = card.reference;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = card.reference;
      block.append(link);
    } else {
      const note = document.createElement("p");
      note.className = "reference-note";
      note.textContent = card.reference_note || "這張卡沒有參考連結。";
      block.append(note);
    }
    return block;
  }

  function bindFinder() {
    document.querySelectorAll("[data-situation]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.situation = state.situation === button.dataset.situation ? null : button.dataset.situation;
        applyFilters();
      });
    });
    document.querySelectorAll("[data-stage-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.stage = button.dataset.stageFilter;
        applyFilters();
      });
    });
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value;
      applyFilters();
    });
    clearButton.addEventListener("click", function () {
      clearFilters();
    });
    document.addEventListener("click", function (event) {
      const link = event.target.closest("a[href^='#card-']");
      if (!link) return;
      clearFilters();
    });
  }

  function clearFilters() {
    state.situation = null;
    state.stage = "all";
    state.query = "";
    searchInput.value = "";
    applyFilters();
  }

  function applyFilters() {
    const query = state.query.trim().toLocaleLowerCase("zh-Hant");
    const situationButton = state.situation
      ? document.querySelector('[data-situation="' + state.situation + '"]')
      : null;
    const allowed = situationButton ? situationButton.dataset.ids.split(",") : null;
    let shown = 0;

    deck.stages.forEach(function (stage) {
      const section = document.getElementById("stage-" + stage.id);
      const cards = Array.from(section.querySelectorAll(".card"));
      let stageShown = 0;
      cards.forEach(function (article) {
        const card = deck.cards.find(function (item) {
          return item.id === article.dataset.id;
        });
        const match = cardMatches(card, stage, query, allowed);
        article.hidden = !match;
        if (match) {
          stageShown += 1;
          shown += 1;
        }
      });
      section.hidden = stageShown === 0;
      section.querySelector(".stage-count").textContent =
        "本階段共 " + cards.length + " 張，目前顯示 " + stageShown + " 張";
    });

    const filters = [];
    if (situationButton) filters.push(situationButton.textContent.trim());
    if (state.stage !== "all") {
      const stage = deck.stages.find(function (item) {
        return item.id === state.stage;
      });
      if (stage) filters.push(stage.name);
    }
    if (query) filters.push("「" + state.query.trim() + "」");

    if (filters.length) {
      summary.textContent = "已篩選：" + filters.join("、") + "。顯示 " + shown + " 張，全部共 " + deck.cards.length + " 張。";
    } else {
      summary.textContent = "顯示全部 " + deck.cards.length + " 張方法卡。";
    }
    empty.hidden = shown !== 0;
    clearButton.disabled = filters.length === 0;

    document.querySelectorAll("[data-situation]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.situation === state.situation));
    });
    document.querySelectorAll("[data-stage-filter]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.stageFilter === state.stage));
    });
  }

  function cardMatches(card, stage, query, allowed) {
    if (state.stage !== "all" && card.stage !== state.stage) return false;
    if (allowed && allowed.indexOf(card.id) === -1) return false;
    if (!query) return true;
    const blob = [
      card.name,
      card.english,
      card.description,
      card.reference,
      card.reference_note,
      stage.name,
      stage.summary
    ].concat(card.when || [], card.materials || [], card.tips || []).join("\n");
    return blob.toLocaleLowerCase("zh-Hant").indexOf(query) !== -1;
  }

  function openHash() {
    if (!/^#(card|stage)-[a-z0-9-]+$/.test(location.hash)) return;
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView();
  }
}());
