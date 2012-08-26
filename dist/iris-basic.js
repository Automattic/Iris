/*! Iris - v0.9.1 - 2012-08-26
* https://github.com/Automattic/Iris
* Copyright (c) 2012 Matt Wiebe; Licensed GPL */

(function( $, undef ){
	var _html = '<div class="iris-picker"><div class="iris-picker-inner"><div class="iris-square"><a class="iris-square-value" href="#"><span class="iris-square-handle ui-slider-handle"></span></a><div class="iris-square-slider iris-square-horiz"></div><div class="iris-square-slider iris-square-vert"></div></div><div class="iris-slider iris-hue"><div class="iris-slider-offset"></div></div></div></div>';
	// Even IE9 dosen't support gradients. Elaborate sigh.
	var nonGradientIE = !! ( $.browser.msie && parseInt( $.browser.version, 10 ) < 10 );
	var gradientType = false;
	var vendorPrefixes = ['-moz-', '-webkit-', '-o-', '-ms-' ];
	// This is manually copied from iris.min.css until I can figure out how to do it without
	var _css = '.iris-picker{display:block;position:relative}.iris-error{background-color:#ffafaf}.iris-border{border-radius:4px;border:1px solid #aaa;width:200px;background-color:#fff}.iris-picker-inner{position:absolute;top:0;right:0;left:0;bottom:0}.iris-border .iris-picker-inner{top:10px;right:10px;left:10px;bottom:10px}.iris-picker .iris-square,.iris-picker .iris-slider,.iris-picker .grad-box{border-radius:4px;-webkit-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);-moz-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);box-shadow:inset 0 0 5px rgba(0,0,0,0.4);height:100%;width:12.5%;float:left;margin-right:5%}.iris-picker .iris-square{width:76%;margin-right:10%}.iris-picker .grad-box{width:auto;margin:0}.iris-picker .iris-square .sat,.iris-ie-9 .iris-square,.iris-ie-9 .iris-slider,.iris-ie-9 .grad-box{-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-radius:0}.iris-picker .iris-square .sat{-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px}.iris-ie-lt9 .iris-square,.iris-ie-lt9 .iris-slider,.iris-ie-lt9 .grad-box{outline:1px solid #aaa}.iris-ie-lt9 .iris-square .ui-slider-handle{outline:1px solid #aaa;background-color:#fff;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)"}.iris-picker .iris-hue{margin-right:0}.iris-picker .iris-hue .ui-slider-handle{position:absolute;right:-3px;left:-3px;border:4px solid #aaa;border-width:4px 3px;width:auto;height:6px;background:none;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.2);opacity:.9;z-index:5}.iris-hue .ui-slider-handle:before{content:" ";position:absolute;left:-2px;right:-2px;top:-3px;bottom:-3px;border:2px solid #fff;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}.iris-picker .iris-result{margin-right:0}.iris-picker .iris-slider-offset{width:100%;height:100%;position:relative;bottom:-6px}.iris-square .iris-square-horiz{position:absolute;top:-7px;left:-7px;height:1px;width:100%}.iris-square .iris-square-vert{position:absolute;right:6px;top:7px;width:1px;height:100%}.iris-square .iris-square-slider a{opacity:.3;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";-moz-transition:opacity 300ms;-webkit-transition:opacity 300ms;transition:opacity 300ms}.iris-square .iris-square-slider .ui-slider-handle.active{opacity:1;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)"}.iris-dragging .iris-square-slider .ui-slider-handle.active{opacity:0;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.iris-picker .ui-slider-handle{background:#f5f5f5;-webkit-border-radius:10px;-moz-border-radius:50%;border-radius:50%;box-shadow:inset #fff 0 1px 1px,inset 0 -1px 1px rgba( 0,0,0,0.4 ),0px 1px 4px 0 rgba( 0,0,0,0.2 ),0 0 2px rgba( 0,0,0,0.3 );display:block;opacity:0.7;position:absolute;z-index:5;height:20px;width:20px;cursor:default;cursor:ns-resize}.iris-square-horiz .ui-slider-handle{cursor:ew-resize}.iris-square-slider .ui-slider-handle{width:14px;height:14px;opacity:1;background-color:#eee}.iris-picker .iris-square-handle{background:transparent;border:3px solid #fff;box-shadow:inset 0 -1px 1px rgba( 0,0,0,0.4 ),0px 1px 4px 0 rgba( 0,0,0,0.2 ),0 0 2px rgba( 0,0,0,0.3 );width:14px;height:14px;position:absolute;left:-10px;top:-10px;cursor:move}.iris-picker .iris-square-value{width:8px;height:8px;position:absolute}.iris-ie-lt9 .iris-square-value,.iris-mozilla .iris-square-value{width:1px;height:1px}';
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
				if ( el.css( 'backgroundImage').match('gradient') )
					gradientType = 'webkit';
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
		if ( gradientType === 'webkit' )
			return legacyWebkitGradient( origin, stops );
		else
			return vendorPrefixes[gradientType] + 'linear-gradient(' + origin + ', ' + stops.join(', ') + ')';
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
		if ( self.css('position') === 'static' )
			self.css( {position: 'relative' } );

		stops = fillColorStops( stops );
		$.each(stops, function( i, startColor ) {
			// we want two at a time. if we're on the last pair, bail.
			if ( i === lastIndex )
				return false;

			var endColor = stops[ i + 1 ];
			//if our pairs are at the same color stop, moving along.
			if ( startColor.stop === endColor.stop )
				return;

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
		if ( percs[0] === false )
			percs[0] = '0%';

		if ( percs[lastIndex] === false )
			percs[lastIndex] = '100%';

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
			} else if ( foundFirst && stops[i] !== false ) {
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
			if ( nonGradientIE )
				stupidIEGradient.apply( this, args );
			else // new hotness
				$( this ).css( 'backgroundImage', createGradient.apply( this, args ) );

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

			if ( ! initialized )
				top.gradient( 'top', '#fff', 'rgba(255,255,255,0) 50%', 'rgba(0,0,0,0) 50%', 'rgba(0,0,0,1)' );


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
			border: true,
			target: false, // a DOM element / jQuery selector that the element will be appended within. Only used when called on an input.
			width: 200
		},
		_inited: false,
		_create: function() {
			var el = this.element;
			var color = this.options.color || el.val();

			if ( gradientType === false ) {
				testGradientType();
			}

			if ( el.is("input") ) {
				if ( this.options.target )
					this.picker = $( _html ).appendTo( this.options.target );
				else
					this.picker = $( _html ).insertAfter( el );

				this._addInputListeners( el );
			} else {
				el.append( _html );
				this.picker = el.find( '.iris-picker' );
			}
			if ( $.browser.mozilla ) {
				this.picker.addClass( 'iris-mozilla' );
			} else if ( $.browser.msie ) {
				var _IEVER = parseInt( $.browser.version, 10 );
				if ( _IEVER === 9 )
					this.picker.addClass( 'iris-ie-9' );
				else if ( _IEVER <= 8 )
					this.picker.addClass( 'iris-ie-lt9' );

			}

			this.color = new Color( color );
			this.options.color = this.color.toString();
			this.controls = {};
			this.controls.square = this.picker.find( '.iris-square' );
			this.controls.result = this.picker.find( '.iris-result' );
			// store it. HSL gets squirrely
			var hue = this.hue = this.color.h();

			if ( this.options.hide )
				this.picker.hide();

			if ( this.options.border )
				this.picker.addClass( 'iris-border' );

			this.controls.square.LSSquare( hue );
			this.picker.find( '.iris-hue' ).raninbowGradient();

			this._initControls();
			this.active = 'external';
			this._dimensions();
			this._change();
		},
		_dimensions: function( reset ) {
			// whatever size
			var inner = this.picker.find(".iris-picker-inner");
			var controls = this.controls;
			var square = controls.square;
			var hue = this.picker.find('.iris-hue');
			var squareWidth = '77.5%';
			var hueWidth = '12%';
			var totalPadding = 20;
			var innerWidth = this.options.border ? this.options.width - totalPadding : this.options.width;
			var controlsHeight;

			if ( reset ) {
				square.css('width', '');
				hue.css('width', '');
				this.picker.removeAttr( 'style' );
			}

			squareWidth = innerWidth * ( parseFloat( squareWidth ) / 100 );
			hueWidth = innerWidth * ( parseFloat( hueWidth ) / 100 );
			controlsHeight = this.options.border ? squareWidth + totalPadding : squareWidth;

			square.width( squareWidth ).height( squareWidth );
			hue.height( squareWidth ).width( hueWidth );
			this.picker.css( { width: this.options.width, height: controlsHeight } );
		},

		_addInputListeners: function( input ) {
			var self = this;
			input.on('change', function( event ){
				var color = new Color( input.val() );
				var val = input.val().replace(/^#/, '');
				input.removeClass( 'iris-error' );
				// we gave a bad color
				if ( color.error && val !== '' )
					input.addClass( 'iris-error' );
				else
					self._setOption( 'color', color.toString() );

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
				if ( event.button !== 0 )
					return;

				// prevent bubbling from the handle: no infinite loops
				if ( ! $( event.target ).is("div") )
					return;

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

			// Hide top-right handles until you approach edges of square
			self.controls.square.mousemove( function( e ) {
				var me = $( this );
				var offset = me.offset();
				var x = e.pageX - offset.left;
				var y = e.pageY - offset.top;
				var handleX = me.find( '.iris-square-horiz .ui-slider-handle' );
				var handleY = me.find( '.iris-square-vert .ui-slider-handle' );

				if ( x > self.controls.square.width() - 20 )
					handleY.addClass( 'active' );
				else
					handleY.removeClass( 'active' );


				if ( y < 20 )
					handleX.addClass( 'active' );
				else
					handleX.removeClass( 'active' );

			});

			self.controls.square.mouseleave( function() {
				$( this ).find( '.iris-square-slider .ui-slider-handle' ).removeClass( 'active' );
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

			if ( forceRefresh !== undef && square.data('dimensions') )
				return square.data('dimensions');

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

				if ( self.active === 'h' )
					actions = [];
				else
					actions.push( 'h' );

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
							if ( self.active === 's' )
								delete cssObj.top;
							else if ( self.active === 'l' )
								delete cssObj.left;

							self.controls.squareDrag.css( cssObj );
							break;
					}
				}
			});

			this.controls.result.css( 'backgroundColor', hex );

			if ( this.element.is(":input") )
				this.element.val( hex );

			// don't run it the first time
			if ( this._inited )
				this._trigger( 'change', { type: this.active }, { color: this.color } );

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
	$('<style id="iris-css">' + _css + '</style>').appendTo( 'head' );

}( jQuery ));
