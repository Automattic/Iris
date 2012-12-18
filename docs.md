Iris uses CSS3 Gradients for everything, so it'll look awesome on HiDPI displays out of the box. Initially developed for [Custom Colors](http://en.blog.wordpress.com/2012/07/11/go-ahead-add-a-splash-of-color/) on [WordPress.com](http://wordpress.com/) and shipping with [WordPress][] 3.5+.

## Dependencies

Iris relies on [jQuery][] 1.7 and up, and the `draggable` and `slider` [jQuery UI][] components. (Those then presume jQuery UI `core`, `widget`, and `mouse` components. Just use the jQuery UI [download builder](http://jqueryui.com/download/) and it'll sort out your dependencies)

Just use the latest version of both jQuery and jQuery UI and you'll be golden.

## Basic Setup

Download the zip on the the [repo][] or clone it or pull it or whatever you're most comfortable with. There are minified of full versions. The -basic versions do not contain the [Color.js][] dependency, which you would then have to include separately.

Then do something like the following:

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
	<script src="path/to/iris.min.js"></script>
	<script src="path/to/my/javascript.js"></script>

*Note that the above example is just an example. Use your discretion. You may not need all of jQuery UI, for instance, and you probably want some kind of system concatenating/managing your scripts.*

## Usage

Iris is easy to use. She's cooperative that way. The easiest thing is to assign her to an `input` element. Say you have:

	<input type="text" id='color-picker' value="#bada55" />

Now, assuming you have a JavaScript file like `path/to/my/javascript.js` above, just write the following:

	jQuery(document).ready(function($){
		$('#color-picker').iris();
	});

And now you'll have a color picker on that element. Well, by default, it'll only show once you click/focus on the input element. Like below:

<input type="text" id='color-picker' value="#bada55" />
<script>
	jQuery(document).ready(function($){
		$('#color-picker').iris();
	});
</script>

## Options

Defaults are powerful, but they may also be wrong for the situation you want to use Iris in. Iris takes an options object when you call her. Like maybe a wider, show-by-default picker:

	jQuery(document).ready(function($){
		$('#wide-load').iris({
			width: 400,
			hide: false 
		});
	});

Produces:

<input type="text" id='wide-load' value="#bada55" />
<script>
	jQuery(document).ready(function($){
		$('#wide-load').iris({
			width: 400,
			hide: false 
		});
	});
</script>

Okay, enough with the chit-chat. Here's the list of default option keys followed by more details of what they do:

	options = {
			color: false,
			mode: 'hsl',
			controls: {
				horiz: 's', // horizontal defaults to saturation
				vert: 'l', // vertical defaults to lightness
				strip: 'h' // right strip defaults to hue
			},
			hide: true, // hide the color picker by default
			border: true, // draw a border around the collection of UI elements
			target: false, // a DOM element / jQuery selector that the element will be appended within. Only used when called on an input.
			width: 200, // the width of the collection of UI elements
			palettes: false // show a palette of basic colors beneath the square.
		}

### color

If Iris is attached to an `input` element, it will first try to pick up its `value` attribute. Otherwise, you can supply a color of any type that [Color.js][] supports. (Hex, rgb, and hsl are good bets.)

### mode

Iris can sport a variety of looks. She supports `hsl` and 'hsv' modes depending on your needs.

### controls

Iris is flexible like a gymnast. You can change all 3 directions of her controls. Just make sure you cover all 3 aspects of `hsl` or `hsv` that you chose in the [mode](#mode) option. `horiz` and 'vert' sets the horizontal and vertical aspects of the square, respectively, while the `strip` options sets the rightmost strip.

### hide

Iris hides until you call on her by default. Set to `false` to show right away.

### border

Set to `true` to display a border around the square and strip controls.

### target

If you are not attaching Iris to an `input` element, you may wish to display her somewhere other than the element you are calling her on. Supply a DOM element or a jQuery selector. This will be ignored when called on an `input` element.

### width

The width, in pixels, that the combined interface should take up. Because Iris is drawn with CSS gradients, you can make her any size.

### palettes

Set to `true` to display a row of common palette colors. This is particularly useful in situations where the currently selected color seems to make no colors available. Example:

	$('#palette-example').iris({
		hide: false,
		palettes: true
	});

<input type="text" id="palette-example" value="#000" />
<script>
	jQuery(document).ready(function($){
		$('#palette-example').iris({
			hide: false,
			palettes: true
		});
	});
</script>

Or, you can supply an array of colors to use your own palette colors.

	$('#palette-example2').iris({
		hide: false,
		palettes: ['#125', '#459', '#78b', '#ab0', '#de3', '#f0f']
	});

<input type="text" id="palette-example2" value="#000" />
<script>
	jQuery(document).ready(function($){
		$('#palette-example2').iris({
			hide: false,
			palettes: ['#125', '#459', '#78b', '#ab0', '#de3', '#f0f']
		});
	});
</script>

## Callbacks

### change

Supply a `change` function when calling Iris to do stuff when the color changes. In the example below, the headline will change colors when you modify Iris.

	$('#change-example').iris({
		hide: false,
		change: function(event, ui) {
			// event = standard jQuery event, produced by whichever control was changed.
			// ui = standard jQuery UI object, with a color Color.js object attached

			// change the headline color
			$("#headlinethatchanges").css( 'color', ui.color.toString());
		}
	});

See [Color.js][] documentation for what you can do with that `ui.color` object. In most cases, you'll just want `ui.color.toString()` to produce a hex color string.

#### Headline That Changes

<input type="text" id="change-example" value="#000" />
<script>
	jQuery(document).ready(function($){
		$('#change-example').iris({
			hide: false,
			change: function(event, ui) {
				$("#headlinethatchanges").css( 'color', ui.color.toString());
			}
		});
	});
</script>

### Methods

Iris supports a couple of methods out of the box.

### Option

Like most jQuery UI-based widgets, you can get/set all of the options intitially passed to Iris. But, only `color` really takes effect when set at present.

	$(element).iris('option', 'color'); // retrieve the current color
	$(element).iris('option', 'color', '#bada55'); // set the color to #bada55

#### Show

Reveal a hidden Iris color picker

	$(element).iris('show');

#### Hide

Hide a visible Iris color picker

	$(element).iris('hide');

#### Toggle

Toggle the visibility of an Iris color picker

	$(element).iris('hide');


[jQuery]: http://jquery.com/

[jQuery UI]: http://jqueryui.com/

[Color.js]: https://github.com/Automattic/Color.js

[repo]: https://github.com/Automattic/Iris

[WordPress]: http://wordpress.org/