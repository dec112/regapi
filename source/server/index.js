/// <reference path="../../typings/index.d.ts"/>
"use strict";

// ======================================================================
// Variables

var	config = require("./config/config"),
	Q = require('q'),
	_ = require('lodash'),
	tools = require('./lib/tools'),
	lang = require('./lang'),
	sprintf = require('sprintf').sprintf,
	colors = require('colors'),
	path = require('path'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	http = require('http'),
	https = require('https'),
    express = require('express'),
	favicon = require('serve-favicon'),
	cons = require('consolidate'),
	serveIndex = require('serve-index'),
	FileStreamRotator = require('file-stream-rotator'),
	logger = require('morgan'),
	api_v1 = require('./api-v1/index');

tools.logInfo('-'.repeat(79));
try {
	var pjson = require('./package.json');
	global.APPLICATION = {
		name: pjson.name,
		description: pjson.description,
		version: pjson.version,
		copyright: 'Copyright ' + pjson.author + ' 2015-2019'
	}

	tools.logInfo(APPLICATION.description + ' started');
	tools.logInfo(APPLICATION.name + ', version ' + APPLICATION.version);
	tools.logInfo(APPLICATION.copyright)
}
catch (err) {
	tools.logInfo('DEC112 Registration Service');
}

//tools.setLogMode(1);
Q.stopUnhandledRejectionTracking();

var server;
var app = express();



// ======================================================================
// Methods

// configure service
function configure() {
	configureServer();
	configureDownloads();
	configureAPI();
	configureContent();
}

// initialize service/data (if any)
function initialize() {
}

// configure server parameters
function configureServer() {
	// in case of debug, pretty print json
	if(config.debug)
		app.set('json spaces', 2);

	// listen address
	if(!config.server.listen)
		app.set('bind', process.env.LISTEN || '0.0.0.0');
	else
		app.set('bind', config.server.listen);

	// listen TCP port
	if(!config.server.port)
		app.set('port', process.env.PORT || 8080);
	else
		app.set('port', config.server.port);

	// configure logging
	// ensure log directory exists
	var logDirectory = config.server.log_directory;
	if(!logDirectory)
		logDirectory = path.join(__dirname, 'logs');
	else
		if(!path.isAbsolute(logDirectory))
			logDirectory = path.join(__dirname, logDirectory);
	fs.existsSync(logDirectory) || mkdirp.sync(logDirectory);

	// create a rotating write stream
	var accessLogStream = FileStreamRotator.getStream({
		date_format: 'YYYYMM',
		filename: path.join(logDirectory, '/access-%DATE%.log'),
		frequency: 'daily',
		verbose: true
	});

	app.use(logger('combined', {stream: accessLogStream}));

	// define favicon for this service/app
	app.use(favicon('favicon.ico'));

	// configure https
	var https = _.get(config, 'server.https', null);
	if(https) {
		if(https.key && https.cert) {
			if(!path.isAbsolute(https.key))
				https.key = path.join(__dirname, https.key);
			if(!fs.existsSync(https.key)) {
				tools.logError('https key ' +
					https.key.toString().cyan +
					' not found');
				https.key = null;
			}

			if(https.ca) {
				if(!path.isAbsolute(https.ca))
					https.ca = path.join(__dirname, https.ca);
				if(!fs.existsSync(https.ca)) {
					tools.logError('https ca certificate ' +
						https.ca.toString().cyan +
						' not found');
					https.ca = null;
				}
			}

			if(!path.isAbsolute(https.cert))
				https.cert = path.join(__dirname, https.cert);
			if(!fs.existsSync(https.cert)) {
				tools.logError('https certificate ' +
					https.cert.toString().cyan +
					' not found');
				https.cert = null;
			}
		}

		if(https.key && https.cert) {
			https.options = {}
			https.options.key = fs.readFileSync(https.key);
			if(https.ca)
				https.options.ca = fs.readFileSync(https.ca);
			https.options.cert = fs.readFileSync(https.cert);

			// listen SSL TCP port
			if(!config.server.https.port)
				app.set('https_port', process.env.HTTPS_PORT || 443);
			else
				app.set('https_port', config.server.https.port);

			tools.logInfo('https configured - ' +
				'enabled'.green);
		}
		else {
			tools.logError('https configuration invalid - ' +
				'disabled'.red);
		}
	}
	else {
		tools.logInfo('https not configured - ' +
			'disabled'.red);
	}
}

// download content (incl. directory indexing)
function configureDownloads() {
	app.use('/downloads', serveIndex('downloads', {'icons': true}));
	app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
}

// setup service API's
function configureAPI() {
	api_v1.init(app, '/api/v1');
}

// static and generated content
function configureContent() {
	// template's
	app.engine('html', cons.lodash);
	app.set('view engine', 'html');
	app.set('views', path.join(__dirname, 'views'));

	// mai template
	app.get('/main', function(req, res, next) {
		res.render('main', { });
	});
	// verify e-mail template
	app.get('/ve', function(req, res, next) {
		var email = _.get(req, 'query.e', '');
		var token = _.get(req, 'query.t', '');
		var lang_code = _.get(req, 'query.l', 'en');
		lang_code = (lang.available.includes(lang_code) ? lang_code : lang.available[0]);
		lang.lang.setLocale(lang_code);
		res.render('verify_e', {
			'email': email,
			'token': token,
			'verify_email_text': lang.lang.translate('verify_page_email_text'),
			'verify_email_button': lang.lang.translate('verify_page_email_button'),
			'verify_page_footer': lang.lang.translate('verify_page_footer'),
			'verify_page_email_field': lang.lang.translate('verify_page_email_field'),
			'verify_page_email_token': lang.lang.translate('verify_page_email_token'),
			'verify_page_email_token_placeholder': lang.lang.translate('verify_page_email_token_placeholder'),
			'verify_page_email_token_invalid': lang.lang.translate('verify_page_email_token_invalid')
		});
	});
	// verify phone template
	app.get('/vp', function(req, res, next) {
		var phone = _.get(req, 'query.p', '');
		var token = _.get(req, 'query.t', '');
		var lang_code = _.get(req, 'query.l', 'en');
		lang_code = (lang.available.includes(lang_code) ? lang_code : lang.available[0]);
		lang.lang.setLocale(lang_code);
		res.render('verify_p', {
			'phone': phone,
			'token': token,
			'verify_phone_text': lang.lang.translate('verify_page_phone_text'),
			'verify_phone_button': lang.lang.translate('verify_page_phone_button'),
			'verify_page_footer': lang.lang.translate('verify_page_footer'),
			'verify_page_phone_field': lang.lang.translate('verify_page_phone_field'),
			'verify_page_phone_token': lang.lang.translate('verify_page_phone_token'),
			'verify_page_phone_token_placeholder': lang.lang.translate('verify_page_phone_token_placeholder'),
			'verify_page_phone_token_invalid': lang.lang.translate('verify_page_phone_token_invalid')
		});
	});
	// verify OK template
	app.get('/vok', function(req, res, next) {
		var lang_code = _.get(req, 'query.l', 'en');
		lang_code = (lang.available.includes(lang_code) ? lang_code : lang.available[0]);
		lang.lang.setLocale(lang_code);
		res.render('verify_ok', {
			'verify_page_ok': lang.lang.translate('verify_page_ok')
		});
	});

	// debug support
	// if(config.debug) {
	// 	// provides express debug infos
	// 	require('express-debug')(app, {
	// 		depth: 4,
	// 		//panels: [
	// 		//	'locals', 'request', 'session', 'template',
	// 		//	'software_info', 'profile'
	// 		//],
	// 		path: '/express-debug'
	// 	});

	// 	// shows client http headers
	// 	app.get('/info', generateDebugPage);
	// }

	// default go to main page
	app.use('/', express.static(path.join(__dirname, 'docs')));

	// remove express specific headers
	app.use(function (req, res, next) {
		res.removeHeader("X-Powered-By");
		next();
	});
}

// start server
function startServer() {
	var port = 0;

	if(_.get(config, 'server.https.options', false)) {
		server = https.createServer(config.server.https.options, app);
		port = app.get('https_port');
	}
	else {
		server = http.createServer(app);
		port = app.get('port');
	}

	server.listen(port, app.get('bind'), function() {
		var addr = server.address();
		tools.logInfo('Express server listening on ' +
			(addr.address.toString() + ':' +
			addr.port).cyan);
		tools.listIPs();
	});
}

// generate debug helper page showing sent client http headers
// and IP address
// function generateDebugPage(req, res) {
// 	var h = '';
// 	for(var header in req.headers)
// 		h += header + ' = <b>' + req.headers[header] + '</b><br>';

//   res.send(
// 	'<html><head></head><body>' +
// 	'Your IP: <b>' + req.connection.remoteAddress + '</b><br><p>' +
// 	'Headers:<br>' +
// 	h +
// 	'</body></html>');
// }



// ======================================================================
// Main

configure();
initialize();
startServer();
