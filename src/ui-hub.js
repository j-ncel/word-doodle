  import html2canvas from 'html2canvas';

  export class UIHub {
    constructor(engine) {
      this.engine = engine;
      this.currentTextCase = "upper";
      this.initElements();
      this.initDraggable();
      this.initEventListeners();
      this.centerHubOnScreen();
    }

    initElements() {
      this.hubContainer = document.getElementById("ui-hub");
      this.minimizedTrigger = document.getElementById("hub-trigger");
      this.wordSeedTextarea = document.getElementById("seed-input");
      this.generateButton = document.getElementById("generate-btn");
      this.wordLimitInput = document.getElementById("limit-input");
      this.fontFamilySelector = document.getElementById("font-select");
      this.onCanvasCounter = document.getElementById("canvas-count");
      this.vocabularyStatsDisplay = document.getElementById("word-stats");
    }

    centerHubOnScreen() {
      const centerX = window.innerWidth / 2 - this.hubContainer.offsetWidth / 2;
      const centerY = window.innerHeight / 2 - this.hubContainer.offsetHeight / 2;
      this.hubContainer.style.left = `${centerX}px`;
      this.hubContainer.style.top = `${centerY}px`;
    }

    initDraggable() {
      let isDraggingHub = false;
      let dragOffset = { x: 0, y: 0 };
      const hubHeader = document.getElementById("hub-header");

      hubHeader.onmousedown = (event) => {
        isDraggingHub = true;
        dragOffset.x = this.hubContainer.offsetLeft - event.clientX;
        dragOffset.y = this.hubContainer.offsetTop - event.clientY;
        this.hubContainer.style.transition = "none";
      };

      document.onmousemove = (event) => {
        if (isDraggingHub) {
          this.hubContainer.style.left = `${event.clientX + dragOffset.x}px`;
          this.hubContainer.style.top = `${event.clientY + dragOffset.y}px`;
        }
      };

      document.onmouseup = () => {
        isDraggingHub = false;
        this.hubContainer.style.transition = "opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      };
    }

    applyTextTransform(text) {
      switch (this.currentTextCase) {
        case "upper": return text.toUpperCase();
        case "lower": return text.toLowerCase();
        case "title": return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        default: return text.toUpperCase();
      }
    }

    initEventListeners() {
      this.generateButton.onclick = () => this.toggleEngineExecution();
      
      document.getElementById("wipe-btn").onclick = () => {
        this.engine.clearCanvas();
        this.onCanvasCounter.innerText = `On Canvas: 0`;
      };

      document.getElementById("minimize-btn").onclick = () => this.toggleHubVisibility();
      this.minimizedTrigger.onclick = () => this.toggleHubVisibility();

      document.getElementById("case-group").onclick = (event) => {
        if (event.target.tagName === "BUTTON") {
          this.currentTextCase = event.target.dataset.case;
          this.updateButtonGroupActiveState("case-group", event.target);
        }
      };

      document.getElementById("theme-group").onclick = (event) => {
        if (event.target.tagName === "BUTTON") {
          document.body.className = `theme-${event.target.dataset.theme}`;
          this.updateButtonGroupActiveState("theme-group", event.target);
        }
      };

      document.getElementById("capture-btn").onclick = () => this.captureViewportImage();
    }

    updateButtonGroupActiveState(groupId, targetButton) {
      document.querySelectorAll(`#${groupId} button`).forEach((btn) => btn.classList.remove("active"));
      targetButton.classList.add("active");
    }

    toggleHubVisibility() {
      const isNowHidden = this.hubContainer.classList.toggle("hub-hidden");
      this.minimizedTrigger.style.display = isNowHidden ? "flex" : "none";
    }

    toggleEngineExecution() {
      if (this.engine.isRunning) {
        this.stopEngine();
      } else {
        const stats = this.engine.processVocabulary(this.wordSeedTextarea.value);
        if (stats.total === 0) return;
        
        this.vocabularyStatsDisplay.innerText = `Unique: ${stats.unique} | Total: ${stats.total}`;
        this.engine.isRunning = true;
        this.generateButton.innerText = "PAUSE";
        this.generationLoop();
      }
    }

    stopEngine(buttonLabel = "GENERATE") {
      this.engine.isRunning = false;
      this.generateButton.innerText = buttonLabel;
      cancelAnimationFrame(this.engine.loopTimer);
    }

    generationLoop() {
      if (!this.engine.isRunning) return;

      const maxWordLimit = parseInt(this.wordLimitInput.value) || 999;

      const currentCount = this.engine.generateDoodle({
        font: this.fontFamilySelector.value,
        transform: (text) => this.applyTextTransform(text),
      });

      this.onCanvasCounter.innerText = `On Canvas: ${currentCount}`;

      if (currentCount >= maxWordLimit) {
        this.stopEngine("LIMIT MET");
        return;
      }

      this.engine.loopTimer = requestAnimationFrame(() => this.generationLoop());
    }

    async captureViewportImage() {
      const screenshotBtn = document.getElementById("capture-btn");
      screenshotBtn.innerText = "CAPTURING...";

      const canvas = await html2canvas(document.body, {
        ignoreElements: (element) => element.id === "ui-hub" || element.id === "hub-trigger",
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        scale: 2,
      });

      const downloadLink = document.createElement("a");
      downloadLink.download = `word-doodle-${Date.now()}.png`;
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.click();
      
      screenshotBtn.innerText = "SCREENSHOT";
    }
  }