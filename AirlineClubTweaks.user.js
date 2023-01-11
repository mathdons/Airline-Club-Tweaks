// ==UserScript==
// @name         Airline Club Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  Fly better
// @author       mathd
// @match        https://*.airline-club.com/
// @icon         https://www.google.com/s2/favicons?domain=airline-club.com
// @downloadURL  https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @updateURL    https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @grant        none
// ==/UserScript==

/* global $, waitForKeyElements */

(function () {
	"use strict";
	var debug = false;

	//waitForKeyElements("#airportCanvas", airportCanvasShown);

	var openAjaxRequests = 0;
	// https://github.com/greasemonkey/greasemonkey/issues/3015
	(function (open) {
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener("readystatechange", function () {
				if (this.readyState == 1) {
					openAjaxRequests++;
					//log("Open requests: "+openAjaxRequests);
				} else if (this.readyState == 4) {
					openAjaxRequests--;
					//log("Open requests: "+openAjaxRequests);
				}
			});
			open.apply(this, arguments);
		};
	})(XMLHttpRequest.prototype.open);

	var airportProcessed = false;
	var linksProcessed = false;
	var officeProcessed = false;

	var currentAirline = "";
	var modifiedHtml = false;
	var airlineLinks;
	var vanilla = true;

	$(document).ready(function () {
		setTimeout(main, 100);
	});

	function main() {
		airlineLinks = new Links();
		setCurrentAirline();

		const linksMutationConfig = {
			attributes: true,
			childList: false,
			subtree: false,
			attributeFilter: ["style"],
		};
		const linksViewObserver = new MutationObserver(linksViewMutated);
		linksViewObserver.observe($("#linksCanvas")[0], linksMutationConfig);

		const airportMutationConfig = {
			attributes: true,
			childList: false,
			subtree: false,
			attributeFilter: ["style"],
		};
		const airportViewObserver = new MutationObserver(airportViewMutated);
		airportViewObserver.observe($("#airportCanvas")[0], airportMutationConfig);

		const officeMutationConfig = {
			attributes: true,
			childList: false,
			subtree: false,
			attributeFilter: ["style"],
		};
		const officeViewObserver = new MutationObserver(officeViewMutated);
		officeViewObserver.observe($("#officeCanvas")[0], officeMutationConfig);
	}

	function officeViewMutated(mutationList, observer) {
		if (openAjaxRequests > 0) {
			setTimeout(function () {
				officeViewMutated(mutationList, observer);
			}, 50);
			return false;
		}

		var officeCanvas = $("#officeCanvas");
		var mutation = mutationList[0];
		if (officeCanvas.css("display") == "block") {
			if (!officeProcessed) {
				officeProcessed = true;
				setTimeout(officeCanvasShown, 1);
			}
		} else {
			officeProcessed = false;
		}
	}

	function linksViewMutated(mutationList, observer) {
		if (openAjaxRequests > 0) {
			setTimeout(function () {
				linksViewMutated(mutationList, observer);
			}, 50);
			return false;
		}

		var linksCanvas = $("#linksCanvas");
		var mutation = mutationList[0];
		if (linksCanvas.css("display") == "block") {
			if (!linksProcessed) {
				linksProcessed = true;
				setTimeout(linksCanvasShown, 1);
			}
		} else {
			linksProcessed = false;
		}
	}

	function airportViewMutated(mutationList, observer) {
		if (openAjaxRequests > 0) {
			setTimeout(function () {
				airportViewMutated(mutationList, observer);
			}, 50);
			return false;
		}

		var airportCanvas = $("#airportCanvas");
		var mutation = mutationList[0];
		if (airportCanvas.css("display") == "block") {
			if (!airportProcessed) {
				airportProcessed = true;
				setTimeout(airportCanvasShown, 1);
			}
		} else {
			airportProcessed = false;
		}
	}

	function setCurrentAirline() {
		if (openAjaxRequests > 0) {
			setTimeout(setCurrentAirline, 50);
			return false;
		}

		var spanContent = $("#topBar .currentAirline ").first().text();
		if (spanContent != "") {
			currentAirline = spanContent;
			log("Current Airline Loaded: " + currentAirline);
		} else {
			setTimeout(setCurrentAirline, 50);
		}
	}

	function officeCanvasShown() {
		var basesTableRoot = $('h4:contains("Airline Bases")').next("div");

		if ($(".tweakOffice").length <= 0) {
			$(basesTableRoot).find(".table-header .cell:eq(0)").css("width", "7%");
			$(basesTableRoot).find(".table-header .cell:eq(1)").css("width", "23%");
			$(basesTableRoot).find(".table-header .cell:eq(2)").css("width", "8%");
			$(basesTableRoot).find(".table-header .cell:eq(3)").css("width", "8%");
			$(basesTableRoot).find(".table-header .cell:eq(4)").css("width", "10%");

			$(basesTableRoot).next("div").find(".table-header .cell:eq(0)").css("width", "7%");
			$(basesTableRoot).next("div").find(".table-header .cell:eq(1)").css("width", "23%");
			$(basesTableRoot).next("div").find(".table-header .cell:eq(2)").css("width", "8%");
			$(basesTableRoot).next("div").find(".table-header .cell:eq(3)").css("width", "8%");
			$(basesTableRoot).next("div").find(".table-header .cell:eq(4)").css("width", "10%");
			$(basesTableRoot)
				.find(".table-header .cell:eq(4)")
				.after(
					'<div class="cell tweakOffice" style="width: 8%; text-align: left;">Routes</div>' +
						'<div class= "cell tweakOffice" style = "width: 8%; text-align: left;" >Pax</div>' +
						'<div class= "cell tweakOffice" style = "width: 8%; text-align: left;" >LF/SF</div>' +
						'<div class="cell tweakOffice" style="width: 10%; text-align: left;">Revenue</div>' +
						'<div class= "cell tweakOffice" style = "width: 10%; text-align: left;" >Profit</div >'
				);
			$(basesTableRoot)
				.next("div")
				.find(".table-header .cell:eq(4)")
				.after(
					'<div class="cell tweakOffice" style="width: 8%; "></div>' +
						'<div class= "cell tweakOffice" style = "width: 8%;" ></div>' +
						'<div class= "cell tweakOffice" style = "width: 8%;" ></div>' +
						'<div class="cell tweakOffice" style="width: 10%; "></div>' +
						'<div class= "cell tweakOffice" style = "width: 10%; " ></div >'
				);
		}

		$(basesTableRoot)
			.next("div")
			.find(".table-row")
			.each(function () {
				let airport = $(this)
					.find("div:eq(1)")
					.text()
					.match(/\(([^)]+)\)/)[1];
				let airportStats = airlineLinks.getStats(airport);
				$(this)
					.find(".cell:eq(4)")
					.after(
						`<div class="cell tweakOffice" > ${airportStats.routes}</div>` +
							`<div class= "cell tweakOffice" > ${airportStats.pax}</div>` +
							`<div class= "cell tweakOffice"> ${airportStats.lf}%/${airportStats.sf}%</div>` +
							`<div class="cell tweakOffice" > $${Math.round(airportStats.revenue)}k</div>` +
							`<div class= "cell tweakOffice" > $${Math.round(airportStats.profit)}k</div>`
					);
			});
	}

	function linksCanvasShown() {
		airlineLinks = new Links();

		var columns = new LinkData();
		$("#linksTableSortHeader div").each(function (index) {
			let attr = $(this).data("sortProperty");
			switch (attr) {
				case "fromAirportCode":
					columns.fromAirport = index;
					break;
				case "toAirportCode":
					columns.toAirport = index - 1;
					break;
				case "model":
					columns.model = index - 1;
					break;
				case "distance":
					columns.distance = index - 1;
					break;
				case "totalCapacity":
					columns.capacity = index - 1;
					break;
				case "totalPassengers":
					columns.pax = index - 1;
					break;
				case "satisfaction":
					columns.satisfaction = index - 1;
					break;
				case "revenue":
					columns.revenue = index - 1;
					break;
				case "profit":
					columns.profit = index - 1;
					break;
				case "totalLoadFactor":
					columns.lf = index - 1;
					break;
				case "profitPerHour":
					vanilla = false;
					break;
			}
		});

		$("#linksCanvas .table-row").each(function () {
			let link = new LinkData();
			let capString = $(this).find(`.cell:eq(${columns.capacity})`).text();
			if (capString == "") return false;

			link.frequency = capString.match(/\(([^)]+)\)/)[1];
			link.capacity = capString.split(" ")[0];
			link.pax = $(this).find(`.cell:eq(${columns.pax})`).text();

			link.fromAirport = $(this).find(`.cell:eq(${columns.fromAirport})`).text().trim().split(" ")[0];
			link.toAirport = $(this).find(`.cell:eq(${columns.toAirport})`).text().trim().split(" ")[0];

			link.distance = $(this).find(`.cell:eq(${columns.distance})`).text().replace("km", "");

			if (vanilla) {
				link.lf = $(this).find(`.cell:eq(${columns.lf})`).text().replace("%", "").replace("-", 0);
				link.lfEco = -1;
				link.lfBiz = -1;
				link.lfFirst = -1;
			} else {
				link.lf = Math.round(link.capacity / link.pax);

				let lfSplit = $(this).find(`.cell:eq(${columns.lf})`).text().split("/");
				if (lfSplit.length > 1) {
					link.lfEco = lfSplit[0].replace("%", "").replace("-", 0);
					link.lfBiz = lfSplit[1].replace("%", "").replace("-", 0);
					link.lfFirst = lfSplit[2].replace("%", "").replace("-", 0);
				} else {
					link.lfEco = 100;
					link.lfBiz = 100;
					link.lfFirst = 100;
				}
			}

			link.model = $(this).find(`.cell:eq(${columns.model})`).text();
			let profitString = $(this).find(`.cell:eq(${columns.profit})`).text().replace("$", "").replace(",", "").replace("(", "-").replace(")", "");
			let revenueString = $(this).find(`.cell:eq(${columns.revenue})`).text().replace("$", "").replace(",", "").replace("(", "-").replace(")", "");

			if (vanilla) {
				link.profit = parseFloat(profitString) / 1000;
				link.revenue = parseFloat(revenueString) / 1000;
			} else {
				if (!profitString.includes("k")) link.profit = parseFloat(profitString) / 1000;
				else link.profit = parseFloat(profitString);
				if (!revenueString.includes("k")) link.revenue = parseFloat(revenueString) / 1000;
				else link.revenue = parseFloat(revenueString);
			}

			link.satisfaction = $(this).find(`.cell:eq(${columns.satisfaction})`).text().replace("%", "");
			log("  -- Loaded " + link.fromAirport + " to " + link.toAirport + " with capacity " + link.capacity);
			airlineLinks.addLink(link);
		});
	}
	function airportCanvasShown() {
		var loyalistData = new Map();

		$(".loyalistDelta div[data-link='rival']").each(function () {
			var rivalName = $(this).find("div span span").text();
			var rivalValue = $(this).find("div:eq(1)").text();
			loyalistData.set(rivalName, rivalValue);
		});
		var currentAirlineChange = loyalistData.get(currentAirline);

		var championData = new Map();

		if ($(".tweakAirport").length <= 0) {
			$("#airportDetailsChampionList .table-header div:eq(4)").after('<div class="cell tweakAirport" style="width: 15%; text-align: right;">Change</div>');
		}

		var rivals = $("#airportDetailsChampionList div[data-link='rival']");
		$(rivals).each(function () {
			var rivalName = $(this).find("div:eq(1) span span").text();
			var rivalValue = parseInt($(this).find("div:eq(2)").text().replaceAll(",", ""));
			championData.set(rivalName, rivalValue);
		});

		var currentAirlineValue = championData.get(currentAirline);
		$(rivals).each(function () {
			var rivalName = $(this).find("div:eq(1) span span").text();
			var toInsert = "";
			if (rivalName != currentAirline) {
				if (loyalistData.has(rivalName)) {
					var deltaTotal = currentAirlineValue - championData.get(rivalName);
					var deltaChange = currentAirlineChange - loyalistData.get(rivalName);
					var weeks = -Math.round(deltaTotal / deltaChange);
					if (weeks > 10000) weeks = ">10k ";

					if (deltaTotal > 0) {
						// current airline above this rival
						if (deltaChange > 0) {
							// current airline gaining
							toInsert = "▽" + deltaChange + "<br>(∞ wks)";
						} else {
							toInsert = "⚠" + deltaChange + "<br>(" + weeks + "wks)";
						}
					} else {
						// current airline below this rival
						if (deltaChange > 0) {
							// current airline gaining
							toInsert = "△" + deltaChange + "<br>(" + weeks + "wks)";
						} else {
							toInsert = "▽" + deltaChange + "<br>(∞ wks)";
						}
					}
				}
			}

			if ($(this).find(".tweakAirport").length <= 0) {
				$(this)
					.find("div:eq(4)")
					.after('<div class="cell tweakAirport" style="text-align: right;">' + toInsert + "</div>");
			} else {
				$(this).find(".tweakAirport").text(toInsert);
			}
		});
	}

	function log(toLog) {
		if (debug) {
			const d = new Date();
			console.log("TWEAK \t" + d.toLocaleTimeString("fr-fr") + "." + String(d.getMilliseconds()).padStart(3, "0") + "\t" + toLog);
		}
	}

	class LinkData {
		fromAirport;
		toAirport;
		capacity;
		pax;
		frequency;
		model;
		revenue;
		profit;
		distance;
		satisfaction;
		lf;
		lfEco;
		lfBiz;
		lfFirst;
	}

	class Links {
		linksByFrom = new Map();

		addLink(linkData) {
			var existingLinksForAirport = new Map();
			if (this.linksByFrom.has(linkData.fromAirport)) {
				existingLinksForAirport = this.linksByFrom.get(linkData.fromAirport);
			} else {
				this.linksByFrom.set(linkData.fromAirport, existingLinksForAirport);
			}
			existingLinksForAirport.set(linkData.toAirport, linkData);
			this.linksByFrom.set(linkData.fromAirport, existingLinksForAirport);
		}

		getStats(airport) {
			var existingLinksForAirport = new Map();
			var stats = new AirportStats();
			var capacity = 0;
			var satisfiedPax = 0;
			if (this.linksByFrom.has(airport)) {
				existingLinksForAirport = this.linksByFrom.get(airport);
				existingLinksForAirport.forEach(function (link) {
					stats.routes++;
					stats.pax += parseInt(link.pax);
					stats.revenue += link.revenue;
					stats.profit += link.profit;
					capacity += parseInt(link.capacity);
					satisfiedPax += (link.satisfaction * link.pax) / 100;
				});
			}
			stats.lf = Math.round((stats.pax / capacity) * 100);
			stats.sf = Math.round((satisfiedPax / capacity) * 100);
			return stats;
		}
	}

	class AirportStats {
		routes = 0;
		pax = 0;
		revenue = 0;
		profit = 0;
		lf = 0;
		sf = 0;
	}
})();
