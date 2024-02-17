/*! @name videojs-contrib-quality-menu @version 0.0.0 @license Apache-2.0 */
(function (QUnit, sinon, videojs) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var QUnit__default = /*#__PURE__*/_interopDefaultLegacy(QUnit);
	var sinon__default = /*#__PURE__*/_interopDefaultLegacy(sinon);
	var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var _nodeResolve_empty = {};

	var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': _nodeResolve_empty
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

	var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : {};
	var minDoc = require$$0;
	var doccy;
	if (typeof document !== 'undefined') {
	  doccy = document;
	} else {
	  doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];
	  if (!doccy) {
	    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
	  }
	}
	var document_1 = doccy;

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

	const Player = videojs__default["default"].getComponent('Player');
	QUnit__default["default"].test('the environment is sane', function (assert) {
	  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
	  assert.strictEqual(typeof sinon__default["default"], 'object', 'sinon exists');
	  assert.strictEqual(typeof videojs__default["default"], 'function', 'videojs exists');
	  assert.strictEqual(typeof qualityMenu, 'function', 'plugin is a function');
	});
	QUnit__default["default"].module('videojs-contrib-quality-menu', {
	  beforeEach() {
	    // Mock the environment's timers because certain things - particularly
	    // player readiness - are asynchronous in video.js 5. This MUST come
	    // before any player is created; otherwise, timers could get created
	    // with the actual timer methods!
	    this.clock = sinon__default["default"].useFakeTimers();
	    this.fixture = document_1.getElementById('qunit-fixture');
	    this.video = document_1.createElement('video');
	    this.fixture.appendChild(this.video);
	    this.player = videojs__default["default"](this.video);
	  },
	  afterEach() {
	    this.player.dispose();
	    this.clock.restore();
	  }
	});
	QUnit__default["default"].test('registers itself with video.js', function (assert) {
	  assert.expect(2);
	  assert.strictEqual(typeof Player.prototype.qualityMenu, 'function', 'videojs-contrib-quality-menu plugin was registered');
	  this.player.qualityMenu();

	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  assert.ok(this.player.hasClass('vjs-quality-menu'), 'the plugin adds a class to the player');
	});
	QUnit__default["default"].test('Groups QualityLevels by bitrate when useResolutionLabels is false', function (assert) {
	  this.player.qualityMenu({
	    useResolutionLabels: false
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 2000001,
	    width: 500,
	    height: 500,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 3000001,
	    width: 600,
	    height: 600,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 19999,
	    width: 300,
	    height: 300,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '4',
	    bandwidth: 1111,
	    width: 200,
	    height: 200,
	    enabled: () => {}
	  });
	  assert.equal(button.items.length, 3, 'created 3 menu items');
	  assert.equal(button.items[0].controlText(), 'High Definition', 'HD element');
	  assert.deepEqual(button.items[0].levels_, [0, 1], 'HD variants added to HD menu item');
	  assert.equal(button.items[1].controlText(), 'Standard Definition', 'SD element');
	  assert.deepEqual(button.items[1].levels_, [2, 3], 'SD variants added to SD menu item');
	  assert.equal(button.items[2].controlText(), 'Auto', 'Auto element');
	  assert.deepEqual(button.items[2].levels_, [0, 1, 2, 3], 'all variants added to Auto menu item');
	});
	QUnit__default["default"].test('Groups QualityLevels by resolution by default', function (assert) {
	  this.player.qualityMenu();
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 2000001,
	    width: 500,
	    height: 500,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 3000001,
	    width: 600,
	    height: 600,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 19999,
	    width: 300,
	    height: 300,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '4',
	    bandwidth: 1111,
	    width: 200,
	    height: 200,
	    enabled: () => {}
	  });
	  assert.equal(button.items.length, 5, 'created 5 menu items');
	  assert.equal(button.items[0].controlText(), '600p', '600p');
	  assert.deepEqual(button.items[0].levels_, [1], '600p variants added to 600p menu item');
	  assert.equal(button.items[1].controlText(), '500p', '500p');
	  assert.deepEqual(button.items[1].levels_, [0], '500p variants added to 500p menu item');
	  assert.equal(button.items[2].controlText(), '300p', '300p');
	  assert.deepEqual(button.items[2].levels_, [2], '300p variants added to 300p menu item');
	  assert.equal(button.items[3].controlText(), '200p', '200p');
	  assert.deepEqual(button.items[3].levels_, [3], '200p variants added to 200p menu item');
	  assert.equal(button.items[4].controlText(), 'Auto', 'Auto');
	  assert.deepEqual(button.items[4].levels_, [0, 1, 2, 3], 'Auto variants added to Auto menu item');
	});
	QUnit__default["default"].test('Dispalys bitrate along with resolution when resolutionLabelBitrates option', function (assert) {
	  this.player.qualityMenu({
	    resolutionLabelBitrates: true
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 2000001,
	    width: 500,
	    height: 500,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 3000001,
	    width: 600,
	    height: 600,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 19999,
	    width: 300,
	    height: 300,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '4',
	    bandwidth: 1111,
	    width: 200,
	    height: 200,
	    enabled: () => {}
	  });
	  assert.equal(button.items.length, 5, 'created 5 menu items');
	  assert.equal(button.items[0].controlText(), '600p @ 3000 kbps', '600p @ 3000 kbps');
	  assert.deepEqual(button.items[0].levels_, [1], '600p variants added to 600p menu item');
	  assert.equal(button.items[1].controlText(), '500p @ 2000 kbps', '500p @ 2000 kbps');
	  assert.deepEqual(button.items[1].levels_, [0], '500p variants added to 500p menu item');
	  assert.equal(button.items[2].controlText(), '300p @ 20 kbps', '300p @ 20 kbps');
	  assert.deepEqual(button.items[2].levels_, [2], '300p variants added to 300p menu item');
	  assert.equal(button.items[3].controlText(), '200p @ 1 kbps', '200p @ 1 kbps');
	  assert.deepEqual(button.items[3].levels_, [3], '200p variants added to 200p menu item');
	  assert.equal(button.items[4].controlText(), 'Auto', 'Auto');
	  assert.deepEqual(button.items[4].levels_, [0, 1, 2, 3], 'Auto variants added to Auto menu item');
	});
	QUnit__default["default"].test('Falls back to grouping by bitrate when no resolution info is available', function (assert) {
	  this.player.qualityMenu({
	    useResolutionLabels: true
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 2000001,
	    width: 500,
	    height: 500,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 3000001,
	    width: 600,
	    height: 600,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 19999,
	    width: 300,
	    height: 300,
	    enabled: () => {}
	  });
	  // No resolution info available in this level.
	  levels.addQualityLevel({
	    id: '4',
	    bandwidth: 1111,
	    enabled: () => {}
	  });
	  assert.equal(button.items.length, 3, 'created 3 menu items');
	  assert.equal(button.items[0].controlText(), 'High Definition', 'HD');
	  assert.deepEqual(button.items[0].levels_, [0, 1], 'HD variants added to HD menu item');
	  assert.equal(button.items[1].controlText(), 'Standard Definition', 'SD');
	  assert.deepEqual(button.items[1].levels_, [2, 3], 'SD variants added to SD menu item');
	  assert.equal(button.items[2].controlText(), 'Auto', 'Auto');
	  assert.deepEqual(button.items[2].levels_, [0, 1, 2, 3], 'Auto variants added to Auto menu item');
	});
	QUnit__default["default"].test('Attaches HD flag when an HD rendition is selected', function (assert) {
	  this.player.qualityMenu({
	    sdBitrateLimit: 100,
	    useResolutionLabels: false
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  const menuContentElement = button.el().getElementsByTagName('ul')[0];
	  assert.equal(menuContentElement.children.length, 0, 'no menu items when empty quality level list');
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 101,
	    width: 500,
	    height: 500,
	    enabled: () => {}
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 99,
	    width: 100,
	    height: 100,
	    enabled: () => {}
	  });
	  assert.ok(!button.hasClass('vjs-quality-menu-button-HD-flag'), 'no hd flag when hd not selected');
	  levels.selectedIndex_ = 0;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(button.hasClass('vjs-quality-menu-button-HD-flag'), 'added hd flag');
	  levels.selectedIndex_ = 1;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(!button.hasClass('vjs-quality-menu-button-HD-flag'), 'no hd flag when hd not selected');
	});
	QUnit__default["default"].test('Passing default quality level reverts to auto if desired level is not found', function (assert) {
	  this.player.qualityMenu({
	    sdBitrateLimit: 100,
	    useResolutionLabels: false,
	    defaultResolution: 'HQ'
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  const enabled = [true, true, true, true];
	  levels.addQualityLevel({
	    id: '0',
	    bandwidth: 102,
	    width: 500,
	    height: 500,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[0];
	      }
	      enabled[0] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 101,
	    width: 400,
	    height: 400,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[1];
	      }
	      enabled[1] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 99,
	    width: 200,
	    height: 200,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[2];
	      }
	      enabled[2] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 98,
	    width: 100,
	    height: 100,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[3];
	      }
	      enabled[3] = enable;
	      return enable;
	    }
	  });
	  const items = button.items;
	  assert.equal(items.length, 3, '3 menu items, auto, sd, hd');
	  levels.selectedIndex_ = 2;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
	  assert.ok(items[items.length - 1].hasClass('vjs-selected'), 'auto menu item selected');
	  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
	  assert.ok(levels[0].enabled, 'all levels enabled');
	  assert.ok(levels[1].enabled, 'all levels enabled');
	  assert.ok(levels[2].enabled, 'all levels enabled');
	  assert.ok(levels[3].enabled, 'all levels enabled');
	});
	QUnit__default["default"].test('Passing default "HD/SD" quality level selects correct starting level', function (assert) {
	  this.player.qualityMenu({
	    sdBitrateLimit: 100,
	    useResolutionLabels: false,
	    defaultResolution: 'HD'
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  const enabled = [true, true, true, true];
	  levels.addQualityLevel({
	    id: '0',
	    bandwidth: 102,
	    width: 500,
	    height: 500,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[0];
	      }
	      enabled[0] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 101,
	    width: 400,
	    height: 400,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[1];
	      }
	      enabled[1] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 99,
	    width: 200,
	    height: 200,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[2];
	      }
	      enabled[2] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 98,
	    width: 100,
	    height: 100,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[3];
	      }
	      enabled[3] = enable;
	      return enable;
	    }
	  });
	  levels.selectedIndex_ = 3;
	  videojs__default["default"].trigger(levels, 'change');
	  const items = button.items;
	  assert.equal(items.length, 3, '3 menu items, auto, sd, hd');
	  assert.ok(items[0].hasClass('vjs-selected'), 'HD menu item selected at start');
	  assert.equal(items[0].options_.label, 'HD', 'HD menu item selected at start');
	  assert.ok(levels[0].enabled, 'HD levels enabled');
	  assert.ok(levels[1].enabled, 'HD levels enabled');
	  assert.ok(!levels[2].enabled, 'SD levels not enabled');
	  assert.ok(!levels[3].enabled, 'auto levels not enabled');
	});
	QUnit__default["default"].test('Passing default resolution quality level selects correct starting level', function (assert) {
	  this.player.qualityMenu({
	    sdBitrateLimit: 100,
	    useResolutionLabels: true,
	    defaultResolution: '500'
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  const enabled = [true, true, true, true];
	  levels.addQualityLevel({
	    id: '0',
	    bandwidth: 102,
	    width: 500,
	    height: 500,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[0];
	      }
	      enabled[0] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 101,
	    width: 400,
	    height: 400,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[1];
	      }
	      enabled[1] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 99,
	    width: 200,
	    height: 200,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[2];
	      }
	      enabled[2] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 98,
	    width: 100,
	    height: 100,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[3];
	      }
	      enabled[3] = enable;
	      return enable;
	    }
	  });
	  levels.selectedIndex_ = 3;
	  videojs__default["default"].trigger(levels, 'change');
	  const items = button.items;
	  assert.equal(items.length, 5, '5 menu items, auto, 100, 200, 400, 500');
	  assert.ok(items[0].hasClass('vjs-selected'), 'HD menu item selected at start');
	  assert.equal(items[0].options_.label, '500p', 'HD menu item selected at start');
	  assert.ok(levels[0].enabled, '500p levels enabled');
	  assert.ok(!levels[1].enabled, '400p levels not enabled');
	  assert.ok(!levels[2].enabled, '200p levels not enabled');
	  assert.ok(!levels[3].enabled, '100p levels not enabled');
	});
	QUnit__default["default"].test('Clicking menu item calls quality level enabled functions', function (assert) {
	  this.player.qualityMenu({
	    sdBitrateLimit: 100,
	    useResolutionLabels: false
	  });
	  // Tick the clock forward enough to trigger the player to be "ready".
	  this.clock.tick(1);
	  const levels = this.player.qualityLevels();
	  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');
	  const enabled = [true, true, true, true];
	  levels.addQualityLevel({
	    id: '0',
	    bandwidth: 102,
	    width: 500,
	    height: 500,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[0];
	      }
	      enabled[0] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '1',
	    bandwidth: 101,
	    width: 400,
	    height: 400,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[1];
	      }
	      enabled[1] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '2',
	    bandwidth: 99,
	    width: 200,
	    height: 200,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[2];
	      }
	      enabled[2] = enable;
	      return enable;
	    }
	  });
	  levels.addQualityLevel({
	    id: '3',
	    bandwidth: 98,
	    width: 100,
	    height: 100,
	    enabled: enable => {
	      if (typeof enable === 'undefined') {
	        return enabled[3];
	      }
	      enabled[3] = enable;
	      return enable;
	    }
	  });
	  levels.selectedIndex_ = 3;
	  videojs__default["default"].trigger(levels, 'change');
	  const items = button.items;
	  assert.equal(items.length, 3, '3 menu items, auto, sd, hd');
	  assert.ok(items[items.length - 1].hasClass('vjs-selected'), 'auto menu item selected at start');
	  assert.equal(items[items.length - 1].options_.label, 'Auto', 'auto menu item selected at start');

	  // click hd menu item
	  videojs__default["default"].trigger(items[0].el(), 'click');
	  levels.selectedIndex_ = 0;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(!items[items.length - 1].hasClass('vjs-selected'), 'auto menu item no longer selected');
	  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
	  assert.ok(items[0].hasClass('vjs-selected'), 'hd menu item selected');
	  assert.ok(levels[0].enabled, 'hd level is enabled');
	  assert.ok(levels[1].enabled, 'hd level is enabled');
	  assert.ok(!levels[2].enabled, 'non hd level disabled');
	  assert.ok(!levels[3].enabled, 'non hd level disabled');

	  // click sd menu item
	  videojs__default["default"].trigger(items[1].el(), 'click');
	  levels.selectedIndex_ = 3;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(items[1].hasClass('vjs-selected'), 'sd menu item selected');
	  assert.ok(!items[items.length - 1].hasClass('vjs-selected'), 'auto menu item not selected');
	  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
	  assert.ok(levels[2].enabled, 'sd level is enabled');
	  assert.ok(levels[3].enabled, 'sd level is enabled');
	  assert.ok(!levels[0].enabled, 'non sd level disabled');
	  assert.ok(!levels[1].enabled, 'non sd level disabled');

	  // click auto menu item
	  videojs__default["default"].trigger(items[items.length - 1].el(), 'click');
	  levels.selectedIndex_ = 2;
	  videojs__default["default"].trigger(levels, 'change');
	  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
	  assert.ok(items[items.length - 1].hasClass('vjs-selected'), 'auto menu item selected');
	  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
	  assert.ok(levels[0].enabled, 'all levels enabled');
	  assert.ok(levels[1].enabled, 'all levels enabled');
	  assert.ok(levels[2].enabled, 'all levels enabled');
	  assert.ok(levels[3].enabled, 'all levels enabled');
	});

})(QUnit, sinon, videojs);
