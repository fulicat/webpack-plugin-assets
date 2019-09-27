

> build assets for Webpack.

> version: 1.1.1

## Installation

### Node.js

`webpack-plugin-assets` is available on [npm](http://npmjs.org) or [yarn](https://yarnpkg.com).

    $ npm install webpack-plugin-assets --save-dev

    $ yarn add webpack-plugin-assets --dev

## Usage

### a. config

```js
  config.plugins.push(
    new WebpackAssets({
      // type: 'auto', // auto | array | object
      // fileName: 'assets.js', // assets.js | assets.json
      publicPath: '',
      assetsDir: '',
      // template: false, // false | custom templateStr | '' (use default template)
      autoload: true, // with assets loader (only javascript file)
      done: conf => {
        // copy to other folder
        // conf.plugins.clean() // isClear clear before |  aways overwrite
        // conf.plugins.copyDirSync('./dist', '../static/')
      }
    })
  )
```

### b. vue.config.js

```js
    module.exports = {
      configureWebpack: config => {
        /*
        // if using external chunks
        config.externals = {
          'vue': 'Vue',
          'vuex': 'Vuex',
          'axios': 'axios'
        }*/
        
        config.plugins.push(
          new WebpackAssets({
            // type: 'auto', // auto | array | object
            // fileName: 'assets.js', // assets.js | assets.json
            publicPath: '',
            assetsDir: '',
            /*
            // if using external chunks
            queue: true, // queue loading
            externals: [
              '//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
              '//cdn.jsdelivr.net/npm/vuex@3.1.1/dist/vuex.min.js',
              '//cdn.jsdelivr.net/npm/axios@0.19.0/dist/axios.min.js',
              '>test.js' // > queue after
            ],*/
            // template: false, // false | custom templateStr | '' (use default template)
            autoload: true, // with assets loader (only javascript file)
            done: conf => {
              // copy to other folder
              // conf.plugins.clean() // isClear clear before |  aways overwrite
              // conf.plugins.copyDirSync('./dist', '../static/')
            }
          })
        )
      }
    }
```


## Result

### a. assets.js

```js
  window.WebpackAssetsObject={"base": ["base.cce6fad8.css", "base.cce6fad8.js"]};
```

### b. assets.js (with assets loader) array

```js
  (function(){var assets=["base.cce6fad8.css","base.cce6fad8.js"];var publicPath = '';(function(assets, publicPath, queue) {if (!String.prototype.startsWith) {String.prototype.startsWith = function(searchString, position) {position = position || 0;return this.indexOf(searchString, position) === position;}}if (!String.prototype.endsWith) {String.prototype.endsWith = function(suffix) {return this.indexOf(suffix, this.length - suffix.length) !== -1;}}function typeOf(object) {return Object.prototype.toString.call(object).replace(/\[object (.*)\]/g, '$1').toLowerCase();}function loadResource(url, basePath, callback) {basePath = basePath || '';callback = (typeof(callback)==='function' ? callback : function(){});if (url) {if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')) {basePath = '';}this.url = url;if(url.indexOf('?') > 1){url = url.split('?')[0];}var type = url.endsWith('.js') ? 'script' : (url.endsWith('.css') ? 'link' : '');if (type) {var element = document.createElement(type);if(type=='script'){element.charset = 'utf-8';element.onerror = function(){console.error('Load failed: '+ url);};element.onload = element.onreadystatechange = function() {if (!this.readyState || this.readyState == 'complete') {callback();}};element.src = basePath + this.url;}if(type=='link'){element.type = 'text/css';element.rel = 'stylesheet';element.href = basePath + this.url;callback();}document.head.appendChild(element);}}}function parseObjectToArray(assets){let _assets = [];Object.keys(assets).forEach(function(chunk) {if (typeOf(assets[chunk]) === 'string') {_assets.push(assets[chunk]);} else if (typeOf(assets[chunk]) === 'array') {assets[chunk].forEach(function(_chunk) {_assets.push(_chunk);});} else if (typeOf(assets[key]) === 'object') {Object.keys(assets[chunk]).forEach(function(_chunk) {_assets.push(assets[chunk][_chunk]);});}});return _assets;}function loadResourceQueue(assets) {var url = assets[0];assets.splice(0, 1);if (url) {loadResource(url, publicPath, function() {loadResourceQueue(assets);});}}if (typeOf(assets) === 'object') {assets = parseObjectToArray(assets);}if (typeOf(assets) === 'array') {if (queue) {assets = JSON.parse(JSON.stringify(assets));loadResourceQueue(assets)} else {assets.forEach(function(chunk) {loadResource(chunk, publicPath);});}}})(assets, publicPath, false);})();
```

### b2. assets.js (with assets loader) object

```js
  (function(){var assets={"base": ["base.cce6fad8.css", "base.cce6fad8.js"]};var publicPath = '';(function(assets, publicPath, queue) {if (!String.prototype.startsWith) {String.prototype.startsWith = function(searchString, position) {position = position || 0;return this.indexOf(searchString, position) === position;}}if (!String.prototype.endsWith) {String.prototype.endsWith = function(suffix) {return this.indexOf(suffix, this.length - suffix.length) !== -1;}}function typeOf(object) {return Object.prototype.toString.call(object).replace(/\[object (.*)\]/g, '$1').toLowerCase();}function loadResource(url, basePath, callback) {basePath = basePath || '';callback = (typeof(callback)==='function' ? callback : function(){});if (url) {if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')) {basePath = '';}this.url = url;if(url.indexOf('?') > 1){url = url.split('?')[0];}var type = url.endsWith('.js') ? 'script' : (url.endsWith('.css') ? 'link' : '');if (type) {var element = document.createElement(type);if(type=='script'){element.charset = 'utf-8';element.onerror = function(){console.error('Load failed: '+ url);};element.onload = element.onreadystatechange = function() {if (!this.readyState || this.readyState == 'complete') {callback();}};element.src = basePath + this.url;}if(type=='link'){element.type = 'text/css';element.rel = 'stylesheet';element.href = basePath + this.url;callback();}document.head.appendChild(element);}}}function parseObjectToArray(assets){let _assets = [];Object.keys(assets).forEach(function(chunk) {if (typeOf(assets[chunk]) === 'string') {_assets.push(assets[chunk]);} else if (typeOf(assets[chunk]) === 'array') {assets[chunk].forEach(function(_chunk) {_assets.push(_chunk);});} else if (typeOf(assets[key]) === 'object') {Object.keys(assets[chunk]).forEach(function(_chunk) {_assets.push(assets[chunk][_chunk]);});}});return _assets;}function loadResourceQueue(assets) {var url = assets[0];assets.splice(0, 1);if (url) {loadResource(url, publicPath, function() {loadResourceQueue(assets);});}}if (typeOf(assets) === 'object') {assets = parseObjectToArray(assets);}if (typeOf(assets) === 'array') {if (queue) {assets = JSON.parse(JSON.stringify(assets));loadResourceQueue(assets)} else {assets.forEach(function(chunk) {loadResource(chunk, publicPath);});}}})(assets, publicPath, false);})();
```

### c. assets.json

```js
  {"base": ["base.cce6fad8.css", "base.cce6fad8.js"]}
```




## License

(The MIT License)

Copyright (c) 2013 Jake Luer <jake@alogicalparadox.com> (http://alogicalparadox.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
