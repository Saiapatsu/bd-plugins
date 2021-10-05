/**
 * @name Goto
 * @description Press Ctrl-G to navigate to the message link or date in the clipboard
 * @version 0
 * @author Wist
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/Goto.plugin.js
 */

const {readText} = require("electron").clipboard;
const {transitionTo} = BdApi.findModuleByProps('transitionTo'); // this gets the navigator module, which contains transitionTo
const {showToast} = BdApi;

function fixdate(arr) {
	arr[1]--;
	return arr;
}

function msecToSnowflake(num) {
	return BigInt(num - 1420070400000) << 22n // 22n is BigInt(22)
}

function arrayOk(arr) {
	return arr.length && arr
}

// a decoder returns either false or a string[] message, channel?, server?
const decoders = [
	// a local date like 20211005113153
	str => /^\d{14}$/.test(str) && [msecToSnowflake(new Date(...fixdate(/(....)(..)(..)(..)(..)(..)/.exec(str).slice(1))).getTime())],
	// discord message url or just message id. never returns false
	str => arrayOk(str.match(/(@me|\d*?)\/?(\d*?)\/?(\d*)$/).slice(1).reverse().filter(Boolean)),
];

function decode(str) {
	for (const f of decoders)
		// try {
			if (f(str))
				return f(str);
		// } catch (e) {}
}

module.exports = class Goto {
	start =()=> document.body.   addEventListener("keydown", this.listener, true);
	stop  =()=> document.body.removeEventListener("keydown", this.listener, true);
	
	listener =e=> {
		if (e.keyCode == 71 && e.ctrlKey && !e.shiftKey && !e.altKey) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const str = readText()
			const [, thisserver, thischannel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
			const [message, channel = thischannel, server = thisserver] = decode(str);
			if      (!message)            return showToast("Incomprehensible", {type: "warning"});
			else if (!server || !channel) return showToast("Unknown server or channel", {type: "warning"});
			showToast(str);
			transitionTo(`/channels/${server}/${channel}/${message}`);
		}
	}
}
