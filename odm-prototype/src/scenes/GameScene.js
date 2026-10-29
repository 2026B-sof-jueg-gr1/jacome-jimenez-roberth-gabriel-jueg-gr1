
import Phaser from "phaser";
import { movementConfig as cfg } from "../config/movementConfig.js";
import Player from "../entities/Player.js";
import Controls from "../input/Controls.js";
import GrappleSystem from "../systems/GrappleSystem.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#17252b");

    this.physicsWorld = {
      width: cfg.worldWidth,
      height: cfg.worldHeight
    };

    this.buildings = [];
    this.anchors = [];

    this.drawWorld();

    this.player = new Player(this, 500, 500);
    this.controls = new Controls(this);
    this.grappleSystem = new GrappleSystem(this, this.player);

    this.cameras.main.setBounds(
      0, 0, cfg.worldWidth, cfg.worldHeight
    );
    this.cameras.main.startFollow(this.player.body, true, 0.08, 0.08);

    this.hud = this.add.text(16, 16, "", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#ffffff",
      backgroundColor: "#102027dd",
      padding: { x: 10, y: 8 },
      lineSpacing: 5
    })
      .setScrollFactor(0)
      .setDepth(100);

    this.add.text(16, 112,
      "WASD: mover | SHIFT: impulso\n" +
      "Clic izq./der.: enganchar\n" +
      "Q / E: soltar cable izq. / der.",
      {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#dce9ee",
        backgroundColor: "#102027cc",
        padding: { x: 8, y: 6 },
        lineSpacing: 4
      }
    ).setScrollFactor(0).setDepth(100);
  }

  drawWorld() {
    const background = this.add.graphics();

    background.fillStyle(0x263b3d, 1);
    background.fillRect(
      0, 0, cfg.worldWidth, cfg.worldHeight
    );

    // Cuadrícula de referencia.
    background.lineStyle(1, 0x3a5151, 0.4);

    for (let x = 0; x <= cfg.worldWidth; x += 80) {
      background.lineBetween(x, 0, x, cfg.worldHeight);
    }

    for (let y = 0; y <= cfg.worldHeight; y += 80) {
      background.lineBetween(0, y, cfg.worldWidth, y);
    }

    const layouts = [
      [250, 250, 170, 150],
      [580, 210, 200, 170],
      [930, 330, 190, 240],
      [1280, 240, 240, 160],
      [1650, 390, 200, 220],
      [2050, 260, 220, 180],
      [350, 850, 240, 190],
      [760, 940, 190, 240],
      [1170, 800, 220, 180],
      [1570, 960, 240, 200],
      [2000, 850, 200, 240],
      [530, 1400, 220, 180],
      [1050, 1370, 250, 180],
      [1630, 1430, 200, 190],
      [2110, 1370, 180, 220]
    ];

    for (const [x, y, width, height] of layouts) {
      const building = { x, y, width, height };
      this.buildings.push(building);

      const g = this.add.graphics();

      g.fillStyle(0x000000, 0.18);
      g.fillRoundedRect(
        x - width / 2 + 8,
        y - height / 2 + 8,
        width,
        height,
        8
      );

      g.fillStyle(0x66777c, 1);
      g.fillRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        8
      );

      g.lineStyle(3, 0x9bafb2, 1);
      g.strokeRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        8
      );

      g.fillStyle(0x34464a, 1);
      g.fillRect(x - 15, y - 15, 30, 30);

      // Cuatro anclajes en las esquinas.
      const inset = 10;
      const corners = [
        [x - width / 2 + inset, y - height / 2 + inset],
        [x + width / 2 - inset, y - height / 2 + inset],
        [x - width / 2 + inset, y + height / 2 - inset],
        [x + width / 2 - inset, y + height / 2 - inset]
      ];

      for (const [ax, ay] of corners) {
        const anchor = { x: ax, y: ay };
        this.anchors.push(anchor);

        this.add.circle(ax, ay, 5, 0x66eaff)
          .setStrokeStyle(2, 0xffffff);
      }
    }

    background.setDepth(-10);
  }

  update(time, delta) {
    const input = this.controls.read();

    if (input.releaseLeft) {
      this.grappleSystem.release(0);
    }

    if (input.releaseRight) {
      this.grappleSystem.release(1);
    }

    this.player.updateMovement(input, delta);
    this.grappleSystem.update(delta);

    this.hud.setText([
      `Velocidad: ${Math.round(this.player.getSpeed())}`,
      `Cables activos: ${this.grappleSystem.getActiveCount()}/2`,
      `Anclajes disponibles: ${this.anchors.length}`
    ]);
  }
}
