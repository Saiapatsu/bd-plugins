/**
 * @name OpenUserModal
 * @description Press Ctrl-P to open the user modal of the user ID in the clipboard
 * @version 0
 * @author Wist
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/OpenUserModal.plugin.js
 */

const readClipboard = DiscordNative.clipboard.read;
const [
	{getGuildId},
	{openUserProfileModal},
	{PR: fetchUser}, // {getUser: fetchUser},
] = BdApi.Webpack.getBulk(...[
	["getGuildId", "getLastSelectedGuildId"],
	["openUserProfileModal", "closeUserProfileModal"], // IT'S BACK
	["In", "Lr", "PR", "k", "mB"], // ["getUser", "fetchProfile", "fetchCurrentUser", "acceptAgreements"],
].map(x => ({filter: BdApi.Webpack.Filters.byKeys(...x)})));

const copyClipboard = DiscordNative.clipboard.copy;
const MessageStore = BdApi.Webpack.getStore("MessageStore");

function tryMessage(match) {
	if (!match) return;
	const [, gid, cid, mid] = match
	const message = MessageStore.getMessage(cid, mid)
	if (message) {
		copyClipboard(message.content + "\n" + JSON.stringify(message));
		BdApi.UI.showToast(cid + "/" + mid + "\nCopied");
	} else {
		BdApi.UI.showToast(cid + "/" + mid + "\nCan't find this message", {type: "warning"});
	}
	return true;
}

function tryUser(match) {
	if (!match) return;
	const str = match[1];
	const guildId = getGuildId() || "0";
	BdApi.UI.showToast(str);
	fetchUser(str)
		.then(user => openUserProfileModal({
			userId: str,
			guildId: guildId,
		}))
		.catch(res => BdApi.UI.showToast(res.text + "\n(This user might not exist)", {type: "warning"}));
	return true;
}

function listener(e) {
	if (e.keyCode == 80 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+P
		e.preventDefault();
		e.stopImmediatePropagation();
		const clip = readClipboard();
		if (tryUser(clip.match(/^\s*(\d+)\s*$/)))
			return;
		if (tryMessage(clip.match(/^\s*https:\/\/discord.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)\s*$/)))
			return;
		return BdApi.UI.showToast("Clipboard is not a user ID or message URL", {type: "warning"});
	}
}

module.exports = class OpenUserModal {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> document.body.removeEventListener("keydown", listener, true);
}
