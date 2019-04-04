/// <binding BeforeBuild='debug' />
/* global module:false */

module.exports = function (grunt) {

    var deploy_debug = {
        host: '10.16.77.202',
        path: '/srv/node/dec112-api',
        user: '',
        password: ''
    }
    var deploy_release = deploy_debug;



    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // see https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            debug: [ 'dist' ],
            release: [ 'dist' ]
        },

        // see https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            debug_server: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '(c) Copyright <%= pkg.author %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    mangle: false,
                    compress: false,
                    sourceMap: false,
                    report: 'min',
                    beautify: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'source/server',
                        src: [
                            '**/*.js',
                            '!config/env/development.js',
                            '!config/env/production.js'
                        ],
                        dest: 'dist'
                    }
                ]
            },
            release_server: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '(c) Copyright <%= pkg.author %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    mangle: {
                        except: [
                        ]
                    },
                    compress: true,
                    sourceMap: false,
                    sourceMapName: 'dist/dec112-api.map',
                    report: 'min',
                    beautify: false
                },
                files: [
                    {
                        expand: true,
                        cwd: 'source/server',
                        src: [
                            '**/*.js',
                            '!config/env/development.js',
                            '!config/env/production.js'
                        ],
                        dest: 'dist'
                    }
                ]
            },
        },

		// see: https://github.com/gruntjs/grunt-contrib-requirejs
		requirejs: {
			debug_client: {
				options: {
					baseUrl: 'source/client/assets/js/',
					mainConfigFile: 'source/client/assets/js/main.js',
					name: 'main',
					out: 'dist/docs/assets/js/app.js',
					optimize: "uglify",
					uglify2: {
						toplevel: true,
						ascii_only: true,
						beautify: true,
						max_line_length: 1000,
						defines: {
							DEBUG: ['name', 'false']
						},
						no_mangle: true
					},
					generateSourceMaps: false,
					optimizeCss: 'standard.keepLines',
					paths: {
						requireLib: '../../../../bower_components/requirejs/require',
						jquery: '../../../../bower_components/jquery/dist/jquery',
						bootstrap: '../../../../bower_components/bootstrap/dist/js/bootstrap'
					},
					include: 'requireLib'
				}
			},
			release_client: {
				options: {
					baseUrl: 'source/client/assets/js/',
					mainConfigFile: 'source/client/assets/js/main.js',
					name: 'main',
					out: 'dist/docs/assets/js/app.js',
					optimize: "uglify",
					generateSourceMaps: false,
					optimizeCss: 'standard.keepLines',
					paths: {
						requireLib: '../../../../bower_components/requirejs/require.min',
						jquery: '../../../../bower_components/jquery/dist/jquery',
						bootstrap: '../../../../bower_components/bootstrap/dist/js/bootstrap.min'
					},
					include: 'requireLib'
				}
			}
		},

        // see https://github.com/gruntjs/grunt-contrib-htmlmin
        htmlmin: {
            debug_client: {
                options: {
                    removeComments: false,
                    collapseWhitespace: false,
                    removeOptionalTags: false
                },
                files: {
                    // pages
                    'dist/docs/index.html': 'source/client/index.html',
                    'dist/docs/info.html': 'source/client/info.html',
                    // views
                    'dist/views/main.html': 'source/client/views/main.html',
                    'dist/views/verify_ok.html': 'source/client/views/verify_ok.html',
                    'dist/views/verify_p.html': 'source/client/views/verify_p.html',
                    'dist/views/verify_e.html': 'source/client/views/verify_e.html'
                }
            },
            release_client: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeOptionalTags: true
                },
                files: {
                    // pages
                    'dist/docs/index.html': 'source/client/index.html',
                    'dist/docs/info.html': 'source/client/info.html',
                    // views
                    'dist/views/main.html': 'source/client/views/main.html',
                    'dist/views/verify_ok.html': 'source/client/views/verify_ok.html',
                    'dist/views/verify_p.html': 'source/client/views/verify_p.html',
                    'dist/views/verify_e.html': 'source/client/views/verify_e.html'
                }
            }
        },

        // see https://github.com/gruntjs/grunt-contrib-cssmin
        cssmin: {
            debug_client: {
                options: {
                    //level: 0,
                    format: 'beautify',
                },
                files: {
                    'dist/docs/assets/css/app.css': [
                        'bower_components/bootstrap/dist/css/bootstrap.css',
                        'source/client/assets/css/app.css'
                    ]
                }
            },
            release_client: {
                files: {
                    'dist/docs/assets/css/app.css': [
                        'bower_components/bootstrap/dist/css/bootstrap.min.css',
                        'source/client/assets/css/app.css'
                    ]
                }
            }
        },

		// see https://github.com/gruntjs/grunt-contrib-copy
		copy: {
            debug_server: {
                files: [
                    { src: [ 'package.json' ], dest: 'dist/package.json' },
                    { src: [ 'readme.md' ], dest: 'dist/readme.md' },
                    { src: [ 'source/server/favicon.ico' ], dest: 'dist/favicon.ico' },
                    { src: [ 'source/server/config/env/development.js' ],
                        dest: 'dist/config/env/development.js' },
                    { src: [ 'source/server/config/env/production.js' ],
                        dest: 'dist/config/env/production.js' },
                    { expand: true, cwd: 'source/server/downloads', src: '**/*',
                        dest: 'dist/downloads' },
                    { expand: true, cwd: 'source/server/docs', src: '**/*',
                        dest: 'dist/docs' },
                    { expand: true, cwd: 'source/server/views', src: '**/*',
                        dest: 'dist/views' },
                    { expand: true, cwd: 'source/server/data', src: '**/*',
                        dest: 'dist/data' },
                    { expand: true, cwd: 'certificates',
                        src: [
                            'dec112.at.key',
                            'dec112.at.intermediate.crt',
                            'dec112.at.primary.crt'
                        ],
                        dest: 'dist/certs/' }
                ]
            },
            release_server: {
                files: [
                    { src: [ 'package.json' ], dest: 'dist/package.json' },
                    { src: [ 'readme.md' ], dest: 'dist/readme.md' },
                    { src: [ 'source/server/favicon.ico' ], dest: 'dist/favicon.ico' },
                    { src: [ 'source/server/config/env/development.js' ],
                        dest: 'dist/config/env/development.js' },
                    { src: [ 'source/server/config/env/production.js' ],
                        dest: 'dist/config/env/production.js' },
                        { expand: true, cwd: 'source/server/downloads', src: '**/*',
                        dest: 'dist/downloads' },
                    { expand: true, cwd: 'source/server/docs', src: '**/*',
                        dest: 'dist/docs' },
                    { expand: true, cwd: 'source/server/views', src: '**/*',
                        dest: 'dist/views' },
                    { expand: true, cwd: 'source/server/data', src: '**/*',
                        dest: 'dist/data' },
                    { expand: true, cwd: 'certificates',
                        src: [
                            'dec112.at.key',
                            'dec112.at.intermediate.crt',
                            'dec112.at.primary.crt'
                        ],
                        dest: 'dist/certs/' }
                ]
            },
            debug_client: {
                files: [
                    { expand: true, cwd: 'source/client/assets/fonts',
                        src: '**/*', dest: 'dist/docs/assets/fonts' },
                    { expand: true, cwd: 'source/client/assets/images',
                        src: '**/*', dest: 'dist/docs/assets/images' },
                    { expand: true, cwd: 'bower_components/bootstrap/fonts',
                        src: '**/*', dest: 'dist/docs/assets/fonts' }
                ]
            },
            release_client: {
                files: [
                    { expand: true, cwd: 'source/client/assets/fonts',
                        src: '**/*', dest: 'dist/docs/assets/fonts' },
                    { expand: true, cwd: 'source/client/assets/images',
                        src: '**/*', dest: 'dist/docs/assets/images' },
                    { expand: true, cwd: 'bower_components/bootstrap/fonts',
                        src: '**/*', dest: 'dist/docs/assets/fonts' }
                ]
            }
		},

        // see https://github.com/gruntjs/grunt-contrib-compress
        compress: {
            zip: {
                options: {
                    archive: './dec112-api.zip',
                    mode: 'zip'
                },
                files: [
                    { src: './gpl-3.0.txt' },
                    { src: './start_server.*' },
                    //{ expand: true, src: './.gitignore.dist', ext: '.gitignore' },
                    { src: './dist/**' }
                ]
            }
        }
    });



    // Load Grunt plugins.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-requirejs');


    // Tasks
    grunt.registerTask('createDirectories', function (d) {
        grunt.file.mkdir('dist');
        grunt.file.mkdir('dist/docs');
        grunt.file.mkdir('dist/downloads');
        grunt.file.mkdir('dist/certs');
    });

	grunt.registerTask('deploy', function(d) {
		var done = this.async();
		var sys = require('sys');
		var exec = require('child_process').exec;
		var child;

        if(d === 'debug')
            d = deploy_debug;
        if(d === 'release')
            d = deploy_release;
        if(!d)
            d = deploy_debug;
		console.log('Deploy DEC112 ...');
        var cmd = 'pscp -r -l ' + d.user +
                ' -pw ' + d.password + ' ./start_server.sh ./dist ' +
                d.host + ':' + d.path;
		child = exec(cmd,
			function(error, stdout, stderr) {
				if(error) {
					sys.print('ERROR: '.red + stderr);
					done(false);
				}

			console.log('DONE'.green);
			}
		);
	});



    // tasks / targets
    grunt.registerTask('debug', [
        'clean:debug',
        'createDirectories',

        'copy:debug_server',
        'uglify:debug_server',

        'copy:debug_client',
        'cssmin:debug_client',
        'htmlmin:debug_client',
        'requirejs:debug_client',

        'compress:zip'
    ]);
    grunt.registerTask('deploy_debug', [
        'deploy:debug'
    ]);

    grunt.registerTask('release', [
        'clean:release',
        'createDirectories',

        'copy:release_server',
        'uglify:release_server',

        'copy:release_client',
        'cssmin:release_client',
        'htmlmin:release_client',
        'requirejs:release_client',

        'compress:zip'
    ]);
    grunt.registerTask('deploy_release', [
        'deploy:release'
    ]);

    grunt.registerTask('default', ['release']);
    grunt.registerTask('build', ['debug']);
};

