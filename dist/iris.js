/*! Iris - v0.8.0 - 2012-07-27
* https://github.com/Automattic/Iris
* Copyright (c) 2012 Matt Wiebe; Licensed GPL */

(function( $, undef ){
	var _html = '<div class="iris-picker"><div class="iris-picker-inner"><div class="iris-square"><a class="iris-square-value" href="#"><span class="iris-square-handle ui-slider-handle"></span></a><div class="iris-square-slider iris-square-horiz"></div><div class="iris-square-slider iris-square-vert"></div></div><div class="iris-slider iris-hue"><div class="iris-slider-offset"></div></div><div class="iris-slider iris-result"></div></div></div>';
	// Even IE9 dosen't support gradients. Elaborate sigh.
	var nonGradientIE = !! ( $.browser.msie && parseInt( $.browser.version, 10 ) < 10 );
	var gradientType = false;
	var vendorPrefixes = ['', '-moz-', '-webkit-', '-o-', '-ms-' ];
	// This is manually copied from iris.min.css until I can figure out how to do it without
	var _css = '.iris-picker{display:block;position:relative;width:240px;height:163px}.iris-picker-inner{position:absolute;top:10px;right:10px;left:10px;bottom:10px}.iris-picker .iris-square,.iris-picker .iris-slider,.iris-picker .grad-box{-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;-webkit-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);-moz-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);box-shadow:inset 0 0 5px rgba(0,0,0,0.4);height:100%;width:10%;float:left;margin-right:5%}.iris-picker .iris-square{width:65%;margin-right:10%}.iris-picker .grad-box{width:auto;margin:0}.iris-picker .iris-square .sat,.iris-ie-9 .iris-square,.iris-ie-9 .iris-slider,.iris-ie-9 .grad-box{-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-radius:0}.iris-picker .iris-square .sat{-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px}.iris-ie-8 .iris-square,.iris-ie-8 .iris-slider,.iris-ie-8 .grad-box,.iris-ie-8 .iris-square .ui-slider-handle,.iris-ie-8 .iris-hue .ui-slider-handle{outline:1px solid #aaa}.iris-picker .iris-result{margin-right:0}.iris-picker .iris-slider-offset{width:100%;height:100%;position:relative;bottom:-10px}.iris-square .iris-square-horiz{position:absolute;top:-7px;left:-7px;height:1px;width:100%}.iris-square .iris-square-vert{position:absolute;right:6px;top:7px;width:1px;height:100%}.iris-square .iris-square-slider a{opacity:.3;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";-moz-transition:opacity 300ms;-webkit-transition:opacity 300ms;transition:opacity 300ms}.iris-square .iris-square-slider .ui-slider-handle.active{opacity:1;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)"}.iris-dragging .iris-square-slider .ui-slider-handle.active{opacity:0;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.iris-picker .ui-slider-handle{background:#f5f5f5;-webkit-border-radius:10px;-moz-border-radius:50%;border-radius:50%;box-shadow:inset #fff 0 1px 1px,inset 0 -1px 1px rgba( 0,0,0,0.4 ),0px 1px 4px 0 rgba( 0,0,0,0.2 ),0 0 2px rgba( 0,0,0,0.3 );display:block;opacity:0.7;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";position:absolute;z-index:5;height:20px;width:20px;cursor:default;cursor:ns-resize}.iris-square-horiz .ui-slider-handle{cursor:ew-resize}.iris-square-slider .ui-slider-handle{width:14px;height:14px;opacity:1;background-color:#eee}.iris-picker .iris-square-handle{background:transparent;border:3px solid #fff;box-shadow:inset 0 -1px 1px rgba( 0,0,0,0.4 ),0px 1px 4px 0 rgba( 0,0,0,0.2 ),0 0 2px rgba( 0,0,0,0.3 );width:14px;height:14px;position:absolute;left:-10px;top:-10px;cursor:move}.iris-picker .iris-square-v';
	// Bail for IE <= 7
	if ( nonGradientIE && parseInt( $.browser.version, 10 ) <= 7 ) {
		return $.fn.iris = $.noop;
	}

	function testGradientType() {
		if ( nonGradientIE ) {
			gradientType = 'filter';
		}
		else {
			var el = $('<div id="iris-gradtest" />');
			var base = "linear-gradient(top,#fff,#000)";
			$.each( vendorPrefixes, function( i, val ){
				el.css( 'backgroundImage', val + base );
				if ( el.css( 'backgroundImage').match('gradient') ) {
					gradientType = i;
					return false;
				}
			});
			// check for legacy webkit gradient syntax
			if ( $.browser.webkit && gradientType === false ) {
				el.css( 'background', '-webkit-gradient(linear,0% 0%,0% 100%,from(#fff),to(#000))' );
				if ( el.css( 'backgroundImage').match('gradient') ) {
					gradientType = 'webkit';
				}
			}
			el.remove();
		}

	}

	/**
	* Only for CSS3 gradients. oldIE will use a separate function.
	*
	* Accepts as many color stops as necessary from 2nd arg on, or 2nd
	* arg can be an array of color stops
	*
	* @param  {string} origin Gradient origin - top or left, defaults to left.
	* @return {string}        Appropriate CSS3 gradient string for use in
	*/
	function createGradient( origin, stops ) {
		origin = ( origin === 'top' ) ? 'top' : 'left';
		stops = $.isArray( stops ) ? stops : Array.prototype.slice.call(arguments, 1);
		if ( gradientType === 'webkit' ) {
			return legacyWebkitGradient( origin, stops );
		} else {
			return vendorPrefixes[gradientType] + 'linear-gradient(' + origin + ', ' + stops.join(', ') + ')';
		}
	}

	/**
	* Stupid gradients for a stupid browser.
	*/
	function stupidIEGradient( origin, stops ) {
		origin = ( origin === 'top' ) ? 'top' : 'left';
		stops = $.isArray( stops ) ? stops : Array.prototype.slice.call(arguments, 1);
		// 8 hex: AARRGGBB
		// GradientType: 0 vertical, 1 horizontal
		var type = ( origin === 'top' ) ? 0 : 1;
		var self = $( this );
		//console.log( origin + " ", stops );

		var lastIndex = stops.length - 1;
		var filter = ( parseInt( $.browser.version, 10 ) >= 8 ) ? '-ms-filter' : 'filter';
		filter = 'filter';
		var startPosProp = ( type === 1 ) ? 'left' : 'top';
		var endPosProp = ( type === 1 ) ? 'right' : 'bottom';
		var dimensionProp = ( type === 1 ) ? 'height' : 'width';
		var template = '<div class="iris-ie-gradient-shim" style="position:absolute;' + dimensionProp + ':100%;' + startPosProp + ':%start%;' + endPosProp + ':%end%;' + filter + ':%filter%;" data-color:"%color%"></div>';
		var html = "";
		// need a positioning context
		if ( self.css('position') === 'static' ) {
			self.css( {position: 'relative' } );
		}
		stops = fillColorStops( stops );
		$.each(stops, function( i, startColor ) {
			// we want two at a time. if we're on the last pair, bail.
			if ( i === lastIndex ) {
				return false;
			}
			var endColor = stops[ i + 1 ];
			//if our pairs are at the same color stop, moving along.
			if ( startColor.stop === endColor.stop ) {
				return;
			}
			var endStop = 100 - parseFloat( endColor.stop ) + '%';
			startColor.octoHex = new Color( startColor.color ).toIEOctoHex();
			endColor.octoHex = new Color( endColor.color ).toIEOctoHex();

			var filterVal = "progid:DXImageTransform.Microsoft.Gradient(GradientType=" + type + ", StartColorStr='" + startColor.octoHex + "', EndColorStr='" + endColor.octoHex + "')";
			html += template.replace( '%start%', startColor.stop ).replace( '%end%', endStop ).replace( '%filter%', filterVal );
		});
		self.find(".iris-ie-gradient-shim").remove();
		$( html ).prependTo( self );
	}

	function legacyWebkitGradient( origin, colorList ) {
		var stops = [];
		origin = ( origin === 'top' ) ? '0% 0%,0% 100%,' : '0% 100%,100% 100%,';
		colorList = fillColorStops( colorList );
		$.each( colorList, function( i, val ){
			stops.push( 'color-stop(' + ( parseFloat( val.stop ) / 100 ) + ', ' + val.color + ')' );
		});
		return '-webkit-gradient(linear,' + origin + stops.join(',') + ')';
	}

	function fillColorStops( colorList ) {
		var colors = [];
		var percs = [];
		var newColorList = [];
		var lastIndex = colorList.length - 1;
		$.each( colorList, function( index, val ) {
			var color = val;
			var perc = false;
			var match = val.match(/1?[0-9]{1,2}%$/);
			if ( match ) {
				color = val.replace(/\s?1?[0-9]{1,2}%$/, '');
				perc = match.shift();
			}
			colors.push( color );
			percs.push( perc );
		});

		// back fill first and last
		if ( percs[0] === false ) {
			percs[0] = '0%';
		}
		if ( percs[lastIndex] === false ) {
			percs[lastIndex] = '100%';
		}
		percs = backFillColorStops( percs );

		$.each( percs, function( i ){
			newColorList[i] = { color: colors[i], stop: percs[i] };
		});
		return newColorList;
	}

	function backFillColorStops( stops ) {
		var first = 0, last = stops.length - 1, i = 0, foundFirst = false;
		var incr, steps, step, firstVal;
		if ( stops.length <= 2 || $.inArray( false, stops ) < 0 ) {
			return stops;
		}
		while ( i < stops.length - 1 ) {
			if ( ! foundFirst && stops[i] === false ) {
				first = i - 1;
				foundFirst = true;
			}
			else if ( foundFirst && stops[i] !== false ) {
				last = i;
				i = stops.length;
			}
			i++;
		}
		steps = last - first;
		firstVal = parseInt( stops[first].replace('%'), 10 );
		incr = ( parseFloat( stops[last].replace('%') ) - firstVal ) / steps;
		i = first + 1;
		step = 1;
		while ( i < last ) {
			stops[i] = ( firstVal + ( step * incr ) ) + '%';
			step++;
			i++;
		}
		return backFillColorStops( stops );
	}

	$.fn.gradient = function( origin ) {
		var args = arguments;
		return this.each( function() {
			// this'll be oldishIE
			if ( nonGradientIE ) {
				stupidIEGradient.apply( this, args );
			} else { // new hotness
				$( this ).css( 'backgroundImage', createGradient.apply( this, args ) );
			}
		});
	};

	$.fn.LSSquare = function( hue ) {
		hue = hue | 0;
		return this.each(function() {
			var self = $(this);
			var initialized = self.data( 'hue' ) !== undef;
			// not yet initialized
			if ( ! initialized ) {
				self.append( '<div class="sat grad-box" /><div class="lum grad-box" />' );
				self.css( "position", "relative" );
				self.children(".grad-box").css({ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 });
			}

			var top = self.find('.lum');
			var bottom = self.find('.sat');

			if ( ! initialized ) {
				// @todo make this actual hsl-ness work for IE
				top.gradient( 'top', '#fff', 'rgba(255,255,255,0) 50%', 'rgba(0,0,0,0) 50%', 'rgba(0,0,0,1)' );
			}

			bottom.gradient( 'left', 'hsl('+ hue +',0%,50%)', 'hsl(' + hue + ',100%,50%)' );
			self.data( 'hue', hue );
		});
	};

	$.fn.raninbowGradient = function( origin, args ) {
		origin = origin || 'top';
		var opts = $.extend( {}, { s: 100, l: 50 }, args );
		var template = 'hsl(%h%,' + opts.s + '%,' + opts.l + '%)';
		var i = 0;
		var steps = [];
		while ( i <= 360 ) {
			steps.push( template.replace('%h%', i) );
			i += 30;
		}
		return this.each(function() {
			$(this).gradient( origin, steps );
		});
	};

	// the colorpicker widget def.
	var Iris = {
		options: {
			color: false,
			displayType: 'float/inline', //float: abs pos, inline,
			hide: true,
			foo: 'bar'
		},
		_inited: false,
		_create: function() {
			var el = this.element;
			var color = this.options.color || el.val();

			if ( gradientType === false ) {
				testGradientType();
			}

			if ( el.is("input") ) {
				el.after( _html );
				this.picker = el.next( '.iris-picker' );
				this._addInputListeners( el );
			} else {
				el.append( _html );
				this.picker = el.find( '.iris-picker' );
			}
			if ( $.browser.mozilla ) {
				this.picker.addClass( 'iris-mozilla' );
			}
			if ( $.browser.msie ) {
				this.picker.addClass( 'iris-ie-' + parseInt( $.browser.version, 10 ) );
			}

			this.color = new Color( color );
			this.options.color = this.color.toString();
			// store it. HSL gets squirrely
			this.controls = {};
			this.controls.square = this.picker.find( '.iris-square' );
			this.controls.result = this.picker.find( '.iris-result' );
			var hue = this.hue = this.color.h();

			if ( this.options.hide ) {
				this.picker.hide();
			}
			this.controls.square.LSSquare( hue );
			this.picker.find( '.iris-hue' ).raninbowGradient();

			// Hide top-right handles until you approach edges of square
			this.controls.square.mousemove( function( e ) {
				var x = e.pageX - $( this ).offset().left,
					y = e.pageY - $( this ).offset().top;

				var handleX = $( this ).find( '.iris-square-horiz .ui-slider-handle' ),
					handleY = $( this ).find( '.iris-square-vert .ui-slider-handle' );

				if ( x > 120 ) {
					handleY.addClass( 'active' );
				}
				else {
					handleY.removeClass( 'active' );
				}

				if ( y < 20 ) {
					handleX.addClass( 'active' );
				}
				else {
					handleX.removeClass( 'active' );
				}
			});

			this._initControls();
			this._dimensions();
			this.active = 'external';
			this._change();
		},
		_dimensions: function( reset ) {
			// whatever size
			var inner = $(".iris-picker-inner");
			var controls = this.controls;
			var square = controls.square;
			var hue = this.picker.find('.iris-hue');
			var squareWidth, hueWidth, innerWidth;

			if ( reset ) {
				square.css('width', '');
				hue.css('width', '');
			}

			squareWidth = square.css("width");
			hueWidth = hue.css("width");
			innerWidth = inner.width();
			if ( squareWidth.match(/%$/) ) {
				innerWidth = this.picker.width() - parseInt( inner.css("left"), 10 ) - parseInt( inner.css("right"), 10 );
				squareWidth = innerWidth * ( parseInt( squareWidth, 10 ) / 100 );
				hueWidth = innerWidth * ( parseInt( hueWidth, 10 ) / 100 );
			}

			square.width( squareWidth ).height( squareWidth );
			hue.height( squareWidth ).width( hueWidth );
			hue.find('.ui-slider-handle').height( hueWidth ).width( hueWidth );
		},

		_addInputListeners: function( input ) {
			var self = this;
			input.on('change', function( event ){
				var color = new Color( input.val() );
				var val = input.val().replace(/^#/, '');
				// if we got black, but didn't give it, it's an error
				if ( color.toInt() === 0 && val !== '000000' ) {
					// restore it
					input.val( self.color.toString() );
				} else {
					// change it
					self._setOption( 'color', color.toString() );
				}
			});
		},

		_initControls: function() {
			var self = this;
			var square = self.controls.square;
			var hue = self.color.h();

			self.controls.h = self.picker.find('.iris-hue .iris-slider-offset').slider({
				orientation: 'vertical',
				max: 359,
				min: 0,
				value: 359 - hue,
				slide: function( event, ui ) {
					self.active = 'h';
					// there does not appear to be a way to "reverse" this.
					ui.value = 359 - ui.value;
					self.color.h( ui.value );
					self._change.apply( self, arguments );
				}
			});

			self.controls.squareDrag = self.picker.find( '.iris-square-value' ).draggable({
				containment: 'parent',
				zIndex: 1000,
				cursor: 'move',
				drag: function( event, ui ) {
					self._squareDrag( event, ui );
				},
				start: function() {
					square.addClass( 'iris-dragging' );
				},
				stop: function() {
					square.removeClass( 'iris-dragging' );
				}
			});

			// allow clicking on the square to move there
			square.mousedown( function( event ) {
				// only left click
				if ( event.button !== 0 ) {
					return;
				}
				// prevent bubbling from the handle: no infinite loops
				if ( ! $( event.target ).is("div") ) {
					return;
				}

				var squareOffset = self.controls.square.offset();
				var pos = {
						top: event.pageY - squareOffset.top,
						left: event.pageX - squareOffset.left
				};
				event.preventDefault();
				self._squareDrag( event, { position: pos } );
				event.target = self.controls.squareDrag.get(0);
				self.controls.squareDrag.css( pos ).trigger( event );
			});

			self.controls.s = square.find( '.iris-square-horiz').slider({
				slide: function( event, ui ) {
					self.color.s( ui.value );
					self.active = 's';
					self._change.apply( self, arguments );
				}
			});

			self.controls.l = square.find( '.iris-square-vert').slider({
				orientation: 'vertical',
				slide: function( event, ui ) {
					self.color.l( ui.value );
					self.active = 'l';
					self._change.apply( self, arguments );
				}
			});
		},

		_squareDrag: function( event, ui ) {
			var self = this;
			var dimensions = self._squareDimensions();
			var light = Math.round( ( dimensions.h - ui.position.top ) / dimensions.h * 100 );
			var sat = 100 - Math.round( ( dimensions.w - ui.position.left ) / dimensions.w * 100 );

			self.color.s( sat ).l( light );
			self.active = 'square';
			self._change.apply( self, arguments );
		},

		_setOption: function( key, value ) {
			var oldValue = this.options[key];
			if ( key === 'color' ) {
				// cast to string in case we have a number
				value = "" + value;
				var hexLessColor = value.replace(/^#/, '');
				// Color.js returns black when passed a dodgy color
				// we'll use this to detect a bad color
				var isBlack = hexLessColor === '0' || hexLessColor === '000' || hexLessColor === '000000';
				var newColor = new Color( value );
				if ( ! ( newColor.toInt() === 0 && isBlack ) ) {
					this.color = newColor;
					this.active = 'external';
					this._change();
					this.options[key] = this.color.toString();
				}
			}
		},

		_squareDimensions: function( forceRefresh ) {
			var square = this.controls.square;
			var dimensions, control;
			if ( forceRefresh !== undef && square.data('dimensions') ){
				return square.data('dimensions');
			}
			control = this.controls.squareDrag;
			dimensions = {
				w: square.width(),
				h: square.height()
			};
			square.data( 'dimensions', dimensions );
			return dimensions;
		},

		_change: function( event, ui ) {
			var self = this;
			var controls = self.controls;
			var hsl = self.color.toHsl();
			var hex = self.color.toString();

			var actions = [ 's', 'l', 'square' ];

			if ( self.active === 'external' || self.active === 'h' ) {
				controls.square.LSSquare( hsl.h );
				if ( self.active === 'h' ) {
					actions = [];
				} else {
					actions.push( 'h' );
				}
				// store h: it gets squirrely
				this.hue = hsl.h;
			} else {
				// we're left with s, l, or square, which shouldn't affect hue, but sometimes does
				// because hue can be weird like that
				if ( hsl.h !== this.hue ) {
					// set it
					hsl.h = this.hue;
					self.color.h( this.hue );
				}
			}

			hex = self.color.toString();

			$.each( actions, function(index, item) {
				if ( item !== self.active ) {
					switch ( item ) {
						case 'h':
							controls.h.slider( 'value', 359 - hsl.h );
							break;
						case 's':
							if ( self.active !== 'l' ) {
								controls.s.slider( 'value', hsl.s );
							}
							break;
						case 'l':
							if ( self.active !== 's' ) {
								controls.l.slider( 'value', hsl.l );
							}
							break;
						case 'square':
							var dimensions = self._squareDimensions();
							var cssObj = {
								left: hsl.s / 100 * dimensions.w,
								top: dimensions.h - ( hsl.l / 100 * dimensions.h )
							};

							// things go all squirrely if we do both. HSL is weird.
							if ( self.active === 's' ) {
								delete cssObj.top;
							} else if ( self.active === 'l' ) {
								delete cssObj.left;
							}
							self.controls.squareDrag.css( cssObj );
							break;
					}
				}
			});

			this.controls.result.css( 'backgroundColor', hex );
			if ( this.element.is(":input") ) {
				this.element.val( hex );
			}

			// don't run it the first time
			if ( this._inited ) {
				this._trigger( 'change', { type: this.active }, { color: this.color } );
			}
			this._inited = true;
			this.active = false;
		},
		show: function() {
			this.picker.show();
		},
		hide: function() {
			this.picker.hide();
		},
		toggle: function() {
			this.picker.toggle();
		}
	};
	// initialize the widget
	$.widget( 'a8c.iris', Iris );
	// add CSS
	$('<style id="iris-css" />').text( _css ).appendTo( 'head' );

}( jQuery ));

/*! Color.js - v0.9 - 2012-07-26
* https://github.com/Automattic/Color.js
* Copyright (c) 2012 Matt Wiebe; Licensed GPL v2 */

(function(exports, undef) {

	var Color = function( color, type ) {
		this._init( color, type );
		return this;
	};

	Color.prototype = {
		_color: 0,
		_alpha: 1,
		// for preserving hue/sat in fromHsl().toHsl() flows
		__hsl: { h: 0, s: 0, l: 0 },

		_init: function( color ) {
			var func = 'noop';
			switch ( typeof color ) {
					case 'object':
						// alpha?
						this._alpha = color.a || 1;
						func = ( color.r !== undef ) ? 'fromRgb' :
							( color.l !== undef ) ? 'fromHsl' : func;
						return this[func]( color );
					case 'string':
						return this.fromCSS( color );
					case 'number':
						return this.fromInt( parseInt( color, 10 ) );
			}
			return this;
		},

		noop: function() {
			return this;
		},

		fromCSS: function( color ) {
			var nums, list;
			if ( color.match(/^(rgb|hsl)a?/) ) {
				list = color.replace(/(\s|%)/g, '').replace(/^(rgb|hsl)a?\(/, '').replace(/\);?$/, '').split(',');
				if ( list.length === 4 ) {
					this._alpha = parseFloat( list.pop() );
				}
				if ( color.match(/^rgb/) ) {
					return this.fromRgb( {
						r: parseInt(list[0], 10),
						g: parseInt(list[1], 10),
						b: parseInt(list[2], 10)
					} );
				}
				else {
					return this.fromHsl( {
						h: parseInt(list[0], 10),
						s: parseInt(list[1], 10),
						l: parseInt(list[2], 10)
					} );
				}
			}
			else {
				// must be hex amirite?
				return this.fromHex( color );
			}
		},

		fromRgb: function( rgb, preserve ) {
			return this.fromInt( parseInt( ( rgb.r << 16 ) + ( rgb.g << 8 ) + rgb.b, 10 ), preserve );
		},

		fromHex: function( color ) {
			color = color.replace(/^#/, '');
			if ( color.length === 3 ) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}
			return this.fromInt( parseInt( color, 16 ) );
		},

		fromHsl: function( hsl ) {
			var r, g, b, q, p, h, s, l;
			this.__hsl = hsl; // store it
			h = hsl.h / 360; s = hsl.s / 100; l = hsl.l / 100;
			if ( s === 0 ) {
				r = g = b = l; // achromatic
			}
			else {
				q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
				p = 2 * l - q;
				r = this.hue2rgb( p, q, h + 1/3 );
				g = this.hue2rgb( p, q, h );
				b = this.hue2rgb( p, q, h - 1/3 );
			}
			return this.fromRgb( {
				r: r * 255,
				g: g * 255,
				b: b * 255
			}, true ); // true preserves hue/sat
		},

		fromInt: function( color, preserve ) {
			this._color = parseInt( color, 10 );
			if ( preserve === undef ) {
				this.__hsl.h = this.__hsl.s = 0;
			}
			// EVENT GOES HERE
			return this;
		},

		hue2rgb: function( p, q, t ) {
			if ( t < 0 ) {
				t += 1;
			}
			if ( t > 1 ) {
				t -= 1;
			}
			if ( t < 1/6 ) {
				return p + ( q - p ) * 6 * t;
			}
			if ( t < 1/2 ) {
				return q;
			}
			if ( t < 2/3 ) {
				return p + ( q - p ) * ( 2/3 - t ) * 6;
			}
			return p;
		},

		toString: function() {
			var hex = parseInt( this._color, 10 ).toString( 16 );
			// maybe left pad it
			if ( hex.length < 6 ) {
				for (var i = 6 - hex.length - 1; i >= 0; i--) {
					hex = '0' + hex;
				}
			}
			return '#' + hex;
		},

		toCSS: function( type, alpha ) {
			type = type || 'hex';
			alpha = parseFloat( alpha || this._alpha );
			switch ( type ) {
				case 'rgb':
				case 'rgba':
					var rgb = this.toRgb();
					if ( alpha < 1 ) {
						return "rgba( " + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + " )";
					}
					else {
						return "rgb( " + rgb.r + ", " + rgb.g + ", " + rgb.b + " )";
					}
					break;
				case 'hsl':
				case 'hsla':
					var hsl = this.toHsl();
					if ( alpha < 1 ) {
						return "hsla( " + hsl.h + ", " + hsl.s + ", " + hsl.l + ", " + alpha + " )";
					}
					else {
						return "hsl( " + hsl.h + ", " + hsl.s + ", " + hsl.l + " )";
					}
					break;
				default:
					return this.toString();
			}
		},

		toRgb: function() {
			return {
				r: 255 & ( this._color >> 16 ),
				g: 255 & ( this._color >> 8 ),
				b: 255 & ( this._color )
			};
		},

		toHsl: function() {
			var rgb = this.toRgb();
			var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
			var max = Math.max( r, g, b ), min = Math.min( r, g, b );
			var h, s, l = ( max + min ) / 2;

			if ( max === min ) {
				h = s = 0; // achromatic
			}
			else {
				var d = max - min;
				s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
				switch ( max ) {
					case r: h = ( g - b ) / d + ( g < b ? 6 : 0 );
						break;
					case g: h = ( b - r ) / d + 2;
						break;
					case b: h = ( r - g ) / d + 4;
						break;
				}
				h /= 6;
			}

			// maintain hue & sat if we've been manipulating things in the HSL space.
			h = Math.round( h * 360 );
			if ( h === 0 && this.__hsl.h !== h ) {
				h = this.__hsl.h;
			}
			s = Math.round( s * 100 );
			if ( s === 0 && this.__hsl.s ) {
				s = this.__hsl.s;
			}

			return {
				h: h,
				s: s,
				l: Math.round( l * 100 )
			};
		},

		toInt: function() {
			return this._color;
		},

		toIEOctoHex: function() {
			// AARRBBGG
			var hex = this.toString();
			var AA = parseInt( 255 * this._alpha, 10 ).toString(16);
			if ( AA.length === 1 ) {
				AA = '0' + AA;
			}
			return '#' + AA + hex.replace(/^#/, '' );
		},

		toLuminosity: function() {
			var rgb = this.toRgb();
			return 0.2126 * Math.pow( rgb.r / 255, 2.2 ) + 0.7152 * Math.pow( rgb.g / 255, 2.2 ) + 0.0722 * Math.pow( rgb.b / 255, 2.2);
		},

		getDistanceLuminosityFrom: function( color ) {
			if ( ! ( color instanceof Color ) ) {
				throw 'getDistanceLuminosityFrom requires a Color object';
			}
			var lum1 = this.toLuminosity();
			var lum2 = color.toLuminosity();
			if ( lum1 > lum2 ) {
				return ( lum1 + 0.05 ) / ( lum2 + 0.05 );
			}
			else {
				return ( lum2 + 0.05 ) / ( lum1 + 0.05 );
			}
		},

		getMaxContrastColor: function() {
			var lum = this.toLuminosity();
			var hex = ( lum >= 0.5 ) ? '000000' : 'ffffff';
			return new Color( hex );
		},

		getGrayscaleContrastingColor: function( contrast ) {
			if ( ! contrast ) {
				return this.getMaxContrastColor();
			}

			// don't allow less than 5
			var target_contrast = ( contrast < 5 ) ? 5 : contrast;
			var color = this.getMaxContrastColor();
			contrast = color.getDistanceLuminosityFrom( this );

			// if current max contrast is less than the target contrast, we had wishful thinking.
			if ( contrast <= target_contrast ) {
				return color;
			}

			var incr = ( 0 === color.toInt() ) ? 1 : -1;

			while ( contrast > target_contrast ) {
				color = color.incrementLightness( incr );
				contrast = color.getDistanceLuminosityFrom( this );
			}

			return color;
		},

		getReadableContrastingColor: function( bgColor, minContrast ) {
			if ( ! bgColor instanceof Color ) {
				return this;
			}

			// you shouldn't use less than 5, but you might want to.
			var targetContrast = ( minContrast === undef ) ? 5 : minContrast;
			// working things
			var contrast = bgColor.getDistanceLuminosityFrom( this );
			var maxContrastColor = bgColor.getMaxContrastColor();
			var maxContrast = maxContrastColor.getDistanceLuminosityFrom( bgColor );

			// if current max contrast is less than the target contrast, we had wishful thinking.
			// still, go max
			if ( maxContrast <= targetContrast ) {
				return maxContrastColor;
			}
			// or, we might already have sufficient contrast
			else if ( contrast >= targetContrast ) {
				return this;
			}

			var incr = ( 0 === maxContrastColor.toInt() ) ? -1 : 1;
			while ( contrast < targetContrast ) {
				this.incrementLightness( incr );
				contrast = this.getDistanceLuminosityFrom( bgColor );
				// infininite loop prevention: you never know.
				if ( this._color === 0 || this._color === 16777215 ) {
					break;
				}
			}

			return this;

		},

		// GET / SET - to be moved into generative functions
		h: function( val ) {
			return this._hsl( 'h', val );
		},
		s: function( val ) {
			return this._hsl( 's', val );
		},
		l: function( val ) {
			return this._hsl( 'l', val );
		},
		_hsl: function( key, val ) {
			var hsl = this.toHsl();
			if ( val === undef ) {
				return hsl[key];
			}
			if ( key === 'h' ) { // hue gets modded
				hsl[key] = val % 360;
			} else { // s & l get range'd
				hsl[key] = ( val < 0 ) ? 0 : ( val > 100 ) ? 100 : val;
			}
			return this.fromHsl( hsl );
		},

		// TRANSFORMS

		darken: function( amount ) {
			amount = amount || 5;
			return this.incrementLightness( - amount );
		},

		lighten: function( amount ) {
			amount = amount || 5;
			return this.incrementLightness( amount );
		},

		incrementLightness: function( amount ) {
			return this.l( this.l() + amount );
		},

		saturate: function( amount ) {
			amount = amount || 15;
			return this.incrementSaturation( amount );
		},

		desaturate: function( amount ) {
			amount = amount || 15;
			return this.incrementSaturation( - amount );
		},

		incrementSaturation: function( amount ) {
			return this.s( this.s() + amount );
		},

		toGrayscale: function() {
			return this.h( 0 );
		},

		getComplement: function() {
			return this.incrementHue( 180 );
		},

		getSplitComplement: function( step ) {
			step = step || 1;
			var incr = 180 + ( step * 30 );
			return this.incrementHue( incr );
		},

		getAnalog: function( step ) {
			step = step || 1;
			var incr = step * 30;
			return this.incrementHue( incr );
		},

		getTetrad: function( step ) {
			step = step || 1;
			var incr = step * 60;
			return this.incrementHue( incr );
		},

		getTriad: function( step ) {
			step = step || 1;
			var incr = step * 120;
			return this.incrementHue( incr );
		},

		incrementHue: function( amount ) {
			return this.h( this.h() + amount );
		}

	};

	exports.Color = Color;

}(typeof exports === 'object' && exports || this));
