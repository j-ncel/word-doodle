  export class WordDoodleEngine {
    constructor(viewportId) {
      this.viewportElement = document.getElementById(viewportId);
      this.placedBoundaries = [];
      this.wordFrequencyMap = {};
      this.vocabularyList = [];
      this.maxFrequencyFound = 1;
      this.isRunning = false;
      this.loopTimer = null;
    }

    processVocabulary(rawText) {
      const words = rawText.trim().split(/\s+/).filter(word => word.length > 0);
      this.wordFrequencyMap = {};

      words.forEach(word => {
        const key = word.toUpperCase();
        this.wordFrequencyMap[key] = (this.wordFrequencyMap[key] || 0) + 1;
      });

      this.vocabularyList = Object.keys(this.wordFrequencyMap);
      this.maxFrequencyFound = Math.max(...Object.values(this.wordFrequencyMap)) || 1;
      
      return { unique: this.vocabularyList.length, total: words.length };
    }

    clearCanvas() {
      this.viewportElement.innerHTML = "";
      this.placedBoundaries = [];
    }

    isOverlapping(newRect) {
      const padding = 5;
      for (const existing of this.placedBoundaries) {
        if (
          newRect.x < existing.x + existing.width + padding &&
          newRect.x + newRect.width + padding > existing.x &&
          newRect.y < existing.y + existing.height + padding &&
          newRect.y + newRect.height + padding > existing.y
        ) {
          return true;
        }
      }
      return false;
    }

    generateDoodle(config) {
      const textElement = document.createElement("span");
      textElement.className = "doodle-text";
      textElement.style.fontFamily = config.font;

      const randomWord = this.vocabularyList[Math.floor(Math.random() * this.vocabularyList.length)];
      textElement.innerText = config.transform(randomWord);

      const isVertical = Math.random() > 0.85;
      this.viewportElement.appendChild(textElement);

      const weight = this.wordFrequencyMap[randomWord.toUpperCase()] / this.maxFrequencyFound;
      const baseSize = Math.random() * (window.innerWidth * 0.07) + 12;
      const finalSize = Math.floor(baseSize * (0.6 + weight * 0.4));

      textElement.style.fontSize = `${finalSize}px`;
      if (weight > 0.8) textElement.style.fontWeight = "700";

      let width = textElement.offsetWidth;
      let height = textElement.offsetHeight;
      if (isVertical) [width, height] = [height, width];

      let successfullyPlaced = false;

      for (let i = 0; i < 70; i++) {
        const x = Math.random() * (window.innerWidth - width);
        const y = Math.random() * (window.innerHeight - height);

        const candidate = { x, y, width, height };

        if (!this.isOverlapping(candidate)) {
          textElement.style.left = `${x}px`;
          textElement.style.top = `${y}px`;
          textElement.style.transform = `rotate(${isVertical ? 90 : 0}deg)`;
          
          if (isVertical) textElement.style.left = `${x + width}px`;
          
          textElement.style.opacity = "0.8";
          this.placedBoundaries.push(candidate);
          successfullyPlaced = true;
          break;
        }
      }

      if (!successfullyPlaced) {
        this.viewportElement.removeChild(textElement);
      }

      return this.placedBoundaries.length;
    }
  }