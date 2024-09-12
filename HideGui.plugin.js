/**
 * @name HideGui
 * @description Hides everything but the chat scroller
 * @version 0
 * @author Wist
 * @authorId 164843244230934529
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/HideGui.plugin.js
 */

const [
	{form}, // message input form
	{typeWindows}, // top bar/window chrome
	{sidebar, guilds}, // channels sidebar, guilds sidebar
	{buttonContainer, timestampVisibleOnHover}, // hover action buttons
	{jumpToPresentBar}, // jump to old/new messages bars
	{scroller}, // messages scroller, used to hide scrollbar
	{content, subtitleContainer}, // channel chat content, channel title bar
] = BdApi.Webpack.getBulk(...[
	["form", "content", "chat"],
	["typeWindows"],
	["sidebar", "guilds", "panels", "content"],
	["buttonContainer", "timestampVisibleOnHover", "zalgo"],
	["jumpToPresentBar"],
	["scroller", "empty", "messagesWrapper"],
	["subtitleContainer", "content", "title", "uploadArea", "chatContent", "avatar"], // Parent of main.chatContent
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})))

/*
.${titleBar},
.${content}::before,
*/ const css =`
.${form},
.${typeWindows.slice(0, 18)},
.${subtitleContainer},
.${sidebar},
.${guilds},
.${buttonContainer},
.${timestampVisibleOnHover},
.${jumpToPresentBar.slice(-14)} {
	display: none;
	
}.${content}::before {
	content: unset;
	
} .${scroller} {
	/* hide scrollbar */
	right: -20px !important;
	
}`;

console.log(css);

// todo: fail more gracefully when any of these go missing
// example to get the module with a class:
// BdApi.findAllModules(x => x.form == "form__13a2c")

/*
2024-06-25
form_a7d72e
typeWindows_a934d8
*/

/*
2022-10-24
sidebar-1tnWFu
wrapper-1_HaEi guilds-2JjMmN
title-31SJ6t container-ZMc96U themed-Hp1KC_
form-3gdLxP
typeWindows-2-g3UY withFrame-2dL45i titleBar-1it3bQ horizontalReverse-2QssvL flex-3BkGQD directionRowReverse-HZatnx justifyStart-2Mwniq alignStretch-Uwowzr
buttonContainer-1502pf
scroller-kQBbkU auto-2K3UW5 scrollerBase-_bVAAt disableScrollAnchor-6TwzvM managedReactiveScroller-1lEEh3
	right: -20px;
content-1jQy2l::before
	height: 0;
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
