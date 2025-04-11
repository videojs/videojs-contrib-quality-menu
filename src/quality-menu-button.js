/**
 * @file quality-menu-button.js
 */
import videojs from 'video.js';
import QualityMenuItem from './quality-menu-item.js';

const MenuButton = videojs.getComponent('MenuButton');

/**
 * Checks whether any of the QualityLevels in a QualityLevelList have resolution information
 *
 * @param {QualityLevelList} qualityLevelList
 *        The list of QualityLevels
 * @return {boolean}
 *         True if any levels have resolution information, false if none have
 * @function hasResolutionInfo
 */
const hasResolutionInfo = function(qualityLevelList) {
  return Array.from(qualityLevelList).some((level) => level.height);
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
const getSubLabel = function(lines) {
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
    if (!player.options().experimentalSvgIcons) {
      this.$('.vjs-icon-placeholder').classList.add('vjs-icon-cog');
    }
    this.setIcon('cog');

    this.qualityLevels_ = player.qualityLevels();

    this.update = this.update.bind(this);
    this.hide = this.hide.bind(this);

    this.handleQualityChange_ = this.handleQualityChange_.bind(this);
    this.firstChangeHandler_ = this.firstChangeHandler_.bind(this);
    this.enableDefaultResolution_ = this.enableDefaultResolution_.bind(this);

    this.on(this.qualityLevels_, 'addqualitylevel', this.update);
    this.on(this.qualityLevels_, 'removequalitylevel', this.update);
    this.on(this.qualityLevels_, 'change', this.handleQualityChange_);

    // TODO: Remove this and the `defaultResolution` option once videojs/http-streaming supports comparable functionality
    this.one(this.qualityLevels_, 'change', this.firstChangeHandler_);
    player.on('adstart', this.hide);
    player.on(['adend', 'adtimeout'], this.update);

    this.update();

    this.on('dispose', () => {
      this.off(this.qualityLevels_, 'addqualitylevel', this.update);
      this.off(this.qualityLevels_, 'removequalitylevel', this.update);
      this.off(this.qualityLevels_, 'change', this.handleQualityChange_);
      this.off(this.qualityLevels_, 'change', this.firstChangeHandler_);
      player.off('adstart', this.hide);
      player.off(['adend', 'adtimeout'], this.update);
      player.off('loadedmetadata', this.enableDefaultResolution_);
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

    groups.forEach((group) => {
      if (group.levels.length) {
        group.selectable = true;

        items.push(new QualityMenuItem(this.player(), group));
      }
    });

    // Add the Auto menu item
    const auto = new QualityMenuItem(this.player(), {
      levels: Array.prototype.map.call(this.qualityLevels_, (level, i) => i),
      label: this.localize('Auto'),
      controlText: '',
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

      // Do not include an audio-only level
      if (!lines) {
        continue;
      }

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
          controlText: '',
          subLabel
        };

        order.push({ label, lines });
      }

      if (active) {
        groups[label].active = true;
      }

      groups[label].levels.push(i);
    }

    // Sort from High to Low
    order.sort((a, b) => b.lines - a.lines);

    const sortedGroups = [];

    order.forEach((group) => {
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
    const groups = [
      {
        levels: [],
        label: 'HD',
        controlText: 'High Definition'
      },
      {
        levels: [],
        label: 'SD',
        controlText: 'Standard Definition'
      }
    ];

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
    const useResolution = (this.options_.useResolutionLabels &&
                           hasResolutionInfo(this.qualityLevels_));

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

  /**
   * Enable the `defaultResolution`, if specified
   *
   * @method enableDefaultResolution_
   */
  enableDefaultResolution_() {
    const defaultResolution = this.options_.defaultResolution;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].options_.label.indexOf(defaultResolution) !== -1) {
        this.items[i].handleClick();
      }
    }
  }

  /**
   * Handle the first change event in order to enable the `defaultResolution`, if specified
   *
   * @method firstChangeHandler_
   */
  firstChangeHandler_() {
    // If we haven't loaded metadata yet and we expect it before playback is initiated, wait to perform the quality switch.
    // Doing so before 'loadedmetadata' can result in cancelling requests for init segments required for the browser to fire 'loadedmetadata'.
    if (this.player_.readyState() < 1 && this.player_.preload() !== 'none') {
      this.player_.one('loadedmetadata', this.enableDefaultResolution_);
      return;
    }

    this.enableDefaultResolution_();
  }
}

videojs.registerComponent('QualityMenuButton', QualityMenuButton);
export default QualityMenuButton;
