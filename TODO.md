# Random TODOs

## Development

- Implement sendbird
- Consider changing logic for add channel - trigger cancel confirm modal or do it apple style (i.e. remove save option)
- Store fetched messages to disk?

## Understand better

- Wrapping <App> in a <Provider> - what does this do specifically? A lot of magic going on
- What are slices and why is it called that?
- What is best practice for working with application configuration, content and pure view states? If everything is handled the same way it feels like we mix concerns. But still I can think of nothing that says we cannot handle it using the same Redux pattern. Rather we would just manage serialisation and persistence depending on what type of state it is. 
- Understand normalised state better
