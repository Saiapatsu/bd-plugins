/**
 * @name MarkAbsentMembers
 * @description Adds a strikethrough to names of users who aren't in the guild, also shows username and discriminator (kitchen-sink plugin)
 * @version 0
 * @author Wist
 * @authorId 164843244230934529
 * @source https://github.com/Saiapatsu/bd-plugins/blob/master/MarkAbsentMembers.plugin.js
*/

const [Plugin, BDFDB] = window.BDFDB_Global.PluginUtils.buildPlugin({
	"info": {
		"name": "MarkAbsentMembers",
		"author": "Wist",
		"version": "0",
		"description": "Hey DevilBro, make a BDFDB function to generate an info object from the stuff at the top of this script",
	},
	// "changeLog": {"fixed": {"Mentions": ""}},
});

// todo: cover more places where absent users may be mentioned,
// e.g. mentions, welcome messages (ESPECIALLY welcome messages)

// todo: invisible, but copyable <@id>
// todo: minimize array allocations, memoize. for a start, add the props _randomly_ to see the current caching behavior (if any)

const ChannelStore = BdApi.findModuleByProps("hasChannel");
// also contains getMember, which we actually isn't needed to learn whether a user is a member
const UserProfileStore = BdApi.findModuleByProps("getUserProfile", "getMutualGuilds");

module.exports = class MarkAbsentMembers extends Plugin {
	onLoad () {
		this.patchPriority = 9; // ad-hoc choice
		this.patchedModules = {
			after: {
				MessageUsername: "default",
			},
		};
	}
	
	onStart () {
		BdApi.injectCSS("MarkAbsentMembers",
`.absent {
	/* text-decoration: line-through dotted; */
} .absent::after {
	/* transparent line-through https://codepen.io/startages/pen/wzapwV */
	position: absolute;
	display: block;
	content: "";
	width: 100%;
	border-top: 2px solid white;
	left: 0;
	top: 50%;
	opacity:0.5;
} .gone {
	text-decoration: line-through;
} .usernamereal {
	color: var(--text-muted);
	font-weight: bold;
} .userdiscrim {
	color: var(--text-muted);
	font-size: 0.75rem; /* like the timestamp */
}`);
		BDFDB.PatchUtils.forceAllUpdates(this);
		BDFDB.MessageUtils.rerenderAll();
	}
	
	onStop () {
		BdApi.clearCSS("MarkAbsentMembers");
		BDFDB.PatchUtils.forceAllUpdates(this);
		BDFDB.MessageUtils.rerenderAll();
	}
	
	asdasdasd = {className: "usernamereal"};
	eqqwewqew = {className: "userdiscrim"};
	
	processMessageUsername(e) {
		const insprops = e.instance.props;
		if (insprops.message.webhookId) return; // webhooks aren't users
		
		const retprops = e.returnvalue.props
		const msgmember = insprops.author;
		const msgauthor = insprops.message.author;
		
		// add username and discrim
		retprops.children.push([
			// user's actual discord username
			msgauthor.username !== msgmember.nick
				? [
					" ", // padding
					BdApi.React.createElement("span", this.asdasdasd, msgauthor.username),
				]
				: undefined,
			
			// user's discriminator
			BdApi.React.createElement(
				"span",
				this.eqqwewqew,
				"#" + msgauthor.discriminator
			),
			
			// compensate for the timestamp's lack of leading whitespace (leaves no space when copying...)
			" ",
		]);
		
		const messageusername = retprops.children[1].props;
		
		// watch your step
		if (typeof messageusername.children !== "function") {
			console.log("MessageUsername children isn't a function");
			return;
		}
		
		if (
			!msgmember.hasOwnProperty("iconRoleId") && // this user isn't a member of the guild
			ChannelStore.getChannel(insprops.message.channel_id).getGuildId() // this message is in a guild (not a DM) (wrong way to do it, yes)
		) {
			// donkeypatch function
			// readers: there are many reasons why I do it like this,
			// chief of them being: I cba and it works, despite the `this`
			// potentially changing in bad ways
			this.children = messageusername.children;
			if (UserProfileStore.getUserProfile(msgauthor.id)?.profileFetchFailed) {
				// if the userprofile has failed to load, i.e. no contact possible
				messageusername.children = this.markGone;
			} else {
				// if the user profile loaded because there are mutual friends
				// or guilds, or if it has never been loaded in the first place
				messageusername.children = this.markAbsent;
			}
		}
	}
	
	// the arrow function makes `this` remain this class
	markAbsent = (instance) => {
		instance = this.children(instance);
		instance.props.className += " absent";
		return instance;
	}
	
	// the arrow function makes `this` remain this class
	markGone = (instance) => {
		instance = this.children(instance);
		instance.props.className += " gone";
		return instance;
	}
	
	// dead code waiting to be revived
	/*
	processUserMention (e) {
		const guildId = ChannelStore.getChannel(e.instance.props.channelId).getGuildId();
		if (!guildId) return;
		const userId = e.instance.props.userId;
		if (!getMember(guildId, userId))
			e.instance.props.className += " memberNotPresent";
	}
	*/
};
