/**
 * @name RemovalLog
 * @description Logs and notifies removed guilds
 * @version 0
 * @author Wist
 * @authorId 164843244230934529
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/RemovalLog.plugin.js
 */

/*

todo:

log removed friends

act immediately when a guild/friend removal event is dispatched

*/

const [
	{getGuilds},
	{defaultColor: classDefaultColor},
] = BdApi.Webpack.getBulk(...[
	["getGuilds", "getGuild", "getGuildCount"],
	["defaultColor"],
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})));

// const modUserFetch = BdApi.findModuleByProps("getUser", "fetchProfile");
// const classDefaultColor = BdApi.findModuleByProps("defaultColor").defaultColor;

var currCheck;

const units = [
	["year"  , 31536000000, 63072000000], // 24 months
	["month" ,  2628000000, 10512000000], // 4 months
	["week"  ,   604800000,  2678400000], // 31 days
	["day"   ,    86400000,   129600000], // 36 hours
	["hour"  ,     3600000,     3600000],
	["minute",       60000,       60000],
	["second",        1000,        1000],
];
function reltime(elapsed) {
	for (const [unit, amount, threshold] of units)
		if (elapsed >= threshold)
			return `${Math.floor(elapsed / amount)} ${unit}${elapsed >= amount + amount ? "s" : ""} ago`;
	return `just now`;
} // snippet 2C414C3F3F384D64407B396D4B5D7176

/*
// escape HTML text and attributes (with some redundancy)
const escapes = {
	'"': "&quot;",
	"'": "&apos;",
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};
function escape(str) {
	return str.replace(/["&<>]/g, x => escapes[x]);
} // snippet 3B292732384D522A6262742D47617560
*/

function pad2(num) {
	return String(num).padStart(2, "0");
}
function formatDate(date) {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDay())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}
function field(content) {
	return BdApi.React.createElement("b", {contenteditable: "true", spellcheck: "false"}, content);
}
function tr(...content) {
	return BdApi.React.createElement("tr", null, content);
}
function td(...content) {
	return BdApi.React.createElement("td", null, content);
}

function guildsRemoved(guilds) {
	// console.log(guilds);
	// guilds.forEach(guild => BdApi.showToast("Removed from guild " + guild.name));
	// return guilds.map(({id, icon, joinedAt, name, owner}) => [
	return guilds.map(({id, icon, joinedAt, name, ownerId}) => [
		BdApi.React.createElement("hr"),
		BdApi.React.createElement("table", null, [
			tr(td(
				BdApi.React.createElement("img", {
					src: `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=80`,
					width: 48, height: 48,
				}),
				// BdApi.React.createElement("img", {
					// src: `https://cdn.discordapp.com/avatars/${owner.id}/${owner.avatar}.webp?size=56`,
					// width: 48, height: 48,
				// }),
			), td(field(name))),
			// tr(td(`Owner`), td(field(owner.tag))),
			tr(td(`Guild ID`), td(field(id))),
			// tr(td(`Owner ID`), td(field(owner.id))),
			tr(td(`Owner ID`), td(field(ownerId))),
			// HACK 20240205081607 joinedat will be null in preview servers
			tr(td(`Joined`), td(field(joinedAt ? formatDate(new Date(joinedAt)) : "PREVIEW"))),
		])
	]);
}

function saveGuild({id, icon, joinedAt, name, ownerId}) {
	return {id, icon, joinedAt: (joinedAt ? joinedAt.valueOf() : null), name, ownerId};
}

function check() {
	const currGuilds = getGuilds(); // Object, not array
	const lastGuilds = BdApi.Data.load("RemovalLogCache", "lastGuilds") || [];
	const removed = [];
	
	currCheck = Date.now();
	const lastCheck = BdApi.Data.load("RemovalLogTime", "lastCheck") || currCheck;
	BdApi.Data.save("RemovalLogTime", "lastCheck", currCheck);
	
	let changed = false;
	
	lastGuilds.forEach(last => {
		const curr = currGuilds[last.id];
		if (curr) {
			if (curr.icon !== last.icon) return changed = true;
			if (curr.name !== last.name) return changed = true;
			if (curr.ownerId !== last.ownerId) return changed = true;
		} else {
			changed = true;
			removed.push(last);
		}
	});
	
	if (changed) {
		BdApi.UI.showToast("RemovalLog: a guild changed");
		BdApi.Data.save("RemovalLogCache", "lastGuilds", Object.values(currGuilds).map(saveGuild));
	} else {
		// BdApi.UI.showToast("RemovalLog: no changes");
		return;
	}
	
	// display removed guilds
	if (removed.length) {
		// save time range in which the removal happened
		removed.forEach(x => {x.minDate = lastCheck; x.maxDate = currCheck});
		
		// add removed guilds to log
		const logRemoved = BdApi.Data.load("RemovalLogOut", "logRemoved") || [];
		BdApi.Data.save("RemovalLogOut", "logRemoved", logRemoved.concat(removed));
		
		// render removed guilds and friends into React elements
		/*
		Promise.all([
			// map each removed guild to a shallow clone that has an owner user object, then render them
			Promise.all(removed.map(guild => modUserFetch.getUser(guild.ownerId).then(user => Object.assign({owner: user}, guild)))).then(guildsRemoved),
			// promise.all(friends).then(friendsRemoved),
		])
		*/
		new Promise(resolve => resolve(guildsRemoved(removed)))
		// append a conclusion and display as a BdApi alert
		.then(stuff => BdApi.UI.alert(
			"Removed from guilds",
			BdApi.React.createElement("div", {class: classDefaultColor}, stuff.concat([
				BdApi.React.createElement("hr"),
				BdApi.React.createElement("p", null, `Last checked ${reltime(currCheck - lastCheck)}`),
			]))
		))
		.catch(e => {
			BdApi.UI.showToast("RemovalLog Promise.all failed");
			console.error(e);
		});
	}
	// const t0 = performance.now();
	// BdApi.showToast("Checked left guilds in " + Math.floor(performance.now() - t0) + "ms");
	// console.log("checked");
}

const minInterval = 1 * 60000;
const maxInterval = 30 * 60000;
module.exports = class RemovalLog {
	start() {
		this.interval = setInterval(check, maxInterval);
		check();
	}
	
	stop() {
		clearInterval(this.interval);
	}
	
	onSwitch() {
		// check more often when there's obvious user activity
		if (Date.now() - currCheck >= minInterval) {
			clearInterval(this.interval);
			this.interval = setInterval(check, maxInterval);
			check();
		}
	}
};
