/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.util.URI', {
		URI : function(u, s) {
			var t = this, o, a;

			// Default settings
			s = t.settings = s || {};
			s.base_uri = s.base_uri || document.location.href;

			if (s.base_uri.indexOf('?') != -1)
				s.base_uri = s.base_uri.substring(0, s.base_uri.indexOf('?'));

			// Strange app protocol
			if (/^(mailto|news|javascript|about):/i.test(u)) {
				t.source = u;
				return;
			}

			// Relative URL not //host/dir/file or http://host/dir/file
			if (u.indexOf('://') == -1 && u.indexOf('//') !== 0) {
				o = new tinymce.util.URI(s.base_uri, {base_uri : s.base_uri});
				o.setPath(u);
				return o;
			}

			// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
			u = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(u);
			each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
				t[v] = u[i];
			});

			t.path = t.path || '/';
		},

		setPath : function(p) {
			var t = this;

			if (p.indexOf('../') != -1 || p.indexOf('/') !== 0)
				p = t.toAbsPath(t.getBaseURI().directory, p);

			p = /^(.*?)\/?(\w+)?$/.exec(p);

			// Update path parts
			t.path = p[0];
			t.directory = p[1];
			t.file = p[2];

			// Rebuild source
			t.source = '';
			t.getURI();
		},

		getBaseURI : function() {
			return new tinymce.util.URI(this.settings.base_uri);
		},

		toRelative : function(u) {
			var t = this;

			u = new tinymce.util.URI(u, {base_uri : t.getURI()});

			// Not on same domain/port or protocol
			if (t.host != u.host || t.port != u.port || t.protocol != u.protocol)
				return u.getURI();

			return t.toRelPath(t.path, u.path);
		},

		toAbsolute : function(u, nh) {
			return new tinymce.util.URI(u, {base_uri : this.getURI()}).getURI(nh);
		},

		toRelPath : function(base, path) {
			var items, bp = 0, out = '', i;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0; i < base.length; i++) {
					if (i >= items.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0; i < items.length; i++) {
					if (i >= base.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (bp == 1)
				return path;

			for (i = 0; i < base.length - (bp - 1); i++)
				out += "../";

			for (i = bp - 1; i < items.length; i++) {
				if (i != bp - 1)
					out += "/" + items[i];
				else
					out += items[i];
			}

			return out;
		},

		toAbsPath : function(base, path) {
			var i, nb = 0, o = [];

			// Split paths
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k)
					o.push(k);
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length == 0 || path[i] == ".")
					continue;

				// Is parent
				if (path[i] == '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0)
				return '/' + o.reverse().join('/');

			return '/' + base.slice(0, i).join('/') + '/' + o.reverse().join('/');
		},

		getBaseURI : function() {
			var t = this;

			if (!t.baseURI)
				t.baseURI = new tinymce.util.URI(t.settings.base_uri);

			return t.baseURI;
		},

		getURI : function(nh) {
			var s, t = this;

			// Rebuild source
			if (!t.source || nh) {
				s = '';

				if (!nh || (t.host != t.getBaseURI().host)) {
					if (t.protocol)
						s += t.protocol + '://';

					if (t.userInfo)
						s += t.userInfo + '@';

					if (t.host)
						s += t.host;

					if (t.port)
						s += ':' + t.port;
				}

				if (t.path)
					s += t.path;

				if (t.query)
					s += '?' + t.query;

				if (t.anchor)
					s += '#' + t.anchor;

				t.source = s;
			}

			return t.source;
		}
	});
})();