"use strict";

var Preloader = {
  init: function init() {
    var _this = this;

    this.$preloader = document.querySelector('.preloader');
    this.$preloader_content = document.querySelector('.preloader__content');
    this.duration = 0;
    this.mintime = 2000;
    this.interval = setInterval(function () {
      _this.duration += 100;
    }, 100);
    setTimeout(function () {
      _this.$preloader.style = 'opacity:1;visibility:visible;';
      setTimeout(function () {
        _this.$preloader_content.classList.add('animate');
      }, 500);
    });
  },
  finish: function finish(callback) {
    var _this2 = this;

    clearInterval(this.interval);

    if (dev) {
      callback();
    } else {
      var finish = function finish() {
        document.body.style.backgroundColor = "".concat(getComputedStyle(document.body).getPropertyValue('--color-main-bg'));
        _this2.$preloader.style = 'opacity:0;visibility:hidden;';
        setTimeout(function () {
          callback();
        }, 500);
      };

      if (this.duration >= this.mintime) finish();else setTimeout(function () {
        finish();
      }, this.mintime - this.duration);
    }
  }
};
Preloader.init();
//# sourceMappingURL=maps/preloader.js.map
