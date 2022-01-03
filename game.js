console.log(Phaser.AUTO);

var config = {
  type: Phaser.AUTO,
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
var gameOver = false;
var canResume = false;

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("portal", "assets/portal.png");
  this.load.image("ep", "assets/ep.png");
  this.load.image("rocket-pink", "assets/rocket-pink.png");
  this.load.image("rocket-green", "assets/rocket-green.png");
}

function create() {
  // Environment
  this.add.image(216, 240, "background");
  startPortal = this.physics.add.sprite(216, 460, "portal");
  endPortal = this.physics.add.sprite(216, 20, "portal");

  // Rockets
  rockets = this.physics.add.group();
  var rocketGreen1 = rockets.create(350, 100, "rocket-green");
  var rocketPink1 = rockets.create(75, 100, "rocket-pink");
  var rocketGreen2 = rockets.create(-50, 225, "rocket-green");
  var rocketPink2 = rockets.create(225, 225, "rocket-pink");
  var rocketGreen3 = rockets.create(350, 350, "rocket-green");
  var rocketPink3 = rockets.create(75, 350, "rocket-pink");

  rocketGreen1.setName("greenRocket1");
  rocketPink1.setName("pinkRocket1");
  rocketGreen2.setName("greenRocket2");
  rocketPink2.setName("pinkRocket2");
  rocketGreen3.setName("greenRocket3");
  rocketPink3.setName("pinkRocket3");
  rockets.setVelocityX(50);

  // Character
  player = this.physics.add.sprite(216, 444, "ep");
  player.setCollideWorldBounds(true);
  player.setSize(12, 12);

  // Character and Rocket
  this.physics.add.collider(player, rockets, hitRocket, null, this);

  // Character and End Portal
  this.physics.add.overlap(player, endPortal, reachEndPortal, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function reachEndPortal(player, portal) {
  this.physics.pause();
  player.body.x = 210;
  player.body.y = 438;
}

function hitRocket(player, rocket) {
  this.physics.pause();

  gameOver = true;
}

function checkInWorld(scene, rocket) {
  return Phaser.Geom.Rectangle.Overlaps(scene.scene.physics.world.bounds, rocket.getBounds());
}

function repositionRocket(scene, rocket) {
  if (!checkInWorld(scene, rocket)) {
    rocket.body.x = -110;
  }
}

function update() {
  player.setDamping(true);
  const dragValue = 0.15;

  repositionRocket(this.scene, rockets.getMatching("name", "greenRocket1")[0]);
  repositionRocket(this.scene, rockets.getMatching("name", "pinkRocket1")[0]);
  repositionRocket(this.scene, rockets.getMatching("name", "greenRocket2")[0]);
  repositionRocket(this.scene, rockets.getMatching("name", "pinkRocket2")[0]);
  repositionRocket(this.scene, rockets.getMatching("name", "greenRocket3")[0]);
  repositionRocket(this.scene, rockets.getMatching("name", "pinkRocket3")[0]);

  if (this.physics.world.isPaused && !gameOver) {
    if (cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
      canResume = true;
    }
    if (canResume && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)) {
      this.physics.resume();
      canResume = false;
    }
  }

  // Left/right
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else if (cursors.left.isUp) {
    player.setDragX(dragValue);
  } else if (cursors.right.isUp) {
    player.setDragX(dragValue);
  }

  // Up/down
  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  } else if (cursors.up.isUp) {
    player.setDragY(dragValue);
  } else if (cursors.down.isUp) {
    player.setDragY(dragValue);
  }
}
