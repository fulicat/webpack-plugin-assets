

> build assets for Webpack.

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
      fileName: 'assets.js', // assets.json
      publicPath: '/',
      assetsDir: '',
      autoload: true, // with assets loader (only javascript file)
      done: conf => {
        // conf.plugins.clean() // aways overwrite
        // conf.plugins.copyDirSync('./dist', '../static/')
      }
    })
  )
```

### b. vue.config.js

```js
    module.exports = {
      configureWebpack: config => {
        config.plugins.push(
          new WebpackAssets({
            fileName: 'assets.js', // assets.json
            publicPath: '/',
            assetsDir: '',
            autoload: true, // with assets loader (only javascript file)
            done: conf => {
              // conf.plugins.clean() // aways overwrite
              // conf.plugins.copyDirSync('./dist', '../static/')
            }
          })
        )
      }
    }
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
