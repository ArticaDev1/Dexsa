window.dev = false;

const Speed = 1; //seconds

const $body = document.body;
const $wrapper = document.querySelector('.wrapper');
const $content = document.querySelector('.content');
const $header = document.querySelector('.header');
const $overlay = document.querySelector('.transition-overlay');
const brakepoints = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1600
}

import 'lazysizes';

import {gsap} from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({
  ease: "power2.inOut", 
  duration: Speed
});

//barba
import barba from '@barba/core';
barba.init({
  debug: true,
  preventRunning: true,
  transitions: [{
    leave(data) {
      barba.done = this.async();
      Transitions.exit(data.current.container, data.current.namespace);
    },
    enter(data) {
      Transitions.enter(data.next.container, data.next.namespace);
    }
  }]
});
import Scrollbar from 'smooth-scrollbar';
import autosize from 'autosize';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';

import Swiper, {Navigation, Pagination, Lazy, Autoplay, EffectFade} from 'swiper/core';
Swiper.use([Navigation, Pagination, Lazy, Autoplay, EffectFade]);

import SwipeListener from 'swipe-listener';
const validate = require("validate.js");
import Inputmask from "inputmask";
require('fslightbox');

const contentWidth = () => {
  return $wrapper.getBoundingClientRect().width;
}
//check device
function mobile() {
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    return true;
  } else {
    return false;
  }
}
//url clean
function cleanUp(url) {
  var url = $.trim(url);
  if(url.search(/^https?\:\/\//) != -1)
      url = url.match(/^https?\:\/\/([^?#]+)(?:[?#]|$)/i, "");
  else
      url = url.match(/^([^?#]+)(?:[?#]|$)/i, "");
  return url[1];
}

window.onload = function(){
  App.init(); 
}

const App = {
  init: function() {
    this.$container = document.querySelector('[data-barba="container"]');
    this.namespace = this.$container.getAttribute('data-barba-namespace');
    this.name = this.$container.getAttribute('data-name');

    this.afunctions = new ActiveFunctions();
    this.afunctions.create();

    //functions
    Scroll.init();
    TouchHoverEvents.init();
    Header.init();
    Nav.init();
    Validation.init();
    Modal.init();
    inputs();
    toggle();

    if(mobile()) {
      windowSize.init();
      $body.classList.add('mobile');
      $body.style.cssText = 'position:initial;height:initial;width:initial;overflow:auto;';
      disablePageScroll();
    } else {
      $body.classList.add('desktop');
      Parallax.init();
      Cursor.init();
      $body.classList.add('hidden');
    }
    
    window.addEventListener('enterstart', ()=>{
      ActiveLinks.check();
      $wrapper.classList.remove('disabled');
      if(mobile()) {
        enablePageScroll();
      }

      if(!this.initialized) {
        this.initialized = true;
        gsap.set($wrapper, {autoAlpha:1})
      }

      this.afunctions.add(LightsScene, '.homepage-scene');
      this.afunctions.add(HomeScene, '.homepage');
      this.afunctions.add(ItemSlider, '.items-slider');
      this.afunctions.add(AdvantagesLights, '.advantages-block .icon');
      this.afunctions.add(Card3d, '.js-3d');
      this.afunctions.add(AboutTextBlock, '.about-text');
      this.afunctions.add(AboutPreviewBlock, '.about-preview');
      this.afunctions.add(DecorationLight, '.decoration-light');
      this.afunctions.add(ClientsBlock, '.clients');
      this.afunctions.add(ContactsBlock, '.contacts-block');
      this.afunctions.add(ProductHead, '.product-head');
      this.afunctions.add(ProductBlock, '.product-item');
      this.afunctions.add(FadeBlocks, '.js-fade-blocks');
      this.afunctions.add(ImageSlider, '.image-slider');
      this.afunctions.add(SfSlider, '.system-features-slider');
      this.afunctions.add(ShemaLights, '.sumo-schema');
      this.afunctions.add(DocsSlider, '.documents-slider');
      this.afunctions.add(RefSlider, '.ref-slider');
      this.afunctions.add(HeadSlider, '.category-head.swiper');
      this.afunctions.add(Map, '.contacts-block__map');
      this.afunctions.add(HistoryBlock, '.section-history');
      this.afunctions.add(AnimationHead, '.animation-head');
      
      
      autosize(document.querySelectorAll('textarea.input__element'));

      this.afunctions.init();
    })

    window.addEventListener('enterfinish', ()=>{
      refreshFsLightbox();
      ScrollTrigger.refresh();
      if(Scroll.scrollbar) Scroll.scrollbar.track.yAxis.element.classList.remove('hidden');
    })

    window.addEventListener('exitstart', ()=>{
      
      for(let instance in fsLightboxInstances) {
        if(fsLightboxInstances[instance].data.isInitialized) {
          if(document.documentElement.classList.contains('fslightbox-open')) {
            fsLightboxInstances[instance].close();
          }
        }
      }

      ActiveLinks.reset();
      $wrapper.classList.add('disabled');
      Scroll.scrollTop(Math.max(Scroll.y-window.innerHeight/2, 0), Speed);
      if(Scroll.scrollbar) Scroll.scrollbar.track.yAxis.element.classList.add('hidden');
      if(mobile()) {
        disablePageScroll();
      } 
    })

    window.addEventListener('exitfinish', ()=>{
      Scroll.scrollTop(0, 0);
      this.afunctions.destroy();
    })

    Preloader.finish(()=>{
      Transitions.enter(this.$container, this.namespace);
    })

  }
}

const Transitions = {
  enter: function($container, namespace) {
    App.$container = $container;
    App.namespace = namespace;
    App.name = App.$container.getAttribute('data-name');

    //header
    if(!App.initialized) {
      gsap.timeline()  
        .fromTo($header, {autoAlpha:0}, {autoAlpha:1})
    }
    
    window.dispatchEvent(new Event("enterstart"));

    this.enterAnimation = gsap.timeline() 
      .to($overlay, {autoAlpha:0})
    .eventCallback('onComplete', ()=>{
      this.active = false;
      window.dispatchEvent(new Event("enterfinish"));
    })

  },
  exit: function($container) {
    this.active = true;
    window.dispatchEvent(new Event("exitstart"));
    
    this.exitAnimation = gsap.timeline()
    .to($overlay, {autoAlpha:1})
    .eventCallback('onComplete', ()=>{
      window.dispatchEvent(new Event("exitfinish"));
      barba.done();
    })

  }
}

const ActiveLinks = {
  check: ()=> {
    let value = cleanUp(location.pathname),
        $links = document.querySelectorAll('a');
    
    $links.forEach($this=>{
      let href = $this.getAttribute('href');
      if(href==value) {
        $this.classList.add('is-active-page');
      } else {
        $this.classList.remove('is-active-page');
      }
    })
  },
  reset: ()=> {
    let $links = document.querySelectorAll('a');
    $links.forEach($this=>{
      $this.classList.remove('is-active-page');
    })
  }
}

const windowSize = {
  init: function() {
    let $el = document.createElement('div');
    $el.style.cssText = 'position:fixed;height:100%;';
    $body.insertAdjacentElement('beforeend', $el);
    let h = $el.getBoundingClientRect().height;

    window.addEventListener('enterstart', ()=>{
      let $el = App.$container.querySelectorAll('.screen');
      $el.forEach($this => {
        $this.style.minHeight = `${h}px`;
      })
    })
  }
}

const TouchHoverEvents = {
  targets: 'a, button, label, tr, [data-touch-hover], .scrollbar-track',
  touched: false,
  touchEndDelay: 100, //ms
  init: function() {
    document.addEventListener('touchstart',  (event)=>{this.events(event)});
    document.addEventListener('touchend',    (event)=>{this.events(event)});
    document.addEventListener('mouseenter',  (event)=>{this.events(event)},true);
    document.addEventListener('mouseleave',  (event)=>{this.events(event)},true);
    document.addEventListener('mousedown',   (event)=>{this.events(event)});
    document.addEventListener('mouseup',     (event)=>{this.events(event)});
    document.addEventListener('contextmenu', (event)=>{this.events(event)});
  },
  events: function(event) {
    let $targets = [];
    $targets[0] = event.target!==document?event.target.closest(this.targets):null;
    let $element = $targets[0], i = 0;

    while($targets[0]) {
      $element = $element.parentNode;
      if($element!==document) {
        if($element.matches(this.targets)) {
          i++;
          $targets[i] = $element;
        }
      } 
      else {
        break;
      }
    }

    //touchstart
    if(event.type=='touchstart') {
      this.touched = true;
      if(this.timeout) clearTimeout(this.timeout);
      if($targets[0]) {
        for(let $target of $targets) $target.setAttribute('data-touch', '');
      }
    } 
    //touchend
    else if(event.type=='touchend' || (event.type=='contextmenu' && this.touched)) {
      this.timeout = setTimeout(() => {this.touched = false}, 500);
      if($targets[0]) {
        setTimeout(()=>{
          for(let $target of $targets) {
            $target.dispatchEvent(new CustomEvent("customTouchend"));
            $target.removeAttribute('data-touch');
          }
        }, this.touchEndDelay)
      }
    } 
    
    //mouseenter
    if(event.type=='mouseenter' && !this.touched && $targets[0] && $targets[0]==event.target) {
      $targets[0].setAttribute('data-hover', '');
    }
    //mouseleave
    else if(event.type=='mouseleave' && !this.touched && $targets[0] && $targets[0]==event.target) {
      $targets[0].removeAttribute('data-focus');
      $targets[0].removeAttribute('data-hover');
    }
    //mousedown
    if(event.type=='mousedown' && !this.touched && $targets[0]) {
      $targets[0].setAttribute('data-focus', '');
    } 
    //mouseup
    else if(event.type=='mouseup' && !this.touched  && $targets[0]) {
      $targets[0].removeAttribute('data-focus');
    }
  }
}

const Cursor = {
  init: function() {
    this.$parent = document.querySelector('.cursor');

    let events = (event)=> {
      let $target = event.target!==document?event.target.closest('[data-cursor]'):null;
      if($target) {
        let attr = $target.getAttribute('data-cursor');
        if(event.type=='mouseenter' && $target==event.target) {
          this.$parent.classList.add(attr);
        } 
        else if(event.type=='mouseleave' && $target==event.target) {
          this.$parent.classList.remove(attr);
          this.$parent.classList.remove('focus');
        } 
        else if(event.type=='mousedown') {
          this.$parent.classList.add('focus');
        } 
        else if(event.type=='mouseup') {
          this.$parent.classList.remove('focus');
        }
      }

      if(event.type=='mousemove') {
        let x = event.clientX,
            y = event.clientY;
        gsap.to(this.$parent, {duration:0.5,x:x,y:y,ease:'power2.out'})
      }
    }

    document.addEventListener('mouseenter',  (event)=>{events(event)},true);
    document.addEventListener('mouseleave',  (event)=>{events(event)},true);
    document.addEventListener('mousedown',   (event)=>{events(event)});
    document.addEventListener('mouseup',     (event)=>{events(event)});
    document.addEventListener('mousemove',     (event)=>{events(event)});

    this.initialized = true;
  }
}

const Scroll = {
  init: function() {
    this.y = 0;
    if(mobile()) this.native();
    else         this.custom(); 
  },
  custom: function() {
    this.scrollbar = Scrollbar.init($content, {
      damping: 0.2
    })
    this.scrollbar.addListener(()=>{
      localStorage.setItem('scroll', this.scrollbar.offset.y);
      this.y = this.scrollbar.offset.y;
    })
    if(dev) {
      this.scrollbar.setPosition(0, +localStorage.getItem('scroll'));
    }
    this.$scrollbar = document.querySelector('.scrollbar-track-y');

    //gsap trigger
    let scrollbar = this.scrollbar;
    ScrollTrigger.scrollerProxy($body, {
      scrollTop(value) {
        if (arguments.length) {
          scrollbar.scrollTop = value
        }
        return scrollbar.scrollTop;
      },
      getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
      }
    });
    this.scrollbar.addListener(ScrollTrigger.update);
  },
  native: function() {
    window.addEventListener('scroll', ()=>{
      this.y = window.pageYOffset;
    })
    window.addEventListener('exit', ()=>{
      $body.style.overflow = 'hidden';
    })
    window.addEventListener('enter_finish', ()=>{
      $body.style.overflow = 'auto';
    })
  },
  scrollTop: function(y, speed) {
    if(speed>0) this.inScroll=true;
    //custom
    if(this.scrollbar) {
      if(speed>0) {
        this.animation = gsap.to(this.scrollbar, {scrollTop:y, duration:speed, ease:'power2.inOut',onComplete:()=>{
          this.inScroll=false;
        }});
      } else {
        gsap.set(this.scrollbar, {scrollTop:y});
      }
    } 
    //native
    else {
      let scroll = {y:this.y};
      if(speed>0) {
        this.animation = gsap.to(scroll, {y:y, duration:speed, ease:'power2.inOut', onComplete:()=>{
          this.inScroll=false;
          cancelAnimationFrame(this.frame);
        }})
        this.checkScroll = ()=>{
          window.scrollTo(0, scroll.y);
          this.frame = requestAnimationFrame(()=>{this.checkScroll()});
        }
        this.checkScroll();
      } else {
        window.scrollTo(0, y);
      }
    }
  },
  stop: function() {
    this.inScroll=false;
    if(this.animation) this.animation.pause();
    if(this.frame) cancelAnimationFrame(this.frame);
  },
  addListener: function(func) {
    //custom
    if(this.scrollbar) {
      this.scrollbar.addListener(func);
    }
    //native
    else {
      window.addEventListener('scroll', func);
    }
  }, 
  removeListener: function(func) {
    //custom
    if(this.scrollbar) {
      this.scrollbar.removeListener(func);
    }
    //native 
    else {
      window.removeEventListener('scroll', func);
    }
  }
}

class ActiveFunctions {
  create() {
    this.functions = [];
  }
  add(clss, blocks) {
    let $blocks = App.$container.querySelectorAll(blocks);
    if($blocks.length) {
      $blocks.forEach($block => {
        this.functions.push(new clss($block));
      });
    }
  }
  init() {
    this.functions.forEach(func => {
      func.init();
    })
  }
  destroy() {
    this.functions.forEach(func => {
      func.destroy();
    })
    this.functions = [];
  }
}

class LightsScene {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {

    //mobile
    if(mobile()) {
      this.$light = this.$parent.querySelector('.homepage-scene__light');
      this.$light.style.display = 'block';
      let animation = gsap.timeline({paused:true})
        .fromTo(this.$light, {autoAlpha:0}, {autoAlpha:1})
      setTimeout(() => {
        animation.play();
      }, 500);
    } 

    //desktop
    else {
      this.$layers_container = this.$parent.querySelector('.homepage-scene__layers');
      this.$triggers_container = this.$parent.querySelector('.homepage-scene__triggers');
      this.$container = this.$parent.querySelector('.homepage-scene__container');
      this.$layers = this.$parent.querySelectorAll('.homepage-scene__layer');
      this.$triggers = this.$parent.querySelectorAll('.homepage-scene__trigger');
      this.states = [];

      this.$layers_container.style.display = 'block';
      this.$triggers_container.style.display = 'block';

      //create animations
      this.animations = {};
      this.$layers.forEach(($this, index)=>{
        this.animations[index] = {};
        this.animations[index].animation = gsap.timeline({paused:true})
          .to(this.$layers[index], {autoAlpha:1, duration:Speed})
      })

      this.resizeEvent = () => {
        let h = this.$parent.getBoundingClientRect().height,
            w = contentWidth(),
            res = 0.666;

        if (h / w < res) {
          this.$container.style.width = `${w}px`;
          this.$container.style.height = `${w*res}px`;
        } else {
          this.$container.style.width = `${h/res}px`;
          this.$container.style.height = `${h}px`;
        }
      }

      this.mousemoveEvent = (event) => {
        if(event.type=='mouseleave') {
          for(let i in this.animations) {
            if(this.animations[i].state) {
              this.animations[i].animation.duration(Speed).reverse();
              this.animations[i].state = false;
            }
          }
        } else {
          let x = event.clientX,
              y = event.clientY;
          this.$triggers.forEach(($trigger, index)=>{
            let x1 = $trigger.getBoundingClientRect().left,
                x2 = $trigger.getBoundingClientRect().right,
                y1 = $trigger.getBoundingClientRect().top,
                y2 = $trigger.getBoundingClientRect().bottom,
                animation = this.animations[index].animation,
                state = this.animations[index].state;
            
            if(x>=x1 && x<=x2 && y>=y1 && y<=y2) {
              if(!state) {
                state = true;
                animation.duration(0.05).play();
              }
            } else if(state) {
              state = false;
              animation.duration(Speed).reverse();
            }
    
            this.animations[index].state = state;
          })  
        }
      }
      
      this.resizeEvent();
      window.addEventListener('resize', this.resizeEvent);
      window.addEventListener('mousemove', this.mousemoveEvent);
      document.addEventListener('mouseleave', this.mousemoveEvent);
    }

  }

  destroy() {
    if(this.resizeEvent) window.removeEventListener('resize', this.resizeEvent);
    if(this.mousemoveEvent) window.removeEventListener('mousemove', this.mousemoveEvent);
    if(this.mousemoveEvent) document.removeEventListener('mouseleave', this.mousemoveEvent);
    for(let child in this) delete this[child];
  }
}

const Header = {
  init: function () {
    this.old_scroll = 0;
    Scroll.addListener(()=>{
      this.check();
    })
    this.check();
  },
  check: function () {
    let y = Scroll.y,
        h = window.innerHeight/2,
        fixed = $header.classList.contains('header_fixed'),
        hidden = $header.classList.contains('header_hidden');

    if (y > 0 && !fixed && !Transitions.active) {
      $header.classList.add('header_fixed');
    } else if ((y<=0 && fixed) || Transitions.active) {
      $header.classList.remove('header_fixed');
    }

    //листаем вниз
    if(this.old_scroll<y) {
      this.old_flag = y;
      if(y>h && !hidden) {
        $header.classList.add('header_hidden');
      }
    }
    //листаем вверх
    else if(this.old_scroll>y) {
      if(hidden && (y<h || y+200<this.old_flag)) {
        $header.classList.remove('header_hidden');
      }
    } 

    this.old_scroll = y;
  }
}

const Nav = {
  init: function() {
    this.$nav = document.querySelector('.nav');
    this.$bg = document.querySelector('.nav__bg');
    this.$container = document.querySelector('.nav__container');
    this.$block = document.querySelector('.nav__block');
    this.$toggle = document.querySelector('.nav-toggle');
    this.$navitems = document.querySelectorAll('.nav__item, .nav__sub-item');
    this.state = false;
    this.opened = false;
    
    this.resize = ()=> {
      let cw1 = document.querySelector('.header .container').getBoundingClientRect().width,
          cw2 = document.querySelector('.header__container').getBoundingClientRect().width,
          w2 = (contentWidth()-cw2)/2;
        
      this.bw = this.$block.getBoundingClientRect().width;
      this.pd = (cw1-cw2)/2;

      if(window.innerWidth>=brakepoints.sm) {
        this.$container.style.width = `${this.bw+w2}px`;
      }

      if(window.innerWidth>=brakepoints.xl && this.state) {
        this.close();
      }

      this.animation = gsap.timeline({paused:true, 
        onStart:()=>{
          disablePageScroll();
          this.opened = true;
        }, 
        onReverseComplete:()=>{
          enablePageScroll();
          this.opened = false;
        }
      })
        .fromTo(this.$nav, {autoAlpha:0}, {autoAlpha:1, duration:0.1})
        .fromTo(this.$toggle, {x:0}, {x:-this.bw-this.pd, duration:0.4}, `-=0.1`)
        .fromTo(this.$container, {xPercent:100}, {xPercent:0, duration:0.5}, `-=0.4`)
        .fromTo(this.$bg, {autoAlpha:0}, {autoAlpha:1, duration:0.5}, `-=0.5`)
        .fromTo(this.$navitems, {autoAlpha:0, y:30}, {autoAlpha:1, y:0, duration:0.45, stagger:{amount:0.05}}, `-=0.5`)

      if(this.state) {
        this.animation.seek(this.animation.totalDuration());
      }
    };
    this.resize();


    this.$bg.addEventListener('click', ()=>{
      if(this.state) this.close();
    })
    this.$toggle.addEventListener('click', ()=>{
      if(!this.state) this.open(); 
      else this.close();
    })

    if(!mobile()) {
      Scrollbar.init(this.$container, {
        damping: 1
      })
    }
    
    //this.open()

    window.addEventListener('resize', this.resize);

    window.addEventListener('exitstart', (event)=>{
      if(this.state) this.close();
    })
  },
  open: function() {
    $header.classList.add('header_nav-opened');
    this.$nav.classList.add('nav_opened');
    this.$toggle.classList.add('active');
    this.state=true;
    this.animation.play();
  },
  close: function() {
    $header.classList.remove('header_nav-opened');
    this.$nav.classList.remove('nav_opened');
    this.$toggle.classList.remove('active');
    this.state=false;
    this.animation.reverse();
  }
}

function inputs() {
  let events = (event)=> {
    let $input = event.target!==document?event.target.closest('.input__element'):null;
    if($input) {
      if(event.type=='focus') {
        $input.parentNode.classList.add('focused');
      } else {
        let value = $input.value;
        if (validate.single(value, {presence: {allowEmpty: false}}) !== undefined) {
          $input.value = '';
          $input.parentNode.classList.remove('focused');
          //textarea
          if($input.tagName=='TEXTAREA') {
            if(window.innerWidth>=brakepoints.sm) {
              $input.style.height = '56px';
            } else {
              $input.style.height = '48px';
            }
          }
        }
      }
    }
  }

  document.addEventListener('focus',  (event)=>{events(event)}, true);
  document.addEventListener('blur',   (event)=>{events(event)}, true);
}

function toggle() {
  let $targets;

  let events = (event)=> {
    let $target = event.target!==document?event.target.closest('[data-toggle-trigger], [data-toggle-content]'):null;
    if(!TouchHoverEvents.touched) {
      if(event.type=='mouseenter' && $target==event.target && !$targets) {
        $targets = $target.parentNode.querySelectorAll('[data-toggle-trigger], [data-toggle-content]');
        $targets.forEach($this=>{$this.classList.add('is-active')});
      } else if(event.type=='mouseleave' && $target==event.target) {
        $targets.forEach($this=>{$this.classList.remove('is-active')});
        $targets = false;
      }
    }
  }

  document.addEventListener('mouseenter', (event)=>{events(event)}, true);
  document.addEventListener('mouseleave', (event)=>{events(event)}, true);
}

class AdvantagesLights {
  constructor($block) {
    this.$block = $block;
  }
  init() {
    this.trigger = ScrollTrigger.create({
      trigger: this.$block,
      start: "center bottom",
      end: "center top",
      once: true,
      toggleClass: 'animate'
    });
  }
  destroy() {
    this.trigger.kill();
    for(let child in this) delete this[child];
  }
}

class Card3d {
  constructor($block) {
    this.$block = $block;
  }
  init() {
    this.$back = this.$block.querySelector('.js-3d__back');
    this.$forward = this.$block.querySelector('.js-3d__forward');

    this.event = (event)=> {
      if(!TouchHoverEvents.touched) {
        if(event.type=='mousemove') {
          if(this.backanimation) this.backanimation.pause();
  
          let x = this.$block.getBoundingClientRect().x - event.clientX,
              y = this.$block.getBoundingClientRect().y - event.clientY,
              w = this.$block.getBoundingClientRect().width/2,
              h = this.$block.getBoundingClientRect().height/2,
              xValue = -(1+x/w),
              yValue = 1+y/h,
              //
              xr = xValue*4,
              yr = yValue*4,
              xm = xValue*3,
              ym = -yValue*3;
  
          if(this.animation) this.animation.pause();
          this.animation = gsap.timeline({defaults:{ease:'power2.out', duration:Speed/2}})
            .to(this.$back, {rotationY:xr, rotationX:yr})
            .to(this.$forward, {x:xm, y:ym}, `-=${Speed/2}`)
        } 
        else {
          if(this.animation) this.animation.pause();
          this.backanimation = gsap.timeline({defaults:{ease:'power2.out', duration:Speed/2}})
            .to(this.$back, {rotationY:0, rotationX:0})
            .to(this.$forward, {x:0, y:0}, `-=${Speed/2}`)
        }
      }
    }

    this.$block.addEventListener('mousemove',  this.event);
    this.$block.addEventListener('mouseleave', this.event);
  }

  destroy() {
    this.$block.removeEventListener('mousemove',  this.event);
    this.$block.removeEventListener('mouseleave', this.event);
    for(let child in this) delete this[child];
  }
}

class AboutTextBlock {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    this.$block = this.$parent.querySelector('.about-text__block');
    this.$lights = this.$parent.querySelectorAll('.about-text__light');
    this.$color1 = getComputedStyle(document.documentElement).getPropertyValue('--color-dark');
    this.$color2 = getComputedStyle(document.documentElement).getPropertyValue('--color-light');

    this.check = ()=> {
      if(window.innerWidth >= brakepoints.lg && (!this.initialized || !this.flag)) {
        if(this.initialized) {
          this.destroyType();
        }
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyType();
        }
        this.initMobile();
        this.flag = false;
      }
    }

    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    this.animation = gsap.timeline({paused:true})
      .fromTo(this.$block, {css:{color:this.$color1}}, {css:{color:this.$color2}, duration:0.8, ease:'power2.in'})
      .to(this.$block, {css:{color:this.$color1}, duration:0.8, ease:'power2.out'}, '+=0.4') //2
      .fromTo(this.$lights[0], {rotate:2}, {rotate:-2, duration:2, ease:'power1.inOut'}, '-=2') //2
      .fromTo(this.$lights[1], {rotate:2}, {rotate:-2, duration:2, ease:'power3.inOut'}, '-=2') //2
      .fromTo(this.$lights, {autoAlpha:0}, {autoAlpha:1, duration:0.8, ease:'power2.in'}, '-=2')
      .to(this.$lights, {autoAlpha:0, duration:0.8, ease:'power2.out'}, '-=0.8')
    this.trigger = ScrollTrigger.create({
      trigger: this.$parent,
      start: "center bottom",
      end: 'center top',
      scrub: true,
      onUpdate: self => {
        this.animation.progress(self.progress);
      }
    });
  }

  initMobile() {
    this.animation = gsap.timeline({paused:true, defaults:{duration:1}})
      .fromTo(this.$block, {css:{color:this.$color1}}, {css:{color:this.$color2}, ease:'power2.in'})
      .fromTo(this.$lights, {autoAlpha:0}, {autoAlpha:1, ease:'power2.in'}, '-=1')
    this.trigger = ScrollTrigger.create({
      trigger: this.$parent,
      start: "center bottom",
      end: 'center center',
      scrub: true,
      onUpdate: self => {
        this.animation.progress(self.progress);
      }
    });
  }

  destroyType() {
    this.animation.kill();
    this.trigger.kill();
    gsap.set([this.$lights, this.$block], {clearProps: "all"})
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    this.destroyType();
    for(let child in this) delete this[child];
  }
}

class DecorationLight {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.lg && (!this.initialized || !this.flag)) {
        if(this.initialized) {
          this.destroyMobile();
        }
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.initMobile();
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    this.$container = this.$parent.querySelector('.decoration-light__container');
    this.$image = this.$parent.querySelector('.decoration-light__image');
    this.$images = this.$parent.querySelectorAll('.image');

    let val = window.innerHeight/this.$container.getBoundingClientRect().height;
    this.animations = [];
    this.animations[0] = gsap.timeline({paused:true})
      .fromTo(this.$image, {scale:0.8, yPercent:-10}, {scale:1, yPercent:0, duration:1, ease:'none'})
      .fromTo(this.$images[1], {autoAlpha:0}, {autoAlpha:1, duration:0.5}, '-=0.5')

    let val1 = 1 + 0.2*val,
        val2 = -(val1-1)*50;

    this.animations[1] = gsap.timeline({paused:true})
      .to(this.$image, {scale:val1, yPercent:val2, duration:1, ease:'none'})

    this.triggers = [];
    this.triggers[0] = ScrollTrigger.create({
      trigger: this.$container,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: self => {
        this.animations[0].progress(self.progress);
      }
    });
    this.triggers[1] = ScrollTrigger.create({
      trigger: this.$container,
      start: "bottom bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: self => {
        this.animations[1].progress(self.progress);
      }
    });
  }

  initMobile() {
    this.$container = this.$parent.querySelector('.decoration-light__container');
    this.$images = this.$parent.querySelectorAll('.image');

    this.mob_animation = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
      .fromTo(this.$images[1], {autoAlpha:0}, {autoAlpha:1})

    this.mob_trigger = ScrollTrigger.create({
      trigger: this.$container,
      start: "center bottom",
      end: "center center",
      scrub: true,
      onUpdate: self => {
        this.mob_animation.progress(self.progress);
      }
    });
  }

  destroyDesktop() {
    gsap.set([this.$image, this.$images], {clearProps: "all"})
    for(let child in this.animations) this.animations[child].kill();
    for(let child in this.triggers) this.triggers[child].kill();
  }

  destroyMobile() {
    gsap.set([this.$images], {clearProps: "all"})
    this.mob_animation.kill();
    this.mob_trigger.kill();
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    if(this.flag) this.destroyDesktop();
    else this.destroyMobile();
    for(let child in this) delete this[child];
  }
}

class AboutPreviewBlock {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.lg && (!this.initialized || !this.flag)) {
        if(this.initialized) {
          this.destroyMobile();
        }
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.initMobile()
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    let pinType = Scroll.scrollbar?'transform':'fixed';
    this.$container = this.$parent.querySelector('.about-preview__container');
    this.$blocks = this.$parent.querySelectorAll('.about-preview-block');
    this.$images = this.$parent.querySelectorAll('.about-preview-block__image');
    this.$text = this.$parent.querySelectorAll('.about-preview-block__text');
    this.$text_item = this.$parent.querySelectorAll('.about-preview-block__text p');
    this.$lines = this.$parent.querySelectorAll('.about-preview-block__text span');
    this.$light = this.$parent.querySelectorAll('.about-preview-block__light');
    this.$ftext = this.$parent.querySelector('.section__head-txt');
    this.$mouse = this.$parent.querySelector('.mouse-icon');

    this.canvas = this.$parent.querySelector('.about-preview__scene canvas');
    this.context = this.canvas.getContext("2d");

    this.mousepos = ()=> {
      let h1 = this.$container.getBoundingClientRect().height,
          h2 = this.$mouse.getBoundingClientRect().height,
          val = (window.innerHeight-h1)/4 + h1 - h2/2;

      this.$mouse.style.top = `${val}px`;

    }
    this.mousepos();
    window.addEventListener('resize', this.mousepos);

    this.animation = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
      .to(this.$text_item[0], {y:-30}, '-=1')
      .to(this.$text_item[0], {autoAlpha:0, duration:0.5}, '-=0.5')
      .to(this.$lines[0], {scaleX:0, xPercent:50, duration:0.75, ease:'power2.in'}, '-=0.5')
      .to(this.$blocks[0], {autoAlpha:0, duration:0.5, ease:'power2.out'}, '-=0.25')

      .fromTo(this.$blocks[1],  {autoAlpha:0},  {autoAlpha:1, duration:0.5, ease:'power2.in'}, '-=0.5')
      .fromTo(this.$lines[1], {scaleX:0, xPercent:50}, {scaleX:1, xPercent:0, duration:0.75, ease:'power2.out'}, '-=0.25')
      .fromTo(this.$text_item[1], {autoAlpha:0}, {autoAlpha:1, duration:0.5}, '-=0.5')
      .fromTo(this.$text_item[1], {y:30}, {y:-30, duration:2}, '-=0.5')
      .to(this.$text_item[1], {autoAlpha:0, duration:0.5}, '-=0.5')
      .to(this.$lines[1], {scaleX:0, xPercent:50, duration:0.75, ease:'power2.in'}, '-=0.5')
      .to(this.$blocks[1], {autoAlpha:0, duration:0.5, ease:'power2.out'}, '-=0.25')

      .fromTo(this.$blocks[2], {autoAlpha:0}, {autoAlpha:1, duration:0.5, ease:'power2.in'}, '-=0.5')
      .fromTo(this.$lines[2], {scaleX:0, xPercent:50}, {scaleX:1, xPercent:0, duration:0.75, ease:'power2.out'}, '-=0.25')
      .fromTo(this.$text_item[2], {autoAlpha:0}, {autoAlpha:1, duration:0.5}, '-=0.5')
      .fromTo(this.$text_item[2], {y:30}, {y:0}, '-=0.5')

      .to(this.$mouse, {autoAlpha:0, duration:1}, '-=4')
    

    this.canvas.width=1000;
    this.canvas.height=1000;
    this.framesCount = 152;
    this.frames = [];
    for(let i = 0; i < this.framesCount; i++) {
      this.frames[i] = new Image();
      this.frames[i].src = `https://articadev1.github.io/Dexsa/build/img/lightrender/2.${1000+i}.jpg`;
    }
    this.activeFrame = this.frames[0];
    this.sceneRender = ()=> {
      this.context.drawImage(this.activeFrame, 0, 0);
      this.animationFrame = requestAnimationFrame(this.sceneRender);
    }
    this.sceneRender();


    this.triggers = [];

    this.triggers[0] = ScrollTrigger.create({
      trigger: this.$container,
      start: "center center",
      end: '+=2500',
      pin: true,
      pinType: pinType,
      scrub: true,
      onUpdate: self => {
        this.animation.progress(self.progress);
        let index = Math.round(self.progress*(this.framesCount-1));
        this.activeFrame = this.frames[index];
      }
    });

    this.triggers[1] = ScrollTrigger.create({
      trigger: this.$ftext,
      start: "center center",
      end: ()=>{
        let start = this.triggers[0].start,
            end = this.triggers[0].end,
            top = (this.$ftext.getBoundingClientRect().top + Scroll.y)-(window.innerHeight/2)+(this.$ftext.getBoundingClientRect().height/2)-10,
            scroll = end-start,
            val = scroll+start-top;

        return `+=${val}`;
      },
      pin: true,
      pinSpacing: false,
      pinType: pinType,
      scrub: true
    });
  }

  initMobile() {
    this.$light = this.$parent.querySelectorAll('.about-preview-block__light');

    this.mob_animation = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
      .fromTo(this.$light, {autoAlpha:0}, {autoAlpha:1})

    this.mob_trigger = ScrollTrigger.create({
      trigger: this.$light,
      start: "bottom bottom",
      end: "center center",
      scrub: true,
      onUpdate: self => {
        this.mob_animation.progress(self.progress);
      }
    });
  }

  destroyMobile() {
    gsap.set(this.$light, {clearProps: "all"})
    this.mob_animation.kill();
    this.mob_trigger.kill();
  }

  destroyDesktop() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.mousepos);
    this.animation.kill();
    this.triggers.forEach($trigger => {
      $trigger.kill();
    })
    gsap.set([this.$text_item, this.$lines, this.$blocks, this.$light, this.$mouse], {clearProps: "all"})
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    if(this.flag) this.destroyDesktop();
    else this.destroyMobile();
    for(let child in this) delete this[child];
  }
}

class ClientsBlock {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.lg && (!this.initialized || !this.flag)) {
        if(this.initialized) {
          this.destroyMobile();
        }
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.initMobile();
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    let pinType = Scroll.scrollbar?'transform':'fixed';

    this.$container = this.$parent.querySelector('.clients__container');
    this.$text = this.$parent.querySelector('.clients__text');
    this.$blocks = this.$parent.querySelectorAll('.clients-block');
    this.$ftext = this.$parent.querySelector('.section__head-txt');
    
    this.triggers = [];
    this.triggers[0] = ScrollTrigger.create({
      trigger: this.$text,
      start: "center center",
      end: ()=>{
        let val = this.$container.getBoundingClientRect().height - this.$text.getBoundingClientRect().height;
        return `+=${val}`;
      },
      pin: true,
      pinType: pinType,
      scrub: true
    });
    this.triggers[1] = ScrollTrigger.create({
      trigger: this.$ftext,
      start: "center center",
      end: (self)=>{
        let start = this.triggers[0].start,
            end = this.triggers[0].end,
            top = (this.$ftext.getBoundingClientRect().top + Scroll.y)-(window.innerHeight/2)+(this.$ftext.getBoundingClientRect().height/2),
            scroll = end-start,
            val = scroll+start-top;
        return `+=${val}`;
      },
      pin: true,
      pinSpacing: false,
      pinType: pinType,
      scrub: true
    });

    this.blocksTriggers = [];
    this.blockAnimations = [];
    this.$blocks.forEach(($block, index)=>{
      let $image = $block.querySelector('.clients-block__image'),
          $value = $block.querySelector('.clients-block__value'),
          start_shadow = '0 0 4px transparent',
          end_shadow = '0 0 4px #D9D9D9';

      if(index==0) {
        this.blockAnimations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .to([$image, $value], {autoAlpha:0.1}, '+=1')
          .to($value, {css:{textShadow:start_shadow}}, '-=1')
      } 
      else if(index==this.$blocks.length-1) {
        this.blockAnimations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .fromTo([$image, $value], {autoAlpha:0.1}, {autoAlpha:1})
          .fromTo($value, {css:{textShadow:start_shadow}}, {css:{textShadow:end_shadow}}, '-=1')
          .to([$image, $value], {autoAlpha:1})
      } 
      else {
        this.blockAnimations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .fromTo([$image, $value], {autoAlpha:0.1}, {autoAlpha:1})
          .fromTo($value, {css:{textShadow:start_shadow}}, {css:{textShadow:end_shadow}}, '-=1')
          .to([$image, $value], {autoAlpha:0.1})
          .to($value, {css:{textShadow:start_shadow}}, '-=1')
      }

      this.blocksTriggers[index] = ScrollTrigger.create({
        trigger: $block,
        start: 'top-=100 center',
        end: 'bottom+=100 center',
        scrub: true,
        onUpdate: self => {
          this.blockAnimations[index].progress(self.progress);
        }
      });

    })
  }

  initMobile() {
    this.$images = this.$parent.querySelectorAll('.image');
    this.$values = this.$parent.querySelectorAll('.clients-block__value-item');
    this.mob_triggers = [];
    this.mob_animations = [];

    this.$images.forEach(($image, index)=>{

      this.mob_animations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
        .fromTo([$image, this.$values[index]], {autoAlpha:0.1}, {autoAlpha:1})

      this.mob_triggers[index] = ScrollTrigger.create({
        trigger: $image,
        start: "bottom bottom",
        end: "center center",
        scrub: true,
        onUpdate: self => {
          this.mob_animations[index].progress(self.progress);
        }
      });
    })

  }

  destroyDesktop() {
    gsap.set(this.$parent.querySelectorAll('.clients-block__image, .clients-block__value'), {clearProps: "all"});
    for(let child in this.blockAnimations) this.blockAnimations[child].kill();
    for(let child in this.triggers) this.triggers[child].kill();
    for(let child in this.blocksTriggers) this.blocksTriggers[child].kill();
  }

  destroyMobile() {
    for(let child in this.mob_animations) this.mob_animations[child].kill();
    for(let child in this.mob_triggers) this.mob_triggers[child].kill();
    gsap.set([this.$images, this.$values], {clearProps: "all"})
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    if(this.flag) this.destroyDesktop();
    else this.destroyMobile();
    for(let child in this) delete this[child];
  }
}

class ContactsBlock {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.lg && (!this.initialized || !this.flag)) {
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    let pinType = Scroll.scrollbar?'transform':'fixed';
    this.$head = this.$parent.querySelector('.section__head');
    this.$ftext = this.$parent.querySelector('.section__head-txt');

    this.trigger = ScrollTrigger.create({
      trigger: this.$ftext,
      start: "center center",
      end: ()=>{
        let val = this.$head.getBoundingClientRect().height - this.$ftext.getBoundingClientRect().height - 2;
        return `+=${val}`;
      },
      pin: true,
      pinType: pinType,
      scrub: true
    });
  }

  destroyDesktop() {
    this.trigger.kill();
  }

  destroy() {
    if(this.flag) this.destroyDesktop();
    window.removeEventListener('resize', this.check);
    for(let child in this) delete this[child];
  }
}

const Validation = {
  init: function () {
    this.namspaces = {
      name: 'name',
      phone: 'phone',
      email: 'email',
      message: 'message'
    }
    this.constraints = {
      name: {
        presence: {
          allowEmpty: false,
          message: '^Введите ваше имя'
        },
        format: {
          pattern: /[A-zА-яЁё ]+/,
          message: '^Введите корректное имя'
        },
        length: {
          minimum: 2,
          tooShort: "^Имя слишком короткое (минимум %{count} символа)",
          maximum: 20,
          tooLong: "^Имя слишком длинное (максимум %{count} символов)"
        }
      },
      phone: {
        presence: {
          allowEmpty: false,
          message: '^Введите ваш номер телефона'
        },
        format: {
          pattern: /^\+7 \d{3}\ \d{3}\-\d{4}$/,
          message: '^Введите корректный номер телефона'
        }
      },
      email: {
        presence: {
          allowEmpty: false,
          message: '^Введите ваш email'
        },
        email: {
          message: '^Неправильный формат email-адреса'
        }
      },
      message: {
        presence: {
          allowEmpty: false,
          message: '^Введите ваше сообщение'
        },
        length: {
          minimum: 2,
          tooShort: "^Сообщение слишком короткое (минимум %{count} символа)",
          maximum: 100,
          tooLong: "^Сообщение слишком длинное (максимум %{count} символов)"
        }
      }
    };
    this.mask = Inputmask({
      mask: "+7 999 999-9999",
      showMaskOnHover: false,
      clearIncomplete: false
    }).mask("[data-validate='phone']");

    gsap.registerEffect({
      name: "fadeMessages",
      effect: ($message) => {
        return gsap.timeline({paused:true})
          .fromTo($message, {autoAlpha: 0}, {autoAlpha:1, duration:0.3, ease:'power2.inOut'})
      }
    });

    document.addEventListener('submit', (event) => {
      let $form = event.target,
        $inputs = $form.querySelectorAll('input, textarea'),
        l = $inputs.length,
        i = 0;
      while (i < l) {
        if ($inputs[i].getAttribute('data-validate')) {
          event.preventDefault();
          let flag = 0;
          $inputs.forEach(($input) => {
            if (!this.validInput($input)) flag++;
          })
          if (!flag) this.submitEvent($form);
          break;
        } else i++
      }
    })

    document.addEventListener('input', (event) => {
      let $input = event.target,
        $parent = $input.parentNode;
      if ($parent.classList.contains('error')) {
        this.validInput($input);
      }
    })

  },
  validInput: function ($input) {
    let $parent = $input.parentNode,
      type = $input.getAttribute('data-validate'),
      required = $input.getAttribute('data-required') !== null,
      value = $input.value,
      empty = validate.single(value, {
        presence: {
          allowEmpty: false
        }
      }) !== undefined,
      resault;

    for (let key in this.namspaces) {
      if (type == key && (required || !empty)) {
        resault = validate.single(value, this.constraints[key]);
        break;
      }
    }
    //если есть ошибки
    if (resault) {
      if (!$parent.classList.contains('error')) {
        $parent.classList.add('error');
        $parent.insertAdjacentHTML('beforeend', `<span class="input__message">${resault[0]}</span>`);
        let $message = $parent.querySelector('.input__message');
        gsap.effects.fadeMessages($message).play();
      } else {
        $parent.querySelector('.input__message').textContent = `${resault[0]}`;
      }
      return false;
    }
    //если нет ошибок
    else {
      if ($parent.classList.contains('error')) {
        $parent.classList.remove('error');
        let $message = $parent.querySelector('.input__message');
        gsap.effects.fadeMessages($message).reverse(1).eventCallback('onReverseComplete', () => {
          $message.remove();
        });
      }
      return true;
    }
  },
  reset: function ($form) {
    let $inputs = $form.querySelectorAll('input, textarea');
    $inputs.forEach(($input) => {
      let $parent = $input.parentNode;
      $input.value = '';
      //textarea
      if($input.tagName=='TEXTAREA') {
        if(window.innerWidth>=brakepoints.sm) {
          $input.style.height = '56px';
        } else {
          $input.style.height = '48px';
        }
      }
      if ($parent.classList.contains('focused')) {
        $parent.classList.remove('focused');
      }
      if ($parent.classList.contains('error')) {
        $parent.classList.remove('error');
        let $message = $parent.querySelector('.input__message');
        gsap.effects.fadeMessages($message).reverse(1).eventCallback('onReverseComplete', ()=>{
          $message.remove();
        });
      }
    })
  },
  submitEvent: function ($form) {
    let $submit = $form.querySelector('button'),
        $inputs = $form.querySelectorAll('input, textarea');
    $inputs.forEach(($input) => {
      $input.parentNode.classList.add('loading');
    })
    $submit.classList.add('loading');
    //test
    setTimeout(() => {
      $inputs.forEach(($input) => {
        $input.parentNode.classList.remove('loading');
      })
      $submit.classList.remove('loading');
      this.reset($form);
      Modal.open(document.querySelector('#modal-succes'));
      setTimeout(()=>{
        Modal.close();
      }, 3000)
    }, 2000)
  }
}

const Modal = {
  init: function () {
    this.$modals = document.querySelectorAll('.modal');

    gsap.registerEffect({
      name: "modal",
      effect: ($modal, $content) => {
        let anim = gsap.timeline({paused: true}).fromTo($modal, {autoAlpha: 0}, {autoAlpha: 1,duration: Speed / 2,ease: 'power2.inOut'})
          .fromTo($content, {y: 20}, {y: 0,duration: Speed,ease: 'power2.out'}, `-=${Speed/2}`)
        return anim;
      },
      extendTimeline: true
    });

    document.addEventListener('click', (event) => {
      let $open = event.target.closest('[data-modal="open"]'),
        $close = event.target.closest('[data-modal="close"]'),
        $wrap = event.target.closest('.modal'),
        $block = event.target.closest('.modal-block');

      //open
      if ($open) {
        event.preventDefault();
        let $modal = document.querySelector(`${$open.getAttribute('href')}`);
        this.open($modal);
      }
      //close 
      else if ($close || (!$block && $wrap)) {
        this.close();
      }

    })

    //add scroll
    if(!mobile()) {
      this.$modals.forEach(($modal)=>{
        Scrollbar.init($modal, {
          damping: 1
        })
      })
    }
  },
  open: function ($modal) {
    let play = () => {
      this.$active = $modal;
      disablePageScroll();
      let $content = $modal.querySelector('.modal-block');
      this.animation = gsap.effects.modal($modal, $content);
      this.animation.play();
    }
    if ($modal) {
      if (this.$active) this.close(play);
      else play();
    }
  },
  close: function (callback) {
    if(this.$active) {
      this.animation.timeScale(2).reverse().eventCallback('onReverseComplete', () => {
        delete this.animation;
        enablePageScroll();
        if (callback) callback();
      })
      //reset form
      let $form = this.$active.querySelector('form');
      if ($form) Validation.reset($form);
  
      delete this.$active;
    }
  }
}

const Parallax = {
  init: function() {
    this.initialized = true;
    Scroll.addListener(()=>{
      requestAnimationFrame(()=>{this.check();})
    })
    window.addEventListener('enter', ()=>{
      setTimeout(()=>{
        this.check();
      }, 2000);
    })
  },
  check: function() {
    let $items = App.$container.querySelectorAll('[data-parallax]');
    $items.forEach(($this)=>{
      let y = $this.getBoundingClientRect().y,
          h1 = window.innerHeight,
          h2 = $this.getBoundingClientRect().height,
          scroll = Scroll.y,
          factor = +$this.getAttribute('data-parallax'),
          val;
      if($this.getAttribute('data-parallax-top')==null) {
        val = ((scroll+h1/2) - (y+scroll+h2/2)) * factor;
      } else {
        val = scroll * factor;
      }
      $this.style.transform = `translate3d(0, ${val}px, 0)`;
    })
  }
}

class ItemSlider {
  constructor($parent) {
    this.$parent = $parent;
  } 
  init() {
    this.$slider = this.$parent.querySelector('.items-slider__element');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');
    this.$prev = this.$parent.querySelector('.swiper-button-prev');
    this.$next = this.$parent.querySelector('.swiper-button-next');

    this.$images_container = this.$parent.querySelector('.items-slider__images');
    this.$images = this.$parent.querySelectorAll('.items-slider__image');
    this.index = 0;
    this.speed = 0.5;

    this.animationsEnter = [];
    this.animationsExit = [];

    this.$images.forEach(($image, index)=>{
      let $light = $image.querySelector('.items-slider__image-light');
      
      this.animationsEnter[index] = gsap.timeline({paused:true})
        .fromTo($image, {yPercent:20}, {yPercent:0, duration:this.speed, ease:'power2.out'})
        .fromTo($image, {autoAlpha:0}, {autoAlpha:1, duration:this.speed, ease:'power2.inOut'}, `-=${this.speed}`)
        .fromTo($light, {autoAlpha:0}, {autoAlpha:1, duration:this.speed, ease:'power2.out'}, `-=${this.speed*0.5}`)

      this.animationsExit [index] = gsap.timeline({paused:true})
        .to($image, {yPercent:20, duration:this.speed, ease:'power2.in'})
        .to($image, {autoAlpha:0, duration:this.speed, ease:'power2.out'}, `-=${this.speed}`)
    })

    this.animationsEnter[this.index].play();

    this.slider = new Swiper(this.$slider, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 24,
      speed: this.speed*1000,
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      },
      navigation: {
        prevEl: this.$prev,
        nextEl: this.$next
      }
    });


    this.slider.on('slideChange', (swiper)=>{
      let index = swiper.realIndex;
      if(this.index!==index) {
        if(this.animationsEnter[this.index].isActive()) {
          this.animationsEnter[this.index].pause();
        }
        this.animationsExit[this.index].play(0);
  
        this.animationsEnter[index].play(0);
        this.index = index;
      }
    });

    this.swipes = SwipeListener(this.$images_container);
    this.$images_container.addEventListener('swipe', (event)=> {
      let dir = event.detail.directions;
      if(dir.left) this.slider.slideNext();
      else if(dir.right) this.slider.slidePrev();
    });
  }

  destroy() {
    this.slider.destroy();
    for(let child in this) delete this[child];
  }
}

class ProductBlock {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');
    this.$bottom_images = this.$parent.querySelectorAll('.product-item__bottom-image');

    this.$more = this.$parent.querySelector('.product-item__more-content');
    this.$morebtn = this.$parent.querySelector('.product-item__more-button');

    let toggleContent = ()=> {
      if(!this.$morebtn.classList.contains('is-active')) {
        this.$morebtn.classList.add('is-active');
        this.$more.style.display = 'block';

        let hh = $header.getBoundingClientRect().height,
            wh = window.innerHeight

        let y;
        if(window.innerWidth>=brakepoints.sm && this.$more.getBoundingClientRect().height < wh - hh) {
          y = this.$more.getBoundingClientRect().bottom + Scroll.y + 50 - wh;
        } else {
          y = this.$more.getBoundingClientRect().top + Scroll.y - hh;
        }
        Scroll.scrollTop(y, Speed)
      } 
      
      else {
        this.$morebtn.classList.remove('is-active');
        this.$more.style.display = 'none';
      }
      ScrollTrigger.refresh();
    }
    this.$morebtn.addEventListener('click', toggleContent)

    this.checkVersion = () => {
      //mobile
      if(window.innerWidth < brakepoints.lg && (!this.initialized || !this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.initMobile();
        this.flag = true;
      } 
      //desktop
      else if(window.innerWidth>=brakepoints.lg && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyMobile();
        }
        this.initDesktop();
        this.flag = false;
      }
    }
    this.checkVersion();

    window.addEventListener('resize', this.checkVersion);

    this.initialized = true;
  }

  initDesktop() {
    this.slider = new Swiper(this.$slider, {
      effect: 'fade',
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      slidesPerView: 1,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      }
    });

    

    if(this.$bottom_images.length>1) {
      this.$bottom_images[0].classList.add('is-active');
      this.slider.on('slideChange', (event)=> {
        this.$bottom_images.forEach($this => {
          $this.classList.remove('is-active')
        })
        this.$bottom_images[event.realIndex].classList.add('is-active');
      })
      this.events = [];
      this.$bottom_images.forEach(($this, index)=>{
        this.events[index] = ()=> {
          this.slider.slideTo(index)
        }
        $this.addEventListener('mouseenter', this.events[index])
        $this.addEventListener('click', this.events[index])
      })
    }
  }
  
  destroyDesktop() {
    this.slider.destroy();
    if(this.$bottom_images.length>1) {
      this.$bottom_images.forEach(($this, index)=>{
        $this.classList.remove('is-active');
        $this.removeEventListener('mouseenter', this.events[index]);
        $this.removeEventListener('click', this.events[index]);
      })
    }
  }

  initMobile() {
    this.slider = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      },
      breakpoints: {
        576: {
          spaceBetween: 24
        }
      }
    });
  }

  destroyMobile() {
    this.slider.destroy();
  }

  destroy() {
    if(this.flag) {
      this.destroyMobile();
    } else {
      this.destroyDesktop();
    }
    window.removeEventListener('resize', this.checkVersion);
    for(let child in this) delete this[child];
  }
}

class FadeBlocks {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    if(window.innerWidth>=brakepoints.lg) {
      this.$blocks = this.$parent.querySelectorAll('.js-fade-blocks__block');
      this.animation = gsap.timeline({paused:true})
        .fromTo(this.$blocks, {autoAlpha:0}, {autoAlpha:1, duration:Speed*0.8, stagger:{amount:Speed*0.2}})
        .fromTo(this.$blocks, {y:80}, {y:0, duration:Speed*0.8, ease:'power2.out', stagger:{amount:Speed*0.2}}, `-=${Speed}`)
  
      this.trigger = ScrollTrigger.create({
        trigger: this.$parent,
        start: "center bottom",
        onEnter: ()=> {
          if(this.animation.totalProgress()==0) {
            this.animation.play();
          }
        }
      });
    }
  }
  destroy() {
    if(this.trigger) {
      this.trigger.kill();
    }
    for(let child in this) delete this[child];
  }
}

class SfSlider {
  constructor($parent) {
    this.$parent = $parent;
  } 
  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$next = this.$parent.querySelector('.swiper-button-next');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    this.swiper = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 500,
      autoHeight: true,
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      },
      navigation: {
        nextEl: this.$next
      },
      breakpoints: {
        576: {
          slidesPerView: 1,
          spaceBetween: 24
        },
        1024: {
          slidesPerView: 2,
          spaceBetween: 24,
          autoHeight: false
        },
        1280: {
          slidesPerView: 2,
          spaceBetween: 102,
          autoHeight: false
        },
        1600: {
          slidesPerView: 2,
          spaceBetween: 118,
          autoHeight: false
        }
      }
    });

  }

  destroy() {
    this.swiper.destroy();
    for(let child in this) delete this[child];
  }
}

//screens anim
class HomeScene {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$items = this.$parent.querySelectorAll('.homepage__label, .homepage__title, .homepage__request p, .homepage__request .button');
    this.$slider = this.$parent.querySelector('.items-slider');
    this.$scene = this.$parent.querySelector('.homepage-scene__container');

    this.animation = gsap.timeline({paused:true})
      .fromTo(this.$scene, {scale:1.2}, {scale:1, duration:Speed*1.5, ease:'power2.out'})
      .fromTo([this.$items, this.$slider], {autoAlpha:0}, {autoAlpha:1, duration:Speed*1.25, stagger:{amount:Speed*0.25}}, `-=${Speed*1.5}`)
      .fromTo([this.$items, this.$slider], {y:40}, {y:0, duration:Speed*1.25, ease:'power2.out', stagger:{amount:Speed*0.25}}, `-=${Speed*1.5}`)
    
    this.animation.play();
  }

  destroy() {
    this.animation.kill();
    for(let child in this) delete this[child];
  }
}

class ProductHead {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$images_wrapper = this.$parent.querySelector('.product-head__image-wrapper');
    this.$images = this.$parent.querySelectorAll('.image');
    this.$items = this.$parent.querySelectorAll('.product-head__item');

    this.animation = gsap.timeline({paused:true})
      .fromTo(this.$items, {autoAlpha:0}, {autoAlpha:1, duration:Speed*1.25, stagger:{amount:Speed*0.25}})
      .fromTo(this.$items, {y:40}, {y:0, duration:Speed*1.25, ease:'power2.out', stagger:{amount:Speed*0.25}}, `-=${Speed*1.5}`)

    if(this.$parent.classList.contains('product-head_type-1')) {
      this.animation.add(
        gsap.fromTo(this.$images_wrapper, {yPercent:15, xPercent:-20, scale:0.9}, {yPercent:0, xPercent:0, scale:1, duration:Speed*1.5, ease:'power2.out'}),
      `-=${Speed*1.5}`)
    } else if(this.$parent.classList.contains('product-head_type-2')) {
      this.animation.add(
        gsap.fromTo(this.$images_wrapper, {yPercent:15, xPercent:10, scale:0.9}, {yPercent:0, xPercent:0, scale:1, duration:Speed*1.5, ease:'power2.out'}),
      `-=${Speed*1.5}`)
    } else {
      this.animation.add(
        gsap.fromTo(this.$images_wrapper, {yPercent:15, scale:0.9}, {yPercent:0, scale:1, duration:Speed*1.5, ease:'power2.out'}),
      `-=${Speed*1.5}`)
    }

    if(this.$images.length==2) {
      this.animation.add(
        gsap.fromTo(this.$images[1], {autoAlpha:0}, {autoAlpha:1}),
      `-=${Speed}`)
    }
      
    this.animation.play();
  }

  destroy() {
    for(let child in this) delete this[child];
  }
}

class ImageSlider {
  constructor($parent) {
    this.$parent = $parent;
  } 

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    this.slider = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      slidesPerView: 1,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      }
    });
  }

  destroy() {
    this.slider.destroy();
    for(let child in this) delete this[child];
  }
}

class AnimationHead {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$image = this.$parent.querySelector('.animation-head__image');
    this.$items = this.$parent.querySelectorAll('.animation-head__item');

    this.animation = gsap.timeline()
      .fromTo(this.$image, {scale:1.2}, {scale:1, duration:Speed*1.5, ease:'power2.out'})
      .fromTo(this.$items, {autoAlpha:0}, {autoAlpha:1, duration:Speed*1.3, stagger:{amount:Speed*0.2}}, `-=${Speed*1.5}`)
      .fromTo(this.$items, {y:40}, {y:0, duration:Speed*1.3, ease:'power2.out', stagger:{amount:Speed*0.2}}, `-=${Speed*1.5}`)
  }

  destroy() {
    this.animation.kill();
    for(let child in this) delete this[child];
  }
}

class HeadSlider {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    this.slider = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      slidesPerView: 1,
      speed: 500,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      }
    });
  }
  destroy() {
    this.slider.destroy();
    for(let child in this) delete this[child];
  }
}

class DocsSlider {
  constructor($parent) {
    this.$parent = $parent;
  } 
  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$prev = this.$parent.querySelector('.swiper-button-prev');
    this.$next = this.$parent.querySelector('.swiper-button-next');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    this.elements = [];

    this.swiper = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      },
      navigation: {
        prevEl: this.$prev,
        nextEl: this.$next
      },
      breakpoints: {
        576: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        1024: {
          slidesPerView: 3
        },
        1280: {
          slidesPerView: 4
        }
      }
    });


  }

  destroy() {
    this.swiper.destroy();
    for(let child in this) delete this[child];
  }
}

class RefSlider {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    if(!mobile()) {
      this.$images = this.$parent.querySelectorAll('.ref-slider__slide-scene');
      if(this.$parent.classList.contains('animation-head')) {
        this.animation = gsap.timeline({paused:true, defaults:{duration:1.5, ease:'linear'}})
          .to(this.$images, {autoAlpha:0}, '+=1.5')
      } else {
        this.animation = gsap.timeline({paused:true, defaults:{duration:1.5, ease:'linear'}})
          .fromTo(this.$images, {autoAlpha:0}, {autoAlpha:1})
          .to(this.$images, {autoAlpha:0})
      }
    }

    this.slider = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      longSwipesRatio: 0.1,
      slidesPerView: 1,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      }
    });

    this.slider.on('slideChange', (swiper)=>{
      if(swiper.realIndex!==0) {
        this.$pagination.classList.add('bg');
      } else {
        this.$pagination.classList.remove('bg');
      }
    });

    this.trigger = ScrollTrigger.create({
      trigger: this.$parent,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: self => {
        if(this.animation) this.animation.progress(self.progress);
        if((self.progress<=0.25 || self.progress>=0.75) && this.slider.realIndex!==0) {
          this.slider.slideTo(0, 1000);
        }
      }
    });

  }

  destroy() {
    if(this.animation) this.animation.kill();
    this.trigger.kill();
    this.slider.destroy();
    for(let child in this) delete this[child];
  }
}

class Map {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.apiKey = '528c7ae6-b79c-4821-ac7d-091492c64261';

    let loadMap = ()=> {
      if(typeof ymaps === 'undefined') {
        let callback = ()=> {
          ymaps.ready(createMap);
        }
        let script = document.createElement("script");
        script.type = 'text/javascript';
        script.onload = callback;
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${this.apiKey}&lang=ru_RU`;
        $body.appendChild(script);
      } else {
        createMap();
      }
    }
    
    let createMap = ()=> {
      this.map = new ymaps.Map(this.$parent, {
        center: [55.581215, 37.769442],
        controls: ['zoomControl'],
        zoom: 14
      });
      this.map.behaviors.disable(['scrollZoom']);
      this.placemarks = [];
      this.$map = this.map.container._element;
      this.$map.classList.add('contacts-block__map-element');
      gsap.fromTo(this.$map, {autoAlpha:0}, {autoAlpha:1})

      let placemark = new ymaps.Placemark(this.map.getCenter(), {
        balloonContent: ' Московская область, Ленинский район, сельское поселение Совхоз им. Ленина, территория Восточная Промзона, владение 3, стр. 1'
      }, {
        iconLayout: 'default#image',
        iconImageHref: './img/icons/map-point.svg',
        iconImageSize: [40, 60],
        iconImageOffset: [-20, -60],
        hideIconOnBalloonOpen: false
      });
      this.map.geoObjects.add(placemark);
    }


    loadMap();
  }

  destroy() {
    for(let child in this) delete this[child];
  }
}

class HistoryBlock {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.md && (!this.initialized || !this.flag)) {
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.md && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    this.$blocks = this.$parent.querySelectorAll('.section-history__block');
    
    this.triggers = [];
    this.animations = [];

    this.$blocks.forEach(($block, index)=>{
      let $value = $block.querySelector('.section-history__date'),
          start_shadow = '0 0 4px transparent',
          end_shadow = '0 0 4px #D9D9D9';

      if(index==0) {
        this.animations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .fromTo($value, {autoAlpha:1, css:{textShadow:end_shadow}}, {autoAlpha:0.1, css:{textShadow:start_shadow}}, '+=1')
          .fromTo($value, {autoAlpha:1}, {autoAlpha:0.1}, '-=1')
      } 
      else if(index==this.$blocks.length-1) {
        this.animations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .fromTo($value, {css:{textShadow:start_shadow}}, {css:{textShadow:end_shadow}})
          .fromTo($value, {autoAlpha:0.1}, {autoAlpha:1}, '-=1')
          .to($value, {autoAlpha:1})
      } 
      else {
        this.animations[index] = gsap.timeline({paused:true, defaults:{duration:1, ease:'none'}})
          .fromTo($value, {css:{textShadow:start_shadow}}, {css:{textShadow:end_shadow}})
          .fromTo($value, {autoAlpha:0.1}, {autoAlpha:1}, '-=1')
          .to($value, {autoAlpha:0.1})
          .to($value, {css:{textShadow:start_shadow}}, '-=1')
      }

      this.triggers[index] = ScrollTrigger.create({
        trigger: $block,
        start: 'top-=100 center',
        end: 'bottom+=100 center',
        scrub: true,
        onUpdate: self => {
          this.animations[index].progress(self.progress);
        }
      });

    })
  }

  destroyDesktop() {
    gsap.set(this.$parent.querySelectorAll('.section-history__date'), {clearProps: "all"});
    for(let child in this.animations) this.animations[child].kill();
    for(let child in this.triggers) this.triggers[child].kill();
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    if(this.flag) this.destroyDesktop();
    for(let child in this) delete this[child];
  }
}

class ShemaLights {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.check = ()=> {
      if(window.innerWidth >= brakepoints.sm && (!this.initialized || !this.flag)) {
        this.initDesktop();
        this.flag = true;
      } 
      else if(window.innerWidth<brakepoints.sm && (!this.initialized || this.flag)) {
        if(this.initialized) {
          this.destroyDesktop();
        }
        this.flag = false;
      }
    }
    this.check();
    window.addEventListener('resize', this.check);
    this.initialized = true;
  }

  initDesktop() {
    this.trigger = ScrollTrigger.create({
      trigger: this.$parent,
      start: "center bottom",
      end: "center top",
      once: true,
      toggleClass: 'active'
    });
  }

  destroyDesktop() {
    this.$parent.classList.remove('active');
    this.trigger.kill();
  }

  destroy() {
    window.removeEventListener('resize', this.check);
    if(this.flag) this.destroyDesktop();
    for(let child in this) delete this[child];
  }
}