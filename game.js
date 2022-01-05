console.log(Phaser.AUTO);

var config = {
  type: Phaser.AUTO,
  width: 432,
  height: 480,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
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

var rocketAsset = "rocket-green";
var rocketCount = 0;
var rocketVelocity = 50;

var level = 1;
var levelText;
var score = 0;
var scoreText;

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("portal", "assets/portal.png");
  this.load.image("ep", "assets/ep.png");
  this.load.image("rocket-pink", "assets/rocket-pink.png");
  this.load.image("rocket-green", "assets/rocket-green.png");
  this.load.image("star", "assets/star.png");
}

function create() {
  // Environment
  this.add.image(216, 240, "background");
  startPortal = this.physics.add.sprite(216, 460, "portal");
  endPortal = this.physics.add.sprite(216, 20, "portal");

  // Stars
  stars = this.physics.add.group();
  updateStars(stars);

  // Level
  levelText = this.add.text(5, 5, "level: " + level, { fontSize: "30px", fill: "#d4996a" });
  levelText.setDepth(999999999999);

  // Score
  scoreText = this.add.text(5, 35, "score: " + score, { fontSize: "30px", fill: "#d4996a" });
  scoreText.setDepth(999999999999);

  // Rockets
  rockets = this.physics.add.group();
  updateRockets(rockets);

  // Test rectangles
  rocketRectangles = this.physics.add.group();
  updateRocketRectangles(this, rocketRectangles);

  // Character
  player = this.physics.add.sprite(216, 444, "ep");
  player.setCollideWorldBounds(true);
  player.setSize(18, 18);
  player.setBounce(0.5);
  player.setDepth(99999999999);

  // Character and Star
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // Character and Rocket
  //this.physics.add.collider(player, rockets, hitRocket, null, this);
  this.physics.add.collider(player, rocketRectangles, hitRocket, null, this);

  // Character and End Portal
  this.physics.add.overlap(player, endPortal, reachEndPortal, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 5;
  scoreText.setText("score: " + score);
}

function updateStars(stars) {
  stars.createMultiple({
    key: "star",
    repeat: 3,
    setXY: { x: 80, y: 80, stepX: 100 },
  });
  stars.createMultiple({
    key: "star",
    repeat: 3,
    setXY: { x: 80, y: 200, stepX: 100 },
  });
  stars.createMultiple({
    key: "star",
    repeat: 3,
    setXY: { x: 80, y: 320, stepX: 100 },
  });
  stars.getChildren().map((star) => {
    star.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20));
    star.setCollideWorldBounds(true);
    star.setBounce(1);
  });
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function setRocketVelocity(rocket, angle, velocity) {
  rocket.setAngle(angle);
  rocket.setVelocity(velocity * Math.cos(toRadians(angle)), velocity * Math.sin(toRadians(angle)));
}

function updateRockets(rockets) {
  console.log("new rockets");
  if (level % 2 == 0 || level == 1) rocketCount++;
  rocketVelocity = rocketVelocity + 5;
  for (i = 0; i < rocketCount; i++) {
    var rocket;
    var angle;
    var velocity = rocketVelocity + Phaser.Math.Between(-15, 15);
    if (i % 2 == 0) {
      rocket = rockets.create(-60, Phaser.Math.Between(50, 400), rocketAsset);
      rocket.setData("left", true);
      angle = Phaser.Math.Between(-60, 60);
    } else {
      rocketAsset = rocketAsset == "rocket-green" ? "rocket-pink" : "rocket-green";
      rocket = rockets.create(430, Phaser.Math.Between(50, 400), rocketAsset);
      rocket.setData("left", false);
      angle = Phaser.Math.Between(-120, -240);
    }
    setRocketVelocity(rocket, angle, velocity);
    rocket.setData("angle", angle);
    rocket.setData("velocity", velocity);
    rocket.setData("rocketName", "rocket-" + i);
  }
}

function updateRocketRectangles(addToThis, rocketRectangles) {
  rockets.getChildren().map((rocket) => {
    var angle = rocket.getData("angle");
    var velocity = rocket.getData("velocity");
    // 60 is half length of rocket
    var offsetX = (60 * Math.cos(toRadians(angle))) / 2;
    var offsetY = (60 * Math.sin(toRadians(angle))) / 2;
    // 48 is height of rocket
    var r1 = addToThis.add.rectangle(rocket.x - offsetX, rocket.y - offsetY, 48, 48);
    var r2 = addToThis.add.rectangle(rocket.x + offsetX, rocket.y + offsetY, 48, 48);
    rocketRectangles.add(r1);
    rocketRectangles.add(r2);
    r1.setAngle(angle);
    r2.setAngle(angle);
    var velocityX = velocity * Math.cos(toRadians(angle));
    var velocityY = velocity * Math.sin(toRadians(angle));
    r1.body.velocity.x = r2.body.velocity.x = velocityX;
    r1.body.velocity.y = r2.body.velocity.y = velocityY;
    r1.setData("rocketName", rocket.getData("rocketName"));
    r2.setData("rocketName", rocket.getData("rocketName"));
    r1.setData("offsetX", -offsetX);
    r1.setData("offsetY", -offsetY);
    r2.setData("offsetX", offsetX);
    r2.setData("offsetY", offsetY);
    //this.physics.pause();
  });
}

function tweenComplete() {
  // Update text
  level++;
  score += 10;
  levelText.setText("level: " + level);
  scoreText.setText("score: " + score);

  canResume = true;
}

function reachEndPortal(player, portal) {
  this.physics.pause();

  rockets.clear(true, true);
  rocketRectangles.clear(true, true);
  stars.clear(true, true);

  this.tweens.add({
    targets: player,
    alpha: 0,
    ease: "Cubic.easeOut",
    duration: 500,
    repeat: 1,
    yoyo: true,
    onYoyo: function () {
      // Reposition player
      player.setPosition(214, 438);
      player.setVelocity(0, 0);
    },
    onComplete: function () {
      tweenComplete();
    },
  });
}

function hitRocket(player, rocket) {
  this.physics.pause();

  console.log("hit", rocket);

  // TODO: tween ep rotate
  // TODO: game over text
  // TODO: reset game

  gameOver = true;
}

function checkInWorld(scene, rocket) {
  return Phaser.Geom.Rectangle.Overlaps(scene.scene.physics.world.bounds, rocket.getBounds());
}

function repositionRocket(scene, rocket) {
  if (!checkInWorld(scene, rocket)) {
    if (rocket.getData("left")) {
      rocket.body.x = -60;
    } else {
      rocket.body.x = 430;
    }
    rocket.body.y = Phaser.Math.Between(50, 400);
    repositionRocketRectangles(rocket);
  }
}

function repositionRocketRectangles(repositionRocket) {
  var repositionRectangles = rocketRectangles
    .getChildren()
    .filter((rocket) => rocket.getData("rocketName") == repositionRocket.getData("rocketName"));
  repositionRectangles.map((rectangle) => {
    console.log(repositionRocket.body.x);
    rectangle.body.x = repositionRocket.body.x + 38 + rectangle.getData("offsetX");
    rectangle.body.y = repositionRocket.body.y + rectangle.getData("offsetY");
  });
}

function update() {
  player.setDamping(true);
  const dragValue = 0.15;

  // Reposition rocket when it dissappears from screen
  rockets.getChildren().map((rocket) => {
    repositionRocket(this.scene, rocket);
  });

  if (this.physics.world.isPaused && canResume && !gameOver) {
    if (cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp) {
      // Recreate Stars
      stars = this.physics.add.group();
      updateStars(stars);
      this.physics.add.overlap(player, stars, collectStar, null, this);

      // Recreate Rockets
      rockets = this.physics.add.group();
      updateRockets(rockets);
      rocketRectangles = this.physics.add.group();
      updateRocketRectangles(this, rocketRectangles);
      this.physics.add.collider(player, rocketRectangles, hitRocket, null, this);
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
