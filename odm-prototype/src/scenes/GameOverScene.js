import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.victory = data.victory || false;
    this.score = data.score || 0;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const titleText = this.victory ? "¡VICTORIA: OBJETIVO COMPLETADO!" : "MISIÓN FALLIDA";
    const titleColor = this.victory ? "#42d6c5" : "#ff5555";

    this.add.text(width / 2, height / 3, titleText, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: titleColor,
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, `Titanes eliminados: ${this.score}`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(width / 2, height / 2 + 80, 220, 50, 0x42d6c5)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height / 2 + 80, "VOLVER AL MENÚ", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#17252b",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const returnToMenu = () => {
      this.scene.start('MainMenuScene');
    };

    const onHover = () => btnBg.setFillStyle(0x66eaff);
    const onOut = () => btnBg.setFillStyle(0x42d6c5);

    btnBg.on('pointerover', onHover);
    btnBg.on('pointerout', onOut);
    btnBg.on('pointerdown', returnToMenu);

    btnText.on('pointerover', onHover);
    btnText.on('pointerout', onOut);
    btnText.on('pointerdown', returnToMenu);
  }
}
