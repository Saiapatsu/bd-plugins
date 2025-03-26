/**
 * @name HideGui
 * @description Hides everything but the chat scroller
 * @version 0
 * @author Wist
 * @authorId 164843244230934529
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/HideGui.plugin.js
 */

// todo: fail more gracefully when any of these go missing
// example to get the module with a class:
// BdApi.findAllModules(x => x.form == "form__13a2c")

const [
	{form, chat}, // message input form, chat scroller wrapper
	{bar}, // title bar/window chrome
	{sidebar, guilds}, // channels sidebar, guilds sidebar
	{buttonContainer, timestampVisibleOnHover}, // hover action buttons
	{jumpToPresentBar}, // jump to old/new messages bars
	{scroller}, // messages scroller, used to hide scrollbar
	{content, subtitleContainer}, // channel chat content, channel title bar
] = BdApi.Webpack.getBulk(...[
	["form", "content", "chat"],
	["bar", "systemBar"],
	["sidebar", "guilds", "panels", "content"],
	["buttonContainer", "timestampVisibleOnHover", "zalgo"],
	["jumpToPresentBar"],
	["scroller", "empty", "messagesWrapper"],
	["subtitleContainer", "content", "title", "uploadArea", "chatContent", "avatar"], // Parent of main.chatContent
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})))

// bgdarBase is from newMessagesBar
const css =`
.bgdarBase,
.${form},
.${bar},
.${subtitleContainer},
.${sidebar},
.${guilds},
.${buttonContainer},
.${timestampVisibleOnHover},
.${jumpToPresentBar.slice(-14)} {
	display: none !important;
	
}.${content}::before {
	content: unset;
	
}.${chat} {
	border-top: unset !important;
	
} .${scroller} {
	right: -20px !important;
	
}`;

console.log(css);

/*
2025-03-26
.bgdarBase,
.form_f75fb0,
.bar_c38106,
.subtitleContainer_f75fb0,
.sidebar_c48ade,
.guilds_c48ade,
.buttonContainer_c19a55,
.timestampVisibleOnHover_c19a55,
.barBase__0f481 {
	display: none !important;
	
}.content_f75fb0::before {
	content: unset;
	
}.chat_f75fb0 {
	border-top: unset !important;
	
} .scroller__36d07 {
	right: -20px !important;
}
*/

var active = false;

function activate() {
	active = true;
	BdApi.DOM.addStyle("HideGui", css);
}

function deactivate() {
	active = false;
	BdApi.DOM.removeStyle("HideGui", css);
}

function listener(e) {
	if (e.keyCode == 72 && e.ctrlKey && e.shiftKey && !e.altKey) { // Ctrl+Shift+H
		e.preventDefault();
		e.stopImmediatePropagation();
		active ? deactivate() : activate();
	}
}

module.exports = class HideGui {
	start =()=> { document.body   .addEventListener("keydown", listener, true); }
	stop  =()=> { document.body.removeEventListener("keydown", listener, true); active && deactivate(); }
};
