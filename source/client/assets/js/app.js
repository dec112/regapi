/// <reference path="../../../../typings/index.d.ts"/>
"use strict";

define([
    'jquery',
	'settings.js',
    'app.splash'
], function ($, settings, Splash) {
    var phone_token_re = /^\s*(.+)-([a-zA-Z0-9]{8})\s*$/;
    var email_token_re = /^\s*(.+)-([a-zA-Z0-9]{8})\s*$/;

    var App = {
        urlParams: {},
        initialize: function() {
			/*
            window.onresize = function(event) {
            };

            window.onerror = function(message, url, line) {
            };

			document.addEventListener('DOMContentLoaded', initialize, false);
			*/

            window.onpopstate = function() {
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query  = window.location.search.substring(1);

                App.urlParams = {};
                while (match = search.exec(query))
                   App.urlParams[decode(match[1])] = decode(match[2]);
            };
            window.onpopstate();

            if(settings.DEBUG) {
			}
        },

        Splash: Splash,

        verify_phone: function(token, phone) {
            var match = phone_token_re.exec(token);
            //console.log(match);
            if(match) {
                var device_id = match[1];
                var phone_token = match[2];
                //console.log('device_id=' + device_id + ', phone_token=' + phone_token);
                $.get({
                    url: '/api/v1/v/p?' +
                        'd=' + encodeURIComponent(device_id) +
                        '&p=' + encodeURIComponent(phone_token) +
                        '&api_key=' + encodeURIComponent(settings.api_key),
                    dataType: 'json',
                    success: function(response) {
                        //console.log(response);
                        window.location.replace('/vok?l=' + App.urlParams['l']);
                    },
                    error: function(jqXHR, textStatus, error) {
                        //console.error('Error: ' + textStatus + ', ' + error);
                        $('#alert').show();
                    }
                });
            }
            else {
                //console.error('regex mismatch (' + token + ')');
                $('#alert').show();
            }
        },

        verify_email: function(token, email) {
            var match = email_token_re.exec(token);
            //console.log(match);
            if(match) {
                var device_id = match[1];
                var email_token = match[2];
                //console.log('device_id=' + device_id + ', email_token=' + email_token);
                $.get({
                    url: '/api/v1/v/e?' +
                        'd=' + encodeURIComponent(device_id) +
                        '&e=' + encodeURIComponent(email_token) +
                        '&api_key=' + encodeURIComponent(settings.api_key),
                    dataType: 'json',
                    success: function(response) {
                        //console.log(response);
                        window.location.replace('/vok?l=' + App.urlParams['l']);
                    },
                    error: function(jqXHR, textStatus, error) {
                        //console.error('Error: ' + textStatus + ', ' + error);
                        $('#alert').show();
                    }
                });
            }
            else {
                //console.error('regex mismatch (' + token + ')');
                $('#alert').show();
            }
        }
    };

    return App;
});
