/**
 * @name Goto
 * @source https://github.com/Saiapatsu/bd-plugins/raw/master/Goto.plugin.js
 */

const {readText} = require("electron").clipboard;
const {transitionTo} = BdApi.findModuleByProps('transitionTo'); // this gets the navigator module, which contains transitionTo
const {showToast} = BdApi;

module.exports = class Goto {
	getName        =()=> "Goto"
	getDescription =()=> "Press Ctrl-G to navigate to the message link in the clipboard"
	getVersion     =()=> "0"
	getAuthor      =()=> "Wist"
	
	load  =()=> {}
	start =()=> document.body.   addEventListener("keydown", this.listener, true);
	stop  =()=> document.body.removeEventListener("keydown", this.listener, true);
	
	listener =e=> {
		if ((e.keyCode << 3 | e.ctrlKey << 2 | e.shiftKey << 1 | e.altKey) == 572) { // 71 (g), true, false, false
			e.preventDefault();
			e.stopImmediatePropagation();
			const text = readText()
			const [, thisserver, thischannel] = document.location.pathname.match(/\/channels\/(\d+)\/(\d+)/) || [];
			const [, server, channel, message] = text.match(/(\d*?)\/?(\d*?)\/?(\d*)$/);
			if (!(server || thisserver) || !(channel || thischannel)) {
				showToast("Nope", {type: "warning"});
				return;
			}
			showToast(text);
			transitionTo(`/channels/${server || thisserver}/${channel || thischannel}/${message || 0}`);
		}
	}
}
