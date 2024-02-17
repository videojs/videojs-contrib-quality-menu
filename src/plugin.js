import videojs from 'video.js';
import './quality-menu-button.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
  sdBitrateLimit: 2000000,
  useResolutionLabels: true,
  resolutionLabelBitrates: false,
  defaultResolution: 'none'
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player.
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 * @return {Function} disposal function for re initialization
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-quality-menu');

  const controlBar = player.getChild('controlBar');

  const button = controlBar.addChild(
    'QualityMenuButton',
    options,
    controlBar.children_.length - 2
  );

  return function() {
    player.removeClass('vjs-quality-menu');
    controlBar.removeChild(button);
    button.dispose();
  };
};

/**
 * Main entry point for the plugin
 *
 * @function initPlugin
 * @param {Player} player a reference to a videojs Player instance
 * @param {Object} [options] an object with plugin options
 */
const initPlugin = function(player, options) {
  if (typeof player.qualityLevels !== 'undefined') {
    // call qualityLevels to initialize it in case it hasnt been initialized yet
    player.qualityLevels();

    let disposeFn = () => {};

    player.ready(() => {
      disposeFn = onPlayerReady(player, options);

      player.on('loadstart', () => {
        disposeFn();
        disposeFn = onPlayerReady(player, options);
      });
    });

    // reinitialization is no-op for now
    player.qualityMenu = () => {};
    player.qualityMenu.VERSION = VERSION;
  }
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function qualityMenu
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const qualityMenu = function(options) {
  initPlugin(this, videojs.obj.merge(defaults, options));
};

// Register the plugin with video.js.
videojs.registerPlugin('qualityMenu', qualityMenu);

// Include the version number.
qualityMenu.VERSION = VERSION;

export default qualityMenu;
