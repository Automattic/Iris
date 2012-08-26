/*! Color.js - v0.9.1 - 2012-08-26
* https://github.com/Automattic/Color.js
* Copyright (c) 2012 Matt Wiebe; Licensed GPL v2 */

(function(exports, undef) {

	var Color = function( color, type ) {
		if ( ! ( this instanceof Color ) )
			return new Color( color, type );

		return this._init( color, type );
	};

	Color.prototype = {
		_color: 0,
		_alpha: 1,
		error: false,
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
			this.error = false;
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
			if ( typeof rgb !== 'object' && ( ! rgb.r || ! rgb.g || ! rgb.b ) ) {
				this.error = true;
				return this;
			}
			this.error = false;
			return this.fromInt( parseInt( ( rgb.r << 16 ) + ( rgb.g << 8 ) + rgb.b, 10 ), preserve );
		},

		fromHex: function( color ) {
			color = color.replace(/^#/, '').replace(/^0x/, '');
			if ( color.length === 3 ) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}

			// rough error checking - this is where things go squirrely the most
			this.error = ! /^[0-9A-F]{6}$/i.test( color );
			return this.fromInt( parseInt( color, 16 ) );
		},

		fromHsl: function( hsl ) {
			if ( typeof hsl !== 'object' || ( ! hsl.h || ! hsl.s || ! hsl.l ) ) {
				this.error = true;
				return this;
			}

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
			// let's coerce things
			if ( this._color > 16777215 )
				this._color = 16777215;
			else if ( this._color < 0 )
				this._color = 0;

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
