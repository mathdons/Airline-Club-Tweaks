# Airline-Club-Tweaks

For feedback/bugs/suggestions, poke Air Primal/Air Patate on Discord.

## Please consider sponsoring the dev and subscribing to their Patreon with the ingame link!!!

Tested on Chrome/Tampermonkey, should work on Firefox/Greasemonkey

## v0.1.21
Loyalist Delta in Airport view:
- Shows the true loyalist change for the current airline (current airline gain + rival gain) for each available rival. 
  - △ indicates the current airline is behind the rival and gaining, 
  - ▽ indicates the current airline is behind and also losing loyalist or that the rival is behind and losing, 
  - ⚠ indicates the current airline is ahead but losing ground. 
- Shows the number of weeks for the two positions to be swapped (or ∞ if the positions will not swap with the current delta)
- Only available for the Rivals shown in the Loyalist Trend table

## v0.1.22
Base statistics added to Office view, with number of routes, number of pax, LF/SF, Revenue and profit
- The stats are created when the Flights page is visited and refreshed each subsequent visit

## v0.1.24
Adds top bar shortcut buttons to main pages

## v0.1.27
Adds a set of filter in the hangar view based on Usage and Condition
- One slider to set the minimum and maximum values for each Usage and Condition. Can be combined (ex: all planes with low usage and low condition)
- One button to set the condition filter to planes which are soon going to be automatically replaced (between target set in the office and target +5)
  - Need to visit the office first to store the value
  - Known issue: after changing the value in the office, the value is not automatically refreshed, need to reopen the office view again
- One button to reset all sliders
