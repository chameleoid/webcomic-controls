// Source: Kim Zick
//
// Special thanks:
// 	Corey Edwards

$(function() {
	if (window != top)
		return;

	var enabled = true, domain = document.domain.replace(/^www\./i, '');

	var key = { last: '', current: '' }, timeout;


	var keys = {
		37: 'previous',
		39: 'next',

		ctrl: {
			37: 'first',
			39: 'last',
			38: 'random'
		}
	};

	$(window).bind({
		keydown: function(event) {
			if (event.target != document.body || !/previous|next|^$/.test(key.last))
				return;

			clearTimeout(timeout);


			key.last = key.current;
			key.current = event.ctrlKey ? keys.ctrl[event.keyCode] : keys[event.keyCode];

			if (/(previous|next){2}/.test(key.current + key.last) && key.last != key.current) {
				key = { last: '', current: '' };

				chrome.extension.sendRequest({ name: 'toggle' }, function(stat) { enabled = !!stat; });

				return;
			}


			timeout = setTimeout(function() {
				key.last = '';
			}, 350);
		},

		keyup: function(event) {
			clearTimeout(timeout);
			key.last = '';

			if (event.target != document.body || !enabled || !key.current)
				return;

			chrome.extension.sendRequest({ name: 'selector', key: key.current, domain: domain }, function(response) {
				switch (response.name) {
					case 'query':
						location.href = $(response.data).attr('href');
						break;

					case 'regex':
						var regex = new RegExp(response.data, 'i');
						$('a, link').each(function() {
							if (regex.test(($(this).html() || '') + ($(this).attr('title') || '') + ($(this).attr('rel') || ''))) {
								location.href = $(this).attr('href');
								return false;
							}
						});
						break;
				}
			});

			key.current = '';
		},

		focus: function() {
			chrome.extension.sendRequest({ name: 'status' }, function(stat) {
				enabled = !!stat;
			});
		},

		/*contextmenu: function(event) {
			$(event.target).each(function() {
				var $tmp, $node, $path = [];

				$(this).add($(this).parents()).each(function() {
					$tmp  = ($node = this.tagName.toLowerCase())
					      + $(this).attr('id').replace(/^(.+)/, '#$1')
					      + $(this).attr('class').replace(/(?:^\s?|\s)(\S)/ig, '.$1');
					
					if ($node != 'body' && $node != 'html' && $tmp.indexOf('#') < 0)
						$tmp += ':nth-child(' + ($(this).index() + 1) + ')';

					$path.push($tmp);

					return $node != 'a';
				});

				console.log($path.join(' > '));
			});
		},*/
	});

	chrome.extension.onRequest.addListener(function(request) {
		switch (request.name) {
			case 'set': enabled = request.enabled; break;
			case 'menu': handleMenu(request.item); break;
		}
	});

	chrome.extension.sendRequest({ name: 'status' }, function(stat) {
		enabled = !!stat;
	});
});
