
import { movementConfig as cfg } from "../config/movementConfig.js";

export default class GrappleSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.cables = [null, null];

    this.graphics = scene.add.graphics().setDepth(5);

    // Clic izquierdo: gancho izquierdo.
    // Clic derecho: gancho derecho.
    scene.input.on("pointerdown", (pointer) => {
      const worldPoint = scene.cameras.main.getWorldPoint(
        pointer.x,
        pointer.y
      );

      if (pointer.button === 0) {
        this.launch(0, worldPoint.x, worldPoint.y);
      } else if (pointer.button === 2) {
        this.launch(1, worldPoint.x, worldPoint.y);
      }
    });

    // Evitar que el menú contextual interfiera con el clic derecho.
    scene.game.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  launch(index, targetX, targetY) {
    let bestAnchor = null;
    let bestDistance = Infinity;

    for (const anchor of this.scene.anchors) {
      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        anchor.x,
        anchor.y
      );

      const playerDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        anchor.x,
        anchor.y
      );

      if (
        distance < 55 &&
        playerDistance <= cfg.grappleRange &&
        playerDistance < bestDistance
      ) {
        bestAnchor = anchor;
        bestDistance = playerDistance;
      }
    }

    if (!bestAnchor) return;

    const cableLength = Phaser.Math.Clamp(
      bestDistance,
      cfg.minCableLength,
      cfg.maxCableLength
    );

    this.cables[index] = {
      anchor: bestAnchor,
      length: cableLength
    };
  }

  release(index) {
    this.cables[index] = null;
  }

  update(delta) {
    const dt = Math.min(delta / 1000, 0.033);

    // Una pasada de corrección por cable.
    // La velocidad tangencial se conserva.
    for (const cable of this.cables) {
      if (!cable) continue;

      const dx = this.player.x - cable.anchor.x;
      const dy = this.player.y - cable.anchor.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= cable.length || distance < 0.001) {
        continue;
      }

      const nx = dx / distance;
      const ny = dy / distance;

      this.player.x = cable.anchor.x + nx * cable.length;
      this.player.y = cable.anchor.y + ny * cable.length;

      // Eliminar solo la velocidad que alarga el cable.
      const radialVelocity =
        this.player.vx * nx + this.player.vy * ny;

      if (radialVelocity > 0) {
        this.player.vx -= radialVelocity * nx;
        this.player.vy -= radialVelocity * ny;
      }
    }

    this.draw();
  }

  draw() {
    this.graphics.clear();

    this.cables.forEach((cable, index) => {
      if (!cable) return;

      const color = index === 0 ? 0x66eaff : 0xffd166;

      this.graphics.lineStyle(2, color, 0.95);
      this.graphics.lineBetween(
        this.player.x,
        this.player.y,
        cable.anchor.x,
        cable.anchor.y
      );

      this.graphics.fillStyle(color, 1);
      this.graphics.fillCircle(
        cable.anchor.x,
        cable.anchor.y,
        5
      );
    });
  }

  getActiveCount() {
    return this.cables.filter(Boolean).length;
  }

  destroy() {
    this.scene.input.off("pointerdown");
    this.graphics.destroy();
  }
}
