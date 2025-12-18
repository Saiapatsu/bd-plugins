/**
 * @name Goto
 * @description Press Ctrl-G to navigate to the message link or date in the clipboard
 * @version 0
 * @author Wist
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/Goto.plugin.js
 */

const readClipboard = DiscordNative.clipboard.read;
const [
	{uL: transitionTo}, // Navigator
	{getChannel, hasChannel, getChannelIds},
	{getGuild},
	{getReadStatesByChannel},
] = BdApi.Webpack.getBulk(...[
	BdApi.Webpack.Filters.byKeys("At", "DB", "DR", "Wf", "XU", "dL", "eH", "m1", "op", "s1", "uL", "uv"), // ["transitionTo", "transitionToGuild", "back", "forward", "getHistory"],
	BdApi.Webpack.Filters.byStoreName("ChannelStore"), // ["getChannel", "hasChannel"],
	BdApi.Webpack.Filters.byStoreName("GuildStore"),
	BdApi.Webpack.Filters.byStoreName("ReadStateStore"), // ["getReadStatesByChannel", "getMentionCount"],
].map(x => ({filter: x})));

/*
copy(Object.entries(BdApi.Webpack.getByKeys("At", "DB", "DR", "Wf", "XU", "dL", "eH", "m1", "op", "s1", "uL", "uv")).map(([k, v]) => k + ": " + v.toString()).join("\n\n"))

At: function S(){return i}

DB: function C(){return h}

DR: function T(){return a}

Wf: function N(e){if(null==e){var t;e=null!=(t=r.location.pathname)?t:""}if(e.startsWith(u.Z5c.LOGIN))return u.Usc.LOGIN;if(e.startsWith(u.Z5c.REGISTER))return u.Usc.REGISTER;if(e.startsWith(u.Z5c.INVITE("")))return u.Usc.INVITE;if(e.startsWith(u.Z5c.VERIFY))return u.Usc.VERIFY;if(e.startsWith(u.Z5c.DISABLE_EMAIL_NOTIFICATIONS))return u.Usc.DISABLE_EMAIL_NOTIFICATIONS;else if(e.startsWith(u.Z5c.DISABLE_SERVER_HIGHLIGHT_NOTIFICATIONS))return u.Usc.DISABLE_SERVER_HIGHLIGHT_NOTIFICATIONS;else if(e.startsWith(u.Z5c.REJECT_IP))return u.Usc.REJECT_IP;else if(e.startsWith(u.Z5c.REJECT_MFA))return u.Usc.REJECT_MFA;else if(e.startsWith(u.Z5c.AUTHORIZE_IP))return u.Usc.AUTHORIZE_IP;else if(e.startsWith(u.Z5c.AUTHORIZE_PAYMENT))return u.Usc.AUTHORIZE_PAYMENT;else if(e.startsWith(u.Z5c.RESET))return u.Usc.RESET;else if(e.startsWith(u.Z5c.REPORT))return u.Usc.REPORT;else if(e.startsWith(u.Z5c.REPORT_SECOND_LOOK))return u.Usc.REPORT_SECOND_LOOK;else if(e.startsWith(u.Z5c.ACCOUNT_REVERT("")))return u.Usc.ACCOUNT_REVERT;return e}

XU: function y(e,t,n,r){_.log("transitionToGuild - Transitioning to ".concat(JSON.stringify({guildId:e,channelId:t,messageId:n}))),b(u.Z5c.CHANNEL(e,t,n),r)}

dL: function v(e,t,n){E(e,"replace")||(_.log("Replacing route with ".concat(e)),"string"==typeof e?r.replace(e,t):r.replace(e),i=n)}

eH: function R(){g()&&(i=null,r.goForward())}

m1: function A(e){if(null==e){var t;e=null!=(t=r.location.pathname)?t:""}return!e.startsWith(u.Z5c.HANDOFF)}

op: function P(){g()&&(i=null,r.goBack())}

s1: function I(){return r}

uL: function b(e,t){if(E(e,"assign"))return;_.log("transitionTo - Transitioning to ".concat(e));let n=null==t?void 0:t.source;null==t||delete t.source;let o=null==t?void 0:t.sourceLocationStack;if(null==t||delete t.sourceLocationStack,null==t)r.push(e);else{let n=new URL(e,"https:".concat(window.GLOBAL_ENV.WEBAPP_ENDPOINT));r.push(f({pathname:n.pathname,search:n.search,hash:n.hash},t))}i=n,a=o}

uv: function O(){return null!=i&&c.H.has(i)}

function S(e, t, n, o) {
	!h(e, "assign") && (c.log("transitionTo - Transitioning to ".concat(e)),
	null != n && (null == t ? t = {
		source: n
	} : t.source = n),
	null == t ? i.push(e) : i.push({
		pathname: e,
		...t
	}),
	r = n,
	s = o)
}
*/

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

// A decoder errors or returns false or string[message?, channel?, server?]
const decoders = [
	// titled link
	"titler", str => {
		const url = new URL(str);
		const params = new URLSearchParams(url.hash.slice(1));
		if (params.get("origin") !== "discord") return;
		return [params.get("messageid"), params.get("channelid"), params.get("serverid")];
	},
	"timestamp", str => {
		str = Number(/^\d+/.exec(str)[0]);
		// Time must be between Discord epoch and now, also auto-detect sec/msec
		return [str
			&& (str >= 1420070400    && str < Date.now() / 1000) ? msecToSnowflake(str * 1000)
			:  (str >= 1420070400000 && str < Date.now()        && msecToSnowflake(str       ))]
	},
	"*server", str => [null, null, getGuild(str.match(/^\*(\d+)/)[1]).id], // arbitrary channel
	"#channel", str => [null, getChannel(str.match(/^#(\d+)/)[1]).id],
	"attachment", str => str.match(/\/attachments\/(\d+)\/(\d+)\//).slice(1).reverse(),
	"YYYYMMDDHHMMSS", str => [regexToSnowflake(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\b/.exec(str))],
	"YYYY-MM-DD HH:MM:SS", str => [regexToSnowflake(/^(\d\d\d\d)[-_ ]?(\d\d)[-_ ]?(\d\d)[-_ ]?(\d\d)[-_: ]?(\d\d)[-_: ]?(\d\d)\b/.exec(str))],
	"channel message", str => str.match(/^(\d+) (\d+)/).slice(1).reverse().filter(Boolean),
	"message url", str => str.match(/(@me|\d+)\/(\d+)\/(\d+)/).slice(1).reverse().filter(Boolean),
	"snowflake", str => [str.match(/^(\d+)/)[1]],
];

// returns falsy or array
function verify(value) {
	return value && (value[0] === null || value[0]) && value;
}

// returns array [message, channel, server]
function decode(str) {
	let value;
	for (var i = 0; i < decoders.length; i+=2) {
		const f = decoders[i+1];
		try {
			if (value = verify(f(str)))
				return [decoders[i], ...value];
		} catch (e) {}
	}
	return [];
}

function listener(e) {
	if (e.keyCode == 71 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+G
		// Go to message in clipboard
		e.preventDefault();
		e.stopImmediatePropagation();
		
		const str = readClipboard().trim();
		
		const [, thisserver, thischannel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
		
		let [decoder, message, channel, server] = decode(str);
		
		if (decoder === undefined)
			return BdApi.UI.showToast("Incomprehensible\n" + str, {type: "warning"});
		
		if (message)
			channel = channel || thischannel;
		
		if (channel)
			server = getChannel(channel)?.guild_id || server || thisserver;
		
		if (server && !channel) {
			channel = getChannelIds(server)[0];
		}
		
		if (server !== "@me" && channel && !hasChannel(channel)) {
			const rope = [
				"server " + server,
				"channel " + channel,
				"message " + message,
				str,
			];
			return BdApi.UI.showToast(decoder + ": Unknown channel\n" + rope.join("\n"), {type: "warning"});
		}
		
		BdApi.UI.showToast(decoder + ": " + str);
		transitionTo("/" + ["channels", server, channel, message].filter(Boolean).join("/"));
		
	} else if (e.keyCode == 33 && e.ctrlKey && e.shiftKey && !e.altKey) { // Ctrl+Shift+PageUp
		// Go to beginning of channel
		e.preventDefault();
		e.stopImmediatePropagation();
		const [, server, channel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
		transitionTo(`/channels/${server}/${channel}/0`);
		
	} else if (e.keyCode == 33 && !e.ctrlKey && e.shiftKey && e.altKey) { // Alt+Shift+PageUp
		// Go to last unread/acked message, this was added because the built-in
		// keybind for this often refuses to work. Aha, it's because
		// getOldestUnreadMessageId respects e.canTrackUnreads. I can't find the
		// module with that method, otherwise I'd make a plugin to dummy it out
		e.preventDefault();
		e.stopImmediatePropagation();
		
		// TODO use the correct method to get current channel
		const [, server, channel] = document.location.pathname.match(/\/channels\/([^\/]+)\/([^\/]+)/) || [];
		if (!channel) return BdApi.UI.showToast("Could not identify current channel", {type: "warning"});
		
		const state = getReadStatesByChannel()[channel];
		const message = state?.ackMessageId;
		if (message) {
			transitionTo(`/channels/${server}/${channel}/${message}`);
		} else {
			BdApi.UI.showToast("Could not get oldest unread message, going to 0", {type: "warning"});
			transitionTo(`/channels/${server}/${channel}/0`);
		}
	}
}

module.exports = class Goto {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> document.body.removeEventListener("keydown", listener, true);
}
