# videojs-contrib-quality-menu

Quality Selection Menu UI

videojs-contrib-quality-menu provides a menu button the the player's control bar which allows you to manually select the playback quality in HLS or Dash sources. If resolution information is available on all renditions, the UI will display quality options by the lines of horizontal resolution (e.g. 360p, 480p, 720p, 1080p). If resolution information is not available, it will fallback to show options `SD` and `HD` for Standard Definition and High Definition respectively. The plugin will use bitrate information for each rendition to determine whether it is SD or HD, using a configurable dividing line.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Options](#options)
  - [`defaultResolution`](#defaultresolution)
  - [`sdBitrateLimit`](#sdbitratelimit)
  - [`useResolutionLabels`](#useresolutionlabels)
  - [`resolutionLabelBitrates`](#resolutionlabelbitrates)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify](#browserify)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-contrib-quality-menu
```

## Options

### `defaultResolution`
> Type: `String`, Default: `none`

Defines the default resolution or resolution mapping to use. Pass it either the horizontal resolution or `SD`/`HD`

### `sdBitrateLimit`

> Type: `Number`, Default: `2000000`

Defines the upper bitrate limit (exclusive) for considering a rendition `SD`.

### `useResolutionLabels`

> Type: `boolean` Default: `true`

When `true`, the plugin will attempt to categorize renditions by lines of horizontal resolution when available. Set to `false` to always use `SD`/`HD` categorization.

### `resolutionLabelBitrates`

> Type: `boolean` Default: `false`

When `true`, the plugin will attach bitrate information to the resolution labels (e.g. `720p @ 13806 kbps`). This option has no effect when `useResolutionLabels` is `false` or when resolution information is unavailable.

## Usage

To include videojs-contrib-quality-menu on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-contrib-quality-menu.min.js"></script>
<script>
  var player = videojs('my-video');

  player.qualityMenu();
</script>
```

### Browserify

When using with Browserify, install videojs-contrib-quality-menu via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-contrib-quality-menu');

var player = videojs('my-video');

player.qualityMenu();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-contrib-quality-menu'], function(videojs) {
  var player = videojs('my-video');

  player.qualityMenu();
});
```

## License

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). Copyright (c) Brightcove, Inc


[videojs]: http://videojs.com/
