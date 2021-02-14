const Speed = 1;
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

import 'lazysizes';
lazySizes.cfg.init = false;
lazySizes.cfg.expand = 100;

import {gsap} from "gsap";
gsap.defaults({
  ease: "power2.inOut", 
  duration: Speed
});

import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";


const contentWidth = () => {
  return $wrapper.getBoundingClientRect().width;
}


window.onload = function(){
  lazySizes.init();
  TouchHoverEvents.init();
  Mask.init();

  //home
  let $lightscene = document.querySelector('.homepage-scene');
  if($lightscene) new LightsScene($lightscene).init();
}

const Mask = {
  init: function() {
    Inputmask({
      mask: "+7 999 999-9999",
      showMaskOnHover: false,
      clearIncomplete: false
    }).mask('[data-phone]');
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
    this.$container = this.$parent.querySelector('.homepage-scene__container');
    this.$triggers = this.$parent.querySelectorAll('.homepage-scene__trigger');
    this.$layers = this.$parent.querySelectorAll('.homepage-scene__layer');
    this.states = [];


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
      let x = event.clientX,
          y = event.clientY;
      
      
      this.$triggers.forEach(($trigger, index)=>{
        let x1 = $trigger.getBoundingClientRect().left,
            x2 = $trigger.getBoundingClientRect().right,
            y1 = $trigger.getBoundingClientRect().top,
            y2 = $trigger.getBoundingClientRect().bottom;

        
        if(x>=x1 && x<=x2 && y>=y1 && y<=y2) {
          if(!this.states[index]) {
            this.states[index] = true;
            gsap.to(this.$layers[index], {autoAlpha:1, duration:Speed*0.1})
          }
        } else if(this.states[index]) {
          this.states[index] = false;
          gsap.to(this.$layers[index], {autoAlpha:0, duration:Speed*0.1})
        }
        
      })  
    }
    

    this.resizeEvent();
    window.addEventListener('resize', this.resizeEvent);
    window.addEventListener('mousemove', this.mousemoveEvent);


  }
}