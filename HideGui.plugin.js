/**
 * @name HideGui
 * @description Hides everything but the chat scroller
 * @version 0
 * @author Wist
 * @authorId 164843244230934529
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/HideGui.plugin.js
 */

const [
	{title, form, content},
	{sidebar, guilds},
	{titleBar},
	{buttonContainer},
	{scroller}
] = BdApi.Webpack.getBulk(...[
	["title", "form", "content"], // channel title bar, text input form and chat container
	["sidebar", "guilds", "panels", "content"], // channels sidebar, guilds sidebar
	["titleBar", "wordmark"], // top title bar
	["buttonContainer", "username"], // message buttons
	["scroller", "messages"], // messages scroller
].map(x => ({filter: BdApi.Webpack.Filters.byProps(...x)})))
// todo: fail more gracefully when any of these go missing

const css = `
.${title},
.${form},
.${sidebar},
.${guilds},
.${titleBar},
.${buttonContainer} {
	display: none;
	
} .${scroller} {
	right: -20px !important;
	
} .${content}::before {
	height: 0 !important;
}
`;

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

var hidden = false;

function hide() {
	hidden = true;
	BdApi.DOM.addStyle("HideGui", css);
}

function show() {
	hidden = false;
	BdApi.DOM.removeStyle("HideGui", css);
}

function listener(e) {
	if (e.keyCode == 72 && e.ctrlKey && e.shiftKey && !e.altKey) { // Ctrl+Shift+H
		e.preventDefault();
		e.stopImmediatePropagation();
		hidden ? show() : hide();
	}
}

module.exports = class HideGui {
	start =()=> document.body.   addEventListener("keydown", listener, true);
	stop  =()=> {
		document.body.removeEventListener("keydown", listener, true);
		hidden && show();
	}
};
