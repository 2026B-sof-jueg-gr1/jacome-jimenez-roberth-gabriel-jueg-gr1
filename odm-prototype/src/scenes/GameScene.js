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
    this.titans = [];
    this.totalTitansToKill = 0;

    this.drawWorld();
    this.spawnTitans();

    this.player = new Player(this, 500, 500);
    this.controls = new Controls(this);
    this.grappleSystem = new GrappleSystem(this, this.player);

    // Tecla de ataque con cuchillas (Espacio)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBounds(0, 0, cfg.worldWidth, cfg.worldHeight);
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

    this.add.text(16, 125,
      "WASD: mover | SHIFT: impulso\n" +
      "Clic izq./der.: enganchar\n" +
      "Q / E: soltar cables\n" +
      "ESPACIO: Atacar con cuchillas",
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
    background.fillRect(0, 0, cfg.worldWidth, cfg.worldHeight);

    background.lineStyle(1, 0x3a5151, 0.4);
    for (let x = 0; x <= cfg.worldWidth; x += 80) {
      background.lineBetween(x, 0, x, cfg.worldHeight);
    }
    for (let y = 0; y <= cfg.worldHeight; y += 80) {
      background.lineBetween(0, y, cfg.worldWidth, y);
    }

    const layouts = [
      [250, 250, 170, 150], [580, 210, 200, 170], [930, 330, 190, 240],
      [1280, 240, 240, 160], [1650, 390, 200, 220], [2050, 260, 220, 180],
      [350, 850, 240, 190], [760, 940, 190, 240], [1170, 800, 220, 180],
      [1570, 960, 240, 200], [2000, 850, 200, 240], [530, 1400, 220, 180],
      [1050, 1370, 250, 180], [1630, 1430, 200, 190], [2110, 1370, 180, 220]
    ];

    for (const [x, y, width, height] of layouts) {
      const building = { x, y, width, height };
      this.buildings.push(building);

      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.18);
      g.fillRoundedRect(x - width / 2 + 8, y - height / 2 + 8, width, height, 8);
      g.fillStyle(0x66777c, 1);
      g.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      g.lineStyle(3, 0x9bafb2, 1);
      g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      g.fillStyle(0x34464a, 1);
      g.fillRect(x - 15, y - 15, 30, 30);

      const inset = 10;
      const corners = [
        [x - width / 2 + inset, y - height / 2 + inset],
        [x + width / 2 - inset, y - height / 2 + inset],
        [x - width / 2 + inset, y + height / 2 - inset],
        [x + width / 2 - inset, y + height / 2 - inset]
      ];

      for (const [ax, ay] of corners) {
        this.anchors.push({ x: ax, y: ay });
        this.add.circle(ax, ay, 5, 0x66eaff).setStrokeStyle(2, 0xffffff);
      }
    }

    background.setDepth(-10);
  }

  spawnTitans() {
    // Posiciones predeterminadas para los titanes geométricos (cuadrados y triángulos)
    const titanPositions = [
      { x: 500, y: 150, type: 'square', size: 40 },
      { x: 1200, y: 120, type: 'triangle', size: 45 },
      { x: 1800, y: 200, type: 'square', size: 40 },
      { x: 900, y: 700, type: 'triangle', size: 50 },
      { x: 1700, y: 800, type: 'square', size: 40 },
      { x: 1000, y: 1200, type: 'triangle', size: 45 }
    ];

    this.totalTitansToKill = titanPositions.length;

    for (const pos of titanPositions) {
      const graphics = this.add.graphics();

      if (pos.type === 'square') {
        // Titán Cuadrado (Rojo oscuro con borde brillante)
        graphics.fillStyle(0xd9534f, 1);
        graphics.fillRect(-pos.size / 2, -pos.size / 2, pos.size, pos.size);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(-pos.size / 2, -pos.size / 2, pos.size, pos.size);
      } else {
        // Titán Triángulo / Aberrante (Naranja con borde brillante)
        graphics.fillStyle(0xf0ad4e, 1);
        graphics.beginPath();
        graphics.moveTo(0, -pos.size / 2);
        graphics.lineTo(pos.size / 2, pos.size / 2);
        graphics.lineTo(-pos.size / 2, pos.size / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokePath();
      }

      graphics.x = pos.x;
      graphics.y = pos.y;
      graphics.setDepth(5);

      const titan = {
        x: pos.x,
        y: pos.y,
        graphic: graphics,
        alive: true,
        radius: pos.size / 2
      };

      this.titans.push(titan);
    }
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

    // Tecla de ataque con cuchillas (Espacio)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.checkBladeAttack();
    }

    const aliveCount = this.titans.filter(t => t.alive).length;

    this.hud.setText([
      `Velocidad: ${Math.round(this.player.getSpeed())}`,
      `Cables activos: ${this.grappleSystem.getActiveCount()}/2`,
      `Titanes restantes: ${aliveCount}/${this.totalTitansToKill}`
    ]);

    // Condición de victoria
    if (aliveCount === 0 && this.totalTitansToKill > 0) {
      this.scene.start("GameOverScene", {
        victory: true,
        score: this.totalTitansToKill
      });
    }
  }

  checkBladeAttack() {
    const attackRange = 70; // Rango de corte de las cuchillas

    for (const titan of this.titans) {
      if (!titan.alive) continue;

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, titan.x, titan.y);

      if (dist <= attackRange) {
        // ¡Titán eliminado! Destruimos el gráfico y marcamos como inactivo
        titan.alive = false;
        titan.graphic.destroy();

        // Efecto visual rápido de corte (círculo destellante)
        const slashEffect = this.add.circle(titan.x, titan.y, 30, 0xffffff, 0.8).setDepth(20);
        this.tweens.add({
          targets: slashEffect,
          scale: 2,
          alpha: 0,
          duration: 200,
          onComplete: () => slashEffect.destroy()
        });
        break; // Corta un titán por pulsación de espacio
      }
    }
  }

  shutdown() {
    if (this.grappleSystem) {
      this.grappleSystem.destroy();
    }
  }
}
