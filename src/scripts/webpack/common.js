window.dev = false;

const Speed = 1; //seconds
const autoslide_interval = 5; //seconds

const $body = document.body;
const $wrapper = document.querySelector('.wrapper');
const $content = document.querySelector('.content');
const $header = document.querySelector('.header');
const brakepoints = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1600
}
const desktop_gap = 24;
const mobile_gap = 16;

import 'lazysizes';
lazySizes.cfg.init = false;
lazySizes.cfg.expand = 100;
lazySizes.cfg.preloadAfterLoad = true;

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
import Splide from '@splidejs/splide';
import Rellax from 'rellax';

const validate = require("validate.js");

import Inputmask from "inputmask";

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
    lazySizes.init();
    TouchHoverEvents.init();
    Header.init();
    Nav.init();
    Validation.init();
    Modal.init();
    inputs();
    if(mobile()) {
      mobileWindow.init();
    }
    

    window.addEventListener('enter', ()=>{

      this.afunctions.add(LightsScene, '.homepage-scene');
      this.afunctions.add(ItemSlider, '.items-slider');
      this.afunctions.add(AdvantagesLights, '.advantages-block .icon');
      this.afunctions.add(Card3d, '.js-3d');
      this.afunctions.add(AboutTextBlock, '.about-text');
      this.afunctions.add(AboutPreviewBlock, '.about-preview');
      this.afunctions.add(WarrantyPreviewBlock, '.warranty-preview');

      autosize(document.querySelectorAll('textarea.input__element'));

      this.afunctions.init();

    })


    Preloader.finish(()=>{
      if(mobile()) {
        $body.classList.add('scroll');
      } else {
        $body.classList.add('hidden');
      }
      gsap.to($wrapper, {autoAlpha:1, duration:0.5})
      Transitions.enter(this.$container, this.namespace);
    })
  }
}

const Transitions = {
  enter: function($container, namespace) {
    App.$container = $container;
    App.namespace = namespace;
    App.name = App.$container.getAttribute('data-name');
    
    window.dispatchEvent(new Event("enter"));

  },
  exit: function($container) {
    window.dispatchEvent(new Event("exit"));
    barba.done();

  }
}

const TouchHoverEvents = {
  targets: 'a, button, label, tr, .jsTouchHover',
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
    this.scrollbar.setPosition(0, +localStorage.getItem('scroll'));

    /* window.addEventListener('enter', ()=>{
      this.scrollbar.track.yAxis.element.classList.remove('show');
    }) */

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
    console.log(this.functions)
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
    this.$layers = this.$parent.querySelectorAll('.homepage-scene__layer');
    
    //mobile
    if(mobile()) {
      setTimeout(() => {
        this.$layers.forEach(($this)=>{
          gsap.to($this, {autoAlpha:1, duration:1.25})
        })
      }, 500);
    } 
    //desktop
    else {
      this.$container = this.$parent.querySelector('.homepage-scene__container');
      this.$triggers = this.$parent.querySelectorAll('.homepage-scene__trigger');
      this.states = [];
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

    if (y > 0 && !fixed) {
      $header.classList.add('header_fixed');
    } else if (y<=0 && fixed) {
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
        .fromTo(this.$toggle, {x:0}, {x:-this.bw-this.pd, duration:0.4}, `-=${0.1}`)
        .fromTo(this.$container, {xPercent:100}, {xPercent:0, duration:0.5}, `-=${0.4}`)
        .fromTo(this.$bg, {autoAlpha:0}, {autoAlpha:1, duration:0.5}, `-=${0.5}`)

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



    window.addEventListener('resize', this.resize);

    //this.open();

    /* window.addEventListener('enter', ()=>{
      this.change(App.name);
    })
    window.addEventListener('exit', ()=>{
      if(this.state) this.close();
    }) */
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
  }/* ,
  change: function(namespace) {
    if(this.$active_links) {
      this.$active_links.forEach(($link)=>{
        $link.classList.remove('active');
      })
    }
    this.$active_links = document.querySelectorAll(`[data-name='${namespace}']`);
    this.$active_links.forEach(($link)=>{
      $link.classList.add('active');
    })
  } */
}

class ItemSlider {
  constructor($parent) {
    this.$parent = $parent;
  } 
  init() {
    this.$slider = this.$parent.querySelector('.items-slider__element');
    this.$images = this.$parent.querySelectorAll('.items-slider__image');
    this.$prev = this.$parent.querySelector('.items-slider__prev');
    this.$next = this.$parent.querySelector('.items-slider__next');
    this.index = 0;
    this.speed = 0.5;

    this.animations = [];
    this.$images.forEach(($image, index)=>{
      this.animations[index] = gsap.timeline({paused:true})
        .fromTo($image, {yPercent:20}, {yPercent:0, duration:this.speed, ease:'power2.out'})
        .fromTo($image, {autoAlpha:0}, {autoAlpha:1, duration:this.speed, ease:'power2.inOut'}, `-=${this.speed}`)
    })
    this.animations[this.index].play();

    this.slider = new Splide(this.$slider, {
      type: 'loop',
      perPage: 1,
      perMove: 1,
      gap: desktop_gap,
      arrows: false,
      pagination: true,
      waitForTransition: false,
      speed: this.speed*1000,
      autoplay: true,
      interval: autoslide_interval*1000,
      breakpoints: {
        576: {
          gap: mobile_gap
        },
      }
    })

    this.slider.on('move', (newIndex)=>{
      this.animations[this.index].reverse();
      this.animations[newIndex].play();
      this.index = newIndex;
    });

    this.$prev.addEventListener('click', ()=>{
      this.slider.go('<');
    })
    this.$next.addEventListener('click', ()=>{
      this.slider.go('>');
    })

    this.slider.mount();
  }

  destroy() {

  }
}

function inputs() {
  let events = (event)=> {
    let $input = event.target;
    if($input.closest('.input__element')) {
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

const mobileWindow = {
  init: function() {
    let $el = document.createElement('div')
    $el.style.cssText = 'position:fixed;height:100%;';
    $body.insertAdjacentElement('beforeend', $el);
    this.h = $el.getBoundingClientRect().height;
    console.log(this.h)
    //$el.remove();
    window.addEventListener('enter', ()=>{
      this.check();
    })
  }, 
  check: function() {
    let $el = App.$container.querySelector('.screen');
    if($el) $el.style.height = `${this.h}px`;
  }
}

class AdvantagesLights {
  constructor($block) {
    this.$block = $block;
  }
  init() {
    ScrollTrigger.create({
      trigger: this.$block,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      once: true,
      toggleClass: 'animate'
    });
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

    this.$block.addEventListener('mousemove',  this.event);
    this.$block.addEventListener('mouseleave', this.event);

  }
  destroy() {
    this.$block.removeEventListener('mousemove',  this.event);
    this.$block.removeEventListener('mouseleave', this.event);
  }
}

class AboutTextBlock {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    this.$blocks = this.$parent.querySelectorAll('.about-text__block');
    this.$title = this.$parent.querySelectorAll('.about-text__title');
    this.$ligts = this.$parent.querySelectorAll('.about-text__light');

    let color1 = getComputedStyle(document.documentElement).getPropertyValue('--color-dark'),
        color2 = getComputedStyle(document.documentElement).getPropertyValue('--color-light');

    this.animation = gsap.timeline({paused:true})
      .fromTo(this.$blocks, {css:{color:color1}}, {css:{color:color2}, duration:1})
      .fromTo(this.$ligts, {autoAlpha:0, rotate:4}, {autoAlpha:1, rotate:0, duration:1, stagger:{amount:0.1}}, '-=1')

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
}

class AboutPreviewBlock {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    this.$container = this.$parent.querySelector('.about-preview__container');
    this.$blocks = this.$parent.querySelectorAll('.about-preview-block');
    this.$images = this.$parent.querySelectorAll('.about-preview-block__image');
    this.$text = this.$parent.querySelectorAll('.about-preview-block__text');
    this.$light = this.$parent.querySelectorAll('.about-preview-block__light');
    this.$ftext = this.$parent.querySelector('.section__head-txt');

    this.animation = gsap.timeline({paused:true, defaults:{duration:1, ease:'power2.out'}})
      .to(this.$text[0], {autoAlpha:0}, "+=1")
      .to(this.$text[0], {x:30, ease:'power2.in'}, '-=1')
      .to(this.$blocks[0], {autoAlpha:0, duration:'0.75'})

      .to(this.$blocks[1], {autoAlpha:1, ease:'power2.in', duration:'0.75'}, '-=0.75')
      .fromTo(this.$text[1], {autoAlpha:0}, {autoAlpha:1, ease:'power2.in'})
      .fromTo(this.$text[1], {x:30}, {x:0}, '-=1')
      .to(this.$text[1], {autoAlpha:0},'+=1')
      .to(this.$text[1], {x:30, ease:'power2.in'}, '-=1')
      .to(this.$blocks[1], {autoAlpha:0, duration:'0.75'})

      .to(this.$blocks[2], {autoAlpha:1, ease:'power2.in', duration:'0.75'}, '-=0.75')
      .fromTo(this.$text[2], {autoAlpha:0}, {autoAlpha:1, ease:'power2.in'})
      .fromTo(this.$text[2], {x:30}, {x:0}, '-=1')

      .fromTo(this.$light, {autoAlpha:0}, {autoAlpha:1, duration:1.5, ease:'power2.in'})

      

      

    let pinType = Scroll.scrollbar?'transform':'fixed';
    
    this.triggers = [];

    this.triggers[0] = ScrollTrigger.create({
      trigger: this.$container,
      start: "center center",
      end: '+=3000',
      pin: true,
      pinType: pinType,
      scrub: true,
      onUpdate: self => {
        this.animation.progress(self.progress);
      }
    });


    this.triggers[1] = ScrollTrigger.create({
      trigger: this.$ftext,
      start: "top top+=120",
      end: ()=>{
        let val = this.triggers[0].start - (this.$ftext.getBoundingClientRect().top + Scroll.y) + 120 + 3000;
        return `+=${val}`;
      },
      pin: true,
      pinSpacing: false,
      pinType: pinType,
      scrub: true
    });

  }
}

class WarrantyPreviewBlock {
  constructor($parent) {
    this.$parent = $parent;
  }
  init() {
    this.$light = this.$parent.querySelector('.warranty-preview__image-light');

    this.animation = gsap.timeline({paused:true})
      .fromTo(this.$light, {autoAlpha:0}, {autoAlpha:1})

    this.trigger = ScrollTrigger.create({
      trigger: this.$light,
      start: "top center",
      end: 'center center',
      scrub: true,
      onUpdate: self => {
        this.animation.progress(self.progress);
      }
    });
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
          damping: 0.2
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