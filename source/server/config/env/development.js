'use strict';

module.exports = {
    quite: false,
    debug: true,
    server: {
        listen: '0.0.0.0',
        port: 8080,
        CORS: true,
        base_url: 'http://localhost:8080/',
        log_directory: 'logs',
        https_off: {
            port: 443,
            key: 'certs/dec112.at.key',
            ca: 'certs/dec112.at.intermediate.crt',
            cert: 'certs/dec112.at.primary.crt'
        }
    },
    api: {
        verify_owner: false,
        verify_phone: true,
        verify_email: true,
        delete_unregistered: true,
        int_phone_prefix: '0043'
    },
    // See also:
    // https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax
    // use postgres local domain socket (normally '/var/run/postgresql/')
    // for local connections
	database: {
        host: '/var/run/postgresql/',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'secret',
        schema: "dec112"
    },
    kamailio: {
        ws: 'ws://server.domain.tld:4711',
        domain: 'server.domain.tld',
        services: [
            {
                urn: "urn:service:sos",
                enabled: true
            },
            {
                urn: "urn:service:police",
                enabled: true
            },
            {
                urn: "urn:service:fire",
                enabled: true
            },
            {
                urn: "urn:service:ambulance",
                enabled: true
            }
        ]
    },
    // SMTP mail server configuration
    mail: {
        host: 'smtp.domain.tld',
        port: 587,
        secure: false,
        auth: {
            user: 'service@domain.tld',
            pass: 'secret'
        }
    },
    // SMS configuration for firmensms.at
    sms: {
        host: 'http://www.firmensms.at',
        auth: {
            user: 'user',
            pass: 'secret'
        },
        warn_below: 5
    },
    // At the moment only a handful api keys are required so this configuration
    // is enough. Later place them into the db
    api_keys: {
        'my_secret_api_key': {
            enabled: true,
            description: 'DEC112 development key'
        }
    }
}
