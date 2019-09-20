/*
* webpack.plugin.assets.js
* @Author: Jack.Chan (971546@qq.com)
* @Date:   2019-09-07 13:00:03
* @Last Modified by:   Jack.Chan
* @Last Modified time: 2019-09-20 21:06:34
* @website http://fulicat.com
* @version v1.0.3
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
			chunks: [],
			publicPath: '/',
			outputDir: 'dist',
			assetsDir: '',
			basePath: './',
			fileName: 'assets.js', // assets.json | assets.json
			autoload: false,
			template: '',
			templateRegExp: /({{assets}}|%assets%|{{data}}|%data%)/gi,
			loader: function(assets){
				function loadResource(url, basePath, element, type){
					basePath = basePath || '';
					if (url) {
						this.url = url;
						if(url.indexOf('?') > 1){
							url = url.split('?')[0];
						}
						if(!type){
							type = url.endsWith('.js') ? 'script' : (url.endsWith('.css') ? 'link' : '');
						}
						element = document.createElement(type);
						if(type=='script'){
							element.charset = 'utf-8';
							// element.async = 1;
							element.src = basePath + this.url;
						}
						if(type=='link'){
							element.type = 'text/css';
							element.rel = 'stylesheet';
							element.href = basePath + this.url;
						}
						document.head.appendChild(element);
					}
				}
				Object.keys(assets).forEach(function(key){
					loadResource(assets[key].css, publicPath);
					loadResource(assets[key].js, publicPath);
				});
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

				const json = compilation.getStats().toJson({context: compiler.context});

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
				let chunk;
				Object.keys(chunks).forEach(chunkIndex => {
					chunk = chunks[chunkIndex];
					if (chunk.files && chunk.files.length) {
						this.opts.assetsList[chunk.id] = {};
						chunk.files.forEach(file => {
							if (file.endsWith('.css')) {
								this.opts.assetsList[chunk.id]['css'] = file;
							}
							if (file.endsWith('.js')) {
								this.opts.assetsList[chunk.id]['js'] = file;
							}
						})
					}
				})

				let assetsData = JSON.stringify(this.opts.assetsList);
				this.opts.assetsContent = assetsData;
				if (this.opts.fileName.endsWith('.js')) {
					this.opts.assetsLoader = (this.opts.loader).toString().replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '').replace(/\t|\n/gi, '');
					this.opts.template = this.opts.template===false ? '' : (this.opts.template || 'window.WebpackAssetsObject={{assets}};');
					if (this.opts.autoload) {
						let templateContent = '';
						if (this.opts.template && this.opts.templateRegExp.test(this.opts.template)) {
							templateContent = this.opts.template.replace(this.opts.templateRegExp, 'assets');
						}
						this.opts.assetsContent = `(function(){var publicPath='${this.opts.publicPath}';var assets=${assetsData};(${this.opts.assetsLoader})(assets);${templateContent}})();`;
					} else {
						if (this.opts.template && this.opts.templateRegExp.test(this.opts.template)) {
							this.opts.assetsContent = this.opts.template.replace(this.opts.templateRegExp, assetsData);
						}
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
					if (this.opts.template && this.opts.templateRegExp.test(this.opts.template)) {
						this.opts.assetsContent = this.opts.template.replace(this.opts.templateRegExp, assetsData);
					}
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