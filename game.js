console.log(Phaser.AUTO);

var config = {
  type: Phaser.AUTO,
  //width: 144,
  //height: 160,
  width: 432,
  height: 480,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  autoCenter: true,
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("portal", "assets/portal.png");
  this.load.image("ep", "assets/ep.png");
  this.load.image("rocket-pink", "assets/rocket-pink.png");
  this.load.image("rocket-green", "assets/rocket-green.png");
}

function create() {
  // Background
  this.add.image(216, 240, "background");
  // Start portal
  this.add.image(216, 460, "portal");
  // End portal
  this.add.image(216, 20, "portal");

  // Rockets
  rockets = this.physics.add.group();
  var rocketPink1 = rockets.create(150, 100, "rocket-pink");
  var rocketGreen1 = rockets.create(300, 100, "rocket-green");

  // Character
  player = this.physics.add.sprite(216, 444, "ep");

  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }
}
