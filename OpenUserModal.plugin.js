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
] = BdApi.Webpack.getBulk(...[
	["getGuildId", "getLastSelectedGuildId"],
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})));
// const {getGuildId} = BdApi.findModuleByProps("getLastSelectedGuildId");
// const {openUserProfileModal} = BdApi.findModuleByProps("openUserProfileModal");
// const {getUser} = BdApi.findModuleByProps("getUser");

const getUserProfileUtils = () => window?.BDFDBInternal?.LibraryModules?.UserProfileUtils;

// openUserProfileModal isn't even in BDFDB, can't think of what it could have
// possibly been renamed to
// unlike ol' reliable GetUser or the thing that returns the user profile as JSON
// Oh good, the user profile modal sucks solid logs of shit anyway - gotta roll my own

function listener(e) {
	if (e.keyCode == 80 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+P
		const UserProfileUtils = getUserProfileUtils();
		if (!UserProfileUtils) {
			BdApi.UI.showToast("BDFDB isn't hijacked, unable to getUserProfileUtils");
			return;
		}
		e.preventDefault();
		e.stopImmediatePropagation();
		const clip = readClipboard();
		const match = clip.match(/^\s*(\d+)\s*$/);
		if (!match) return BdApi.UI.showToast("Clipboard is not a user ID", {type: "warning"});
		const str = match[1];
		const guildId = getGuildId() || "0";
		BdApi.UI.showToast(str);
		UserProfileUtils.getUser(str)
			.then(user => UserProfileUtils.openUserProfileModal({
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
