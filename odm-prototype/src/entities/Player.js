
import Phaser from "phaser";
import { movementConfig as cfg } from "../config/movementConfig.js";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.body = scene.add.circle(x, y, cfg.playerRadius, 0x42d6c5)
      .setDepth(10)
      .setStrokeStyle(3, 0xffffff);

    this.direction = scene.add.graphics().setDepth(11);
  }

  updateMovement(input, delta) {
    const dt = Math.min(delta / 1000, 0.033);

    let dx = input.x;
    let dy = input.y;

    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    this.vx += dx * cfg.acceleration * dt;
    this.vy += dy * cfg.acceleration * dt;

    if (input.boost && length > 0) {
      this.vx += dx * cfg.propulsionAcceleration * dt;
      this.vy += dy * cfg.propulsionAcceleration * dt;
    }

    const speed = Math.hypot(this.vx, this.vy);

    if (speed > cfg.maxSpeed) {
      const scale = cfg.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // Fricción independiente de la tasa de fotogramas.
    const damping = Math.pow(cfg.friction, dt * 60);
    this.vx *= damping;
    this.vy *= damping;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.resolveBuildingCollisions();

    this.body.setPosition(this.x, this.y);

    this.direction.clear();

    if (speed > 5) {
      this.direction.lineStyle(3, 0xffffff, 0.8);
      this.direction.lineBetween(
        this.x,
        this.y,
        this.x + this.vx * 0.07,
        this.y + this.vy * 0.07
      );
    }
  }

  resolveBuildingCollisions() {
    const radius = cfg.playerRadius;

    for (const building of this.scene.buildings) {
      const left = building.x - building.width / 2;
      const right = building.x + building.width / 2;
      const top = building.y - building.height / 2;
      const bottom = building.y + building.height / 2;

      const nearestX = Phaser.Math.Clamp(this.x, left, right);
      const nearestY = Phaser.Math.Clamp(this.y, top, bottom);

      let dx = this.x - nearestX;
      let dy = this.y - nearestY;
      const distance = Math.hypot(dx, dy);

      if (distance >= radius) continue;

      if (distance > 0.001) {
        const overlap = radius - distance;
        this.x += (dx / distance) * overlap;
        this.y += (dy / distance) * overlap;

        const nx = dx / distance;
        const ny = dy / distance;
        const normalVelocity = this.vx * nx + this.vy * ny;

        if (normalVelocity < 0) {
          this.vx -= normalVelocity * nx;
          this.vy -= normalVelocity * ny;
        }
      } else {
        // Si el centro queda dentro del edificio,
        // lo desplazamos hacia el borde más cercano.
        const options = [
          { distance: this.x - left, x: left - radius, y: this.y, nx: -1, ny: 0 },
          { distance: right - this.x, x: right + radius, y: this.y, nx: 1, ny: 0 },
          { distance: this.y - top, x: this.x, y: top - radius, nx: 0, ny: -1 },
          { distance: bottom - this.y, x: this.x, y: bottom + radius, nx: 0, ny: 1 }
        ];

        options.sort((a, b) => a.distance - b.distance);
        const edge = options[0];

        this.x = edge.x;
        this.y = edge.y;

        const normalVelocity =
          this.vx * edge.nx + this.vy * edge.ny;

        if (normalVelocity < 0) {
          this.vx -= normalVelocity * edge.nx;
          this.vy -= normalVelocity * edge.ny;
        }
      }
    }
  }

  getSpeed() {
    return Math.hypot(this.vx, this.vy);
  }
}
