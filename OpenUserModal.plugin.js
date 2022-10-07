/**
 * @name OpenUserModal
 * @description Press Ctrl-P to open the user modal of the user ID in the clipboard
 * @version 0
 * @author Wist
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/OpenUserModal.plugin.js
 */

const readClipboard = DiscordNative.clipboard.read;
const {showToast} = BdApi;
const {getGuildId} = BdApi.findModuleByProps("getLastSelectedGuildId");
// const {openUserProfileModal} = BdApi.findModuleByProps("openUserProfileModal");
const {getUser} = BdApi.findModuleByProps("getUser");
openUserProfileModal = () => showToast("bloop!");

function listener(e) {
	if (e.keyCode == 80 && e.ctrlKey && !e.shiftKey && !e.altKey) { // Ctrl+P
		showToast("getUser is broken!!!");
		if (1) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		const clip = readClipboard();
		const match = clip.match(/^\s*(\d)\s*$/);
		if (!match) return showToast("Clipboard is not a user ID", {type: "warning"});
		const str = match[1];
		const guildId = getGuildId() || "0";
		showToast(str);
		getUser(str)
			.then(user => openUserProfileModal({
				userId: str,
				guildId: guildId,
			}))
			.catch(res => showToast(res.text + "\n(This user might not exist)", {type: "warning"}));
	}
}

module.exports = class OpenUserModal {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> document.body.removeEventListener("keydown", listener, true);
}
