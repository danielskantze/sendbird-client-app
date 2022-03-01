# Sendbird Chat Client

This is a simple chat client app using Sendbird (sendbird.com). 

## Installation

`npm install`

`npm start`

## Background

While I tested React a few times when it was new, I haven't touched it in a long time. This project was done primarily as an exercise in React. In addition I wanted to explore different ways of doing state management. I was vaguely familliar with Redux since before so I decided to give it a shot. I knew many people do state management just using React hooks nowadays but I need something suitable for a bigger project so it was interesting to explore more advanced options. 

## Limitations

Did not spend that much time to clean up the code. I do not think it is terrible but it is not great either. 

Currently it is using open channels only but group channels is probably not that hard to provide support for. 

While supported by the api, no update support, mentions nor threading is supporteed by the app (yet). Most of these things should be quite easy to support but the app now covers the base of what I need so I did not bother. 

## Learnings / reflections

I got more and more into React and overall I enjoyed it. Not sure it will be my first hand choice for everything I do on the web but it is a descent framework nevertheless.   

Positive aspects:

- Quick to get into
- Good documentation
- Simple enough
- State updates are explicit through special setMethods provided by useState (makes it clear that changing a property can have side effects)

Negative aspects: 

- Feels like being thrown back to the old Flex days. Feels like it invites you to write sloppy code. 
- Being an old c-programmer I cannot help thinking a little bit on what the actual cost of the rendering is. A lot of scoped functions that are being recreated when properties update. Also, the price of the diffing thing of just changing stuff and letting the updates get applied magically... I can see a more advanced ui gradually being slow to render. Something that could be hard to fix as well. I have not done any advanced analysis of this and perhaps it is all just fine. But still... Something that bugs me a bit. 

### Thoughts on Redux

Verdict: I do not think I will use Redux again. If I need more advanced state management I will explore other options. It must be possible to solve the same things in a simpler way. 

- While Redux did the trick when I set it up I still felt it was too verbose and felt pretty overengineered. Especially the documentation left me with the feeling that the same principles could have been explained with fewer words and better examples. Almost like the one writing it would want it to appear more complicated than it is. 
- Also all this immutatibility and copying (something that of course solves a lot of things) feels like a potential performance bottleneck. Especially when it comes to really big data structures. 

## TODO

- Provide feedback when channel list is updated
- Automatically select the newly added alternative for drop down lists
## Known issues / room for improvement

Sharing the stateful chat service and controlling it directly inside multiple components feels so so. It is a remnant of some old chatbot code based some of the code on. Not sure exactly how I would want to clean it up though. Probably the "correct" way would be to manage it from one of the store slices. Wrap it with actions and just render whatever state they produce. I imagine that the error handling may get messy using this approach though. The error that can be quite local and tied to the specific user interaction would still need to get lifted up and dispatched. Sometimes it is just easier to read the code if that type of error handling would be managed directly inside the component. For example, a user manages to connect but but for some reason the user cannot join the channel. Or the user fails to connect. Managing two different error states globally for this in addition to their corresponding error messages and so forth is of course possible but may turn out to be quite hard to follow. Also Redux both helps and makes things worse here. It helps because it has thunks and way of handling async code. But it is quite verbose so troubleshooting things will still involve jumping through a lot of hoops. 

Not too happy with the way uiState both manages intended states and actual states. For example when someone clicks the connect button, it sets uiState.isConnected. If it fails it clears it. Then another flag checks if the user joined a channel. This would be much nicer and explicit with a proper state machine, like: Disconnected, Connecting, Connected, JoiningChannel, JoinedChannel etc..

UI-wise I could not make up my mind if there should be a save-button on the edit nickname view or not. It is easy to add or delete a nickname and then forget to press the save button. This could be solved in various ways but right now it is easy to forget to save the changes you make and that is confusing / annoying. 

Better handling of scroll position when it re-renders (should keep position unless user hits load-more or is at the tail of the list). 

CSS could be restructured and improved and support easier theming. 

CSS could be moved to components instead of using a single file