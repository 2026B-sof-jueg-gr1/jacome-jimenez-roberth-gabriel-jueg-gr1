import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.text(width / 2, height / 3 - 30, "ATTACK ON TITAN: ODM PROTOTYPE", {
      fontFamily: "monospace",
      fontSize: "26px",
      color: "#42d6c5",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, 
      "Misión: Elimina a todos los titanes geométricos\n" +
      "(Cuadrados y Triángulos) usando tus cuchillas y ganchos.", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#dce9ee",
      align: "center",
      lineSpacing: 6
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(width / 2, height / 2 + 80, 220, 50, 0x42d6c5)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height / 2 + 80, "INICIAR MISIÓN", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#17252b",
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const startGame = () => {
      this.scene.start('GameScene');
    };

    const onHover = () => btnBg.setFillStyle(0x66eaff);
    const onOut = () => btnBg.setFillStyle(0x42d6c5);

    btnBg.on('pointerover', onHover);
    btnBg.on('pointerout', onOut);
    btnBg.on('pointerdown', startGame);

    btnText.on('pointerover', onHover);
    btnText.on('pointerout', onOut);
    btnText.on('pointerdown', startGame);
  }
}
