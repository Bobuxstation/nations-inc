class Chunk {
  constructor(scene, x, y, seed) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.tiles = this.scene.add.group();
    this.isLoaded = false;
    this.seed = seed;
  }

  unload() {
    if (this.isLoaded) {
      this.tiles.clear(true, true);
      this.isLoaded = false;
    }
  }

  createTownData(tileX, tileY) {
    var cityName = faker.address.city();
    var citySecondName = faker.address.city();
    var divisionGen = randomizeDivisions(1, false)
    var randomresourceandfactories = randomizeFactoriesAndResources(divisionGen);
    var tradeLuck = Math.max(Math.floor(Math.random() * 10), 1);
    var money = Math.max(Math.floor(Math.random() * 10_000_000), 1);
    return {
      "isExplored": false,
      "isConquered": false,
      "divisions": divisionGen,
      "xPosition": tileX,
      "yPosition": tileY,
      "countryName": `${cityName}-${citySecondName}`,
      "money": money,
      "tradeluck": tradeLuck,
      "relation": 1,
      "factories": randomresourceandfactories["factories"],
      "inventory": randomresourceandfactories["resources"]
    }
  }

  load() {
    if (!this.isLoaded) {
      noise.seed(this.seed);
      for (var x = 0; x < this.scene.chunkSize; x++) {
        for (var y = 0; y < this.scene.chunkSize; y++) {
          var tileX = (this.x * (this.scene.chunkSize * this.scene.tileSize)) + (x * this.scene.tileSize);
          var tileY = (this.y * (this.scene.chunkSize * this.scene.tileSize)) + (y * this.scene.tileSize);
          var perlinValue = noise.perlin2(tileX / 100, tileY / 100);
          var key = "sprWater";

          if (perlinValue < 0) {
            key = "sprWater";
          } else if (perlinValue >= 0 && perlinValue < 0.2) {
            key = "sprSand";
          } else if (perlinValue >= 0.2 && perlinValue < 0.5) {
            key = "sprGrass";
            if (Math.random() > 0.95) {
              key = "sprTown";
              if (towns.find(obj => obj.xPosition === tileX && obj.yPosition === tileY)) return;
              towns.push(this.createTownData(tileX, tileY));
            }
          } else {
            key = "sprMountain"
          }

          var tile = new Tile(this.scene, tileX, tileY, key);
          this.tiles.add(tile);
        }
      }

      this.isLoaded = true;
    }
  }
}

class Tile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setOrigin(0);
    this.setInteractive();

    const foundObject = towns.find(obj => obj.xPosition === x && obj.yPosition === y);
    if (foundObject) {
      if (foundObject.countryName === myOwnCountry) {
        this.setTexture("sprCapital");
      }

      this.on('pointerdown', function (pointer) {
        clickedTile(foundObject, this)
      });

      this.on('pointerover', () => {
        var name = (foundObject.isExplored) ? foundObject.countryName : "???"
        if (foundObject.countryName === myOwnCountry) name = foundObject.countryName;
        this.text = this.scene.add.text(x + this.width / 2, y + this.height / 2, (name), {
          fontSize: '14px',
          fill: '#ffffff',
          fontFamily: 'monospace'
        })
        
        this.text.setDepth(this.depth + 2);;
        this.text.setOrigin(0.5);
        this.text.setShadow(1, 1, 'rgba(0, 0, 0, 0.5)', 5);
      });

      this.on('pointerout', () => {
        this.text.destroy()
      });
    }
  }
}