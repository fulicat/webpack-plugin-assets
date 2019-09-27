/*
* webpack.plugin.assets.js
* @Author: Jack.Chan (971546@qq.com)
* @Date:   2019-09-07 13:00:03
* @Last Modified by:   Jack.Chan
* @Last Modified time: 2019-09-27 13:54:31
* @website http://fulicat.com
* @version v1.1.1
*/

const fs = require('fs');
const path = require('path');

const run_path = path.resolve(__dirname);
const work_path = process.cwd();

const utils = {
	getEnvLocale: function(env) {
		env = env || process.env;
		let locale = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || 'en-US';
		locale = locale.split('.')[0];
		locale = locale.replace(/_/gi, '-');
		return locale;
	},
	getTimeByLocale: function(locale) {
		locale = locale || this.getEnvLocale();
		let time = new Date();
		try{
			time = time.toLocaleString(locale, {hour12: false});
		}catch(ex){
			time = time.toLocaleString('en-US', {hour12: false});
		}
		return time;
	},
	getISOTime: function() {
		let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
		return (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '')
	},
	typeOf: function(object) {
		return Object.prototype.toString.call(object).replace(/\[object (.*)\]/g, '$1').toLowerCase()
	},
	parseChunkURL: function(chunk){
		if (chunk && this.typeOf(chunk) === 'string') {
			if (chunk.startsWith('>') || chunk.startsWith('<')) {
				return chunk.substr(1)
			}
		}
		return chunk
	},
	rmdirSync: function(dir) {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(element => {
				let item = dir +'/'+ element;
				if(fs.statSync(item).isDirectory()) { // recurse
					this.rmdirSync(item);
				} else { // delete file
					fs.unlinkSync(item);
				}
			})
			fs.rmdirSync(dir);
		}
	},
	clean: function(dir) {
		if (arguments.length < 1 || dir===true) {
			this.isNeedClean = true;
		} else {
			if(dir){
				this.rmdirSync(path.resolve(dir));
			} else {
				this.isNeedClean = false;
			}
		}
	},
	copyDirSync: function(from, to) {
		if (!this.isCopied) {
			this.isCopied = true
			this.form = path.resolve(from)
			this.to = path.resolve(to)
		}
		form = path.resolve(from);
		to = path.resolve(to);
		if (this.isNeedClean) {
			this.rmdirSync(to);
		}
		fs.mkdirSync(to, { recursive: true });
		fs.readdirSync(from).forEach(element => {
			if (fs.lstatSync(path.join(from, element)).isFile()) {
				fs.copyFileSync(path.join(from, element), path.join(to, element));
			} else {
				this.copyDirSync(path.join(from, element), path.join(to, element));
			}
		});
	}
};

const chunkOnlyConfig = {
	assets: false,
	cached: false,
	children: false,
	chunks: true,
	chunkModules: false,
	chunkOrigins: false,
	errorDetails: false,
	hash: false,
	modules: false,
	reasons: false,
	source: false,
	timings: false,
	version: false
};


class WebpackPluginAssets {
	constructor(opts = {}) {
		const defaults = {
			type: 'auto', // outputType: auto | array | object
			chunks: [],
			chunkSort: true,
			externals: [],
			publicPath: '/',
			outputDir: 'dist',
			assetsDir: '',
			basePath: './',
			fileName: 'assets.js', // assets.json | assets.json
			autoload: false,
			queue: false,
			template: false, // false | custom templateStr | '' (use default template)
			templateRegExp: /({{assets}}|%assets%|{{data}}|%data%)/gi,
			loader: function(assets, publicPath, queue) {
				if (!String.prototype.startsWith) {
					String.prototype.startsWith = function(searchString, position) {
						position = position || 0;
						return this.indexOf(searchString, position) === position;
					}
				}
				if (!String.prototype.endsWith) {
					String.prototype.endsWith = function(suffix) {
						return this.indexOf(suffix, this.length - suffix.length) !== -1;
					}
				}
				function typeOf(object) {
					return Object.prototype.toString.call(object).replace(/\[object (.*)\]/g, '$1').toLowerCase();
				}
				function loadResource(url, basePath, callback) {
					basePath = basePath || '';
					callback = (typeof(callback)==='function' ? callback : function(){});
					if (url) {
						if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')) {
							basePath = '';
						}
						this.url = url;
						if(url.indexOf('?') > 1){
							url = url.split('?')[0];
						}
						var type = url.endsWith('.js') ? 'script' : (url.endsWith('.css') ? 'link' : '');
						if (type) {
							var element = document.createElement(type);
							if(type=='script'){
								element.charset = 'utf-8';
								// element.async = 1;
								element.onerror = function(){
									console.error('Load failed: '+ url);
								};
								element.onload = element.onreadystatechange = function() {
									if (!this.readyState || this.readyState == 'complete') {
										callback();
									}
								};
								element.src = basePath + this.url;
							}
							if(type=='link'){
								element.type = 'text/css';
								element.rel = 'stylesheet';
								element.href = basePath + this.url;
								callback();
							}
							document.head.appendChild(element);
						}
					}
				}
				function parseObjectToArray(assets){
					let _assets = [];
					Object.keys(assets).forEach(function(chunk) {
						if (typeOf(assets[chunk]) === 'string') {
							_assets.push(assets[chunk]);
						} else if (typeOf(assets[chunk]) === 'array') {
							assets[chunk].forEach(function(_chunk) {
								_assets.push(_chunk);
							});
						} else if (typeOf(assets[key]) === 'object') {
							Object.keys(assets[chunk]).forEach(function(_chunk) {
								_assets.push(assets[chunk][_chunk]);
							});
						}
					});
					return _assets;
				}
				function loadResourceQueue(assets) {
					var url = assets[0];
					assets.splice(0, 1);
					if (url) {
						loadResource(url, publicPath, function() {
							loadResourceQueue(assets);
						});
					}
				}
				if (typeOf(assets) === 'object') {
					assets = parseObjectToArray(assets);
				}
				if (typeOf(assets) === 'array') {
					if (queue) {
						assets = JSON.parse(JSON.stringify(assets));
						loadResourceQueue(assets)
					} else {
						assets.forEach(function(chunk) {
							loadResource(chunk, publicPath);
						});
					}
				}
			},
			authors: '',
			website: '',
			description: ''
		}
		
		this.opts = Object.assign({}, defaults, opts);
		this.opts.copyright = 'Jack.Chan (fulicat@qq.com)';
		this.opts.authors = this.opts.authors===false ? '' : (this.opts.authors || this.opts.copyright);
		this.opts.website = this.opts.website===false ? '' : (this.opts.website || 'http://fulicat.com');
		this.opts.filePath = this.opts.outputDir +'/'+ this.opts.assetsDir +'/';
		this.opts.fileFullName = this.opts.filePath + this.opts.fileName;
		this.opts.file = path.resolve(this.opts.basePath + this.opts.fileFullName);
	}
	apply(compiler) {
		compiler.hooks.emit.tapAsync('WebpackPluginAssets', (compilation, callback) => {

				const chunks = compilation.getStats().toJson(chunkOnlyConfig).chunks
				.filter(c => { // https://github.com/jantimon/html-webpack-plugin/blob/master/index.js#L374
					if (!c.names[0]) return false;

					if (this.opts.chunks && this.opts.chunks.length) {
						if (!this.opts.chunks.includes(c.names[0])) {
							return false;
						}
					}

					if (typeof c.isInitial === 'function' && !c.isInitial()) {
						return false;
					} else if (!c.initial) {
						return false;
					}
					return true;
				});

				this.opts.release = utils.getISOTime();

				this.opts.assetsList = {};
				let outputType = this.opts.type
				if (!this.opts.fileName.endsWith('.js')) {
					outputType = 'object'
				}
				if (outputType==='auto') {
					outputType = this.opts.fileName.endsWith('.js') ? 'array' : 'object'
				}
				if (outputType==='array') {
					this.opts.assetsList = []
					this.opts.chunkSort = true
				}

				// sort dependency of chunks
				if (this.opts.chunkSort) {
					chunks.sort((a, b) => {
						// make sure user entry is loaded last so user CSS can override
						// vendor CSS
						if (a.id === 'app') {
							return 1
						} else if (b.id === 'app') {
							return -1
						} else if (a.entry !== b.entry) {
							return b.entry ? -1 : 1
						}
						return 0
					})
				}

				// build assetsList of chunks
				chunks.forEach((chunk, chunkIndex) => {
					if (chunk.files && chunk.files.length) {
						if (outputType==='array') {
							this.opts.assetsList = this.opts.assetsList.concat(chunk.files)
						} else if (outputType==='object') {
							this.opts.assetsList[chunk.id] = chunk.files;
						} else {
							this.opts.assetsList[chunk.id] = {}
							chunk.files.forEach(file => {
								if (file.endsWith('.css')) {
									this.opts.assetsList[chunk.id]['css'] = file
								}
								if (file.endsWith('.js')) {
									this.opts.assetsList[chunk.id]['js'] = file
								}
							})
						}
					}
				})

				// parse externals chunks
				if (this.opts.externals) {
					// outputType: array
					if (outputType === 'array') {
						let externals = []
						if (utils.typeOf(this.opts.externals) === 'string') {
							if (this.opts.externals) {
								externals.push(this.opts.externals)
							}
						} else if (utils.typeOf(this.opts.externals) === 'array') {
							this.opts.externals.forEach((item, itemIndex) => {
								if (utils.typeOf(item) === 'string') {
									if (item) {
										externals.push(item)
									}
								} else if (utils.typeOf(item) === 'array') {
									externals = externals.concat(item)
								} else if (utils.typeOf(item) === 'object') {
									Object.keys(item).filter(chunkName => item[chunkName] && item[chunkName]).map(chunkName => {
										if (utils.typeOf(item[chunkName]) === 'string') {
											if (item[chunkName]) {
												externals.push(item[chunkName])
											}
										} else if (utils.typeOf(item[chunkName]) === 'array') {
											externals = externals.concat(item[chunkName])
										}
									})
								}
							})
						} else if (utils.typeOf(this.opts.externals) === 'object') {
							Object.keys(this.opts.externals).forEach(chunkName => {
								if (utils.typeOf(this.opts.externals[chunkName]) === 'array') {
									externals = externals.concat(this.opts.externals[chunkName])
								} else if (utils.typeOf(this.opts.externals[chunkName]) === 'object') {
									Object.keys(this.opts.externals[chunkName]).map(item => {
										externals.push(this.opts.externals[chunkName][item])
									})
								} else if (utils.typeOf(this.opts.externals[chunkName]) === 'string') {
									externals.push(this.opts.externals[chunkName])
								}
							})
						}

						// merge externals chunks to assetsList
						if (externals.length) {
							let externalsBefore = [], externalsAfter = []
							externals = externals.filter(chunk => chunk && chunk)
							if (utils.typeOf(externals) === 'array') {
								externals.forEach(chunk => {
									if (chunk.startsWith('>')) {
										externalsAfter.push(utils.parseChunkURL(chunk))
									} else {
										externalsBefore.push(utils.parseChunkURL(chunk))
									}
								})
							}
							this.opts.assetsList = externalsBefore.concat(this.opts.assetsList).concat(externalsAfter)
						}
					} else {
						// outputType: object
						let assetsList = this.opts.assetsList
						if (utils.typeOf(this.opts.externals) === 'string') {
							assetsList = Object.assign({}, assetsList, [this.opts.externals])
						} else {
							assetsList = Object.assign({}, assetsList, this.opts.externals)
						}
						Object.keys(assetsList).forEach(chunkName => {
							if (utils.typeOf(assetsList[chunkName]) === 'string') {
								assetsList[chunkName] = utils.parseChunkURL(assetsList[chunkName])
							} else if (utils.typeOf(assetsList[chunkName]) === 'array') {
								assetsList[chunkName] = assetsList[chunkName].map(item => utils.parseChunkURL(item))
								if (assetsList[chunkName].length < 2) {
									assetsList[chunkName] = assetsList[chunkName][0]
								}
							} else if (utils.typeOf(assetsList[chunkName]) === 'object') {
								Object.keys(assetsList[chunkName]).forEach(key => {
									assetsList[chunkName][key] = utils.parseChunkURL(assetsList[chunkName][key])
								})
							}
						})
						this.opts.assetsList = assetsList
					}
				}

				let assetsData = JSON.stringify(this.opts.assetsList);
				this.opts.assetsContent = assetsData;
				// parse template
				if (this.opts.template!==false) {
					this.opts.template = this.opts.template || (this.opts.fileName.endsWith('.js') ? `window.WebpackAssetsObject={{assets}};window.WebpackAssetsPublicPath='{{publicPath}}';` : `{"WebpackAssetsObject": {{assets}}, "WebpackAssetsPublicPath": "{{publicPath}}"}`)
				}
				let templateContent = '';
				if (this.opts.template) {
					var vars = {
						'publicPath': '',
						'outputDir': '',
						'assetsDir': '',
						'basePath': '',
						'fileName': '',
						'autoload': '',
						'queue': '',
						'authors': '',
						'website': '',
						'description': ''
					}
					Object.keys(vars).forEach(key => {
						vars[key] = this.opts[key]
					})
					vars.assets = assetsData
					templateContent = this.opts.template.replace(/\{\{([^\}]+)\}\}/g, function(match, key) {
						return vars[key.trim()]!==undefined ? vars[key.trim()] : match;
					})
				}

				// build content
				if (this.opts.fileName.endsWith('.js')) {
					this.opts.assetsLoader = ''
					if (this.opts.loader) {
						let compressLoaderRegExp = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/gm;
						let compressLoaderCode = (this.opts.loader).toString()
						compressLoaderCode = compressLoaderCode.replace(compressLoaderRegExp, function(s) {
							return /^\/{2,}/.test(s) || /^\/\*/.test(s) ? '' : s; 
						}).replace(/\t|\n/gi, '');
						this.opts.assetsLoader = compressLoaderCode ? `(${compressLoaderCode})(assets, publicPath, ${this.opts.queue});` : '';
					}
					if (this.opts.autoload) {
						this.opts.assetsContent = `(function(){var assets=${assetsData};var publicPath = '${this.opts.publicPath}';${this.opts.assetsLoader}${templateContent}})();`;
					} else {
						this.opts.assetsContent = templateContent
					}
					let assetsAnnotation = [];
					assetsAnnotation.push('/**');
					assetsAnnotation.push(' * '+ this.opts.fileName +' (build by webpack-plugin-assets)');
					if(this.opts.authors)assetsAnnotation.push(' * @authors '+ this.opts.authors);
					assetsAnnotation.push(' * @release '+ this.opts.release);
					if(this.opts.website)assetsAnnotation.push(' * @website '+ this.opts.website);
					if(this.opts.description)assetsAnnotation.push(' * @description '+ this.opts.description);
					assetsAnnotation.push(' */');
					assetsAnnotation = assetsAnnotation.join('\n');
					this.opts.assetsContent = `${assetsAnnotation}\n${this.opts.assetsContent}`;
				} else {
					this.opts.assetsContent = templateContent
				}

				process.on('exit', () => {
					fs.writeFileSync(this.opts.file, this.opts.assetsContent);
					console.log('\x1b[42m%s\x1b[0m%s\x1b[32m%s\x1b[0m', 'Webpack.Assets:', ' ', this.opts.fileFullName, '  ', `[${this.opts.release}]`, '\n');

					if (typeof(this.opts.done)==='function') {
						let config = {
							...this.opts,
							plugins: utils
						}
						delete config.done;
						this.opts.done.apply(process, [config, compiler]);
					}
					if (utils.isCopied) {
						console.log('\x1b[42m%s\x1b[0m%s\x1b[32m%s\x1b[0m', 'Webpack.Assets copy to:', ' ', utils.to, '\n');
					}
				});
				
				// process result use webpack plugin API
				// compilation.addModule(/* ... */);

				callback();
			}
		);
	}
}

module.exports = WebpackPluginAssets;