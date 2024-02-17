/*! @name videojs-contrib-quality-menu @version 0.0.0 @license Apache-2.0 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsContribQualityMenu = factory(global.videojs));
})(this, (function (videojs) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

  /**
   * @file quality-menu-item.js
   */
  const MenuItem = videojs__default["default"].getComponent('MenuItem');
  const dom = videojs__default["default"].dom || videojs__default["default"];

  /**
   * The quality level menu quality
   *
   * @extends MenuItem
   * @class QualityMenuItem
   */
  class QualityMenuItem extends MenuItem {
    /**
     * Creates a QualityMenuItem
     *
     * @param {Player|Object} player
     *        Main Player
     * @param {Object} [options]
     *        Options for menu item
     * @param {number[]} options.levels
     *        Array of indices mapping to QualityLevels in the QualityLevelList for
     *        this menu item
     * @param {string} options.label
     *        Label for this menu item
     * @param {string} options.controlText
     *        control text for this menu item
     * @param {string} options.subLabel
     *        sub label text for this menu item
     * @param {boolean} options.active
     *        True if the QualityLevelList.selectedIndex is contained in the levels list
     *        for this menu
     * @param {boolean} options.selected
     *        True if this menu item is the selected item in the UI
     * @param {boolean} options.selectable
     *        True if this menu item should be selectable in the UI
     */
    constructor(player, options = {}) {
      const selectedOption = options.selected;

      // We need to change options.seleted to options.active because the call to super
      // causes us to run MenuItem's constructor which calls this.selected(options.selected)
      // However, for QualityMenuItem, we change the meaning of the parameter to
      // this.selected() to be what we mean for 'active' which is True if the
      // QualityLevelList.selectedIndex is contained in the levels list for this menu
      options.selected = options.active;
      super(player, options);
      const qualityLevels = player.qualityLevels();
      this.levels_ = options.levels;
      this.selected_ = selectedOption;
      this.handleQualityChange = this.handleQualityChange.bind(this);
      this.controlText(options.controlText);
      this.on(qualityLevels, 'change', this.handleQualityChange);
      this.on('dispose', () => {
        this.off(qualityLevels, 'change', this.handleQualityChange);
      });
    }

    /**
     * Create the component's DOM element
     *
     * @param {string} [type]
     *        Element type
     * @param {Object} [props]
     *        Element properties
     * @param {Object} [attrs]
     *        An object of attributes that should be set on the element
     * @return {Element}
     *         The DOM element
     * @method createEl
     */
    createEl(type, props, attrs) {
      const el = super.createEl(type, props, attrs);
      const subLabel = dom.createEl('span', {
        className: 'vjs-quality-menu-item-sub-label',
        innerHTML: this.localize(this.options_.subLabel || '')
      });
      this.subLabel_ = subLabel;
      if (el) {
        el.appendChild(subLabel);
      }
      return el;
    }

    /**
     * Handle a click on the menu item, and set it to selected
     *
     * @method handleClick
     */
    handleClick() {
      this.updateSiblings_();
      const qualityLevels = this.player().qualityLevels();
      const currentlySelected = qualityLevels.selectedIndex;
      for (let i = 0, l = qualityLevels.length; i < l; i++) {
        // do not disable the currently selected quality until the end to prevent
        // playlist selection from selecting something new until we've enabled/disabled
        // all the quality levels
        if (i !== currentlySelected) {
          qualityLevels[i].enabled = false;
        }
      }
      for (let i = 0, l = this.levels_.length; i < l; i++) {
        qualityLevels[this.levels_[i]].enabled = true;
      }

      // Disable the quality level that was selected before the click if it is not
      // associated with this menu item
      if (currentlySelected !== -1 && this.levels_.indexOf(currentlySelected) === -1) {
        qualityLevels[currentlySelected].enabled = false;
      }
    }

    /**
     * Handle a change event from the QualityLevelList
     *
     * @method handleQualityChange
     */
    handleQualityChange() {
      const qualityLevels = this.player().qualityLevels();
      const active = this.levels_.indexOf(qualityLevels.selectedIndex) > -1;
      this.selected(active);
    }

    /**
     * Set this menu item as selected or not
     *
     * @param  {boolean} active
     *         True if the active quality level is controlled by this item
     * @method selected
     */
    selected(active) {
      if (!this.selectable) {
        return;
      }
      if (this.selected_) {
        this.addClass('vjs-selected');
        this.el_.setAttribute('aria-checked', 'true');
        // aria-checked isn't fully supported by browsers/screen readers,
        // so indicate selected state to screen reader in the control text.
        this.controlText(this.localize('{1}, selected', this.localize(this.options_.controlText)));
        const controlBar = this.player().controlBar;
        const menuButton = controlBar.getChild('QualityMenuButton');
        if (!active) {
          // This menu item is manually selected but the current playing quality level
          // is NOT associated with this menu item. This can happen if the quality hasnt
          // changed yet or something went wrong with rendition selection such as failed
          // server responses for playlists
          menuButton.addClass('vjs-quality-menu-button-waiting');
        } else {
          menuButton.removeClass('vjs-quality-menu-button-waiting');
        }
      } else {
        this.removeClass('vjs-selected');
        this.el_.setAttribute('aria-checked', 'false');
        // Indicate un-selected state to screen reader
        // Note that a space clears out the selected state text
        this.controlText(this.options_.controlText);
      }
    }

    /**
     * Sets this QualityMenuItem to be selected and deselects the other items
     *
     * @method updateSiblings_
     */
    updateSiblings_() {
      const qualityLevels = this.player().qualityLevels();
      const controlBar = this.player().controlBar;
      const menuItems = controlBar.getChild('QualityMenuButton').items;
      for (let i = 0, l = menuItems.length; i < l; i++) {
        const item = menuItems[i];
        const active = item.levels_.indexOf(qualityLevels.selectedIndex) > -1;
        item.selected_ = item === this;
        item.selected(active);
      }
    }
  }

  /**
   * @file quality-menu-button.js
   */
  const MenuButton = videojs__default["default"].getComponent('MenuButton');

  /**
   * Checks whether all the QualityLevels in a QualityLevelList have resolution information
   *
   * @param {QualityLevelList} qualityLevelList
   *        The list of QualityLevels
   * @return {boolean}
   *         True if all levels have resolution information, false otherwise
   * @function hasResolutionInfo
   */
  const hasResolutionInfo = function (qualityLevelList) {
    for (let i = 0, l = qualityLevelList.length; i < l; i++) {
      if (!qualityLevelList[i].height) {
        return false;
      }
    }
    return true;
  };

  /**
   * Determines the appropriate sub label for the given lines of resolution
   *
   * @param {number} lines
   *        The horizontal lines of resolution
   * @return {string}
   *         sub label for given resolution
   * @function getSubLabel
   */
  const getSubLabel = function (lines) {
    if (lines >= 2160) {
      return '4K';
    }
    if (lines >= 720) {
      return 'HD';
    }
    return '';
  };

  /**
   * The component for controlling the quality menu
   *
   * @extends MenuButton
   * @class QualityMenuButton
   */
  class QualityMenuButton extends MenuButton {
    /**
     * Creates a QualityMenuButton
     *
     * @param {Player|Object} player
     *        Main Player
     * @param {Object} [options]
     *        Options for QualityMenuButton
     */
    constructor(player, options = {}) {
      super(player, options);
      this.el_.setAttribute('aria-label', this.localize('Quality Levels'));
      this.controlText('Quality Levels');
      this.qualityLevels_ = player.qualityLevels();
      this.update = this.update.bind(this);
      this.handleQualityChange_ = this.handleQualityChange_.bind(this);
      this.changeHandler_ = () => {
        const defaultResolution = this.options_.defaultResolution;
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].options_.label.indexOf(defaultResolution) !== -1) {
            this.items[i].handleClick();
          }
        }
      };
      this.on(this.qualityLevels_, 'addqualitylevel', this.update);
      this.on(this.qualityLevels_, 'removequalitylevel', this.update);
      this.on(this.qualityLevels_, 'change', this.handleQualityChange_);
      this.one(this.qualityLevels_, 'change', this.changeHandler_);
      this.update();
      this.on('dispose', () => {
        this.off(this.qualityLevels_, 'addqualitylevel', this.update);
        this.off(this.qualityLevels_, 'removequalitylevel', this.update);
        this.off(this.qualityLevels_, 'change', this.handleQualityChange_);
        this.off(this.qualityLevels_, 'change', this.changeHandler_);
      });
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {string}
     *         The constructed class name
     * @method buildWrapperCSSClass
     */
    buildWrapperCSSClass() {
      return `vjs-quality-menu-wrapper ${super.buildWrapperCSSClass()}`;
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {string}
     *         The constructed class name
     * @method buildCSSClass
     */
    buildCSSClass() {
      return `vjs-quality-menu-button ${super.buildCSSClass()}`;
    }

    /**
     * Create the list of menu items.
     *
     * @return {Array}
     *         The list of menu items
     * @method createItems
     */
    createItems() {
      const items = [];
      if (!(this.qualityLevels_ && this.qualityLevels_.length)) {
        return items;
      }
      let groups;
      if (this.options_.useResolutionLabels && hasResolutionInfo(this.qualityLevels_)) {
        groups = this.groupByResolution_();
        this.addClass('vjs-quality-menu-button-use-resolution');
      } else {
        groups = this.groupByBitrate_();
        this.removeClass('vjs-quality-menu-button-use-resolution');
      }

      // if there is only 1 or 0 menu items, we should just return an empty list so
      // the ui does not appear when there are no options. We consider 1 to be no options
      // since Auto will have the same behavior as selecting the only other option,
      // so it is as effective as not having any options.
      if (groups.length <= 1) {
        return [];
      }
      groups.forEach(group => {
        if (group.levels.length) {
          group.selectable = true;
          items.push(new QualityMenuItem(this.player(), group));
        }
      });

      // Add the Auto menu item
      const auto = new QualityMenuItem(this.player(), {
        levels: Array.prototype.map.call(this.qualityLevels_, (level, i) => i),
        label: 'Auto',
        controlText: 'Auto',
        active: true,
        selected: true,
        selectable: true
      });
      this.autoMenuItem_ = auto;
      items.push(auto);
      return items;
    }

    /**
     * Group quality levels by lines of resolution
     *
     * @return {Array}
     *         Array of each group
     * @method groupByResolution_
     */
    groupByResolution_() {
      const groups = {};
      const order = [];
      for (let i = 0, l = this.qualityLevels_.length; i < l; i++) {
        const level = this.qualityLevels_[i];
        const active = this.qualityLevels_.selectedIndex === i;
        const lines = level.height;
        let label;
        if (this.options_.resolutionLabelBitrates) {
          const kbRate = Math.round(level.bitrate / 1000);
          label = `${lines}p @ ${kbRate} kbps`;
        } else {
          label = lines + 'p';
        }
        if (!groups[label]) {
          const subLabel = getSubLabel(lines);
          groups[label] = {
            levels: [],
            label,
            controlText: label,
            subLabel
          };
          order.push({
            label,
            lines
          });
        }
        if (active) {
          groups[label].active = true;
        }
        groups[label].levels.push(i);
      }

      // Sort from High to Low
      order.sort((a, b) => b.lines - a.lines);
      const sortedGroups = [];
      order.forEach(group => {
        sortedGroups.push(groups[group.label]);
      });
      return sortedGroups;
    }

    /**
     * Group quality levels by bitrate into SD and HD buckets
     *
     * @return {Array}
     *         Array of each group
     * @method groupByBitrate_
     */
    groupByBitrate_() {
      // groups[0] for HD, groups[1] for SD, since we want sorting from high to low\
      const groups = [{
        levels: [],
        label: 'HD',
        controlText: 'High Definition'
      }, {
        levels: [],
        label: 'SD',
        controlText: 'Standard Definition'
      }];
      for (let i = 0, l = this.qualityLevels_.length; i < l; i++) {
        const level = this.qualityLevels_[i];
        const active = this.qualityLevels_.selectedIndex === i;
        let group;
        if (level.bitrate < this.options_.sdBitrateLimit) {
          group = groups[1];
        } else {
          group = groups[0];
        }
        if (active) {
          group.active = true;
        }
        group.levels.push(i);
      }
      if (!groups[0].levels.length || !groups[1].levels.length) {
        // Either HD or SD do not have any quality levels, we should just return an empty
        // list so the ui does not appear when there are no options. We consider 1
        // to be no options since Auto will have the same behavior as selecting the only
        // other option, so it is as effective as not having any options.
        return [];
      }
      return groups;
    }

    /**
     * Handle a change event from the QualityLevelList
     *
     * @method handleQualityChange_
     */
    handleQualityChange_() {
      const selected = this.qualityLevels_[this.qualityLevels_.selectedIndex];
      const useResolution = this.options_.useResolutionLabels && hasResolutionInfo(this.qualityLevels_);
      let subLabel = '';
      if (selected) {
        if (useResolution) {
          subLabel = getSubLabel(selected.height);
        } else if (selected.bitrate >= this.options_.sdBitrateLimit) {
          subLabel = 'HD';
        }
      }
      if (subLabel === 'HD') {
        this.addClass('vjs-quality-menu-button-HD-flag');
        this.removeClass('vjs-quality-menu-button-4K-flag');
      } else if (subLabel === '4K') {
        this.removeClass('vjs-quality-menu-button-HD-flag');
        this.addClass('vjs-quality-menu-button-4K-flag');
      } else {
        this.removeClass('vjs-quality-menu-button-HD-flag');
        this.removeClass('vjs-quality-menu-button-4K-flag');
      }
      if (this.autoMenuItem_) {
        if (this.autoMenuItem_.manuallySelected_ && selected) {
          // auto mode, update the sub label
          this.autoMenuItem_.subLabel_.innerHTML = this.localize(subLabel);
        } else {
          this.autoMenuItem_.subLabel_.innerHTML = '';
        }
      }
    }
  }
  videojs__default["default"].registerComponent('QualityMenuButton', QualityMenuButton);

  var version = "0.0.0";

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
    const button = controlBar.addChild('QualityMenuButton', options, controlBar.children_.length - 2);
    return function () {
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
  const initPlugin = function (player, options) {
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
      player.qualityMenu.VERSION = version;
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
  const qualityMenu = function (options) {
    initPlugin(this, videojs__default["default"].obj.merge(defaults, options));
  };

  // Register the plugin with video.js.
  videojs__default["default"].registerPlugin('qualityMenu', qualityMenu);

  // Include the version number.
  qualityMenu.VERSION = version;

  return qualityMenu;

}));
