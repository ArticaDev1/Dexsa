window.addEventListener('load', ()=>{
  Helper.init();
})

//url clean
function cleanUp(url) {
  var url = $.trim(url);
  if(url.search(/^https?\:\/\//) != -1)
      url = url.match(/^https?\:\/\/([^?#]+)(?:[?#]|$)/i, "");
  else
      url = url.match(/^([^?#]+)(?:[?#]|$)/i, "");
  return url[1];
}


const Helper = {
  init: function() {
    let $block = document.querySelector('.helper'),
        $trigger = $block.querySelector('.helper__trigger'),
        state;

    let set_active_page = ()=> {
      let value = cleanUp(location.pathname),
          $links = $block.querySelectorAll('a');
  
      $links.forEach(($this)=>{
        let href = $this.getAttribute('href');
        if(href==value) {
          $this.classList.add('active');
        } else {
          $this.classList.remove('active');
        }
      })
    }
    let open = ()=> {
      state = true;
      $block.classList.add('active');
    }
    let close = ()=> {
      state = false;
      $block.classList.remove('active');
    }

    set_active_page();
    window.addEventListener('enterstart', set_active_page);
    $trigger.addEventListener('click', ()=>{
      if(!state) open()
      else close()
    })
  }
}
