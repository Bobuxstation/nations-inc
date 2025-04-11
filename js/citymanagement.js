let towns = [];
let countriesinwarwith = [];
let myOwnCountry = "";
let gameSpeed = 1000;
let conqueredNations = []
let myCountryValues = {};

function clickedTile(foundObject, tile) {
	if (myOwnCountry == "") {
		myOwnCountry = foundObject.countryName;
		myCountryValues = foundObject;

		tile.setTexture("sprCapital");
		tile.text.setText(myOwnCountry);
		document.getElementById('selectCountry').innerText = myOwnCountry;

		closeAllWindows()
		newDialog(`A new start`, content.nationSelected, "")
	} else if (myOwnCountry == foundObject.countryName) {
		//tutorial
		document.getElementById('tutorManage').style.display = 'block';
		document.getElementById('tutorDiplomacy').style.display = 'none';
		document.getElementById('tutorConquered').style.display = 'none';

		//window
		closeAllWindows()
		document.getElementById('cityStatWindow').style.display = 'block';
		document.getElementById('selectCityName').innerText = foundObject.countryName;
		document.getElementById('selectCountryName').innerText = 'Country';

		//buttons
		document.getElementById('infantrybtn').style.display = 'block';
		document.getElementById('checkinventory').style.display = 'block';
		document.getElementById('managefactories').style.display = 'block';
		document.getElementById('tradewithcountry').style.display = 'none';
		document.getElementById('improverelation').style.display = 'none';
		document.getElementById('declarewarbtn').style.display = 'none';

		document.getElementById('checkinventory').onclick = function () {
			closeAllWindows()
			document.getElementById('cityInventory').style.display = 'block'
			document.getElementById('inventoryCountryName').innerText = foundObject.countryName;
		}

		document.getElementById('infantrybtn').onclick = function () {
			closeAllWindows()
			manageDivisions(foundObject, tile);
		}

		document.getElementById('managefactories').onclick = function () {
			closeAllWindows()
			manageFactories(foundObject);
		}
	} else if (foundObject.isConquered) {
		//tutorial
		document.getElementById('tutorManage').style.display = 'none';
		document.getElementById('tutorDiplomacy').style.display = 'none';
		document.getElementById('tutorConquered').style.display = 'block';

		//window
		closeAllWindows()
		document.getElementById('cityStatWindow').style.display = 'block';
		document.getElementById('selectCityName').innerText = foundObject.countryName;
		document.getElementById('selectCountryName').innerText = 'Country';

		//buttons
		document.getElementById('infantrybtn').style.display = 'block';
		document.getElementById('checkinventory').style.display = 'none';
		document.getElementById('managefactories').style.display = 'block';
		document.getElementById('tradewithcountry').style.display = 'none';
		document.getElementById('improverelation').style.display = 'none';
		document.getElementById('declarewarbtn').style.display = 'none';

		document.getElementById('infantrybtn').onclick = function () {
			closeAllWindows()
			manageDivisions(foundObject, tile);
		}

		document.getElementById('managefactories').onclick = function () {
			closeAllWindows()
			manageFactories(foundObject);
		}

	} else if (foundObject.isExplored) {
		//tutorial
		document.getElementById('tutorManage').style.display = 'none';
		document.getElementById('tutorDiplomacy').style.display = 'block';
		document.getElementById('tutorConquered').style.display = 'none';

		//buttons
		document.getElementById('managefactories').style.display = 'none';
		document.getElementById('checkinventory').style.display = 'none';
		document.getElementById('infantrybtn').style.display = 'none';
		document.getElementById('declarewarbtn').style.display = 'block';
		document.getElementById('improverelation').style.display = 'block';
		document.getElementById('tradewithcountry').style.display = 'block';

		//window
		closeAllWindows()
		document.getElementById('cityStatWindow').style.display = 'block';
		document.getElementById('selectCityName').innerText = foundObject.countryName;
		document.getElementById('selectCountryName').innerText = 'Country Strength: ' + foundObject.divisions[Object.keys(foundObject.divisions)[0]].strength;

		document.getElementById('declarewarbtn').onclick = function () {
			closeAllWindows()
			document.getElementById('invadewindow').style.display = 'block';
			document.getElementById('countryToInvade').innerText = foundObject.countryName;
		}

		document.getElementById('tradewithcountry').onclick = function () {
			closeAllWindows()
			doTrading(foundObject.countryName, foundObject.tradeluck, foundObject);
		}

		document.getElementById('improverelation').onclick = function () {
			if (myCountryValues.money > 10000 * foundObject.relation) {
				foundObject.relation += 1;
				myCountryValues.money -= 10000 * foundObject.relation;
			}
		}

		document.getElementById('invadeyes').onclick = function () {
			closeAllWindows()
			if (countriesinwarwith.find(obj => obj.countryName === foundObject.countryName)) return;

			let text = document.createElement('span')
			text.innerText = "<< " + myOwnCountry + " is now in war with " + foundObject.countryName + " >>";
			document.getElementById('news').prepend(text)
			countriesinwarwith.push(foundObject)
		}
	} else {
		// if country is unexplored
		closeAllWindows()
		document.getElementById('sendExpedition').style.display = 'block';
		document.getElementById('expyes').onclick = function () {
			closeAllWindows()
			march(foundObject.xPosition, foundObject.yPosition, myCountryValues.xPosition, myCountryValues.yPosition, true, 0, foundObject, tile)
		}
	}
}

function manageDivisions(foundObject, tile) {
	var divisionData = foundObject.divisions;
	if (foundObject.countryName == myOwnCountry) divisionData = myCountryValues.divisions;

	document.getElementById('divisionManagement').style.display = 'block'
	document.getElementById('divisionCountryName').innerText = foundObject.countryName;

	document.getElementById("newDivision").onclick = function () {
		let genDivision = randomizeDivisions(1, 1)
		let newDivision = genDivision[Object.keys(genDivision)[0]];
		divisionData[newDivision.name] = newDivision
		refreshDivisions()
	}

	function refreshDivisions() {
		document.getElementById("divisionList").innerHTML = ""
		Object.keys(divisionData).forEach((key) => {
			let value = divisionData[key];
			let elem = document.createElement('button');

			elem.innerText = value.name + " (" + value.strength + ")";
			document.getElementById("divisionList").appendChild(elem);

			function calcDivisionUpgradePrice() {
				document.getElementById("divisionDescription").innerText = `Level: ${value.strength}`;
				document.getElementById('divisionUpgradeCost').innerHTML = ""

				let upgradePrice = value.strength * 10000;
				let steelCost = value.strength * 10;
				let goodsCost = value.strength * 5;

				let li1 = document.createElement('li')
				li1.innerText = `$${upgradePrice.toLocaleString()}`
				document.getElementById('divisionUpgradeCost').appendChild(li1)

				let li2 = document.createElement('li')
				li2.innerText = `${steelCost} Steel`
				document.getElementById('divisionUpgradeCost').appendChild(li2)

				let li3 = document.createElement('li')
				li3.innerText = `${goodsCost} Goods`
				document.getElementById('divisionUpgradeCost').appendChild(li3)
			}

			elem.onclick = function () {
				closeAllWindows()
				calcDivisionUpgradePrice()
				document.getElementById('manageDivision').style.display = 'block';
				document.getElementById('divisionName').innerText = `${value.name}`;

				document.getElementById('upgradeDivision').onclick = function () {
					if (myCountryValues.money > 10000 * value.strength && myCountryValues.inventory["Steel"] > value.strength * 10 && myCountryValues.inventory["Goods"] > value.strength * 5) {
						myCountryValues.money -= 10000 * value.strength;
						myCountryValues.inventory["Steel"] -= value.strength * 10;
						myCountryValues.inventory["Goods"] -= value.strength * 5;
						value.strength += 1;
						refreshDivisions()
						calcDivisionUpgradePrice()
					} else {
						newNotification("You do not have enough money to upgrade!")
					}
				}

				if (countriesinwarwith.length == 0) {
					document.getElementById("invadeOption").style.display = 'none';
				} else {
					document.getElementById("invadeOption").style.display = 'block';
					document.getElementById("countriesinwarwith").innerHTML = ""

					countriesinwarwith.forEach((country) => {
						let elem = document.createElement('option');
						elem.innerText = country.countryName;
						document.getElementById("countriesinwarwith").appendChild(elem);
					})

					document.getElementById("invadeselectedbtn").onclick = function () {
						let enemyData = towns.find(obj => obj.countryName === document.getElementById("countriesinwarwith").value);
						closeAllWindows()
						march(enemyData.xPosition, enemyData.yPosition, foundObject.xPosition, foundObject.yPosition, false, value, enemyData, tile)
					}
				}
			}
		})
	}
	refreshDivisions()
}

function manageFactories(foundObject) {
	var factoryData = foundObject.factories;
	if (foundObject.countryName == myOwnCountry) factoryData = myCountryValues.factories;

	document.getElementById('cityFactories').style.display = 'block'
	document.getElementById('factoryCountryName').innerText = foundObject.countryName;

	document.getElementById("factoryList").innerHTML = ""
	Object.keys(factoryData).forEach((key) => {
		let value = factoryData[key];
		let elem = document.createElement('button');

		elem.innerText = key + " (" + value.generates + ")";
		document.getElementById("factoryList").appendChild(elem);

		function calcUpgradePrice() {
			document.getElementById("factoryLevel").innerText = `Level: ${value.level}`;

			let upgradePrice = value.level * 10000;
			let upgradeResources = value.level * 10;
			document.getElementById('upgradeCost').innerHTML = ""

			let li1 = document.createElement('li')
			li1.innerText = `$${upgradePrice.toLocaleString()}`
			document.getElementById('upgradeCost').appendChild(li1)

			let li2 = document.createElement('li')
			li2.innerText = `${upgradeResources} Steel`
			document.getElementById('upgradeCost').appendChild(li2)
		}

		elem.onclick = function () {
			closeAllWindows()
			document.getElementById("manageFactory").style.display = 'block';
			document.getElementById("factoryname").innerText = key;

			calcUpgradePrice()
			document.getElementById("upgradeFactory").onclick = function () {
				if (myCountryValues.money > 10000 * value.level && myCountryValues.inventory["Steel"] > value.level * 10) {
					myCountryValues.money -= 10000 * value.level;
					myCountryValues.inventory["Steel"] -= value.level * 10;
					value.level += 1;
					calcUpgradePrice()
				} else {
					newNotification("You do not have enough money or resources to upgrade!")
				}
			}
		}
	})
}

function doTrading(countryname, luck, country) {
	let resourcesofCountry = country.inventory
	let sellprice
	let buyprice

	document.getElementById("thingtotradeto").innerHTML = ""
	Object.keys(resourcesofCountry).forEach((key) => {
		let elem = document.createElement('option');
		elem.value = key;
		elem.innerText = key;
		document.getElementById("thingtotradeto").appendChild(elem);
	})

	function refreshPrice() {
		if (parseInt(document.getElementById("tradeAmount").value) < 1) document.getElementById("tradeAmount").value = 1;
		let selected = document.getElementById("thingtotradeto").value
		let qty = parseInt(document.getElementById("tradeAmount").value) || 1

		sellprice = Math.floor(qty * luck * resources[selected] * country.relation)
		buyprice = Math.floor(qty * luck * resources[selected] / country.relation)
		document.getElementById("sellbtn").innerText = `Sell ($${sellprice})`
		document.getElementById("buybtn").innerText = `Buy ($${buyprice})`
	}

	document.getElementById("sellbtn").onclick = function () {
		let item = document.getElementById("thingtotradeto").value

		if (myCountryValues.inventory[item] >= parseInt(document.getElementById("tradeAmount").value)) {
			myCountryValues.money += sellprice
			country.money -= sellprice

			myCountryValues.inventory[item] -= parseInt(document.getElementById("tradeAmount").value)
			country.inventory[item] += parseInt(document.getElementById("tradeAmount").value)
		} else {
			newNotification("You do not have enough money or resources to upgrade!")
		}
	}

	document.getElementById("buybtn").onclick = function () {
		let item = document.getElementById("thingtotradeto").value

		if (country.inventory[item] >= parseInt(parseInt(document.getElementById("tradeAmount").value))) {
			country.money += buyprice
			myCountryValues.money -= buyprice

			country.inventory[item] -= parseInt(parseInt(document.getElementById("tradeAmount").value))
			myCountryValues.inventory[item] += parseInt(parseInt(document.getElementById("tradeAmount").value))
		} else {
			newNotification("They do not have enough materials to trade!")
		}
	}

	document.getElementById("tradeAmount").oninput = refreshPrice
	document.getElementById("thingtotradeto").onchange = refreshPrice
	document.getElementById("tradewindow").style.display = "block"
	document.getElementById("tradetitle").innerText = `Trade with ${countryname}`
	refreshPrice()
}