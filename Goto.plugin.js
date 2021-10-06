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

function msecToSnowflake(num) {
	return BigInt(num - 1420070400000) << 22n // 22n is BigInt(22)
}

function regexToSnowflake(arr) {
	if (!arr) return;
	arr = arr.slice(1);
	arr[1]--;
	return msecToSnowflake(new Date(...arr).getTime());
}

// returns false or array
function verify(value) {
	return value && (typeof value == "object" ? (value.length && value) : [value]);
}

// a decoder returns either false, empty array or a string[] message, channel?, server?
const decoders = [
	// #channel date
	// todo: str => str.startsWith(/\s*#/) && find channel, return [decode(rest)[0], channel, server]
	// YYYYMMDDHHMMSS
	str => regexToSnowflake(/^\s*(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\s*$/.exec(str)),
	// YYYY-MM-DD HH:MM:SS
	str => regexToSnowflake(/^\s*(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\s*$/.exec(str)),
	// discord message url or just message id
	str => /(@me|\d*?)\/?(\d*?)\/?(\d*)$/.exec(str).slice(1).reverse().filter(Boolean),
];

function decode(str) {
	let value;
	for (var f of decoders)
		if (value = verify(f(str)))
			return value;
	return [];
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
