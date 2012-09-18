var options = {
	set enabled(enabled) {
		enabled = !!enabled;

		localStorage.enabled = JSON.stringify(enabled);
		chrome.browserAction.setIcon({ path: '/icons/' + (enabled ? '' : 'red') + '24.png'});
		chrome.browserAction.setTitle({ title: 'WebComic Controls (' + (enabled ? 'enabled' : 'disabled') + ')' });
	},

	get enabled() {
		return JSON.parse(localStorage.enabled || 'false');
	},

	site: {
		'gocomics.com': {
			first:    '#content > .feature > .bottom > .top > .feature-nav > li > .beginning',
			last:     '#content > .feature > .bottom > .top > .feature-nav > li > .newest',
			next:     '#content > .feature > .bottom > .top > .feature-nav > li > .next',
			previous: '#content > .feature > .bottom > .top > .feature-nav > li > .prev',
		}
	},

	generic: {
		first:    'first',
		last:     'last',
		next:     'next',
		previous: 'prev(ious)?|back',
		random:   'random',
	},
};

function toggle() {
	return options.enabled = !options.enabled;
}

options.enabled = options.enabled;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch (request.name) {
		case 'status':
			sendResponse(options.enabled);
			break;

		case 'toggle':
			sendResponse(toggle());
			break;

		case 'selector':
			if (options.site[request.domain] && options.site[request.domain][request.key])
				sendResponse({ name: 'query', data: options.site[request.domain][request.key] });
			else
				sendResponse({ name: 'regex', data: options.generic[request.key] || '' });
			break;
	}
});

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendRequest(tab.id, { name: 'set', enabled: toggle() });
});

/*var menu = chrome.contextMenus.create({ title: 'Webcomic Controls' });

for (j in {Back:1,Forward:1,First:1,Last:1,Random:1}) {
	(function(j) {
		chrome.contextMenus.create({ title: j, parentId: menu, onclick: function(info) {
			chrome.extension.sendRequest({ name: 'menu', item: j.toLowerCase() });
		}});
	})(j);
}*/
