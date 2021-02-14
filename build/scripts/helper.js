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
    var _this = this;

    this.$block = document.querySelector('.helper');
    this.$trigger = this.$block.querySelector('.helper__trigger');
    this.set_active_page();
    this.$trigger.addEventListener('click', function () {
      if (!_this.state) {
        _this.open();
      } else {
        _this.close();
      }
    });
  },
  set_active_page: function set_active_page() {
    var values = cleanUp(location.href).split('/'),
        last_value = values[values.length - 1],
        page = last_value == '' ? 'index.html' : last_value;
    var $links = this.$block.querySelectorAll('a');
    $links.forEach(function ($this) {
      var href_values = $this.getAttribute('href').split('/'),
          href_page = href_values[href_values.length - 1];

      if (page == href_page) {
        $this.classList.add('active');
      }
    });
  },
  open: function open() {
    this.state = true;
    this.$block.classList.add('active');
  },
  close: function close() {
    this.state = false;
    this.$block.classList.remove('active');
  }
};
//# sourceMappingURL=maps/helper.js.map
