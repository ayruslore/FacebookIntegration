(function(){

    window.GuestfulWidget = window.GuestfulWidget || {};

	window.console = window.console || {warn: function(){}};
	
	var scripts = document.querySelectorAll('script.guestful-widget-loader');

	if(scripts.length == 0) {
		//Fallback for ID reliant widgets.
		scripts = document.querySelectorAll('#guestful-widget-loader');
	}

	if(scripts.length == 0){
		console.warn("Could not find Guestful widget loader. Is the class 'guestful-widget-loader' properly set on the script element?");
		return;
	}

	//Currently executing script is always the last one in the list
	var script = scripts[scripts.length - 1],
        parser = document.createElement('a');

    parser.href = script.src;

    var query = parser.search,
        matches = /([&\?]?)lang=([a-zA-Z_]+)&?/.exec(query),
        lang = 'en';

    if(matches) {
        lang = matches[2];
        query = query.replace(matches[0], matches[1]);
    }

    var url = parser.protocol + '//' + parser.host + (lang == 'en' ? '' : '/' + lang) + '/widgets/responsive/widget.html' + query;

	function insertAfter(el, after){
		if (el.nextSibling) {
		  el.parentNode.insertBefore(after, el.nextSibling);
		}else {
		  el.parentNode.appendChild(after);
		}
	}

	var iel = document.createElement('iframe');
	iel.setAttribute('onload', "this.style.visibility='visible';");
	iel.setAttribute('src', url);
	iel.setAttribute('frameborder', 0);
	iel.setAttribute('allowtransparency', 'true');
	iel.setAttribute('style', 'visibility: visible; overflow: hidden; width: 100%; height: 100%; max-height: 245px;');
	iel.setAttribute('scrolling', 'no');

	insertAfter(script, iel);
})();