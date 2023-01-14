// ==UserScript==
// @name         Airline Club Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.1.27
// @description  Fly better
// @author       mathd
// @match        https://*.airline-club.com/
// @icon         https://www.google.com/s2/favicons?domain=airline-club.com
// @downloadURL  https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @updateURL    https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @resource     jqUI_CSS https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.2/themes/dark-hive/jquery-ui.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
// @require      file://D:\Dev\AirlineClub\Airline-Club-Tweaks.user.js
/* global $, waitForKeyElements */

(function () {
	"use strict";
	var debug = true;

	const jqUI_CssSrc = GM_getResourceText("jqUI_CSS");
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

	var hangarProcessed = false;
	var linksProcessed = false;
	var officeProcessed = false;
	var airportProcessed = false;

	var currentAirline = "";
	var airlineLinks;
	var settings;
	var vanilla = true;

	$(document).ready(function () {
		//GM_addStyle(jqUI_CssSrc);
		addCss(jqUI_CssSrc);
		setTimeout(main, 50);
	});

	function main() {
		settings = new Settings();
		settings.refresh();
		airlineLinks = new Links();

		log("INIT");

		setCurrentAirline();
		addTopNavButtons();
		monitorMutations();

		log("INIT DONE");
	}

	function monitorMutations() {
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

		const hangarMutationConfig = {
			attributes: true,
			childList: false,
			subtree: false,
			attributeFilter: ["style"],
		};
		const hangarViewObserver = new MutationObserver(hangarViewMutated);
		const airplaneViewObserver = new MutationObserver(hangarViewMutated);

		hangarViewObserver.observe($("#airplaneCanvas .hangar")[0], hangarMutationConfig);
		airplaneViewObserver.observe($("#airplaneCanvas")[0], hangarMutationConfig);
	}

	function addTopNavButtons() {
		var toAdd = '<span style="margin-left: 7px;"></span>';
		var buttons = $("#main-tabs .tab-icon").each(function () {
			var link = $(this).data("link");
			if (link == "country" || link == "airplane" || link == "link" || link == "office" || link == "bank" || link == "oil" || link == "/") {
				toAdd += '<span class="clickable" style="margin-left: 3px; padding: 0 3px;" title="' + link + '">' + $(this)[0].outerHTML + "</span>";
			}
		});

		$(".desktopOnly .topBarDetails span span").first().parent().append(toAdd);
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

	function hangarViewMutated(mutationList, observer) {
		if (openAjaxRequests > 0) {
			setTimeout(function () {
				hangarViewMutated(mutationList, observer);
			}, 50);
			return false;
		}

		var hangarCanvas = $("#airplaneCanvas .hangar");
		var airplaneCanvas = $("#airplaneCanvas");
		var mutation = mutationList[0];
		if (airplaneCanvas.css("display") == "block" && hangarCanvas.css("display") == "block") {
			if (!hangarProcessed) {
				hangarProcessed = true;
				setTimeout(hangarCanvasShown, 1);
			}
		} else {
			hangarProcessed = false;
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

	function hangarCanvasShown() {
		if ($(".tweakHangar").length <= 0) {
			$("#airplaneCanvas .toggleConditionBox").before('<span style="top:-3px;position: relative;margin-right:4px;">Condition</span>');
			var conditionCb = $("#airplaneCanvas .toggleConditionBox").next().after(` <span style="top:-3px;position: relative; margin-left:17px;">
            <span class= "tweakHangar" id="sliderCondition" style="display:inline-flex; width:160px; top:4px;"></span>
            <input type="text" id="conditionRange" readonly style="border:0; color:#f6931f; font-weight:bold; width:52px;margin-left:15px">
            <div id="autoReplace" class="button" >Set with Auto (<span id="autoReplaceValue">N/A</span>)</div>
            <div id="slidersReset" class="button" >Reset filters</div>
            </span>`);

			$("#airplaneCanvas .toggleUtilizationRateBox").before('<span style="top:-3px;position: relative;margin-right:4px;">Usage</span>');
			var usageCb = $("#airplaneCanvas .toggleUtilizationRateBox").next().after(` <span style="top:-3px;position: relative; margin-left:17px;">
            <span class= "tweakHangar" id="sliderUsage" style="display:inline-flex; width:160px; top:4px;"></span>
            <input type="text" id="usageRange" readonly style="border:0; color:#f6931f; font-weight:bold; width:52px;margin-left:15px;margin-right:35px">
            </span>`);
			$("#sliderCondition").slider({
				range: true,
				min: 0,
				max: 100,
				values: [0, 100],
				slide: function (event, ui) {
					$("#conditionRange").val("" + ui.values[0] + " - " + ui.values[1]);
				},
				change: function (event, ui) {
					$("#conditionRange").val("" + ui.values[0] + " - " + ui.values[1]);
					hangarSliderChanged();
				},
			});
			$("#conditionRange").val("" + $("#sliderCondition").slider("values", 0) + " - " + $("#sliderCondition").slider("values", 1));

			$("#sliderUsage").slider({
				range: true,
				min: 0,
				max: 100,
				values: [0, 100],
				slide: function (event, ui) {
					$("#usageRange").val("" + ui.values[0] + " - " + ui.values[1]);
				},
				change: function (event, ui) {
					$("#usageRange").val("" + ui.values[0] + " - " + ui.values[1]);
					hangarSliderChanged();
				},
			});
			$("#usageRange").val("" + $("#sliderUsage").slider("values", 0) + " - " + $("#sliderUsage").slider("values", 1));
		}

		$("#slidersReset").click(function () {
			$("#sliderCondition").slider("option", "values", [0, 100]);
			$("#sliderUsage").slider("option", "values", [0, 100]);
		});

		if (settings.autoReplaceValue > 0) {
			$("#autoReplaceValue").text(settings.autoReplaceValue + "%");
			$("#autoReplace").click(function () {
				$("#sliderCondition").slider("option", "values", [settings.autoReplaceValue, settings.autoReplaceValue + 5]);
				$("#sliderUsage").slider("option", "values", [0, 100]);
			});
			$("#autoReplace").attr("class", "button");
		} else {
			$("#autoReplaceValue").text("N/A");
			$("#autoReplace").attr("class", "button disabled");
			$("#autoReplace").attr("title", "Visit the office first and set a replacement target.");

			$("#autoReplace").off("click");
		}
		hangarSliderChanged();
	}

	function hangarSliderChanged() {
		const minCondition = $("#sliderCondition").slider("values", 0);
		const maxCondition = $("#sliderCondition").slider("values", 1);
		const minUsage = $("#sliderUsage").slider("values", 0);
		const maxUsage = $("#sliderUsage").slider("values", 1);
		log(`Slider changed min: ${minCondition}, max: ${maxCondition}`);

		$("#airplaneCanvas .hangar .sectionContainer .section").each(function () {
			let total = 0;
			let shown = 0;
			let minConditionOfType = 100;
			let maxConditionOfType = 0;
			$(this)
				.find(".airplaneIcon")
				.each(function () {
					let title = $(this).attr("title");
					let split = title.split(" ");
					let condition = parseFloat(split[2].replace("%", ""));
					if (condition < minConditionOfType) minConditionOfType = condition;
					if (condition > maxConditionOfType) maxConditionOfType = condition;
					let usage = parseFloat(split[4].replace("%", ""));
					total++;
					if (condition >= minCondition && condition <= maxCondition && usage >= minUsage && usage <= maxUsage) {
						$(this).parent().css("display", "block");
						shown++;
					} else {
						$(this).parent().css("display", "none");
					}
				});
			if (shown <= 0) {
			} else {
			}

			let title = $(this).find("h4").next();
			if (!$(title).hasClass("tweakHangar")) {
				$(this).find("h4").after('<span class="tweakHangar" style=""></span>');
				title = $(this).find(".tweakHangar");
				$(this).find("h4").css("display", "inline-block");
			}
			title.text(` (${shown}/${total}, min: ${minConditionOfType}, max: ${maxConditionOfType})`);
		});
	}

	function officeCanvasShown() {
		let autoReplaceString = $("#airplaneRenewal").text();
		if (autoReplaceString.includes("%")) {
			//.replace("%", "");
			settings.autoReplaceValue = parseInt(autoReplaceString.split(" ")[1]);
		} else settings.autoReplaceValue = 0;
		settings.save();

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
				log(airportStats, true);
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
			if (vanilla) {
				link.capacity = capString.split("(")[0];
				link.fromAirport = $(this)
					.find(`.cell:eq(${columns.fromAirport})`)
					.text()
					.match(/\(([^)]+)\)/)[1];
				link.toAirport = $(this)
					.find(`.cell:eq(${columns.toAirport})`)
					.text()
					.match(/\(([^)]+)\)/)[1];
			} else {
				link.capacity = capString.split(" ")[0];
				link.fromAirport = $(this).find(`.cell:eq(${columns.fromAirport})`).text().trim().split(" ")[0];
				link.toAirport = $(this).find(`.cell:eq(${columns.toAirport})`).text().trim().split(" ")[0];
			}

			link.pax = $(this).find(`.cell:eq(${columns.pax})`).text();

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

	function log(toLog, isObject = false) {
		if (debug) {
			const d = new Date();
			let str = "TWEAK \t" + d.toLocaleTimeString("fr-fr") + "." + String(d.getMilliseconds()).padStart(3, "0") + "\t";

			if (isObject) {
				console.log(str);
				console.dir(toLog);
			} else console.dir(str + toLog);
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

	class Settings {
		autoReplaceValue = 0;

		refresh() {
			this.autoReplaceValue = GM_getValue("autoReplaceValue", 0);
			log("Loading replace value with " + this.autoReplaceValue);
			//https://stackoverflow.com/questions/39139448/preserve-variables-set-within-userscript
		}

		save() {
			GM_setValue("autoReplaceValue", this.autoReplaceValue);
			log("Settings replace value with " + this.autoReplaceValue);
		}
	}

	function getSlidersVals() {
		// Get slider values
		var parent = this.parentNode;
		var slides = parent.getElementsByTagName("input");
		var slide1 = parseFloat(slides[0].value);
		var slide2 = parseFloat(slides[1].value);
		// Neither slider will clip the other, so make sure we determine which is larger
		if (slide1 > slide2) {
			var tmp = slide2;
			slide2 = slide1;
			slide1 = tmp;
		}

		var displayElement = parent.getElementsByClassName("rangeValues")[0];
		displayElement.innerHTML = slide1 + " - " + slide2;
	}

	function addCss(cssString) {
		var head = document.getElementsByTagName("head")[0];
		var newCss = document.createElement("style");
		newCss.type = "text/css";
		newCss.innerHTML = cssString;
		head.appendChild(newCss);
	}
})();
