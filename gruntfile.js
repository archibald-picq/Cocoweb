module.exports = function(grunt) {
	var current_git_rev = Math.round(Math.random() * 42000);
	var server_locked = false;
	var angular_app_name = 'Cocoweb';
	const fs = require('fs');

	function	buildConfig() {
		var config = {};
		console.info('build config from ', grunt.cli.options);
		if (grunt.cli.options.api)
			config.api = grunt.cli.options.api;
			
		config = JSON.stringify(config);
		if (config === '{}')
			return undefined;
		return 'var config = '+config+';';
	}
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		dirs: {
			lib: 'bower_components/',
			build: 'build',
			src: 'src'
		},

		jshint: {
			files: {
				src: ['<%= dirs.src %>/**/*.js']
			},
			options: {
				// more options here if you want to override JSHint defaults
				freeze: true, // prohibits overwriting prototypes of native objects such as Array, Date and so on.
				browser: true, // This option defines globals exposed by modern browsers (FileRead, document).
				eqnull: true, // This option suppresses warnings about == null comparisons.
				es3: false, // This option tells JSHint that your code needs to adhere to ECMAScript 3 specification -- We do not support legacy js environment such as IE6/7/8.
				forin: true, // This option requires all for in loops to filter object's items.
				eqeqeq: true, // This options prohibits the use of == and != in favor of === and !==.
				latedef: true, // This option prohibits the use of a variable before it was defined
				nonbsp: true, // This option warns about "non-breaking whitespace" characters
				noempty: true, // This option warns when you have an empty block in your code
				noarg: true, // This option prohibits the use of arguments.caller and arguments.callee
				quotmark: true, // This option enforces the consistency of quotation marks used throughout your code
				unused: 'vars', // This option warns when you define and never use your variables (set to vars to not check function parameters
				trailing: true, // This option makes it an error to leave a trailing whitespace in your code
				globals: {
					console: true,
					angular: true
				}
			}
		},

		scsslint: {
			allFiles: ['<%= dirs.src %>/**/*.scss'],
			options: {
				config: '.scss_lint.yml',
				colorizeOutput: true,
				force: true
			}
		},

		copy: {
			html: {
				flatten: false,
				expand: true,

				cwd: '<%= dirs.src %>',
				src: ['index.html'],
				dest: '<%= dirs.build %>/'
			},

			assets: {
				flatten: false,
				expand: true,

				cwd: '<%= dirs.src %>',
				src: [
					'manifest.json',
					'assets/**/*',
				],
				dest: '<%= dirs.build %>'
			},
			libstyles: {
				flatten: false,
				expand: true,
				cwd: '<%= dirs.lib %>/',
				src: [
					'angular-gridster/src/angular-gridster.less',
				],
				dest: '<%= dirs.build %>/../.sass-cache/',
				rename: function(dest, src) {
					console.info('rename: ', dest, src);
					return dest + src.replace(/(\.min)?\.(c|le)ss$/, '.scss');
				}
			},
		},

		clean: {
			build: {
				src: ['<%= dirs.build %>/**/*']
			},
			temp_prod: {
				src: [
					'<%= dirs.build %>/app/script.js*',
					'<%= dirs.build %>/app/tpl.js',
				],
			},
		},

		sass: { //Compiling our scss files to css files
			dev: {
				options: {
					style: 'expanded', //keep the css readable, anyways it will be compressed later on
					sourcemap : 'auto',
					loadPath: [],
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>',
					//					src: ['**/*.scss'],		// all files are merged into style.scss
					src: ['/style.scss'],
					dest: '<%= dirs.build %>/', //Keep the same architecture as the src. So the concat_app will have no problem finding these files
					ext: '.css',
					nonull: true,
				}]
			},
			prod: {
				options: {
					style: 'compressed', //keep the css readable, anyways it will be compressed later on,
					sourcemap: 'none', //no source map
					loadPath: [
					],
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>',
					//					src: ['**/*.scss'],
					src: ['/style.scss'],
					dest: '<%= dirs.build %>/', //Keep the same architecture as the src. So the concat_app will have no problem finding these files
					ext: '.css',
					nonull: true,
				}]
			}
		},

		pleeease: {
			dev: {
				options: {
					autoprefixer: {'browsers': ['last 4 versions', 'ie 11', 'Android 4.0']},
					//minifier: true,
					sourcemaps: true,
				},
				files: {
					'<%= dirs.build%>/style.css': '<%= dirs.build%>/style.css',
				},
			},
			prod: {
				options: {
					autoprefixer: {'browsers': ['last 4 versions', 'ie 11', 'Android 4.0']},
					minifier: true,
				},
				files: {
					'<%= dirs.build%>/style.css': '<%= dirs.build%>/style.css',
				},
			},
		},

		'file-creator': {
			index_html_dev: {
				'build/index.html': function(fs, fd, done) {
					build_index_file({
						source: 'src/index.html',
						styles: [
							'/style.css',
						],
						scripts: [
							'/app/lib.js',
							'/app/script.js',
							'/app/tpl.js',
						],
						config: buildConfig(),
					}, fs, fd, done);
				},
			},
			index_html_prod: {
				'build/index.html': function(fs, fd, done) {
					build_index_file({
						source: 'src/index.html',
						styles: [
							'/style.css',
						],
						scripts: [
							'/app/app.js',
						],
						config: buildConfig(),
					}, fs, fd, done);
				},
			},
			modules_dev: {
				'build/app/tpl.js': function(fs, main_file, done) {
					build_modules_files(fs, main_file, done, grunt.option('min') || false);
				}
			},
			modules_prod: {
				'build/app/tpl.js': function(fs, main_file, done) {
					build_modules_files(fs, main_file, done, true);
				}
			}
		},

		watch: {
			assets: {
				options: { atBegin: true },
				files: [
					'<%= dirs.src %>/manifest.json',
					'<%= dirs.src %>/assets/**/*',
				],
				tasks: ['copy:assets']
			},

			script: {
				options: { atBegin: true },
				files: ['<%= dirs.src %>/**/*.js'],
				tasks: ['server-lock', 'jshint', 'uglify:js_app', 'file-creator:modules_dev', 'server-unlock']
			},

			html: {
				options: { atBegin: true },
				files: ['<%= dirs.src %>/**/*.html', '!<%= dirs.src %>/index.html'],
				tasks: ['server-lock', 'file-creator:modules_dev', 'server-unlock']
			},

			css: {
				options: { atBegin: true },
				files: ['<%= dirs.src %>/**/*.scss'],
				tasks: ['server-lock', 'scsslint', 'sass:dev', 'pleeease:dev', 'server-unlock']
			}
		},

		'bower-install-simple': {
			prod: {
				options: {
					production: true
				}
			},
			dev: {
				options: {
					production: false
				}
			}
		},

		uglify: {
			js_libraries_dev: {
				options: {
					// banner: '<%= banner %>\n',
					// stripBanners: false,
					sourceMap: true,
					mangle: grunt.option('min') ? true : false,
					preserveComments: grunt.option('min') ? false : true,
					compress: grunt.option('min') ? true : false,
					beautify: grunt.option('min') ? false : true
				},
				dest: '<%= dirs.build %>/app/lib.js',
				nonull: true,
				src: [
					'<%= dirs.lib %>/angular/angular.js',
					'<%= dirs.lib %>/angular-ui-router/release/angular-ui-router.js',
					'<%= dirs.lib %>/angular-animate/angular-animate.js',
					'<%= dirs.lib %>/oclazyload/dist/ocLazyLoad.js',
					// '<%= dirs.lib %>/ng-file-upload/ng-file-upload.js',
					// '<%= dirs.lib %>/angular-multiupload/dist/js/multiupload.js',
//					'<%= dirs.lib %>/angularjs-slider/dist/rzslider.js',
//					'<%= dirs.lib %>/angular-socialshare/dist/angular-socialshare.js',
					'<%= dirs.lib %>/angular-websocket/dist/angular-websocket.js',
					'<%= dirs.lib %>/javascript-detect-element-resize/detect-element-resize.js',
					'<%= dirs.lib %>/angular-gridster/src/angular-gridster.js',
				],
			},
			full_package_prod: {
				dest: '<%= dirs.build %>/app/app.js',
				nonull: true,
				src: [
					'<%= dirs.lib %>/angular/angular.min.js',
					'<%= dirs.lib %>/angular-ui-router/release/angular-ui-router.js',
					'<%= dirs.lib %>/angular-animate/angular-animate.min.js',
					'<%= dirs.lib %>/oclazyload/dist/ocLazyLoad.min.js',
					// '<%= dirs.lib %>/ng-file-upload/ng-file-upload.min.js',
					// '<%= dirs.lib %>/angular-multiupload/dist/js/multiupload.min.js',
					// '<%= dirs.lib %>/angularjs-slider/dist/rzslider.min.js',
					// '<%= dirs.lib %>/angular-socialshare/dist/angular-socialshare.min.js',
					'<%= dirs.lib %>/angular-websocket/dist/angular-websocket.min.js',
					'<%= dirs.lib %>/javascript-detect-element-resize/detect-element-resize.js',
					'<%= dirs.lib %>/angular-gridster/dist/angular-gridster.min.js',
					'<%= dirs.build %>/app/script.js',
					'<%= dirs.build %>/app/tpl.js',
				],
			},
			js_app: {
				options: {
					// banner: '<%= banner %>\n',
					// stripBanners: false,
					sourceMap: true,
					mangle: false,
					preserveComments: true,
					compress: false,
					beautify: true
				},
				dest: '<%= dirs.build %>/app/script.js',
				src: [
					'<%= dirs.src %>/app.js',
					'<%= dirs.src %>/locales.js',
					'<%= dirs.src %>/root.controller.js',
					'<%= dirs.src %>/routes.js',
					'<%= dirs.src %>/shared/**/*.js',
					'<%= dirs.src %>/*/routes.js',
					'<%= dirs.src %>/*/*.routes.js',
					'<%= dirs.src %>/*/*/routes.js',

//					'<%= dirs.src %>/**/*.js',
				]
			},
			// js_app_prod: {
				// options: {
					// mangle: true,
				// },
				// dest: '<%= dirs.build %>/app/script.js',
				// src: [
					// '<%= dirs.src %>/app.js',
					// '<%= dirs.src %>/locales.js',
					// '<%= dirs.src %>/root.controller.js',
					// '<%= dirs.src %>/routes.js',
					// '<%= dirs.src %>/shared/**/*.js',
					// '<%= dirs.src %>/*/routes.js',
					// '<%= dirs.src %>/*/*.routes.js',
				// ]
			// }
		},

	});

	function	build_index_file(meta, fs, fd, done) {
		var index_html = grunt.file.read(meta.source),
			basePath = 'build',
			file,
			i,
			/**
			 * ordered stylesheets
			 */
			stylesheets = meta.styles,
			/**
			 * ordered scripts
			 */
			scripts = meta.scripts,
			config_script = meta.config;

		for (i=0; i<stylesheets.length; i++) {
			file = stylesheets[i];
			stylesheets[i] = '<link rel="stylesheet" href="'+file.replace(/\/(static|app)\//, '/$1'+(current_git_rev || '')+'/')+'">';
		}

		for (i=0; i<scripts.length; i++) {
			file = scripts[i];
			scripts[i] = '<script type="text/javascript" src="'+file.replace(/\/(static|app)\//, '/$1'+(current_git_rev || '')+'/')+'"></script>';
		}
		
		if (config_script)
			scripts.push('<script type="text/javascript">\n'+config_script+'\n</script>');

		var title = grunt.config('pkg').name+' - v'+grunt.config('pkg').version;

		if (grunt.option('title'))
			title = grunt.option('title');

		index_html = index_html
			.replace('<!-- %title% -->', title)
			.replace('<!-- %style% -->', stylesheets.join('\n\t'))
			.replace('<!-- %script% -->', '\n\t'+scripts.join('\n\t'));

		fs.writeSync(fd, index_html);
		done();
	}
	
	function build_modules_files(fs, main_file, done, min) {
		console.info('==================================== compile ', min);

		var glob = grunt.file.glob,
			Q = require('q'),
			deferred = Q.defer(),
			modules_files = {},
			global_templates = {},
			source_dir = 'src/'; // must have trailing slash

		deferred.resolve();
		deferred.promise.then(function() {
			/**
			 * scan all HTML files and split in 2 parts:
			 *  - 1. the main tpl file
			 *  - 2. one file par static/module/ * /*.html
			 */
			var deferred = Q.defer();
			glob(source_dir + '**/*.html', function(err, files) {
				for (var i = 0; i < files.length; i++) {
					var filename = files[i].substr(source_dir.length);
					var parts = filename.split('/');
					var module_name = parts[0];

					//				console.info('>', filename);
					if (filename === 'shared/templates/translations.html' || filename === 'index.html')
						continue;
					else if (parts.length <= 1 || filename.match(/^shared\//)) // skip shared files
						global_templates[filename] = grunt.file.read(files[i]);
					else {
						if (!modules_files[module_name])
							modules_files[module_name] = { templates: {}, scripts: {} };
						modules_files[module_name].templates[filename] = grunt.file.read(files[i]);
					}
				}
				deferred.resolve();
			});

			return deferred.promise;
		}).then(function() {
			/**
			 * scan all JS files and split in 2 parts:
			 *  - 1. global code files
			 *  - 2. module files
			 */
			var deferred = Q.defer();
			glob(source_dir + '**/*.js', function(err, files) {
				for (var i = 0; i < files.length; i++) {
					var filename = files[i].substr(source_dir.length);
					var parts = filename.split('/');
					var module_name = parts[0];

					if (parts.length <= 1) // skip root files
						continue;
					else if (filename.match(/routes\.js$/)) // skip routes files
						continue;
					else {
						if (!modules_files[module_name])
							modules_files[module_name] = { templates: {}, scripts: {} };
						modules_files[module_name].scripts[filename] = grunt.file.read(files[i]);
					}
				}
				deferred.resolve();
			});
			return deferred.promise;
		}).then(function() {
			var UglifyJS = require('uglify-js');

			/**
			 * write the main tpl file
			 */
			fs.writeSync(main_file, wrap_loader(global_templates));

			/**
			 * write each module template files
			 */

			function build_module_file(name, module) {
				var s = [];
				for (var i in module.scripts)
					if (module.scripts.hasOwnProperty(i))
						s.push(source_dir + i);
				var script = '/** ' + JSON.stringify(Object.keys(module.scripts)) + ' */\n';
				// script += 'console.info("loading module \\""+'+JSON.stringify(name)+'+"\\"");\n';
				if (s.length) {
					var ret = UglifyJS.minify(s, {
						// sourceRoot: source_dir,
						outSourceMap: min? false: name + '.js.map',
						mangle: min ? true : false,
						compress: min ? true : false,
						output: {
							beautify: min ? false : true
						}
					});
					script += ret.code + '\n';
					script += wrap_loader(module.templates, true);
					return { code: script, map: ret.map };
				} else {
					script += wrap_loader(module.templates, true);
					return { code: script };
				}
			}

			function write_module(name, module) {
				if (!grunt.file.isDir('build/app/module'))
					grunt.file.mkdir('build/app/module');
				var file = build_module_file(name, module);
				grunt.file.write('build/app/module/' + name + '.js', file.code);
				if (file.map)
					grunt.file.write('build/app/module/' + name + '.js.map', file.map);
			}

			for (var module_name in modules_files)
				if (modules_files.hasOwnProperty(module_name))
					write_module(module_name, modules_files[module_name]);

		}).then(function() {
			done();
		}, function(e) {
			// error
			console.warn('failed ', e);
		});
	}

	function wrap_loader(fileMap, async) {
		if (async)
			return 'angular.module(\''+angular_app_name+'\').asyncTemplate(' + JSON.stringify(fileMap) + ');';
		return fileMap ? '' +
			'(function(){' +
			'angular.module(\''+angular_app_name+'\').run([\'$templateCache\',function($templateCache){' +
			'var cache=' + JSON.stringify(fileMap) + ';for(var i in cache)if(cache.hasOwnProperty(i))$templateCache.put(i,cache[i]);' +
			'}]);})();' : '';
	}

	function is_external(url) {
		return url.match(/^\/\//) || url.match(/^([^\/]{3,10}):\/\//) ? true : false;
	}
	/**
	 * ugly function to wait for the index file to be present
	 */
	function required_files_exists() {
		if (server_locked)
			return false;
		if (!grunt.file.exists('build/index.html'))
			return false;
		if (!grunt.file.exists('build/style.css'))
			return false;
		if (!grunt.file.exists('build/static/script.js') && !grunt.file.exists('build/app/script.js'))
			return false;
		if (!grunt.file.exists('build/static/lib.js') && !grunt.file.exists('build/app/lib.js'))
			return false;
		var stats = fs.statSync('build/index.html');
		return stats.size > 0;
		//		return true;
	}

	function wait_for_files(callback) {
		var iv = null;
		if (required_files_exists())
			callback();
		else
			iv = setInterval(function() {
				if (required_files_exists()) {
					clearInterval(iv);
					iv = null;
					setTimeout(callback, 500);
				}
			}, 20);
	}

	/**
	 * start a tiny development server
	 */
	grunt.registerTask('serve', 'serve files from build/ folder', function() {
		this.async();
		serveFile();
	});
	grunt.registerTask('serve-async', 'serve files from build/ folder', function() {
		serveFile();
	});

	function serveFile() {
		var srv = require('./app');
		if (grunt.option('http-port'))
			srv.setHttpPort(parseInt(grunt.option('http-port'), 10));
		srv.setLocker(wait_for_files);
	}


	// Load dependencies specified in package.json to avoid doing grunt.loadNpmTasks('exemple')
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

	grunt.registerTask('server-lock', 'server lock', function() {
		server_locked = true;
	});
	grunt.registerTask('server-unlock', 'server un lock', function() {
		server_locked = false;
	});


	require('load-grunt-tasks')(grunt, { scope: 'dependencies' });
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});

	grunt.registerTask('dev', [
		'bower-install-simple:dev',
		'clean:build',
		'copy:libstyles',
		'uglify:js_libraries_dev',
		'file-creator:index_html_dev',
		'serve-async',
		'watch',
	]);
	
	grunt.registerTask('prod', [
		'bower-install-simple:prod',
		'clean:build',
		'file-creator:index_html_prod',
		'uglify:js_app',
		'file-creator:modules_prod',	// will create main tpl.js file
		'uglify:full_package_prod',		// pack lib + script + tpl
		'clean:temp_prod',
		'copy:assets',
		'copy:libstyles',
		'sass:prod',
		'pleeease:prod',
	]);

};
