// ==UserScript==
// @name         Airline Club Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.1.21
// @description  Fly better
// @author       mathd
// @match        https://*.airline-club.com/
// @icon         https://www.google.com/s2/favicons?domain=airline-club.com
// @downloadURL  https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @updateURL    https://raw.githubusercontent.com/mathdons/Airline-Club-Tweaks/main/AirlineClubTweaks.user.js
// @grant        none
// ==/UserScript==

/* global $, waitForKeyElements */

(function() {
    'use strict';
    var debug = false;

    //waitForKeyElements("#airportCanvas", airportCanvasShown);


    var openAjaxRequests = 0;
    // https://github.com/greasemonkey/greasemonkey/issues/3015
    (function(open) {
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener("readystatechange", function() {

                if (this.readyState == 1)
                {
                    openAjaxRequests++;
                    log("Open requests: "+openAjaxRequests);
                }
                else if (this.readyState == 4)
                {
                    openAjaxRequests--;
                    log("Open requests: "+openAjaxRequests);
                }

            });
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);




    var airportProcessed = false;
    var currentAirline = "";
    var modifiedHtml = false;

    $(document).ready(function() {
        setTimeout(main, 100);
    });

    function main()
    {
        setCurrentAirline();

        const airportMutationConfig = { attributes: true, childList: false, subtree: false, attributeFilter: ['style'] };
        const airportViewObserver = new MutationObserver(airportViewMutated);
        airportViewObserver.observe($("#airportCanvas")[0], airportMutationConfig);
    }

    function airportViewMutated(mutationList, observer)
    {
        if (openAjaxRequests > 0){ setTimeout(function() {airportViewMutated(mutationList, observer)}, 50); return false}

        var airportCanvas = $("#airportCanvas");
        var mutation = mutationList[0];
        if (airportCanvas.css("display") == "block")
        {
            if (!airportProcessed)
            {
                airportProcessed = true;
                setTimeout(airportCanvasShown, 1000);
            }
        }
        else
        {
            airportProcessed = false;
            log("Setting processed to false");
        }
    }

    function setCurrentAirline()
    {
        if (openAjaxRequests > 0){ setTimeout(setCurrentAirline, 50); return false}

        var spanContent = $("#topBar .currentAirline ").first().text();
        if (spanContent!="")
        {
            currentAirline = spanContent;
            log("Current Airline Loaded: " + currentAirline);
        }
        else
        {
            setTimeout(setCurrentAirline, 50);
        }

    }
    function airportCanvasShown () {

        var loyalistData = new Map();

        $(".loyalistDelta div[data-link='rival']").each(function() {
            var rivalName = $(this).find("div span span").text();
            var rivalValue = $(this).find("div:eq(1)").text();
            loyalistData.set(rivalName, rivalValue);

        });
        var currentAirlineChange = loyalistData.get(currentAirline);

        var championData = new Map();

        if ($(".tweakAirport").length <= 0) {
            $("#airportDetailsChampionList .table-header div:eq(4)").after('<div class="cell tweakAirport" style="width: 15%; text-align: right;">Change</div>');
        } else {
            modifiedHtml = true;
        }

        var rivals = $("#airportDetailsChampionList div[data-link='rival']");
        $(rivals).each(function() {
            var rivalName = $(this).find("div:eq(1) span span").text();
            var rivalValue = parseInt($(this).find("div:eq(2)").text().replaceAll(",", ""));
            championData.set(rivalName, rivalValue);
        });

        var currentAirlineValue = championData.get(currentAirline);
        $(rivals).each(function() {
            var rivalName = $(this).find("div:eq(1) span span").text();
            var toInsert = "";
            if (rivalName != currentAirline) {
                if (loyalistData.has(rivalName)) {
                    var deltaTotal = currentAirlineValue - championData.get(rivalName);
                    var deltaChange = currentAirlineChange - loyalistData.get(rivalName);
                    var weeks = -Math.round(deltaTotal / deltaChange);
                    
                    if (weeks > 10000) weeks = ">10k ";
                    

                    if (deltaTotal > 0) // current airline above this rival
                    {
                        if (deltaChange > 0) // current airline gaining
                        {
                            toInsert = "▽" + deltaChange + "<br>(∞ wks)";
                        } else {
                            toInsert = "⚠" + deltaChange + "<br>(" + weeks + "wks)";
                        }
                    } else { // current airline below this rival
                        if (deltaChange > 0) // current airline gaining
                        {
                            toInsert = "△" + deltaChange + "<br>(" + weeks + "wks)";
                        } else {
                            toInsert = "▽" + deltaChange + "<br>(∞ wks)";
                        }
                    }

                }

            }

            if ($(this).find(".tweakAirport").length <= 0) {
                $(this).find("div:eq(4)").after('<div class="cell tweakAirport" style="text-align: right;">' + toInsert + '</div>');
            } else {
                $(this).find(".tweakAirport").text(toInsert);
            }
        });

    }

    function log(toLog)
    {
        if (debug){
            const d = new Date();
            console.log("TWEAK \t" + d.toLocaleTimeString('fr-fr') + "." + String(d.getMilliseconds()).padStart(3, '0') + "\t" + toLog);
        }
    }

})();
