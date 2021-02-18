window.dev = false;

const Speed = 1; //seconds
const autoslide_interval = 5; //seconds

const $body = document.body;
const $wrapper = document.querySelector('.wrapper');
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

import {gsap} from "gsap";
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

import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import Splide from '@splidejs/splide';

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
    //functions
    lazySizes.init();
    TouchHoverEvents.init();
    Header.init();
    Nav.init();
    if(mobile()) {
      mobileWindow.init();
    }

    window.addEventListener('enter', ()=>{
      //home
      let $lightscene = document.querySelector('.homepage-scene');
      if($lightscene) new LightsScene($lightscene).init();
      //slider
      let $itemslider = document.querySelector('.items-slider');
      if($itemslider) new ItemSlider($itemslider).init();
    })


    Preloader.finish(()=>{
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
          gsap.to($this, {autoAlpha:1, duration:Speed})
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

        this.animations[index].animation_flick = gsap.timeline({paused:true})
          .fromTo($this, {autoAlpha:0}, {autoAlpha:1, duration:Speed*0.05})
          .to($this, {autoAlpha:0, duration:Speed*0.25})
          .to($this, {autoAlpha:1, duration:Speed*0.05})
          .to($this, {autoAlpha:0, duration:Speed*0.05})
          .to($this, {autoAlpha:1, duration:Speed*0.05})
          .to($this, {autoAlpha:0, duration:Speed*0.5}, `+=${Speed*0.25}`)
      })

      this.flick = ()=> {
        let timeout = Math.round(Math.random() * 50000) + 10000,
            index = Math.round(Math.random()*(this.$layers.length-1)),
            animation = this.animations[index].animation,
            animation_flick = this.animations[index].animation_flick,
            state = this.animations[index].state;
        setTimeout(() => {
          if(!state) {
            if(animation.isActive()) {
              animation.pause();
            }
            animation_flick.play(0);
          }
          this.flick();
        }, timeout);
      }
      this.flick();

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
                animation_flick = this.animations[index].animation_flick,
                state = this.animations[index].state;
            
            if(x>=x1 && x<=x2 && y>=y1 && y<=y2) {
              if(!state) {
                state = true;
                animation.duration(Speed*0.05).play();
                if(animation_flick.isActive()) {
                  animation_flick.pause();
                }
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
    window.addEventListener('scroll', () => {
      this.check();
    })
    this.check();
  },
  check: function () {
    let y = window.pageYOffset,
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
    };
    this.resize();

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
      .set(this.$nav, {autoAlpha:1})
      .to(this.$toggle, {x:-this.bw-this.pd, duration:Speed*0.4, ease:'power1.inOut'})
      .fromTo(this.$container, {xPercent:100}, {xPercent:0, duration:Speed*0.5, ease:'power2.inOut'}, `-=${Speed*0.4}`)
      .fromTo(this.$bg, {autoAlpha:0}, {autoAlpha:1, duration:Speed*0.5, ease:'power2.inOut'}, `-=${Speed*0.5}`)


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
    this.state=true;
    this.animation.play();
  },
  close: function() {
    $header.classList.remove('header_nav-opened');
    this.$nav.classList.remove('nav_opened');
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
    this.speed = Speed/2;

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

const mobileWindow = {
  init: function() {
    let $el = document.createElement('div')
    $el.style.cssText = 'position:fixed;height:100%;';
    $body.insertAdjacentElement('beforeend', $el);
    this.h = $el.getBoundingClientRect().height;
    $el.remove();
    window.addEventListener('enter', ()=>{
      this.check();
    })
  }, 
  check: function() {
    let $el = App.$container.querySelector('.screen');
    if($el) $el.style.height = `${this.h}px`;
  }
}