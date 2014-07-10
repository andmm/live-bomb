# Live Bomb!
> Live Bomb is a Chrome extension that notifies you when there's a live video on [GiantBomb.com](http://www.giantbomb.com) and lets you keep tabs on the schedule of upcoming videos, articles, podcasts, and streams.

## Features
* Live Stream Notifications - Optional desktop notifications with customizable audio alerts.
* Runs in Background - Option to run in the background while the browser is closed.
* Customizable Appearance - Selectable Light/Dark themes.

## Installation

The extension is available for download through the [Chrome Web Store][webstore].

## Feedback, Bugs, and Feature Requests

Bug reports and new features can be posted on [GitHub][issues] or on the [Chrome Web Store][webstoresupport].

If you have a minute to spare, please post a review on the [Chrome Web Store][webstore].

## Development

All contributors are welcome. Feel free to fork away and submit pull requests for any new features, enhancements, or bug fixes that you would like to add.

It is preferred but not required that you [submit an issue][issues] prior to doing any development. Also, please try to observe basic pull request etiquette:

* Do every bug fix/feature/ehancemnt on its own branch and never on the master branch.
* If any upstream commits have been made on master, rebase prior to submitting the pull request.
* Commit often like a responsible developer, but clean up and squash your commits on your pull request.
* You can find more info on forking and pull requests here: [https://github.com/Chaser324/live-bomb/issues][issues]

### Development Quick Start

This project utilizes the task runner [Grunt](http://gruntjs.com/) and package manager [Bower](http://bower.io/) to make development as smooth and to decouple this repository from its third-party dependencies.

#### 0. Install NPM & Grunt.js
NPM is included with Node.js - if you don't already have it, you can get it at [http://nodejs.org/](http://nodejs.org/). Verify your install by running the following command at the command line:

````bash
npm -v
````

With NPM installed, you can install the Grunt.js CLI (command line interface) by running the following command at the command line:

````bash
npm install -g grunt-cli
````

#### 1. Fork and clone to your machine
Click the fork button on the [main repo][mainrepo] and then clone it to your machine.

#### 2. Install dependencies
`cd` into this project's directory and run the following command to install both the NPM and Bower dependencies:

````bash
npm install
````

#### 3. Develop & Build
Run `grunt` at the command line to build the project.

On the [Chrome Extensions page](chrome://extensions/) enable *Developer mode*, click the *Load unpacked extension...*, and point it to the `dist` directory that was created by running the Grunt.js build.

You can run `grunt dev` at the command line to automatically rebuild as you make changes. Refresh the Chrome Extensions page to reload the extension and see your changes there.

### File Organization

* `manifest.json` - Chrome extension manifest file.
* `popup.html` - The HTML displayed when you click the extension's icon.

`css` directory:

* `app.less` - The primary LESS file that Grunt.js compiles. All CSS/LESS is imported into this file.
* `base.less` - Basic layout styling.
* `dark.less` - Dark Theme styling.
* `light.less` - Light Theme styling.
* `variables.less` - Twitter Bootstrap variables.

`js` directory:

* `functions.js` - Base functions for checking for live video and retrieving the upcoming schedule.
* `background.js` - Background routines.
* `livebomb.js` - Interface code.

## Contributors & Thanks

* **André Milani Marcos (andmm)** - Creator of Live Bomb - [twitter](https://twitter.com/andrem_m), [github](https://github.com/andmm)
* **Chase Pettit (Chaser324)** - Current lead Live Bomb developer - [twitter](https://twitter.com/chasepettit), [github](https://github.com/Chaser324)

* **Hamst3r** - Audio contributor - [twitter](https://twitter.com/hamst3r), [youtube](https://www.youtube.com/hamsteralliance)

* **CatsAkimbo** - Testing/Development - [giantbomb](http://www.giantbomb.com/profile/catsakimbo/)
* **Chance_S** - Testing/Development - [giantbomb](http://www.giantbomb.com/profile/chance_s/)
* **cencen123** - Testing/Development - [giantbomb](http://www.giantbomb.com/profile/cencen123/)

* **Danny Chi (mrpibb)** - CBSi engineer - [twitter](https://twitter.com/dannichi)
* **edgework** - CBSi engineer - [twitter](https://twitter.com/edgework_gb)

* **[...AND YOU!](http://www.giantbomb.com/thanks-for-playing/3015-4614/)**





[mainrepo]: https://github.com/Chaser324/live-bomb
[webstore]: https://chrome.google.com/webstore/detail/live-bomb/foadpaalpoealldkplclbhbebjmpaild
[issues]: https://github.com/Chaser324/live-bomb/issues
[webstoresupport]: https://chrome.google.com/webstore/support/foadpaalpoealldkplclbhbebjmpaild?hl=en&gl=US
