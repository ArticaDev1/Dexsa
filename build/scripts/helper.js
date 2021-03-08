"use strict";

window.addEventListener('load', function () {
  Helper.init();
}); //url clean

function cleanUp(url) {
  var url = $.trim(url);
  if (url.search(/^https?\:\/\//) != -1) url = url.match(/^https?\:\/\/([^?#]+)(?:[?#]|$)/i, "");else url = url.match(/^([^?#]+)(?:[?#]|$)/i, "");
  return url[1];
}

var Helper = {
  init: function init() {
    var $block = document.querySelector('.helper'),
        $trigger = $block.querySelector('.helper__trigger'),
        state;

    var set_active_page = function set_active_page() {
      var value1 = cleanUp(location.pathname),
          value2 = '.' + cleanUp(location.pathname);
      var $links = $block.querySelectorAll('a');
      console.log(value1, value2);
      $links.forEach(function ($this) {
        var href = $this.getAttribute('href');

        if (href == value1 || href == value2) {
          $this.classList.add('active');
        } else {
          $this.classList.remove('active');
        }
      });
    };

    var open = function open() {
      state = true;
      $block.classList.add('active');
    };

    var close = function close() {
      state = false;
      $block.classList.remove('active');
    };

    set_active_page();
    window.addEventListener('enterstart', set_active_page);
    $trigger.addEventListener('click', function () {
      if (!state) open();else close();
    });
  }
};
//# sourceMappingURL=maps/helper.js.map
