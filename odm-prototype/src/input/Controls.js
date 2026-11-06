import Phaser from "phaser";

export default class Controls {
  constructor(scene) {
    this.scene = scene;

    this.keys = scene.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
      boost: "SHIFT",
      releaseLeft: "Q",
      releaseRight: "E"
    });

    this.prevLeftDown = false;
    this.prevRightDown = false;

    // Desactiva el menú contextual del navegador al hacer clic derecho
    scene.input.mouse.disableContextMenu();
  }

  read() {
    const k = this.keys;
    const pointer = this.scene.input.activePointer;

    // Traducir la posición de la pantalla del mouse a coordenadas del mundo del juego
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const leftDown = typeof pointer.leftButtonDown === 'function' ? pointer.leftButtonDown() : false;
    const rightDown = typeof pointer.rightButtonDown === 'function' ? pointer.rightButtonDown() : false;
    const leftReleased = typeof pointer.leftButtonReleased === 'function' ? pointer.leftButtonReleased() : false;
    const rightReleased = typeof pointer.rightButtonReleased === 'function' ? pointer.rightButtonReleased() : false;

    const leftJustDown = leftDown && !this.prevLeftDown;
    const rightJustDown = rightDown && !this.prevRightDown;

    this.prevLeftDown = leftDown;
    this.prevRightDown = rightDown;

    return {
      x: Number(k.right.isDown) - Number(k.left.isDown),
      y: Number(k.down.isDown) - Number(k.up.isDown),
      boost: k.boost.isDown,

      // Teclas para soltar cables
      releaseLeft: Phaser.Input.Keyboard.JustDown(k.releaseLeft),
      releaseRight: Phaser.Input.Keyboard.JustDown(k.releaseRight),

      // Clic izquierdo (Gancho Izquierdo)
      leftDown,
      leftJustDown,
      leftReleased,

      // Clic derecho (Gancho Derecho)
      rightDown,
      rightJustDown,
      rightReleased,

      // Coordenadas del mouse en el mundo para saber a dónde disparar
      mouseX: worldPoint.x,
      mouseY: worldPoint.y
    };
  }
}
