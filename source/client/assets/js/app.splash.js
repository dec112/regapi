/// <reference path="../../../../typings/index.d.ts"/>
"use strict";

define([
    'jquery',
	'settings.js'
], function ($, settings) {

	var Splash = {
		oReadyStateTimer: undefined,

		initialize: function initialize(splashElementID, startPage) {
			Splash.oReadyStateTimer = setInterval(function() {
				if(document.readyState === "complete") {
					clearInterval(Splash.oReadyStateTimer);
					Splash._fadeOut(splashElementID, startPage);
				}
			}, 500);
		},

		_fadeOut: function _fadeOut(splashElementID, startPage) {
			$('#' + splashElementID)
				.fadeOut(3000, function() {
					window.location.href = startPage;
				});
		}
	};

	return Splash;
});
