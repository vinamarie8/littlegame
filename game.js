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
var rocketCount = 0;
var rocketVelocity = 50;

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
  updateRockets(rockets);

  // Character
  player = this.physics.add.sprite(216, 444, "ep");
  player.setCollideWorldBounds(true);
  player.setSize(12, 12);
  player.setDepth(99999999999);

  // Character and Rocket
  this.physics.add.collider(player, rockets, hitRocket, null, this);

  // Character and End Portal
  this.physics.add.overlap(player, endPortal, reachEndPortal, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function setRocketVelocity(rocket, angle) {
  var velocity = rocketVelocity + Phaser.Math.Between(-10, 10);
  rocket.setAngle(angle);
  rocket.setVelocity(velocity * Math.cos(toRadians(angle)), velocity * Math.sin(toRadians(angle)));
}

function updateRockets(rockets) {
  rocketCount++;
  rocketVelocity = rocketVelocity + 5;
  for (i = 0; i < rocketCount; i++) {
    var rocket;
    if (i % 2 == 0) {
      rocket = rockets.create(-110, Phaser.Math.Between(50, 400), "rocket-green");
      rocket.setData("left", true);
      // Set velocity
      var angle = Phaser.Math.Between(-60, 60);
      setRocketVelocity(rocket, angle);
    } else {
      rocket = rockets.create(430, Phaser.Math.Between(50, 400), "rocket-pink");
      rocket.setData("left", false);
      // Set velocity
      var angle = Phaser.Math.Between(-120, -240);
      setRocketVelocity(rocket, angle);
    }
  }
}

function reachEndPortal(player, portal) {
  this.physics.pause();
  rockets.clear(true, true);
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
    if (rocket.getData("left")) {
      rocket.body.x = -110;
    } else {
      rocket.body.x = 430;
    }
    rocket.body.y = Phaser.Math.Between(50, 400);
  }
}

function update() {
  player.setDamping(true);
  const dragValue = 0.15;

  rockets.getChildren().map((rocket) => {
    repositionRocket(this.scene, rocket);
  });
  /*repositionRocket(this.scene, rockets.getMatching("name", "greenRocket1")[0]);*/

  if (this.physics.world.isPaused && !gameOver) {
    if (cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
      canResume = true;
    }
    if (canResume && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)) {
      rockets = this.physics.add.group();
      updateRockets(rockets);
      // Character and Rocket
      this.physics.add.collider(player, rockets, hitRocket, null, this);
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
