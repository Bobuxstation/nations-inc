// ==================================
// Additional functions for base game
// ==================================

// Notifications
function newNotification(text) {
  let toast = document.createElement('div')
  toast.innerText = text
  toast.className = 'notification'
  document.documentElement.appendChild(toast)

  setTimeout(function () {
    toast.style.visibility = 'hidden';
    toast.remove()
  }, 2500);
}

// Close all windows
function closeAllWindows() {
  Object.values(document.getElementsByClassName("cityStats")).forEach(function (elem) {
    elem.style.inset = ""
    if (elem.classList.contains("tutorial")) {
      elem.remove()
    } else {
      elem.style.display = "none"
    }
  })
}

// Dialogs
function newDialog(heading, content, image) {
  let windowElem = document.createElement('div')
  windowElem.className = 'cityStats tutorial'

  let titlebar = document.createElement('div')
  titlebar.className = 'titlebar'
  windowElem.appendChild(titlebar)

  let closeButton = document.createElement('button')
  closeButton.innerText = 'X'
  closeButton.onclick = function () { windowElem.remove() }
  titlebar.appendChild(closeButton)

  let headingElem = document.createElement('h1')
  headingElem.innerText = heading
  headingElem.style.width = '400px'
  windowElem.appendChild(headingElem)

  let contentElem = document.createElement('p')
  contentElem.innerText = content
  contentElem.style.width = '400px'
  windowElem.appendChild(contentElem)

  Object.values(document.getElementsByClassName("tutorial")).forEach(function (elem) {
    elem.remove()
  })

  document.getElementById('tutorials').appendChild(windowElem)
  $(windowElem).draggable({ handle: ".titlebar", containment: "#window" });
}

// Number Functions
function isNumberNear(number1, number2, threshold) {
  return Math.abs(number1 - number2) <= threshold;
}

// Generate Divisions
function randomizeDivisions(much, strength, seed = Math.random()) {
  var divisions = {}
  for (var i = 0; i < much; i++) {
    var divisionName = faker.company.companyName();
    divisions[divisionName] = {
      "name": divisionName,
      "strength": (strength ? strength : Math.floor(biasedrng(seed + i) * 100)),
      "atWar": false
    }
  }
  return divisions
}

//generate random string
function stringGen(seed, len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(biasedrng(seed + i) * possible.length));

  return text;
}

// Generate Factories and Resources
function randomizeFactoriesAndResources(strength, seed) {
  var nationStrength = strength[Object.keys(strength)[0]].strength;
  var nationStrengthPercent = Math.max(Math.floor(nationStrength / 100 * 5), 1);
  var factoryKeys = Object.keys(factories);
  var selectedFactories = {};
  var selectedResources = {};

  for (var i = 0; i < nationStrengthPercent && factoryKeys.length > 0; i++) {
    var randomIndex = Math.floor(biasedrng(seed + i) * factoryKeys.length);
    var factoryName = factoryKeys[randomIndex];
    selectedFactories[factoryName] = factories[factoryName];
    selectedResources[factories[factoryName].generates] = Math.floor(biasedrng(seed + i) * 100);
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
function march(toX, toY, fromX, fromY, isExpedition, strength, enemyData) {
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
        march(fromX, fromY, toX, toY, true, strength, enemyData)
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
          newDialog('Resources Obtained', JSON.stringify(enemyData.inventory, '\n', 2).replace(/[,{}" ]/g, " "), "")
          march(fromX, fromY, toX, toY, true, strength, enemyData)
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

function biasedrng(a) {
  var x = Math.sin(a++) * 10000;
  return x - Math.floor(x);
}

function loadGame() {
  let allSaves = JSON.parse(localStorage.getItem('saveData')) || [];
  let saveData = allSaves[allSaves.length - 1];

  if (!saveData) return;
  saveData = JSON.parse(saveData);

  myOwnCountry = saveData.myOwnCountry;
  myCountryValues = saveData.myCountryValues;
  conqueredNations = saveData.conqueredNations;
  countriesinwarwith = saveData.countriesinwarwith;

  towns = saveData.towns;
  game.scene.scenes[0].chunks = [];
  game.scene.scenes[0].seed = saveData.worldSeed;
  game.scene.scenes[0].chunkAmount = saveData.chunkAmount || 0;
  game.scene.scenes[0].followPoint.x = saveData.cameraX;
  game.scene.scenes[0].followPoint.y = saveData.cameraY;

  setTimeout(() => {
    document.getElementById('selectCountry').innerText = myOwnCountry;
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('ourStats').style.display = 'block';
    document.getElementById('news').style.visibility = 'visible';
    game.scene.scenes[0].gameStarted = true;
    earningsLoop();
  }, 100);
}

function openSaves() {
  let allSaves = JSON.parse(localStorage.getItem('saveData')) || [];
  document.getElementById('saves').innerText = '';
  if (allSaves.length == 0) document.getElementById('saves').innerText = 'You have no saves!';

  allSaves.forEach(element => {
    let saveData = JSON.parse(element)
    let loadbutton = document.createElement("button")

    loadbutton.innerText = `${saveData.myOwnCountry}\n${saveData.date}`
    loadbutton.onclick = function () {
      myOwnCountry = saveData.myOwnCountry;
      myCountryValues = saveData.myCountryValues;
      conqueredNations = saveData.conqueredNations;
      countriesinwarwith = saveData.countriesinwarwith;

      towns = saveData.towns;
      game.scene.scenes[0].chunks = [];
      game.scene.scenes[0].seed = saveData.worldSeed;
      game.scene.scenes[0].chunkAmount = saveData.chunkAmount || 0;
      game.scene.scenes[0].followPoint.x = saveData.cameraX;
      game.scene.scenes[0].followPoint.y = saveData.cameraY;

      setTimeout(() => {
        document.getElementById('selectCountry').innerText = myOwnCountry;
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('ourStats').style.display = 'block';
        document.getElementById('news').style.visibility = 'visible';
        game.scene.scenes[0].gameStarted = true;
        earningsLoop();
      }, 100);
    }

    document.getElementById('saves').prepend(loadbutton);
  });

  document.getElementById("loadsave").style.display = 'block';
}

function saveGame() {
  let saveData = {
    "myOwnCountry": myOwnCountry,
    "myCountryValues": myCountryValues,
    "conqueredNations": conqueredNations,
    "countriesinwarwith": countriesinwarwith,
    "towns": towns,
    "worldSeed": game.scene.scenes[0].seed,
    "chunkAmount": game.scene.scenes[0].chunkAmount,
    "cameraX": game.scene.scenes[0].followPoint.x,
    "cameraY": game.scene.scenes[0].followPoint.y,
    "date": new Date()
  }

  saveData = JSON.stringify(saveData, null, 2);
  let allSaves = JSON.parse(localStorage.getItem('saveData')) || [];
  allSaves.push(saveData);
  localStorage.setItem('saveData', JSON.stringify(allSaves));
}

// Start game and update UI
function startGame() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('ourStats').style.display = 'block';
  document.getElementById('news').style.visibility = 'visible';
  game.scene.scenes[0].gameStarted = true
  earningsLoop()

  setTimeout(() => {
    newDialog("Welcome to Nations!", content.intro, "")
  }, 250);
}

// Intro Sequence
function intro() {
  $(".cityStats").draggable({ handle: ".titlebar", containment: "#window" });
  const logo = document.getElementById('ablogo');
  const buttons = document.getElementById('buttons');
  logo.style.display = 'block';

  setTimeout(() => {
    logo.style.display = 'none';
    buttons.style.display = 'block';
  }, 3000);
}
window.onload = intro

setInterval(function () {
  try {
    if (!game.scene.scenes[0].gameStarted) return;
    document.getElementById('mymoney').innerText = (myOwnCountry == "") ? 0 : myCountryValues.money.toLocaleString();
    document.getElementById('nationsConquered').innerText = conqueredNations.length;
    document.getElementById('factoriesOwned').innerText = countFactories();

    const invData = JSON.parse(JSON.stringify(myCountryValues.inventory));
    Object.keys(invData).forEach(element => {
      invData[`${symbols[element]} ${element}`] = invData[element]
      delete invData[element]
    });
    document.getElementById('inventorysaya').innerText = JSON.stringify(invData, '\n', 2).replace(/[,{}" ]/g, " ");
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

//compare division for updating menu
function compareDivision(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const areObjects = typeof object1[key] === 'object' && object1[key] !== null && typeof object2[key] === 'object' && object2[key] !== null;
    if (areObjects && !compareDivision(object1[key], object2[key]) || !areObjects && object1[key] !== object2[key]) return false;
  }

  return true;
}

// Loop earnings
function earningsLoop() {
  if (!myOwnCountry == "") {
    totalFactories = 0;
    Object.keys(myCountryValues.factories).forEach((key) => {
      var value = myCountryValues.factories[key];
      myCountryValues.inventory[value.generates] += value.level;
    })

    conqueredNations.forEach((name) => {
      let enemyData = towns.find(obj => obj.countryName === name);
      Object.keys(enemyData.factories).forEach((key) => {
        var value = enemyData.factories[key];
        myCountryValues.inventory[value.generates] += value.level;
      })
    })

    if (!compareDivision(prevDivision, myCountryValues.divisions)) {
      document.getElementById("divisions").innerText = '';
      Object.values(myCountryValues.divisions).forEach(element => {
        var button = document.createElement("button");
        button.innerHTML = `<span>${element.strength}</span><h1>🪖</h1>`;
        button.onclick = () => manageDivisions(myCountryValues, element.name);
        document.getElementById("divisions").prepend(button)
      });

      prevDivision = JSON.parse(JSON.stringify(myCountryValues.divisions));
    }
  };

  setTimeout(earningsLoop, gameSpeed)
}

// ================================
// Factories and Resources
// ================================

var factories = {
  "Electronics Manufacturing": {
    "generates": "Components",
    "level": 1,
    "upgradeResource": "Steel",
  },
  "Oil Refinery": {
    "generates": "Oil",
    "level": 1,
    "upgradeResource": "Steel",
  },
  "Steel Mill": {
    "generates": "Steel",
    "level": 1,
    "upgradeResource": "Steel",
  },
  "Gold Mine": {
    "generates": "Gold",
    "level": 1,
    "upgradeResource": "Steel",
  },
  "Food Processing": {
    "generates": "Goods",
    "level": 1,
    "upgradeResource": "Steel",
  },
  "Farm": {
    "generates": "Crops",
    "level": 1,
    "upgradeResource": "Steel",
  }
}

var resources = {
  "Goods": 5,
  "Steel": 10,
  "Oil": 15,
  "Gold": 50,
  "Components": 10,
  "Crops": 10,
}

var symbols = {
  "Goods": "📦",
  "Steel": "🔩",
  "Oil": "🛢️",
  "Gold": "🧈",
  "Components": "⚙️",
  "Crops": "🌾",
}

// ================================
// Dialogs
// ================================

var content = {
  intro: "Welcome to Nations, a game where you can control a country and expand your empire. You can build factories for resources, or conquer other nations to get them. Use your resources wisely to grow your economy and military strength. Start by selecting a random country (Brown Tile) in the map. Good luck!",
  nationSelected: "Click on the newly selected nation to manage it",
  manage: "Manage military: Manage your military divisions for sending to war\n Resources: See the resources you have\n Manage Factories: Manage your factories, they generate resources",
  divisions: "You can manage all your divisions here.\n Either select an existing division or create a new one (Every nation comes with one division, each with randomized strength).",
  resources: "Resources are generated by the factories you have.\n If you do not have a certain resource, you can trade with another nation or invade them for their factories.",
  factories: "Factories generate resources for trading.",
  division: "You can send a division to fight wars.\n or you can upgrade them with money.",
  trading: "You can earn money by selling resources generated by your factories or obtain resources you don't have with trade.",
  diplomacy: "Declare war: Declare war with the nation for their land and resources\n Trade: sell and purchase resources\n Improve Relations: Improve your relations with the nation for cheaper trade (costs money)",
  conquered: "Manage military: Manage their military divisions for sending to war\n Manage Factories: Manage their factories, they generate resources for your nation",
  manageFactory: "Factories generate resources for trading. You can upgrade one here.\n Level of a factory determines how much resources it generates.",
}