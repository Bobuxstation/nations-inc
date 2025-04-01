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
		closeAllWindows()
		document.getElementById('sendExpedition').style.display = 'block';
		document.getElementById('expyes').onclick = function () {
			document.getElementById('sendExpedition').style.display = 'none';
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

			elem.onclick = function () {
				document.getElementById('divisionManagement').style.display = 'none';
				document.getElementById('manageDivision').style.display = 'block';
				document.getElementById('divisionDescription').innerText = `${value.name} (${value.strength})`;
				document.getElementById('upgradeDivision').innerText = `⬆️ Upgrade ($${(10000 * value.strength).toLocaleString()})`;
				document.getElementById('upgradeDivision').onclick = function () {
					if (myCountryValues.money > 10000 * value.strength) {
						value.strength += 1;
						myCountryValues.money -= 10000 * value.strength;
					}
					document.getElementById('divisionDescription').innerText = `${value.name} (${value.strength})`;
					document.getElementById('upgradeDivision').innerText = `⬆️ Upgrade ($${(10000 * value.strength).toLocaleString()})`;
					refreshDivisions()
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
						document.getElementById('manageDivision').style.display = 'none';
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

		elem.innerText = key + " (" + value + ")";
		document.getElementById("factoryList").appendChild(elem);
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
			newNotification("You do not have enough materials to trade!")
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