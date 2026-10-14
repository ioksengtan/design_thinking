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
      const title = document.createElement("h2");
      title.textContent = stage.name;
      const intro = document.createElement("p");
      intro.textContent = stage.summary;
      const count = document.createElement("p");
      count.className = "stage-count";
      head.append(title, intro, count);

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

    article.append(
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
