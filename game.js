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

var rocketAsset = "rocket-green";
var rocketCount = 0;
var rocketVelocity = 50;

var level = 1;
var levelText;
var score = 0;
var scoreText;
var gameOverText;
var resetGameText;

var rocketCollider;

function preload() {
  // Images
  this.load.image("background", "assets/background.png");
  this.load.image("portal", "assets/portal.png");
  this.load.image("ep", "assets/ep.png");
  this.load.image("rocket-pink", "assets/rocket-pink.png");
  this.load.image("rocket-green", "assets/rocket-green.png");
  this.load.image("star", "assets/star.png");

  // Sounds
  this.load.audio("collect-star-audio", ["assets/audio/collect-star.wav"]);
  this.load.audio("collect-all-stars-audio", ["assets/audio/collect-all-stars.wav"]);
  this.load.audio("game-over-audio", ["assets/audio/game-over.wav"]);
  this.load.audio("level-up-audio", ["assets/audio/level-up.wav"]);
  this.load.audio("background-music", ["assets/audio/background-music.wav"]);
}

function create() {
  // Environment
  background = this.add.image(216, 240, "background");
  startPortal = this.physics.add.sprite(216, 460, "portal");
  endPortal = this.physics.add.sprite(216, 20, "portal");

  // Stars
  stars = this.physics.add.group();
  updateStars(stars);

  // Level
  levelText = this.add.text(5, 5, "level:" + level, { fontSize: "30px", fill: "#d4996a" });
  levelText.setStroke("#252945", 2);
  levelText.setDepth(999999999999);

  // Score
  scoreText = this.add.text(5, 35, "score:" + score, { fontSize: "30px", fill: "#d4996a" });
  scoreText.setStroke("#252945", 2);
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
  rocketCollider = this.physics.add.collider(player, rocketRectangles, hitRocket, null, this);

  // Character and End Portal
  this.physics.add.overlap(player, endPortal, reachEndPortal, null, this);

  cursors = this.input.keyboard.createCursorKeys();

  // Sounds
  starSoundEffect = this.sound.add("collect-star-audio");
  collectAllStarsSoundEffect = this.sound.add("collect-all-stars-audio");
  gameOverSoundEffect = this.sound.add("game-over-audio");
  levelUpSoundEffect = this.sound.add("level-up-audio");
  backgroundMusic = this.sound.add("background-music");

  //backgroundMusic.play({ loop: true, volume: 0.75 });
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += level * 5;
  scoreText.setText("score:" + score);

  starSoundEffect.play();

  if (stars.countActive(true) === 0) {
    score += 50;
    scoreText.setText("score:" + score);
    starSoundEffect.stop();
    collectAllStarsSoundEffect.play();
    rocketCollider.active = false;
    player.setBlendMode(Phaser.BlendModes.ADD);
  }
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
  var starCount = 1;
  stars.getChildren().map((star) => {
    star.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20));
    star.setCollideWorldBounds(true);
    star.setBounce(1);
    star.setDepth(starCount % 2 == 0 ? 1 : 3);
    starCount++;
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
  if (level % 2 == 0 || level == 1) rocketCount++;
  rocketVelocity = rocketVelocity + 5;
  for (i = 0; i < rocketCount; i++) {
    var rocket;
    var angle;
    var velocity = rocketVelocity + Phaser.Math.Between(-20, 20);
    if (i % 2 == 0) {
      rocket = rockets.create(-100, Phaser.Math.Between(50, 400), rocketAsset);
      rocket.setData("left", true);
      angle = Phaser.Math.Between(-60, 60);
    } else {
      rocketAsset = rocketAsset == "rocket-green" ? "rocket-pink" : "rocket-green";
      rocket = rockets.create(430, Phaser.Math.Between(50, 400), rocketAsset);
      rocket.setData("left", false);
      rocket.setFlip(false, true);
      angle = Phaser.Math.Between(-140, -220);
    }
    setRocketVelocity(rocket, angle, velocity);
    rocket.setData("angle", angle);
    rocket.setData("velocity", velocity);
    rocket.setData("rocketName", "rocket-" + i);
    rocket.setDepth(2);
  }
}

function addRocketRectangle(addToThis, rocketRectangles, rocket, angle, velocity, offsetX, offsetY) {
  var rectangle = addToThis.add.rectangle(rocket.x + offsetX, rocket.y + offsetY, 40, 40);
  rocketRectangles.add(rectangle);
  rectangle.setAngle(angle);
  rectangle.body.velocity.x = velocity * Math.cos(toRadians(angle));
  rectangle.body.velocity.y = velocity * Math.sin(toRadians(angle));
  rectangle.setData("rocketName", rocket.getData("rocketName"));
  rectangle.setData("offsetX", offsetX);
  rectangle.setData("offsetY", offsetY);
}

function updateRocketRectangles(addToThis, rocketRectangles) {
  rockets.getChildren().map((rocket) => {
    var angle = rocket.getData("angle");
    var velocity = rocket.getData("velocity");
    // 60 is half length of rocket
    var offsetX = (60 * Math.cos(toRadians(angle))) / 2;
    var offsetY = (60 * Math.sin(toRadians(angle))) / 2;
    addRocketRectangle(addToThis, rocketRectangles, rocket, angle, velocity, -offsetX, -offsetY);
    addRocketRectangle(addToThis, rocketRectangles, rocket, angle, velocity, offsetX, offsetY);
  });
}

function tweenComplete() {
  // Update text
  level++;
  score += level * 10;
  levelText.setText("level:" + level);
  scoreText.setText("score:" + score);

  canResume = true;
}

function reachEndPortal(player, portal) {
  this.physics.pause();

  rockets.clear(true, true);
  rocketRectangles.clear(true, true);
  stars.clear(true, true);

  starSoundEffect.stop();
  collectAllStarsSoundEffect.stop();
  levelUpSoundEffect.play();
  player.setBlendMode(Phaser.BlendModes.NORMAL);

  this.tweens.add({
    targets: player,
    alpha: 0,
    ease: "Cubic.easeOut",
    duration: 500,
    repeat: 1,
    yoyo: true,
    onYoyo: function () {
      // Reposition player
      player.setPosition(216, 438);
      player.setVelocity(0, 0);
    },
    onComplete: function () {
      tweenComplete();
    },
  });
}

function hitRocket(player, rocket) {
  this.physics.pause();

  // Tint
  background.setTint(0x848fa1);
  rockets.setTint(0x848fa1);
  stars.setTint(0x848fa1);
  startPortal.setTint(0x848fa1);
  endPortal.setTint(0x848fa1);
  player.setTint(0xa13567);

  // Rotate ep
  this.tweens.add({
    targets: player,
    angle: 360.0,
    duration: 1500,
    repeat: -1,
  });

  // Game Over
  gameOverText = this.add.text(58, 200, "game over!", { fontSize: "56px", fill: "#79bee0" });
  gameOverText.setStroke("#252945", 2);
  gameOverText.setDepth(999999999999);
  resetGameText = this.add.text(15, 256, "press spacebar to play again", { fontSize: "24px", fill: "#79bee0" });
  resetGameText.setStroke("#252945", 2);
  resetGameText.setDepth(999999999999);

  gameOver = true;

  starSoundEffect.stop();
  collectAllStarsSoundEffect.stop();
  levelUpSoundEffect.stop();
  gameOverSoundEffect.play();
}

function checkInWorld(scene, rocket) {
  return Phaser.Geom.Rectangle.Overlaps(scene.scene.physics.world.bounds, rocket.getBounds());
}

function repositionRocket(scene, rocket) {
  if (!checkInWorld(scene, rocket)) {
    if (rocket.getData("left")) {
      rocket.body.x = -100;
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

  if (gameOver && cursors.space.isDown) {
    // Reset values
    rocketCount = 0;
    rocketVelocity = 50;
    level = 1;
    score = 0;
    gameOver = false;
    player.setBlendMode(Phaser.BlendModes.NORMAL);
    this.scene.restart();
  }

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
      rocketCollider = this.physics.add.collider(player, rocketRectangles, hitRocket, null, this);
      this.physics.resume();

      canResume = false;
    }
  }

  var playerVelocity = 180;
  // Left/right
  if (cursors.left.isDown) {
    player.setVelocityX(-playerVelocity);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerVelocity);
  } else if (cursors.left.isUp) {
    player.setDragX(dragValue);
  } else if (cursors.right.isUp) {
    player.setDragX(dragValue);
  }

  // Up/down
  if (cursors.up.isDown) {
    player.setVelocityY(-playerVelocity);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerVelocity);
  } else if (cursors.up.isUp) {
    player.setDragY(dragValue);
  } else if (cursors.down.isUp) {
    player.setDragY(dragValue);
  }
}
