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

const modGuilds = BdApi.findModuleByProps("getGuilds", "getGuild", "getGuildCount");
const modUserFetch = BdApi.findModuleByProps("getUser", "fetchProfile");
const classDefaultColor = BdApi.findModuleByProps("defaultColor").defaultColor;

var now;

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
	return guilds.map(({id, icon, joinedAt, name, owner}) => [
		BdApi.React.createElement("hr"),
		BdApi.React.createElement("table", null, [
			tr(td(
				BdApi.React.createElement("img", {
					src: `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=80`,
					width: 48, height: 48,
				}),
				BdApi.React.createElement("img", {
					src: `https://cdn.discordapp.com/avatars/${owner.id}/${owner.avatar}.webp?size=56`,
					width: 48, height: 48,
				}),
			), td(field(name))),
			tr(td(`Owner`), td(field(owner.tag))),
			tr(td(`Guild ID`), td(field(id))),
			tr(td(`Owner ID`), td(field(owner.id))),
			tr(td(`Joined`), td(field(formatDate(new Date(joinedAt))))),
		])
	]);
}

function saveGuild({id, icon, joinedAt, name, ownerId}) {
	return {id, icon, joinedAt: joinedAt.valueOf(), name, ownerId};
}

function check() {
	// it's probably faster to sort guilds and iterate over both arrays to get a diff
	const guilds = Object.values(modGuilds.getGuilds());
	const lastGuilds = BdApi.loadData("RemovalLog", "lastGuilds") || [];
	now = Date.now(); // global because that's the easy way
	const then = BdApi.loadData("RemovalLog", "lastCheckTime") || now;
	const removed = [];
	
	// find all guilds that aren't in current guild list, but are in last guild list
	// const aaa = [guilds.pop(), guilds.pop()]; // testing
	const setGuilds = new Set(guilds.map(x => x.id));
	// guilds.push(aaa.pop()); guilds.push(aaa.pop());
	lastGuilds.forEach(guild => !setGuilds.has(guild.id) && removed.push(guild));
	
	// update last seen guild list. has to be done every time
	// to account for guild additions, name changes etc.
	BdApi.saveData("RemovalLog", "lastGuilds", guilds.map(saveGuild));
	BdApi.saveData("RemovalLog", "lastCheckTime", now);
	
	// display removed guilds
	if (removed.length) {
		// save time range in which the removal happened
		removed.forEach(x => {x.minDate = then; x.maxDate = now});
		
		// add removed guilds to log
		const logRemoved = BdApi.loadData("RemovalLog", "logRemoved") || [];
		BdApi.saveData("RemovalLog", "logRemoved", logRemoved.concat(removed));
		
		// render removed guilds and friends into React elements
		Promise.all([
			// map each removed guild to a shallow clone that has an owner user object, then render them
			Promise.all(removed.map(guild => modUserFetch.getUser(guild.ownerId).then(user => Object.assign({owner: user}, guild)))).then(guildsRemoved),
			// promise.all(friends).then(friendsRemoved),
		])
		// append a conclusion and display as a BdApi alert
		.then(stuff => BdApi.alert(
			"Removed from guilds",
			BdApi.React.createElement("div", {class: classDefaultColor}, stuff.concat([
				BdApi.React.createElement("hr"),
				BdApi.React.createElement("p", null, `Last checked ${reltime(now - then)}`),
			]))
		));
	}
	// const t0 = performance.now();
	// BdApi.showToast("Checked left guilds in " + Math.floor(performance.now() - t0) + "ms");
	// console.log("checked");
}

const minInterval = 5 * 60000;
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
		if (Date.now() - now >= minInterval) {
			clearInterval(this.interval);
			this.interval = setInterval(check, maxInterval);
			check();
		}
	}
};
