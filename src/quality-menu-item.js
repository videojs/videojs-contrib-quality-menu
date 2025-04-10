/**
 * @file quality-menu-item.js
 */
import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');
const dom = videojs.dom || videojs;

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
      const hasSubLabel = this.options_.subLabel;
      this.addClass('vjs-selected');
      this.el_.setAttribute('aria-checked', 'true');
      // aria-checked isn't fully supported by browsers/screen readers,
      // so indicate selected state to screen reader in the control text.
      this.controlText(this.localize(hasSubLabel ? 'selected,' : 'selected'));

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

export default QualityMenuItem;
