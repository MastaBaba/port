var mojs      = require('../js/vendor/mo');

var showOnEl = {
  prepareSprites: function () {
    this.blobSprite = new mojs.Spriter({
      el:         this.blobCircle,
      duration:   this.BLOB_DURATION*this.S,
      isRunLess:  true
    })
  },

  showInnerCircle: function (x, y) {
    var tween = new mojs.Tween;

    var size = Math.min(this.wWidth, this.wHeight);
    this.blobCircle.style.left = `${x}px`
    this.blobCircle.style.top  = `${y}px`
    var borderWidth = Math.min(10*mojs.easing.cubic.in(size/800), 20),
        blobCircleSize = 30 + 2*borderWidth;

    var strokeStep = (borderWidth/2)/(this.blobEllipses.length);
    var i = 0;
    for (let item of this.blobEllipses) {
      i++;
      // console.log(borderWidth/2 - i*strokeStep)
      item.setAttribute('stroke-width', borderWidth/2 - i*strokeStep);
      item.setAttribute('rx', blobCircleSize/2);
      item.setAttribute('ry', blobCircleSize/2);
    }
    this.blobCircle.style.display = 'block';
    var blobCircleTm = new mojs.Timeline({
      duration:  this.BLOB_DURATION*this.S,
      onStart:() => {
        this.blobSprite.run();
        this.openSound.play();
      },
      onUpdate:   (p) => {
        var tr = `scale(${28*p}) translateZ(0)`;
        mojs.h.setPrefixedStyle(this.blobCircle, 'transform', tr);
        this.blobCircle.style.opacity = 1*(mojs.easing.cubic.in(1-p));
      }
    });

    tween.add(blobCircleTm);
    tween.start()
  },

  showOnEl: function (el) {
    this.prevEl = this.currentEl; this.currentEl = el;
    this.prevEl && (this.prevEl.style['z-index'] = 0)
    // return immediately on edges
    if (el.delta < .2) { return }

    var x = el.x - this.wWidth/2 - this.xOffset,
        y = el.y - this.wHeight/2 - this.yOffset,
        innerEl   = el.querySelector('.particle__inner'),
        contentEl = el.querySelector('.particle__content');
    var tween = new mojs.Tween;

    this.isOpen = true;
    el.style['z-index']  = 20
    this.iscroll.enabled = false;
    this.iscroll.scrollTo(-x,-y, 500*this.S);
    this.showInnerCircle(el.x+75, el.y+75)

    var soundTimeline = new mojs.Timeline({
      delay: 0*this.S, onStart: () => { this.openSound2.play(); } });

    var scaleDownTween = new mojs.Timeline({
      duration: 300*this.S, easing: 'expo.out',
      onUpdate: (p)=> {
        mojs.h.setPrefixedStyle(innerEl, 'transform', `scale(${1-.25*p}) translateZ(0)`);
        innerEl.style.opacity = 1-.25*p;
      }
    });

    var blobTimeline = new mojs.Timeline({
      duration: 600*this.S, delay: 100*this.S,
      onUpdate: (p)=> {
        this.blob = this.blobBase + .3*(mojs.easing.cubic.out(p));
        this.blobShift = this.blobBase + 1*(p);
      }
    });

    this.content.style.opacity = 0;
    this.contentI.innerHTML = el.querySelector('.particle__content').innerHTML;

    var scaleUpTimeline = new mojs.Timeline({
      duration: 600*this.S, delay: 350*this.S,
      onUpdate: (p)=> {
        var scaleSize = 19*mojs.easing.cubic.in(p)
        scaleSize = Math.max(.75, scaleSize)
        var scale = `scale(${scaleSize}) translateZ(0)`;
        mojs.h.setPrefixedStyle(innerEl, 'transform', scale);
        innerEl.style.opacity = .75 + .25*mojs.easing.cubic.out(p)
      },
      onStart:()=> {
        // this.content.style.display = 'block';
        setTimeout(()=> {
          this.showInner(this.content);
        }, 450)
      },
      onComplete: () => {
        this.blobCircle.style.display = 'none';
      }
    });
    
    tween.add(scaleDownTween, soundTimeline, blobTimeline, scaleUpTimeline);
    tween.start();
  }
}

export default showOnEl