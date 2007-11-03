/**
 * $Id: TinyMCE_Popup.class.js 227 2007-02-26 21:35:35Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * This file contains all adapter logic needed to use prototype library as the base API for TinyMCE.
 */

// #if prototype_adapter

(function() {
	if (!window.Prototype)
		return alert("Load prototype first!");

	// Patch in core NS functions
	tinymce.trim = function(s) {return s.strip();};
	tinymce.indexOf = function(a, v) {return a.indexOf(v);};

	// Patch in functions in various clases
	// Add a "#if !jquery" statement around each core API function you add below
	var patches = {
		'tinymce.util.JSON' : {
			serialize : function(o) {
				return o.toJSON();
			}
		},
	};

	// Patch functions after a class is created
	tinymce.onCreate = function(ty, c, p) {
		tinymce.extend(p, patches[c]);
	};
})();

// #endif