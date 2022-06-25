/**
 * @name Goto
 * @description Press Ctrl-G to navigate to the message link or date in the clipboard
 * @version 0
 * @author Wist
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/Goto.plugin.js
 */

const {readText} = require("electron").clipboard;
const {transitionTo} = BdApi.findModuleByProps("transitionTo"); // this gets the navigator module, which contains transitionTo
const {getChannel, hasChannel} = BdApi.findModuleByProps("hasChannel");
const {showToast} = BdApi;

function msecToSnowflake(num) {
	return BigInt(num - 1420070400000) << 22n // 22n is BigInt(22);
	// return (num - 1420070400000) * 4194304;
}

// array [str, yyyy, mm, dd, hh, mm, ss] (from a regex) to snowflake
function regexToSnowflake(arr) {
	if (!arr) return;
	arr = arr.slice(1);
	arr[1]--;
	return msecToSnowflake(new Date(...arr).getTime());
}

// a decoder returns either false, empty array or a string[] message, channel?, server?
const decoders = [
	// attachment link
	str => str.match(/\/attachments\/(\d+)\/(\d+)\//).slice(1).reverse(),
	// YYYYMMDDHHMMSS
	str => regexToSnowflake(/^\s*(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\s*$/.exec(str)),
	// YYYY-MM-DD HH:MM:SS
	// str => regexToSnowflake(/^\s*(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\s*$/.exec(str)),
	str => regexToSnowflake(/^\s*(\d\d\d\d)[-_ ]?(\d\d)[-_ ]?(\d\d)[-_ ]?(\d\d)[-_: ]?(\d\d)[-_: ]?(\d\d)\s*$/.exec(str)),
	// Unix seconds or milliseconds timestamp between Discord epoch and now
	// collision with snowflakes won't be a concern within my lifetime
	str => {str = Number(/\s*(\d+)\s*/.exec(str)[1]);
		return str
			&& (str >= 1420070400    && str < Date.now() / 1000) ? msecToSnowflake(str * 1000)
			:  (str >= 1420070400000 && str < Date.now()        && msecToSnowflake(str       ))},
	// discord message url or just message id, tolerating a comment after a space
	str => str.match(/\S*/)[0].match(/(@me|\d*?)\/?(\d*?)\/?(\d*)$/).slice(1).reverse().filter(Boolean),
];

// returns false or array
function verify(value) {
	return value && (typeof value == "object" ? (value.length && value) : [value]);
}

// returns array [message, channel, server]
function decode(str) {
	let value;
	for (var f of decoders)
		try {
			if (value = verify(f(str)))
				return value;
		} catch (e) {}
	return [];
}

function listener(e) {
	if (e.keyCode == 71 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+G
		// Go to message in clipboard
		e.preventDefault();
		e.stopImmediatePropagation();
		const str = readText()
		const [, thisserver, thischannel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
		let [message, channel, server] = decode(str);
		if (!message) return showToast("Incomprehensible\n" + str, {type: "warning"});
		if (!Number(server) && channel) server = getChannel(channel)?.guild_id || server;
		channel = channel || thischannel;
		server = server || thisserver;
		if (!server || !channel) return showToast("Cannot resolve\n" + str, {type: "warning"});
		if (server !== "@me" && !hasChannel(channel)) return showToast("Unknown channel\n" + str, {type: "warning"});
		showToast(str);
		transitionTo(`/channels/${server}/${channel}/${message}`);
		
	} else if (e.keyCode == 33 && e.ctrlKey && e.shiftKey && !e.altKey) { // Ctrl+Shift+PageUp
		// Go to beginning of channel
		e.preventDefault();
		e.stopImmediatePropagation();
		const [, server, channel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
		transitionTo(`/channels/${server}/${channel}/0`);
	}
}

module.exports = class Goto {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> document.body.removeEventListener("keydown", listener, true);
}
