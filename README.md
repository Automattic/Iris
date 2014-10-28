# Iris

Iris uses CSS3 Gradients for everything, so it'll look awesome on HiDPI displays out of the box. Initially developed for [Custom Colors](http://en.blog.wordpress.com/2012/07/11/go-ahead-add-a-splash-of-color/) on [WordPress.com](http://wordpress.com/) and shipping with [WordPress](http://wordpress.org/) 3.5+.

## Documentation

See the [Iris project page](http://automattic.github.io/Iris/).

## License
Copyright (c) 2012–2014 Automattic.
Licensed under the GPLv2 license.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
2. If grunt isn't installed globally, run `npm install -g grunt-cli` to install the latest version. _You may need to run `sudo npm install -g grunt-cli`._
3. From the root directory of this project, run `npm install` to install the project's dependencies.
