const Preloader = {
  init: function() {
    this.$preloader = document.querySelector('.preloader');
    this.$preloader_content = document.querySelector('.preloader__content');
    this.duration = 0;
    this.mintime = 2000;

    this.interval = setInterval(() => {
      this.duration+=100;
    }, 100);

    setTimeout(()=>{
      this.$preloader.style = 'opacity:1;visibility:visible;';
      setTimeout(()=>{
        this.$preloader_content.classList.add('animate');
      }, 500)
    })

  },
  finish: function(callback) {
    document.body.style.backgroundColor = `${getComputedStyle(document.body).getPropertyValue('--color-main-bg')}`;
    clearInterval(this.interval);
    if(dev) {
      this.$preloader.style = 'transition:0;opacity:0;visibility:hidden;';
      callback();
    } 
    
    else {
      let finish = ()=> {
        this.$preloader.style = 'opacity:0;visibility:hidden;';
        setTimeout(() => {
          callback();
        }, 500);
      }
      if(this.duration>=this.mintime) finish();
      else setTimeout(()=>{finish()}, this.mintime - this.duration);
    }
  }
}

Preloader.init();
