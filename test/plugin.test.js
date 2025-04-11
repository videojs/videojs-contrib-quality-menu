import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin.js';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-contrib-quality-menu', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.qualityMenu,
    'function',
    'videojs-contrib-quality-menu plugin was registered'
  );

  this.player.qualityMenu();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-quality-menu'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('Hides and shows the component when an ad plays', function(assert) {
  this.player.qualityMenu();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  const levels = this.player.qualityLevels();
  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');

  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');

  // add multiple quality levels so button displays.
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

  assert.notOk(
    button.hasClass('vjs-hidden'),
    'the plugin is displayed'
  );

  this.player.trigger('adstart');

  assert.ok(
    button.hasClass('vjs-hidden'),
    'the plugin is hidden'
  );

  this.player.trigger('adend');

  assert.notOk(
    button.hasClass('vjs-hidden'),
    'the plugin is no longer hidden'
  );
});

QUnit.test('Groups QualityLevels by bitrate when useResolutionLabels is false', function(assert) {
  this.player.qualityMenu({ useResolutionLabels: false });
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

  assert.equal(button.items[2].options_.label, 'Auto', 'Auto element');
  assert.deepEqual(
    button.items[2].levels_, [0, 1, 2, 3],
    'all variants added to Auto menu item'
  );
});

QUnit.test('Groups QualityLevels by resolution by default', function(assert) {
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

  assert.equal(button.items[0].options_.label, '600p', '600p');
  assert.deepEqual(button.items[0].levels_, [1], '600p variants added to 600p menu item');

  assert.equal(button.items[1].options_.label, '500p', '500p');
  assert.deepEqual(button.items[1].levels_, [0], '500p variants added to 500p menu item');

  assert.equal(button.items[2].options_.label, '300p', '300p');
  assert.deepEqual(button.items[2].levels_, [2], '300p variants added to 300p menu item');

  assert.equal(button.items[3].options_.label, '200p', '200p');
  assert.deepEqual(button.items[3].levels_, [3], '200p variants added to 200p menu item');

  assert.equal(button.items[4].options_.label, 'Auto', 'Auto');
  assert.deepEqual(
    button.items[4].levels_, [0, 1, 2, 3],
    'Auto variants added to Auto menu item'
  );
});

QUnit.test('Does not create menu items for audio-only levels', function(assert) {
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
    width: undefined,
    height: undefined,
    enabled: () => {}
  });

  assert.equal(button.items.length, 4, 'created 4 menu items');

  assert.equal(button.items[0].options_.label, '600p', '600p');
  assert.deepEqual(button.items[0].levels_, [1], '600p variants added to 600p menu item');

  assert.equal(button.items[1].options_.label, '500p', '500p');
  assert.deepEqual(button.items[1].levels_, [0], '500p variants added to 500p menu item');

  assert.equal(button.items[2].options_.label, '300p', '300p');
  assert.deepEqual(button.items[2].levels_, [2], '300p variants added to 300p menu item');

  assert.equal(button.items[3].options_.label, 'Auto', 'Auto');
  assert.deepEqual(
    button.items[3].levels_, [0, 1, 2, 3],
    'All variants added to Auto menu item'
  );
});

QUnit.test('Dispalys bitrate along with resolution when resolutionLabelBitrates option', function(assert) {
  this.player.qualityMenu({ resolutionLabelBitrates: true });
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

  assert.equal(button.items[0].options_.label, '600p @ 3000 kbps', '600p @ 3000 kbps');
  assert.deepEqual(button.items[0].levels_, [1], '600p variants added to 600p menu item');

  assert.equal(button.items[1].options_.label, '500p @ 2000 kbps', '500p @ 2000 kbps');
  assert.deepEqual(button.items[1].levels_, [0], '500p variants added to 500p menu item');

  assert.equal(button.items[2].options_.label, '300p @ 20 kbps', '300p @ 20 kbps');
  assert.deepEqual(button.items[2].levels_, [2], '300p variants added to 300p menu item');

  assert.equal(button.items[3].options_.label, '200p @ 1 kbps', '200p @ 1 kbps');
  assert.deepEqual(button.items[3].levels_, [3], '200p variants added to 200p menu item');

  assert.equal(button.items[4].options_.label, 'Auto', 'Auto');
  assert.deepEqual(
    button.items[4].levels_, [0, 1, 2, 3],
    'Auto variants added to Auto menu item'
  );
});

QUnit.test('Falls back to grouping by bitrate when no resolution info is available', function(assert) {
  this.player.qualityMenu({ useResolutionLabels: true });
  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  const levels = this.player.qualityLevels();
  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');

  assert.equal(button.items.length, 0, 'no menu items when empty quality level list');

  levels.addQualityLevel({
    id: '1',
    bandwidth: 2000001,
    enabled: () => {}
  });
  levels.addQualityLevel({
    id: '2',
    bandwidth: 3000001,
    enabled: () => {}
  });
  levels.addQualityLevel({
    id: '3',
    bandwidth: 19999,
    enabled: () => {}
  });
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

  assert.equal(button.items[2].options_.label, 'Auto', 'Auto');
  assert.deepEqual(
    button.items[2].levels_, [0, 1, 2, 3],
    'Auto variants added to Auto menu item'
  );

});

QUnit.test('Attaches HD flag when an HD rendition is selected', function(assert) {
  this.player.qualityMenu({
    sdBitrateLimit: 100,
    useResolutionLabels: false
  });
  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  const levels = this.player.qualityLevels();
  const button = this.player.getChild('controlBar').getChild('QualityMenuButton');

  const menuContentElement = button.el().getElementsByTagName('ul')[0];

  assert.equal(
    menuContentElement.children.length, 0,
    'no menu items when empty quality level list'
  );

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

  assert.ok(
    !button.hasClass('vjs-quality-menu-button-HD-flag'),
    'no hd flag when hd not selected'
  );

  levels.selectedIndex_ = 0;

  videojs.trigger(levels, 'change');
  assert.ok(button.hasClass('vjs-quality-menu-button-HD-flag'), 'added hd flag');

  levels.selectedIndex_ = 1;

  videojs.trigger(levels, 'change');
  assert.ok(
    !button.hasClass('vjs-quality-menu-button-HD-flag'),
    'no hd flag when hd not selected'
  );
});

QUnit.test('Passing default quality level reverts to auto if desired level is not found', function(assert) {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
  videojs.trigger(levels, 'change');
  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
  assert.ok(
    items[items.length - 1].hasClass('vjs-selected'),
    'auto menu item selected'
  );
  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
  assert.ok(levels[0].enabled, 'all levels enabled');
  assert.ok(levels[1].enabled, 'all levels enabled');
  assert.ok(levels[2].enabled, 'all levels enabled');
  assert.ok(levels[3].enabled, 'all levels enabled');
});

QUnit.test('Passing default "HD/SD" quality level selects correct starting level', function(assert) {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
      if (typeof enable === 'undefined') {
        return enabled[3];
      }
      enabled[3] = enable;
      return enable;
    }
  });

  levels.selectedIndex_ = 3;
  this.player.readyState = () => 1;

  videojs.trigger(levels, 'change');

  const items = button.items;

  assert.equal(items.length, 3, '3 menu items, auto, sd, hd');
  assert.ok(
    items[0].hasClass('vjs-selected'),
    'HD menu item selected at start'
  );
  assert.equal(
    items[0].options_.label, 'HD',
    'HD menu item selected at start'
  );
  assert.ok(levels[0].enabled, 'HD levels enabled');
  assert.ok(levels[1].enabled, 'HD levels enabled');
  assert.ok(!levels[2].enabled, 'SD levels not enabled');
  assert.ok(!levels[3].enabled, 'auto levels not enabled');
});

QUnit.test('Passing default resolution quality level selects correct starting level', function(assert) {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
      if (typeof enable === 'undefined') {
        return enabled[3];
      }
      enabled[3] = enable;
      return enable;
    }
  });

  levels.selectedIndex_ = 3;
  this.player.readyState = () => 1;

  videojs.trigger(levels, 'change');

  const items = button.items;

  assert.equal(items.length, 5, '5 menu items, auto, 100, 200, 400, 500');
  assert.ok(
    items[0].hasClass('vjs-selected'),
    'HD menu item selected at start'
  );
  assert.equal(
    items[0].options_.label, '500p',
    'HD menu item selected at start'
  );
  assert.ok(levels[0].enabled, '500p levels enabled');
  assert.ok(!levels[1].enabled, '400p levels not enabled');
  assert.ok(!levels[2].enabled, '200p levels not enabled');
  assert.ok(!levels[3].enabled, '100p levels not enabled');
});

QUnit.test('Clicking menu item calls quality level enabled functions', function(assert) {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
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
    enabled: (enable) => {
      if (typeof enable === 'undefined') {
        return enabled[3];
      }
      enabled[3] = enable;
      return enable;
    }
  });

  levels.selectedIndex_ = 3;
  videojs.trigger(levels, 'change');

  const items = button.items;

  assert.equal(items.length, 3, '3 menu items, auto, sd, hd');
  assert.ok(
    items[items.length - 1].hasClass('vjs-selected'),
    'auto menu item selected at start'
  );
  assert.equal(
    items[items.length - 1].options_.label, 'Auto',
    'auto menu item selected at start'
  );

  // click hd menu item
  videojs.trigger(items[0].el(), 'click');
  levels.selectedIndex_ = 0;
  videojs.trigger(levels, 'change');
  assert.ok(
    !items[items.length - 1].hasClass('vjs-selected'),
    'auto menu item no longer selected'
  );
  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
  assert.ok(items[0].hasClass('vjs-selected'), 'hd menu item selected');
  assert.ok(levels[0].enabled, 'hd level is enabled');
  assert.ok(levels[1].enabled, 'hd level is enabled');
  assert.ok(!levels[2].enabled, 'non hd level disabled');
  assert.ok(!levels[3].enabled, 'non hd level disabled');

  // click sd menu item
  videojs.trigger(items[1].el(), 'click');
  levels.selectedIndex_ = 3;
  videojs.trigger(levels, 'change');
  assert.ok(items[1].hasClass('vjs-selected'), 'sd menu item selected');
  assert.ok(
    !items[items.length - 1].hasClass('vjs-selected'),
    'auto menu item not selected'
  );
  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
  assert.ok(levels[2].enabled, 'sd level is enabled');
  assert.ok(levels[3].enabled, 'sd level is enabled');
  assert.ok(!levels[0].enabled, 'non sd level disabled');
  assert.ok(!levels[1].enabled, 'non sd level disabled');

  // click auto menu item
  videojs.trigger(items[items.length - 1].el(), 'click');
  levels.selectedIndex_ = 2;
  videojs.trigger(levels, 'change');
  assert.ok(!items[1].hasClass('vjs-selected'), 'sd menu item not selected');
  assert.ok(
    items[items.length - 1].hasClass('vjs-selected'),
    'auto menu item selected'
  );
  assert.ok(!items[0].hasClass('vjs-selected'), 'hd menu item not selected');
  assert.ok(levels[0].enabled, 'all levels enabled');
  assert.ok(levels[1].enabled, 'all levels enabled');
  assert.ok(levels[2].enabled, 'all levels enabled');
  assert.ok(levels[3].enabled, 'all levels enabled');
});
