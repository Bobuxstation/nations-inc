class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image("sprWater", "content/sprWater.png");
    this.load.image("sprSand", "content/sprSand.png");
    this.load.image("sprGrass", "content/sprGrass.png");
    this.load.image("sprMountain", "content/sprMountain.png");
    this.load.image("sprTown", "content/sprTown.png");
    this.load.image("sprTroop", "content/sprTroop.png");
    this.load.image("sprCapital", "content/sprCapital.png");
  }

  calculateChunkSize() {
    const baseChunkSize = 6;
    const screenFactor = Math.min(this.scale.width, this.scale.height) / 800;
    this.chunkSize = Math.max(4, Math.floor(baseChunkSize * screenFactor));
  }

  create() {
    this.calculateChunkSize();

    this.tileSize = 16;
    this.cameraSpeed = 10;
    this.gameStarted = false;
    this.seed = Math.random() * 1000;

    this.cameras.main.setZoom(2);
    this.followPoint = new Phaser.Math.Vector2(
      this.cameras.main.worldView.x + (this.cameras.main.worldView.width * 0.5),
      this.cameras.main.worldView.y + (this.cameras.main.worldView.height * 0.5)
    );

    this.chunks = [];

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.scale.on('resize', this.handleResize, this);
  }

  handleResize() {
    this.calculateChunkSize();
  }

  getChunk(x, y) {
    var chunk = null;
    for (var i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].x == x && this.chunks[i].y == y) {
        chunk = this.chunks[i];
      }
    }
    return chunk;
  }

  update() {
    var snappedChunkX = (this.chunkSize * this.tileSize) * Math.round(this.followPoint.x / (this.chunkSize * this.tileSize));
    var snappedChunkY = (this.chunkSize * this.tileSize) * Math.round(this.followPoint.y / (this.chunkSize * this.tileSize));

    snappedChunkX = snappedChunkX / this.chunkSize / this.tileSize;
    snappedChunkY = snappedChunkY / this.chunkSize / this.tileSize;

    for (var x = snappedChunkX - 5; x < snappedChunkX + 5; x++) {
      for (var y = snappedChunkY - 5; y < snappedChunkY + 5; y++) {
        var existingChunk = this.getChunk(x, y);

        if (existingChunk == null) {
          var newChunk = new Chunk(this, x, y, this.seed);
          this.chunks.push(newChunk);
        }
      }
    }

    for (var i = 0; i < this.chunks.length; i++) {
      var chunk = this.chunks[i];

      if (Phaser.Math.Distance.Between(
        snappedChunkX,
        snappedChunkY,
        chunk.x,
        chunk.y
      ) < 6) {
        if (chunk !== null) {
          chunk.load();
        }
      }
      else {
        if (chunk !== null) {
          chunk.unload();
        }
      }
    }

    if (this.gameStarted) {
      if (this.keyW.isDown) {
        this.followPoint.y -= this.cameraSpeed;
      }
      if (this.keyS.isDown) {
        this.followPoint.y += this.cameraSpeed;
      }
      if (this.keyA.isDown) {
        this.followPoint.x -= this.cameraSpeed;
      }
      if (this.keyD.isDown) {
        this.followPoint.x += this.cameraSpeed;
      }
    } else {
      this.followPoint.y -= 0.25;
      this.followPoint.x += 0.25;
    }

    this.cameras.main.centerOn(this.followPoint.x, this.followPoint.y);
  }
}