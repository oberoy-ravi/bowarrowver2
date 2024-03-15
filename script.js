const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#ffffff",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 0,
      },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  input: {
    activePointers: 2,
  },
};

const game = new Phaser.Game(config);

let bow;
let arrow;
let target;
let cheerGirl;

function preload() {
  this.load.image("bow", "assets/bow.png");
  this.load.image("arrow", "assets/arrow.png");
  this.load.image("target", "assets/target.png");
  this.load.image("cheerGirl", "assets/cheer_girl.png");
}

function create() {
  const width = game.config.width;
  const height = game.config.height;

  arrow = this.physics.add.sprite(width / 2, height / 2, "arrow");
  arrow.visible = false;

  bow = this.add.sprite(width / 2, height - 100, "bow");
  bow.setScale(0.4, 0.3);
  bow.setPosition(width * 0.15, height * 0.8);

  arrow.setScale(0.3, 0.1);

  target = this.physics.add.sprite(
    width,
    Phaser.Math.Between(height * 0.2, height * 0.8),
    "target"
  );
  target.setVelocityX(-200);
  target.setScale(0.5);

  cheerGirl = this.add.sprite(width - 100, height - 100, "cheerGirl");
  cheerGirl.visible = false;
  cheerGirl.setScale(0.5);

  this.anims.create({
    key: "cheer",
    frames: [{ key: "cheerGirl" }],
    frameRate: 10,
    repeat: 0,
  });

  this.input.on("pointerdown", handleShoot, this);
  this.input.addPointer(2);

  this.physics.add.collider(arrow, target, handleHit, null, this);

  // Resize the game to fit the new window dimensions
  window.addEventListener("resize", function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    game.scale.resize(newWidth, newHeight);
  });
}

function update() {
  const width = game.config.width;

  const pointer = this.input.activePointer;
  const angle = Phaser.Math.Angle.Between(bow.x, bow.y, pointer.x, pointer.y);
  bow.setRotation(angle);

  if (target.x >= width - target.width) {
    target.setVelocityX(-100);
  } else if (target.x <= target.width) {
    target.setVelocityX(100);
  }
}

function handleShoot(pointer) {
  const width = game.config.width;
  const height = game.config.height;
  const arrowSpeed = 290;

  arrow.visible = true;
  arrow.x = bow.x;
  arrow.y = bow.y;

  if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
    const touch1X = this.input.pointer1.x;
    const touch2X = this.input.pointer2.x;
    const targetX = (touch1X + touch2X) / 2;

    this.physics.moveTo(arrow, targetX, bow.y, arrowSpeed);
  } else {
    this.physics.moveTo(arrow, pointer.x, pointer.y, arrowSpeed);
  }
}

function handleHit(arrow, target) {
  const width = game.config.width;
  const height = game.config.height;
  let isAiming = true;
  let isArrowReleased = false;

  if (isAiming && !isArrowReleased) {
    arrow.visible = false;
    target.visible = false;

    // Reposition the girl's animation
    cheerGirl.setPosition(
      width - cheerGirl.displayWidth / 2 - 50,
      height - cheerGirl.displayHeight / 2 - 50
    );
    cheerGirl.visible = true;

    // Create a jiggle animation for the girl
    this.tweens.add({
      targets: cheerGirl,
      y: cheerGirl.y - 20, // Move up
      duration: 200,
      yoyo: true,
      repeat: 4, // Jiggle 4 times
      onComplete: () => {
        cheerGirl.visible = false;
        repositionTarget();
      },
    });
  }
}

function repositionTarget() {
  const width = game.config.width;
  const height = game.config.height;

  // Randomly reposition the target
  target.setPosition(
    Phaser.Math.Between(target.width, width - target.width),
    Phaser.Math.Between(target.height, height - target.height)
  );

  // Make the target visible again
  target.visible = true;
}
