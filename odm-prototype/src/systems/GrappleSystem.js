import Phaser from "phaser";
import { movementConfig as cfg } from "../config/movementConfig.js";

export default class GrappleSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.cables = [null, null];

    this.graphics = scene.add.graphics().setDepth(5);

    // Guardamos referencias a las funciones para poder removerlas limpiamente
    this.onPointerDown = (pointer) => {
      // Ignorar clics si el juego está pausado o si viene del menú anterior
      if (this.scene.scene.isPaused()) return;
      
      const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if (pointer.button === 0) {
        this.launch(0, worldPoint.x, worldPoint.y);
      } else if (pointer.button === 2) {
        this.launch(1, worldPoint.x, worldPoint.y);
      }
    };

    this.onPointerUp = (pointer) => {
      if (pointer.button === 0) {
        this.release(0);
      } else if (pointer.button === 2) {
        this.release(1);
      }
    };

    // Limpiamos cualquier listener previo antes de registrar nuevos
    scene.input.off("pointerdown");
    scene.input.off("pointerup");

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointerup", this.onPointerUp);

    if (!this.contextMenuHandled) {
      scene.game.canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
      this.contextMenuHandled = true;
    }
  }

  launch(index, targetX, targetY) {
    let bestAnchor = null;
    let bestDistance = Infinity;

    for (const anchor of this.scene.anchors) {
      // Distancia entre el cursor y el anclaje
      const distance = Phaser.Math.Distance.Between(targetX, targetY, anchor.x, anchor.y);
      // Distancia entre el jugador y el anclaje
      const playerDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, anchor.x, anchor.y);

      // Se aumentó la tolerancia a 120px para que enganchar al hacer clic cerca sea más accesible
      if (
        distance < 120 &&
        playerDistance <= (cfg.grappleRange || 800) &&
        playerDistance < bestDistance
      ) {
        bestAnchor = anchor;
        bestDistance = playerDistance;
      }
    }

    if (!bestAnchor) return;

    const minLen = cfg.minCableLength || 30;
    const maxLen = cfg.maxCableLength || 600;

    const cableLength = Phaser.Math.Clamp(bestDistance, minLen, maxLen);

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

    for (const cable of this.cables) {
      if (!cable) continue;

      const dx = cable.anchor.x - this.player.x;
      const dy = cable.anchor.y - this.player.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 0.001) continue;

      const nx = dx / distance;
      const ny = dy / distance;

      // Fuerza de atracción hacia el anclaje mientras se mantiene presionado el botón
      const pullForce = 900;
      this.player.vx += nx * pullForce * dt;
      this.player.vy += ny * pullForce * dt;

      // Reducción progresiva de la longitud del cable (efecto carrete/tracción del ODM)
      cable.length = Math.max(30, cable.length - 200 * dt);

      // Restricción física del cable
      if (distance > cable.length) {
        this.player.x = cable.anchor.x - nx * cable.length;
        this.player.y = cable.anchor.y - ny * cable.length;

        const radialVelocity = -this.player.vx * nx - this.player.vy * ny;
        if (radialVelocity > 0) {
          this.player.vx += radialVelocity * nx;
          this.player.vy += radialVelocity * ny;
        }
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
      this.graphics.fillCircle(cable.anchor.x, cable.anchor.y, 5);
    });
  }

  getActiveCount() {
    return this.cables.filter(Boolean).length;
  }

  destroy() {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.graphics.destroy();
  }
}