(function( $, undef ){
	var _html = '<div class="iris-picker"><div class="iris-picker-inner"><div class="iris-square"><a class="iris-square-value" href="#"><span class="iris-square-handle ui-slider-handle"></span></a><div class="iris-square-slider iris-horiz-slider"></div><div class="iris-square-slider iris-vert-slider"></div><div class="iris-square-inner iris-square-horiz"></div><div class="iris-square-inner iris-square-vert"></div></div><div class="iris-slider iris-strip"><div class="iris-slider-offset"></div></div></div></div>';
	// Even IE9 dosen't support gradients. Elaborate sigh.
	var nonGradientIE = !! ( $.browser.msie && parseInt( $.browser.version, 10 ) < 10 );
	var gradientType = false;
	var vendorPrefixes = ['-moz-', '-webkit-', '-o-', '-ms-' ];
	// This is manually copied from iris.min.css until I can figure out how to do it without
	var _css = '.iris-picker{display:block;position:relative}.iris-error{background-color:#ffafaf}.iris-border{border-radius:3px;border:1px solid #aaa;width:200px;background-color:#fff}.iris-picker-inner{position:absolute;top:0;right:0;left:0;bottom:0}.iris-border .iris-picker-inner{top:10px;right:10px;left:10px;bottom:10px}.iris-picker .iris-square-inner{position:absolute;left:0;right:0;top:0;bottom:0}.iris-picker .iris-square,.iris-picker .iris-slider,.iris-picker .iris-square-inner{border-radius:3px;-webkit-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);-moz-box-shadow:inset 0 0 5px rgba(0,0,0,0.4);box-shadow:inset 0 0 5px rgba(0,0,0,0.4);height:100%;width:12.5%;float:left;margin-right:5%}.iris-picker .iris-square{width:76%;margin-right:10%;position:relative}.iris-picker .iris-square-inner{width:auto;margin:0}.iris-picker .iris-square .sat,.iris-ie-9 .iris-square,.iris-ie-9 .iris-slider,.iris-ie-9 .iris-square-inner{-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-radius:0}.iris-picker .iris-square .sat{-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}.iris-ie-lt9 .iris-square,.iris-ie-lt9 .iris-slider,.iris-ie-lt9 .iris-square-inner{outline:1px solid #aaa}.iris-ie-lt9 .iris-square .ui-slider-handle{outline:1px solid #aaa;background-color:#fff;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)"}.iris-ie-lt9 .iris-square .iris-square-handle{background:none;border:3px solid #fff;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)"}.iris-picker .iris-strip{margin-right:0;position:relative}.iris-picker .iris-strip .ui-slider-handle{position:absolute;background:none;right:-3px;left:-3px;border:4px solid #aaa;border-width:4px 3px;width:auto;height:6px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.2);opacity:.9;z-index:5}.iris-strip .ui-slider-handle:before{content:" ";position:absolute;left:-2px;right:-2px;top:-3px;bottom:-3px;border:2px solid #fff;-webkit-border-radius:3px;border-radius:3px}.iris-picker .iris-slider-offset{position:absolute;top:11px;left:0;right:0;bottom:-3px}.iris-square .iris-horiz-slider{position:absolute;top:-7px;left:-7px;height:1px;width:100%}.iris-square .iris-vert-slider{position:absolute;right:6px;top:7px;width:1px;height:100%}.iris-square .iris-square-slider a{opacity:.3;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";-moz-transition:opacity 300ms;-webkit-transition:opacity 300ms;transition:opacity 300ms}.iris-square .iris-square-slider .ui-slider-handle.active{opacity:1;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)"}.iris-dragging .iris-square-slider .ui-slider-handle.active{opacity:0;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.iris-picker .ui-slider-handle{background:#f5f5f5;-webkit-border-radius:10px;-moz-border-radius:50%;border-radius:50%;box-shadow:inset #fff 0 1px 1px,inset 0 -1px 1px rgba( 0,0,0,0.4 ),0px 1px 4px 0 rgba( 0,0,0,0.2 ),0 0 2px rgba( 0,0,0,0.3 );display:block;opacity:0.7;position:absolute;z-index:5;height:20px;width:20px;cursor:default;cursor:ns-resize;z-index:5}.iris-horiz-slider .ui-slider-handle{cursor:ew-resize}.iris-square-slider .ui-slider-handle{width:14px;height:14px;opacity:1;background-color:#eee}.iris-picker .iris-square-handle{background:transparent;border:5px solid #aaa;border-color:rgba(128,128,128,.5);box-shadow:none;width:12px;height:12px;position:absolute;left:-10px;top:-10px;cursor:move;opacity:1;z-index:10}.iris-picker .ui-state-focus .iris-square-handle{opacity:.8}.iris-picker .iris-square-handle:hover{border-color:#999}.iris-picker .iris-square-handle:hover::after{border-color:#fff}.iris-picker .iris-square-handle::after{position:absolute;bottom:-4px;right:-4px;left:-4px;top:-4px;border:3px solid #f9f9f9;border-color:rgba(255,255,255,.8);border-radius:50%;content:" "}.iris-picker .iris-square-value{width:8px;height:8px;position:absolute}.iris-ie-lt9 .iris-square-value,.iris-mozilla .iris-square-value{width:1px;height:1px}';
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
			mode: 'hsl',
			controls: {
				horiz: 's', // horizontal defaults to saturation
				vert: 'l', // vertical defaults to lightness
				strip: 'h' // right strip defaults to hue
			},
			hide: true,
			border: true,
			target: false, // a DOM element / jQuery selector that the element will be appended within. Only used when called on an input.
			width: 200
		},
		_inited: false,
		_scale: {
			h: 359,
			s: 100,
			l: 100,
			v: 100
		},
		_create: function() {
			var self = this,
				el = self.element,
				color = self.options.color || el.val(),
				hue;

			if ( gradientType === false )
				testGradientType();

			if ( el.is("input") ) {
				if ( self.options.target )
					self.picker = $( _html ).appendTo( self.options.target );
				else
					self.picker = $( _html ).insertAfter( el );

				self._addInputListeners( el );
			} else {
				el.append( _html );
				self.picker = el.find( '.iris-picker' );
			}
			if ( $.browser.mozilla ) {
				self.picker.addClass( 'iris-mozilla' );
			} else if ( $.browser.msie ) {
				var _IEVER = parseInt( $.browser.version, 10 );
				if ( _IEVER === 9 )
					self.picker.addClass( 'iris-ie-9' );
				else if ( _IEVER <= 8 )
					self.picker.addClass( 'iris-ie-lt9' );
			}

			self.color = new Color( color ).setHSpace( self.options.mode );
			self.options.color = self.color.toString();

			// prep 'em for re-use
			self.controls = {
				square:      self.picker.find( '.iris-square' ),
				squareDrag:  self.picker.find( '.iris-square-value' ),
				horiz:       self.picker.find( '.iris-square-horiz' ),
				horizSlider: self.picker.find( '.iris-horiz-slider' ),
				vert:        self.picker.find( '.iris-square-vert' ),
				vertSlider:  self.picker.find( '.iris-vert-slider' ),
				strip:       self.picker.find( '.iris-strip' ),
				stripSlider: self.picker.find( '.iris-strip .iris-slider-offset' )
			};

			// small sanity check - if we chose hsv, change default controls away from hsl
			if ( self.options.mode === 'hsv' && self.options.controls.vert === 'l' ) {
				self.options.controls = {
					horiz: 'h',
					vert: 'v',
					strip: 's'
				};
			}

			// store it. HSL gets squirrely
			self.hue = self.color.h();

			if ( self.options.hide )
				self.picker.hide();

			if ( self.options.border )
				self.picker.addClass( 'iris-border' );

			self._initControls();
			self.active = 'external';
			self._dimensions();
			self._change();
		},
		_paint: function() {
			var self = this;
			self._paintDimension( 'top', 'strip' );
			self._paintDimension( 'top', 'vert' );
			self._paintDimension( 'left', 'horiz' );
		},
		_paintDimension: function( origin, control ) {
			var self = this,
				c = self.color,
				mode = self.options.mode,
				color = self._getHSpaceColor(),
				target = self.controls[control],
				controlOpts = self.options.controls,
				stops, hue;

			// don't paint the active control
			if ( control === self.active || ( self.active === 'square' && control !== 'strip' ) )
				return;

			switch ( controlOpts[ control ] ) {
				case 'h':
					if ( mode === 'hsv' ) {
						color = c.clone();
						switch ( control ) {
							case 'horiz':
								color[controlOpts.vert](100);
								break;
							case 'vert':
								color[controlOpts.horiz](100);
								break;
							case 'strip':
								color.setHSpace('hsl').s(100).l(100);
								break;
						}
						stops = color.toHsl();
					} else {
						if ( control === 'strip' )
							stops = { s: color.s, l: color.l };
						else
							stops = { s: 100, l: color.l };
					}
					target.raninbowGradient( origin, stops );
					break;
				case 's':
					if ( control === 'vert' && self.options.controls.horiz === 'h' && self.options.mode === 'hsl' ) {
						stops = ['hsla(0, 0%, ' + color.l + '%, 0)', 'hsla(0, 0%, ' + color.l + '%, 1)'];
					} else if ( control === 'vert' && self.options.mode === 'hsv' ) {
						stops = [ c.clone().a(0).s(0).toCSS('rgba'), c.clone().a(1).s(0).toCSS('rgba') ];
					} else if ( control === 'strip' && self.options.mode === 'hsv' ) {
						stops = [ c.clone().s(100).toCSS('hsl'), c.clone().s(0).toCSS('hsl') ];
					} else {
						stops = ['hsl('+ color.h +',0%,50%)', 'hsl(' + color.h + ',100%,50%)'];
					}
					target.gradient( origin, stops );
					break;
				case 'l':
					if ( control === 'strip' )
						stops = ['hsl(' + color.h + ',100%,100%)', 'hsl(' + color.h + ', ' + color.s + '%,50%)', 'hsl('+ color.h +',100%,0%)'];
					else
						stops = ['#fff', 'rgba(255,255,255,0) 50%', 'rgba(0,0,0,0) 50%', 'rgba(0,0,0,1)'];
					target.gradient( origin, stops );
					break;
				case 'v':
						if ( control === 'strip' )
							stops = [ c.clone().v(100).toCSS(), c.clone().v(0).toCSS() ];
						else
							stops = ['rgba(0,0,0,0)', '#000'];
						target.gradient( origin, stops );
					break;
				default:
					break;
			}
		},

		_getHSpaceColor: function() {
			return ( this.options.mode === 'hsv' ) ? this.color.toHsv() : this.color.toHsl();
		},

		_dimensions: function( reset ) {
			// whatever size
			var inner = this.picker.find(".iris-picker-inner"),
				controls = this.controls,
				square = controls.square,
				strip = this.picker.find('.iris-strip'),
				squareWidth = '77.5%',
				stripWidth = '12%',
				totalPadding = 20,
				innerWidth = this.options.border ? this.options.width - totalPadding : this.options.width,
				controlsHeight;

			if ( reset ) {
				square.css('width', '');
				strip.css('width', '');
				this.picker.removeAttr( 'style' );
			}

			squareWidth = innerWidth * ( parseFloat( squareWidth ) / 100 );
			stripWidth = innerWidth * ( parseFloat( stripWidth ) / 100 );
			controlsHeight = this.options.border ? squareWidth + totalPadding : squareWidth;

			square.width( squareWidth ).height( squareWidth );
			strip.height( squareWidth ).width( stripWidth );
			this.picker.css( { width: this.options.width, height: controlsHeight } );
		},

		_addInputListeners: function( input ) {
			var self = this;
			input.on('change', function( event ){
				var color = new Color( input.val() );
				var val = input.val().replace(/^#/, '');
				input.removeClass( 'iris-error' );
				// we gave a bad color
				if ( color.error ) {
					// don't error on an empty input - we want those allowed
					if ( val !== '' )
						input.addClass( 'iris-error' );
				} else {
					self._setOption( 'color', color.toString() );
				}
			});
		},

		_initControls: function() {
			var self = this,
				controls = self.controls,
				square = controls.square,
				controlOpts = self.options.controls,
				stripScale = self._scale[controlOpts.strip];

			controls.stripSlider.slider({
				orientation: 'vertical',
				max: stripScale,
				slide: function( event, ui ) {
					self.active = 'strip';
					// "reverse" for hue.
					if ( controlOpts.strip === 'h' )
						ui.value = stripScale - ui.value;

					self.color[controlOpts.strip]( ui.value );
					self._change.apply( self, arguments );
				}
			});

			controls.horizSlider.slider({
				max: self._scale[controlOpts.horiz],
				slide: function( event, ui ) {
					self.color[controlOpts.horiz]( ui.value );
					self.active = 'horiz';
					self._change.apply( self, arguments );
				}
			});

			controls.vertSlider.slider({
				max: self._scale[controlOpts.vert],
				orientation: 'vertical',
				slide: function( event, ui ) {
					self.color[controlOpts.vert]( ui.value );
					self.active = 'vert';
					self._change.apply( self, arguments );
				}
			});

			controls.squareDrag.draggable({
				containment: 'parent',
				zIndex: 1000,
				cursor: 'move',
				drag: function( event, ui ) {
					self._squareDrag( event, ui );
				},
				start: function() {
					square.addClass( 'iris-dragging' );
					$(this).addClass('ui-state-focus');
				},
				stop: function() {
					square.removeClass( 'iris-dragging' );
					$(this).removeClass('ui-state-focus');
				}
			}).on( 'mousedown mouseup', function( event ) {
				event.preventDefault();
				var focusClass = 'ui-state-focus';
				if (event.type === 'mousedown' ) {
					self.picker.find('.' + focusClass).removeClass(focusClass).blur();
					$(this).addClass( focusClass );
				} else {
					$(this).removeClass( 'ui-state-focus' );
				}
			});

			// allow clicking on the square to move there and keep dragging
			square.mousedown( function( event ) {
				// only left click
				if ( event.which !== 1 )
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

			// Hide top-right handles until you approach edges of square
			controls.square.mousemove( function( e ) {
				var me = $( this ),
					offset = me.offset(),
					x = e.pageX - offset.left,
					y = e.pageY - offset.top,
					handleX = me.find( '.iris-horiz-slider .ui-slider-handle' ),
					handleY = me.find( '.iris-vert-slider .ui-slider-handle' );

				if ( x > controls.square.width() - 20 )
					handleY.addClass( 'active' );
				else
					handleY.removeClass( 'active' );

				if ( y < 20 )
					handleX.addClass( 'active' );
				else
					handleX.removeClass( 'active' );
			});

			controls.square.mouseleave( function() {
				$( this ).find( '.iris-square-slider .ui-slider-handle' ).removeClass( 'active' );
			});
		},

		_squareDrag: function( event, ui ) {
			var self = this,
				controlOpts = self.options.controls,
				dimensions = self._squareDimensions(),
				vertVal = Math.round( ( dimensions.h - ui.position.top ) / dimensions.h * self._scale[controlOpts.vert] ),
				horizVal = self._scale[controlOpts.horiz] - Math.round( ( dimensions.w - ui.position.left ) / dimensions.w * self._scale[controlOpts.horiz] );

			self.color[controlOpts.horiz]( horizVal )[controlOpts.vert]( vertVal );

			self.active = 'square';
			self._change.apply( self, arguments );
		},

		_setOption: function( key, value ) {
			var oldValue = this.options[key];
			if ( key === 'color' ) {
				// cast to string in case we have a number
				value = "" + value;
				var hexLessColor = value.replace(/^#/, '');
				var newColor = new Color( value ).setHSpace( this.options.mode );
				if ( ! ( newColor.error ) ) {
					this.color = newColor;
					this.options.color = this.options[key] = this.color.toString();
					this.active = 'external';
					this._change();
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
			var self = this,
				controls = self.controls,
				color = self._getHSpaceColor(),
				hex = self.color.toString(),
				actions = [ 'vert', 'horiz', 'square', 'strip' ],
				controlOpts = self.options.controls,
				type = controlOpts[self.active] || 'external';

			// take no action on any of the square sliders if we adjusted the strip
			if ( self.active === 'strip' )
				actions = [];
			else if ( self.active !== 'external' ) // for non-strip, non-external, strip should never change
				actions.pop(); // conveniently the last item

			if ( type === 'external' || type === 'h' ) {
				// store h: it gets squirrely
				self.hue = color.h;
			} else {
				// we're left with s, l, or square, which shouldn't affect hue, but sometimes does
				// because hue can be weird like that
				if ( color.h !== self.hue ) {
					// set it
					color.h = self.hue;
					self.color.h( self.hue );
				}
			}

			$.each( actions, function(index, item) {
				var value;
				if ( item !== self.active ) {
					switch ( item ) {
						case 'strip':
							// reverse for hue
							value = ( controlOpts.strip === 'h' ) ? self._scale[controlOpts.strip] - color[controlOpts.strip] : color[controlOpts.strip];
							controls.stripSlider.slider( 'value', value );
							break;
						case 'vert':
							if ( self.active !== 'horiz' ) {
								controls.vertSlider.slider( 'value', color[controlOpts.vert] );
							}
							break;
						case 'horiz':
							if ( self.active !== 'vert' ) {
								controls.horizSlider.slider( 'value', color[controlOpts.horiz] );
							}
							break;
						case 'square':

							var dimensions = self._squareDimensions(),
								cssObj = {
									left: color[controlOpts.horiz] / self._scale[controlOpts.horiz] * dimensions.w,
									top: dimensions.h - ( color[controlOpts.vert] / self._scale[controlOpts.vert] * dimensions.h )
								};

							// things go all squirrely if we do both. HS[LV] is weird.
							if ( self.active === 'horiz' )
								delete cssObj.top;
							else if ( self.active === 'vert' )
								delete cssObj.left;

							self.controls.squareDrag.css( cssObj );
							break;
					}
				}
			});

			self.options.color = self.color.toString();

			// only run after the first time
			if ( self._inited )
				self._trigger( 'change', { type: self.active }, { color: self.color } );

			if ( self.element.is(":input") && ! self.color.error )
				self.element.val( self.color.toString() ).removeClass( 'iris-error' );

			self._paint();
			self._inited = true;
			self.active = false;
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
