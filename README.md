# bd-plugins

This is a selection of my personal BetterDiscord plugins.

If you've found this and would like to use them, then you are expected to be clueful enough to read, understand and modify the source code and to get them to Work On Your Machine(tm).  
As such, the following blurbs are deliberately vague.

## Goto

Navigates to the message in the clipboard. Recognized formats:

* Attachment URL
* Message URL
* Message ID
* Unix timestamp/milliseconds since epoch
* Unix seconds since epoch
* YYYYMMDDHHMISS timestamp
* YYYY-MM-DD HH:MI:SS timestamp

Navigates to the beginning of the current channel.

## HideGui

Fullscreens the chat scroller and hides some stuff that's meant to pop up on hover.

* All sidebars except users/search (already trivial to hide)
* All top and bottom bars
* Message hover buttons
* Scrollbar

Note that there's a Discord bug where if you try to type while the chatbar can't be focused, e.g. if this plugin is active or you don't have sending permissions, Discord will foolhardily clear the selection and attempt to focus the chatbar every frame. Go to a channel where you're allowed to type and click the chatbar to mitigate this.

## MarkAbsentMembers

Defunct and disheveled.

Used to strikethrough usernames of members who are no longer in the server.  
Definitely absent members get a solid strikethrough. Members who haven't loaded yet
(e.g. after seeing a member who hasn't been cached yet) get a transparent strikethrough,
as it's not yet clear whether they are a member.

## OpenUserModal

Currently broken and deactivated, supposed to open the user modal dialog of the user ID in the clipboard.  
Relied on getUser(id):Promise<User>, which became inaccessible to me after that one Discord update.  
When I need it in other plugins, I hijack BDFDB to expose BDFDB_INTERNAL and use that to get getUser.  
Oh right, openUserProfileModal is gone, too. Can't do anything without it.

## RemovalLog

Periodically compares the guild list against a known state.  
Notifies of removed guilds with a modal and commits them to a log of removed guilds.  
Does not listen to event dispatch because I cba to figure out how to do that without a library.

Remembers the following about a removed guild:

* ID
* Name
* Owner
* Join date
* Time range when a guild was removed (important and unique feature, if yours lacks this, then it's inadequate)
* Icon ID

It does not save icon images, so the icon IDs can go invalid in the meantime.  
A 404ing icon could indicate a deleted or nuked server if it's unlikely to have simply changed it in the mean time.
