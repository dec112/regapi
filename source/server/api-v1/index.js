/// <reference path="../../../typings/index.d.ts"/>
"use strict";

var _ = require('lodash'),
	util = require('util'),
	url = require('url'),
	config = require('../config/config'),
	tools = require('../lib/tools'),
	lang = require('./lang').lang,
	express = require('express'),
	bodyParser = require('body-parser'),
	swagger = require("swagger-node-express"),
	db = require("../data/queries"),
	models = require("./models"),
	nodemailer = require('nodemailer'),
	firmensms = require('firmensms').default;


var mail = nodemailer.createTransport(config.mail);
var sms = new firmensms(config.sms.auth.user, config.sms.auth.pass);
var sms_low_threshold = null;

// ======================================================================
// Module Functions

function init(app, apiPath) {
	var api = app;

	if(!apiPath)
		return;

	api = express();
	app.use(apiPath, api);

	// setup body parser
	api.use(bodyParser.json());
	api.use(bodyParser.urlencoded({
	  extended: true
	}));

	// remove express specific headers
	api.set('etag', false);
	api.use(function (req, res, next) {
		res.removeHeader("X-Powered-By");
		next();
	});

	// CORS
	// This allows client applications from other domains use the API
	if(config.server.CORS) {
		api.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers",
				"Origin, X-Requested-With, Content-Type, Accept");
			//res.header("Access-Control-Allow-Methods", "*");
			res.header("Access-Control-Allow-Methods",
				"OPTIONS, GET, PUT, DELETE");
			next();
		});
	}
	else {
		api.use(function(req, res, next) {
			res.removeHeader("Access-Control-Allow-Origin");
			res.removeHeader("access-Control-Allow-Headers");
			res.removeHeader("Access-Control-Allow-Methods");
			next();
		});
	}

	// configure swagger
	swagger.setAppHandler(api);
	swagger.addModels(models);
	swagger.configureSwaggerPaths("", "/api-docs", "");
	swagger.setApiInfo({
		title: "DEC112-API",
		description: "Backend services for the Deaf Emergency Call 112 service. " +
			"It uses node.js as platform. Requests and responses use HTTP REST "+
			"and are formated as JSON.",
		termsOfServiceUrl: "",
		contact: "richard.prinz@min.at",
		license: "GPLv3",
		licenseUrl: "https://www.gnu.org/licenses/gpl-3.0.en.html"
	});

	// add API methods
	swagger.addGet(v1_check);
	swagger.addPut(v1_register);
	swagger.addDelete(v1_unregister);
	swagger.addGet(v1_configure);
	swagger.addGet(v1_verifyOwner);
	swagger.addGet(v1_verifyPhone);
	swagger.addGet(v1_verifyEmail);

	swagger.configureDeclaration('devices', {
	    description: 'DEC112 device registry',
		authorizations : ["none"],
		protocols : ["http"],
		consumes: ['application/json'],
		produces: ['application/json']
	});

	swagger.configureDeclaration('v', {
		description: 'DEC112 verification routines using http GET method and ' +
			'URL query parameters to be easily performed using standard web ' +
			'browsers',
		authorizations : ["none"],
		protocols : ["http"],
		consumes: ['application/json'],
		produces: ['application/json']
	});

	// API api_key validator
	swagger.addValidator(
		function validate(req, path, httpMethod) {
			var apiKey = req.headers["api_key"];

			if (!apiKey)
				apiKey = url.parse(req.url, true).query["api_key"];

			if (_.get(config, ['api_keys', apiKey, 'enabled'], false))
				return true;

			tools.logWarning('api_key (' + apiKey + ') rejected');
			return false;
		}
	);

	// must be last swagger config action
	swagger.configure(apiPath, "1.0");

	// configure API error handler
	app.use(apiPath, function(error, req, res, next) {
		if(error) {
			//res.status(500).send('error').end();

			// create response error object
			var e = {};
			if(error.message)
				e.msg = error.message;
			else
				e.msg = error.toString();
			if(config.debug) {
				if(error.stack)
					e.stack = error.stack;
				e.obj = error
			}
			if(error.tag)
				e.tag = error.tag;
			if(error.errorType)
				e.errorType = error.errorType;
			if(error.errorLanguage)
				e.errorLanguage = error.errorLanguage;

			tools.logError('Ex: (' + e.msg + ')', e);

			// send back as JSON
			//res.send(JSON.stringify({error: e}));
			//res.json({error: e});

			res.status(500).json({
				'message': e.msg,
				'code': 500
			});

			// send back as XML
			//res.set('Content-Type', 'text/xml');
			//res.send(tools.createError(e.errorType,
			//	e.msg, e.errorLanguage, false, 0));
		}
		else
			next();
	});
};



// ======================================================================
// Swagger API Metadata

// -----------------------------------------------------------------------------
// Device Registry Methods
// -----------------------------------------------------------------------------
var v1_check = {
	spec: {
		method: "GET",
		path: "/devices/check/{device_id}",
		description: "Check state of a device",
		summary: "Returns the current registration state of a device",
		parameters: [
			swagger.pathParam("device_id", "Unique device ID", "string")
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.notFound('device_id')
		],
		nickname: "v1_check"
	},
	action: function(req, res, next) {
		tools.logInfo('Check device (' + _.get(req, 'params.device_id', 'null') + ')');
		db.checkDevice(req, res, next, swagger);
	}
};


var v1_register_info = _.template(
	'Register device <%= device_id %>, ' +
	'<%= model %>, <%= owner_name %>, <%= phone_number %>, ' +
	'<%= owner_email %>, <%= lang %>');
var v1_register_sms = _.template(
	'Send verification SMS to (<%= phone_number %>)');
var v1_register_email = _.template(
	'Send verification e-mail to (<%= owner_email %>)');
var v1_normalized_phone = _.template(
	'Normalized phone from (<%= phone %>) to (<%= phone_norm %>)');
var v1_register = {
	spec: {
		method: "PUT",
		path: "/devices/registry",
		description: "Register a new device",
		summary: "Registers a new device",
		parameters: [
			swagger.bodyParam("device", "JSON object of new device", "Device", null, true)
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.invalid('device')
		],
		nickname: "v1_register"
	},
	action: function(req, res, next) {
		tools.logInfo(v1_register_info(req.body));

		// check and ensure that some request values are conform
		var phone = _.get(req, 'body.phone_number', null);
		if(phone) {
			// remove all whitespaces and replace leading
			// international prefix '+' with 00
			var phone_norm = phone
				.toString()
				.replace(/\s/g,'')
				.replace(/^\+/, '00');
			// if we dont have an intl. prefix starting with 00
			if(!_.startsWith(phone_norm, '00')) {
				// check if we have a local prefix starting with 0
				if(_.startsWith(phone_norm, '0')) {
					// and replace it with the preconfigured
					// international prefix
					phone_norm = phone_norm.replace(/^0/,
						config.api.int_phone_prefix);
				}
				// if we dont have a local prefix starting with 0
				else {
					// just prepend the configured intl. prefix
					phone_norm = config.api.int_phone_prefix + phone_norm;
				}
			}
			// ensure that there are always two zeros prefix
			phone_norm = phone_norm.replace(/^0*/, '00');

			tools.logDebug(v1_normalized_phone({
				phone: phone,
				phone_norm: phone_norm
			}));

			req.body.phone_number = phone_norm;
		}

		db.registerDevice(req, res, next, swagger)
			.then(function(result) {

				tools.logDebug('result after DB registerDevice', result);
				if(result.state >= 10)
					return Promise.resolve('do nothing');

				lang.setLocale(req.body.lang);
				tools.logDebug('Request body after DB registration', req.body);

				// send verification sms
				return new Promise(function(resolve, reject) {
					if(_.get(config, 'api.verify_phone', false)) {
						tools.logInfo(v1_register_sms(req.body));

						var message = {
							to: req.body.phone_number,
							from: 'DEC112',
							text: lang.translate('verify_phone',
								req.body.phone_number,
								_.get(config, 'server.base_url', '') + 'vp?l=' + req.body.lang +
									'&p=' + req.body.phone_number +
									'&t=' + req.body.device_id + '-' +
											req.body.phone_token),
							route: 3
						};
						tools.logDebug('SMS message', message);

						sms.send(message)
							.then(function(response) {
								tools.logDebug('SMS sent', response);
								var low_check = _.get(config, 'sms.warn_below', 0);
								var credits = _.get(response, 'credits', null);
								if(credits && credits < low_check) {
									var low_msg = 'Firmensms credits (' + credits + ') ' +
										'below warning level of (' + low_check + ')';
									tools.logWarning(low_msg);

									// only send low sms credits warning once a day
									var low_warn_date = new Date();
									if(sms_low_threshold != low_warn_date.toDateString()) {
										sms_low_threshold = low_warn_date.toDateString();
										var message = {
											from: '"DEC112 registration service" <service@dec112.at>',
											to: _.get(config, 'sms.warn_email', 'info@dec112.at'),
											subject: 'SMS credits low',
											text: low_msg,
										};
										// fire and forget
										mail.sendMail(message, function(error, response) {
											// if (error) {
											// 	tools.logError('E-mail error', error);
											// 	reject(error);
											// }

											// tools.logDebug('E-mail sent', response);
											// resolve('e-mail sent');
										});
									}
								}
								resolve('sms sent');
							})
							.catch(function(error) {
								tools.logError('SMS error', error);
								reject(error);
							});
					}
					else
						resolve('no sms sent');
				})
				.then(function() {
					// send verification email
					if(_.get(config, 'api.verify_email', false)) {
						tools.logInfo(v1_register_email(req.body));

						var message = {
							from: '"DEC112 service" <service@dec112.at>',
							to: req.body.owner_email,
							subject: lang.translate('verify_email_subject'),
							text: lang.translate('verify_email',
								req.body.owner_email,
								_.get(config, 'server.base_url', '') + 've?l=' + req.body.lang +
									'&e=' + req.body.owner_email +
									'&t=' + req.body.device_id + '-' +
											req.body.email_token),
							html: lang.translate('verify_email_html',
								req.body.owner_email,
								_.get(config, 'server.base_url', '') + 've?l=' + req.body.lang +
									'&e=' + req.body.owner_email +
									'&t=' + req.body.device_id + '-' +
											req.body.email_token),
						};
						tools.logDebug('E-mail message', message);

						return new Promise(function(resolve, reject) {
							resolve(mail.sendMail(message, function(error, response) {
								if (error) {
									tools.logError('E-mail error', error);
									reject(error);
								}

								tools.logDebug('E-mail sent', response);
								resolve('e-mail sent');
							}));
						});
					}
					else
						return Promise.resolve('no email sent');
				});
			})
			.catch(function (error) {
				tools.logError('Unhandled SMS or e-mail error', error);
			})
	}
};


var v1_unregister = {
	spec: {
		method: "DELETE",
		path: "/devices/registry/{device_id}",
		description: "Unregister device",
		summary: "Unregisters a device from the device registry",
		parameters: [
			swagger.pathParam("device_id", "Unique device ID", "string")
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.notFound('device_id')
		],
		nickname: "v1_unregister"
	},
	action: function(req, res, next) {
		tools.logInfo('Unregister device (' + _.get(req, 'params.device_id', 'null') + ')');
		db.unregisterDevice(req, res, next, swagger);
	}
};



// -----------------------------------------------------------------------------
// Configuration Methods
// -----------------------------------------------------------------------------
var v1_configure = {
	spec: {
		method: "GET",
		path: "/devices/configure/{device_id}",
		description: "Configure registered device",
		summary: "Provides configuration parameters for registered devices",
		parameters: [
			swagger.pathParam("device_id", "Unique device ID", "string")
		],
		produces: ['application/json'],
		type: "DeviceConfiguration",
		errorResponses: [
			swagger.errors.notFound('device_id'),
			swagger.errors.invalid('device_id')
		],
		nickname: "v1_configure"
	},
	action: function(req, res, next) {
		tools.logInfo('Configure device (' + _.get(req, 'params.device_id', 'null') + ')');
		db.configureDevice(req, res, next, swagger);
	}
};



// -----------------------------------------------------------------------------
// Verification Methods
// -----------------------------------------------------------------------------
var v1_verifyOwner = {
	spec: {
		method: "GET",
		path: "/v/o",
		description: "Verify owner",
		summary: "Verifies a phone owner token",
		parameters: [
			swagger.queryParam("d", "Unique device ID", "string", true),
			swagger.queryParam("o", "owner token to verify", "string", true)
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.notFound('d'),
			swagger.errors.notFound('o'),
			swagger.errors.invalid('o')
		],
		nickname: "v1_verifyOwner"
	},
	action: function(req, res, next) {
		tools.logInfo('Verify owner of device (' + _.get(req, 'query.d', 'null') + ')');
		db.verifyOwner(req, res, next, swagger);
	}
};


var v1_verifyPhone = {
	spec: {
		method: "GET",
		path: "/v/p",
		description: "Verify phone",
		summary: "Verifies a phone number token",
		parameters: [
			swagger.queryParam("d", "Unique device ID", "string", true),
			swagger.queryParam("p", "phone token to verify", "string", true)
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.notFound('d'),
			swagger.errors.notFound('p'),
			swagger.errors.invalid('p')
		],
		nickname: "v1_verifyPhone"
	},
	action: function(req, res, next) {
		tools.logInfo('Verify phone number of device (' + _.get(req, 'query.d', 'null') + ')');
		db.verifyPhone(req, res, next, swagger);
	}
};


var v1_verifyEmail = {
	spec: {
		method: "GET",
		path: "/v/e",
		description: "Verify e-mail",
		summary: "Verifies an e-mail token",
		parameters: [
			swagger.queryParam("d", "Unique device ID", "string", true),
			swagger.queryParam("e", "e-mail token to verify", "string", true)
		],
		produces: ['application/json'],
		type: "DeviceState",
		errorResponses: [
			swagger.errors.notFound('d'),
			swagger.errors.notFound('e'),
			swagger.errors.invalid('e')
		],
		nickname: "v1_verifyEmail"
	},
	action: function(req, res, next) {
		tools.logInfo('Verify owner e-mail for device (' + _.get(req, 'query.d', 'null') + ')');
		db.verifyEmail(req, res, next, swagger);
	}
};



// ======================================================================
// Exports

module.exports = {
    init: init
};
