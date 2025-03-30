// ================================
// Additional functions for base game
// ================================

// Notifications
function newNotification(text) {
  let toast = document.createElement('div')
  toast.innerText = text
  toast.className = 'notification'
  document.documentElement.appendChild(toast)

  setTimeout(function () {
    toast.style.visibility = 'hidden'
  }, 2500);
}

// Number Functions
function isNumberNear(number1, number2, threshold) {
  return Math.abs(number1 - number2) <= threshold;
}

function randbetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Generate Divisions
function randomizeDivisions(much, strength) {
  var divisions = {}
  for (var i = 0; i < much; i++) {
    var divisionName = faker.company.companyName();
    divisions[divisionName] = {
      "name": divisionName,
      "strength": (strength ? strength : Math.floor(Math.random() * 100)),
      "atWar": false
    }
  }
  return divisions
}

// Generate Factories and Resources
function randomizeFactoriesAndResources(strength) {
  var nationStrength = strength[Object.keys(strength)[0]].strength;
  var nationStrengthPercent = Math.max(Math.floor(nationStrength / 100 * 5), 1);
  var factoryKeys = Object.keys(factories);
  var selectedFactories = {};
  var selectedResources = {};

  for (var i = 0; i < nationStrengthPercent && factoryKeys.length > 0; i++) {
    var randomIndex = Math.floor(Math.random() * factoryKeys.length);
    var factoryName = factoryKeys[randomIndex];
    selectedFactories[factoryName] = factories[factoryName];
    selectedResources[factories[factoryName]] = Math.floor(Math.random() * 100);
    factoryKeys.splice(randomIndex, 1);
  }

  Object.keys(resources).forEach((key) => {
    if (selectedResources[key]) return;
    selectedResources[key] = 0;
  })

  return { "resources": selectedResources, "factories": selectedFactories };
}

// Take resources from enemy
function moveResources(from) {
  Object.keys(from).forEach((key) => {
    var value = from[key];
    if (resources[value]) {
      myCountryValues.resources[value] += resources[value];
      from[key] = 0;
    }
  })
}

// Invasion and Expeditions
function march(toX, toY, fromX, fromY, isExpedition, strength, enemyData, tile) {
  let troop = game.scene.scenes[0].add.sprite(fromX, fromY, 'sprTroop');
  troop.setDepth(troop.depth + 1);

  if (!isExpedition) {
    document.getElementById('atWar').style.display = 'none';
    document.getElementById('atWar2').style.display = 'block';
    document.getElementById('atWar2').innerText = `At war with ${enemyData.countryName}`;
  }

  function troopLoop() {
    if (!isNumberNear(troop.x, toX, 5) || !isNumberNear(troop.y, toY, 5)) {
      var angle = Math.atan2(toY - troop.y, toX - troop.x);
      var velocityX = Math.cos(angle) * 3;
      var velocityY = Math.sin(angle) * 3;

      troop.x += Math.floor(velocityX);
      troop.y += Math.floor(velocityY);

      setTimeout(troopLoop, gameSpeed)
    } else {
      troop.destroy()
      if (isExpedition) {
        if (enemyData.isExplored) return;
        enemyData.isExplored = true;
        newNotification('New country discovered: ' + enemyData.countryName)
        march(fromX, fromY, toX, toY, true, strength, enemyData, tile)

        if (!(tile.text && tile.text.active)) return;
        tile.text.setText(enemyData.countryName);
      } else {
        let tempStrength = enemyData.divisions[Object.keys(enemyData.divisions)[0]].strength;
        enemyData.divisions[Object.keys(enemyData.divisions)[0]].strength -= strength.strength;
        strength.strength -= tempStrength;
        document.getElementById('atWar2').style.display = 'none';
        document.getElementById('atWar').style.display = 'block';

        if (enemyData.divisions[Object.keys(enemyData.divisions)[0]].strength <= 0) {
          enemyData.isConquered = true;
          conqueredNations.push(enemyData.countryName);

          newNotification('You conquered ' + enemyData.countryName)
          newNotification('Resources Obtained:\n ' + JSON.stringify(enemyData.inventory, '\n', 2).replace(/[,{}" ]/g, " "))
          march(fromX, fromY, toX, toY, true, strength, enemyData, tile)
          moveResources(enemyData.inventory)

          countriesinwarwith.splice(countriesinwarwith.indexOf(enemyData), 1);
          myCountryValues.money += enemyData.money;
          enemyData.divisions[Object.keys(enemyData.divisions)[0]].strength = 0;
        } else {
          newNotification('You lost a division in battle!')
          strength.strength = 0;
        }
      }
    }
  }
  troopLoop()
}

// Start game and update UI
function startGame() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('ourStats').style.display = 'block';
  document.getElementById('news').style.visibility = 'visible';
  game.scene.scenes[0].gameStarted = true
  newNotification('Welcome to Nations Inc! Select a country to continue')
  earningsLoop()
}

setInterval(function () {
  try {
    if (!game.scene.scenes[0].gameStarted) return;
    document.getElementById('inventorysaya').innerText = JSON.stringify(myCountryValues.inventory, '\n', 2).replace(/[,{}" ]/g, " ");
    document.getElementById('mymoney').innerText = (myOwnCountry == "") ? 0 : myCountryValues.money.toLocaleString();
    document.getElementById('nationsConquered').innerText = conqueredNations.length;
    document.getElementById('factoriesOwned').innerText = countFactories();
  } catch (error) { }
})

// Calculate total factories
function countFactories() {
  if (!myOwnCountry == "") {
    var totalFactories = 0;
    Object.keys(myCountryValues.factories).forEach((key) => {
      totalFactories += 1;
    })

    conqueredNations.forEach((name) => {
      Object.keys(towns.find(obj => obj.countryName === name).factories).forEach((key) => {
        totalFactories += 1;
      })
    })

    return totalFactories;
  } else {
    return 0;
  };
}

// Loop earnings
function earningsLoop() {
  if (!myOwnCountry == "") {
    totalFactories = 0;
    Object.keys(myCountryValues.factories).forEach((key) => {
      var value = myCountryValues.factories[key];
      myCountryValues.inventory[value] += 1;
    })

    conqueredNations.forEach((name) => {
      let enemyData = towns.find(obj => obj.countryName === name);
      Object.keys(enemyData.factories).forEach((key) => {
        var value = myCountryValues.factories[key];
        myCountryValues.inventory[value] += 1;
      })
    })
  };

  setTimeout(earningsLoop, gameSpeed)
}

// ================================
// Factories and Resources
// ================================

var factories = {
  "Electronics Manufacturing": "Components",
  "Oil Refinery": "Oil",
  "Steel Mill": "Steel",
  "Gold Mine": "Gold",
  "Food Processing": "Goods",
}

var resources = {
  "Goods": 5,
  "Steel": 10,
  "Oil": 15,
  "Gold": 50,
  "Components": 10,
}