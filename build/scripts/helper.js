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
      var values = cleanUp(location.href).split('/'),
          last_value = values[values.length - 1],
          page = last_value == '' ? 'index.html' : last_value;
      var $links = $block.querySelectorAll('a');
      $links.forEach(function ($this) {
        var href_values = $this.getAttribute('href').split('/'),
            href_page = href_values[href_values.length - 1];

        if (page == href_page) {
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
