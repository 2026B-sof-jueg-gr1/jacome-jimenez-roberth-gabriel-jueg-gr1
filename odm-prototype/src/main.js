import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 640,
  backgroundColor: "#17252b",
  scene: [MainMenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true
  }
};

window.game = new Phaser.Game(config);