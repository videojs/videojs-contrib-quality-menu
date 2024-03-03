const generate = require('videojs-generate-karma-config');

module.exports = function(config) {

  // see https://github.com/videojs/videojs-generate-karma-config
  // for options
  const options = {
    browsers(aboutToRun) {
    // TODO - current firefox headless fails to run w karma, blocking the npm version script.
      return aboutToRun.filter(function(launcherName) {
        return launcherName !== 'FirefoxHeadless';
      });
    }
  };

  config = generate(config, options);

// any other custom stuff not supported by options here!
};

