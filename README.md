# WebpackGrabber

A Userscript to grab the webpack instance on any site that uses webpack.

Offers methods to find modules by props, name, displayName or code and to find module ids by source code.
Also accounts for mangled ("obfuscated") exports.

Should technically work on any site using webpack, confirmed working on Discord, Twitter and even Github (however for Github see below sentence) 

Note that some sites have webpack that doesn't expose some things like the cache so it won't work fully there

## Installation

Install a Userscript manager, I recommend [ViolentMonkey](https://violentmonkey.github.io/) and just click View Raw 
