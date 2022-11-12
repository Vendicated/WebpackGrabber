# WebpackGrabber

A Userscript to grab the webpack instance on any site that uses webpack.

Works on Discord, Spotify, Github, Twitter, Twitch, Netflix and so many more

If found, window.WEBPACK_GRABBER will be defined with the following methods:
![image](https://user-images.githubusercontent.com/45497981/200848153-448b492f-5827-4491-aeeb-49bd94dc0cf4.png)


Offers methods to find modules by props, name, displayName or code and to find module ids by source code.
Also accounts for mangled ("obfuscated") exports.

Note that some sites have webpack that doesn't expose the cache.
In this case, WebpackGrabber will build the cache itself by importing every module. This may have side effects.

## Installation

Install a Userscript manager, I recommend [ViolentMonkey](https://violentmonkey.github.io/) and just click View Raw 
