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
	{getUser: fetchUser},
] = BdApi.Webpack.getBulk(...[
	["getGuildId", "getLastSelectedGuildId"],
	["openUserProfileModal", "closeUserProfileModal"], // IT'S BACK
	["getUser", "fetchProfile", "fetchCurrentUser", "acceptAgreements"],
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})));

function listener(e) {
	if (e.keyCode == 80 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+P
		e.preventDefault();
		e.stopImmediatePropagation();
		const clip = readClipboard();
		const match = clip.match(/^\s*(\d+)\s*$/);
		if (!match) return BdApi.UI.showToast("Clipboard is not a user ID", {type: "warning"});
		const str = match[1];
		const guildId = getGuildId() || "0";
		BdApi.UI.showToast(str);
		fetchUser(str)
			.then(user => openUserProfileModal({
				userId: str,
				guildId: guildId,
			}))
			.catch(res => BdApi.UI.showToast(res.text + "\n(This user might not exist)", {type: "warning"}));
	}
}

module.exports = class OpenUserModal {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> document.body.removeEventListener("keydown", listener, true);
}
