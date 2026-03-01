import './styles/main.css';
import { WordDoodleEngine } from './engine.js';
import { UIHub } from './ui-hub.js';

const engine = new WordDoodleEngine("viewport");
new UIHub(engine);