import Phaser from "phaser";

export default class Controls {
  constructor(scene) {
    this.keys = scene.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
      upArrow: "UP",
      downArrow: "DOWN",
      leftArrow: "LEFT",
      rightArrow: "RIGHT",
      boost: "SHIFT",
      releaseLeft: "Q",
      releaseRight: "E"
    });
  }

  read() {
    const k = this.keys;

    return {
      x:
        Number(k.right.isDown || k.rightArrow.isDown) -
        Number(k.left.isDown || k.leftArrow.isDown),

      y:
        Number(k.down.isDown || k.downArrow.isDown) -
        Number(k.up.isDown || k.upArrow.isDown),

      boost: k.boost.isDown,
      releaseLeft: Phaser.Input.Keyboard.JustDown(k.releaseLeft),
      releaseRight: Phaser.Input.Keyboard.JustDown(k.releaseRight)
    };
  }
}
