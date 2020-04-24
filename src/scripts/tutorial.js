/**
 * tutorial.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2019, Codrops
 * http://www.codrops.com
 */

// set the starting position of the cursor outside of the screen
let clientX = -100;
let clientY = -100;
const innerCursor = document.querySelector(".cursor--small");

const initCursor = () => {
  // add listener to track the current mouse position
  document.addEventListener("mousemove", e => {
    clientX = e.clientX;
    clientY = e.clientY;
  });

  // transform the innerCursor to the current mouse position
  // use requestAnimationFrame() for smooth performance
  const render = () => {

    innerCursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
    // if you are already using TweenMax in your project, you might as well
    // use TweenMax.set() instead
    // TweenMax.set(innerCursor, {
    //   x: clientX,
    //   y: clientY
    // });
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
};

initCursor();

let lastX = 0;
let lastY = 0;
let isStuck = false;
let showCursor = false;
let group, stuckX, stuckY, fillOuterCursor;

const initCanvas = () => {

  const canvas = document.querySelector(".cursor--canvas");
  // const shapeBounds = {
  //   width: 75,
  //   height: 75
  // };
  const shapeBounds = { //on scale - was 135
    width: 95,
    height: 95
  };
  paper.setup(canvas);
  const strokeColor = "rgba(255, 255, 255, 1)";
  const strokeWidth = 2.3;
  const segments = 8;
  const radius = 13;

  // we'll need these later for the noisy circle
  const noiseScale = 200; // speed
  const noiseRange = 4.5; // range of distortion
  let isNoisy = false; // state

  // the base shape for the noisy circle
  const polygon = new paper.Path.RegularPolygon(
    new paper.Point(0, 0),
    segments,
    radius
  );

  polygon.strokeColor = strokeColor;
  polygon.strokeWidth = strokeWidth;
  polygon.smooth();
  group = new paper.Group([polygon]);
  group.applyMatrix = false;

  const noiseObjects = polygon.segments.map(() => new SimplexNoise());
  let bigCoordinates = [];

  // function for linear interpolation of values
  const lerp = (a, b, n) => {
    return (1 - n) * a + n * b;
  };

  // function to map a value from one range to another range
  const map = (value, in_min, in_max, out_min, out_max) => {
    return (
      ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
  };

  // the draw loop of Paper.js
  // (60fps with requestAnimationFrame under the hood)
  paper.view.onFrame = event => {
    // using linear interpolation, the circle will move 0.2 (20%)
    // of the distance between its current position and the mouse
    // coordinates per Frame
    if (!isStuck) {
      // move circle around normally
      lastX = lerp(lastX, clientX, 0.09);
      lastY = lerp(lastY, clientY, 0.09);
      group.position = new paper.Point(lastX, lastY);
    } else if (isStuck) {
      // fixed position on a nav item
      lastX = lerp(lastX, stuckX, 0.09);
      lastY = lerp(lastY, stuckY, 0.09);
      group.position = new paper.Point(lastX, lastY);
    }

    if (isStuck && polygon.bounds.width < shapeBounds.width) {
      // scale up the shape
      polygon.scale(1.08);
    } else if (!isStuck && polygon.bounds.width > 30) {
      // remove noise
      if (isNoisy) {
        polygon.segments.forEach((segment, i) => {
          segment.point.set(bigCoordinates[i][0], bigCoordinates[i][1]);
        });
        isNoisy = false;
        bigCoordinates = [];
      }
      // scale down the shape
      const scaleDown = 0.92;
      polygon.scale(scaleDown);
    }

    // while stuck and big, apply simplex noise
    if (isStuck && polygon.bounds.width >= shapeBounds.width) {
      isNoisy = true;
      // first get coordinates of large circle
      if (bigCoordinates.length === 0) {
        polygon.segments.forEach((segment, i) => {
          bigCoordinates[i] = [segment.point.x, segment.point.y];
        });
      }

      // loop over all points of the polygon
      polygon.segments.forEach((segment, i) => {
        // get new noise value
        // we divide event.count by noiseScale to get a very smooth value
        const noiseX = noiseObjects[i].noise2D(event.count / noiseScale, 0);
        const noiseY = noiseObjects[i].noise2D(event.count / noiseScale, 1);

        // map the noise value to our defined range
        const distortionX = map(noiseX, -1, 1, -noiseRange, noiseRange);
        const distortionY = map(noiseY, -1, 1, -noiseRange, noiseRange);

        // apply distortion to coordinates
        const newX = bigCoordinates[i][0] + distortionX;
        const newY = bigCoordinates[i][1] + distortionY;

        // set new (noisy) coodrindate of point
        segment.point.set(newX, newY);
      });
    }
    polygon.smooth();
  };
};

initCanvas();

const initHovers = () => {
  // find the center of the link element and set stuckX and stuckY
  // these are needed to set the position of the noisy circle
  const handleMouseEnter = e => {
    const navItem = e.currentTarget;
    const navItemBox = navItem.getBoundingClientRect();
    stuckX = Math.round(navItemBox.left + navItemBox.width / 2);
    stuckY = Math.round(navItemBox.top + navItemBox.height / 2);
    isStuck = true;
  };

  // reset isStuck on mouseLeave
  const handleMouseLeave = () => {
    isStuck = false;
  };

  // add event listeners to all items
  const linkItems = document.querySelectorAll(".link");
  linkItems.forEach(item => {
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  });
};

var notAlreadyUp = true;
var mouseDown = 0;
document.body.onmousedown = function(eventdata) {

  if(eventdata.which != 3)
  {
    ++mouseDown;
  }
}
document.body.onmouseup = function(eventdata) {

  if(eventdata.which != 3)
  {
  --mouseDown;
}
notAlreadyUp = true;
}

//TRANSITION - change opacity of big video
$(function(){
       var $win = $(window),
       w = 0,h = 0,
       opacity = 0,
       getWidth = function() {
           w = $win.width();
           h = $win.height();
       };

       $win.mousemove(function(e) {
           getWidth();
           //opacity = (e.pageX/w * 0.5) + (e.pageY/h * 0.5);

           //ONLY BOTTOM HALF
           if(e.pageY > h*0.8)
           {
             opacity = (e.pageY-(h*0.78))/(h*0.16);
           } else {
             opacity = 0;
           }

           opacity = ((e.pageY > h*0.6) && mouseDown) ? 1 : 0;


           // var perc = Math.floor((($('#myVideo').get(0).currentTime/$('#myVideo').get(0).duration) * 100).toFixed(2));
           // // console.log(perc);
           //
           // if(perc >= 71)
           // {
           //   //$('#myVideo').get(0).pause();
           // }
           //
           // if((e.pageY > h*0.6) && mouseDown && notAlreadyUp)
           // {
           //   //console.log('restart vid');
           //   $('#myVideo').get(0).currentTime = 0;
           //   $('#myVideo').get(0).play();
           //   notAlreadyUp = false;
           // }
           //
           // if(mouseDown)
           // {
           //    $('#myVideo').css('opacity',opacity);
           // } else {
           //   $('#myVideo').css('opacity',0);
           // }
       });
   });

initHovers();
setTimeout(function() {initCanvas()}, 50); //IMPORTANT

//Perspective svg
(function() {
  // Init
  var container = document.getElementById("svgContainer"),
    inner = document.getElementById("inner");

  // Mouse
  var mouse = {
    _x: 0,
    _y: 0,
    x: 0,
    y: 0,
    updatePosition: function(event) {
      var e = event || window.event;
      this.x = e.clientX - this._x;
      this.y = (e.clientY - this._y) * -1;
    },
    setOrigin: function(e) {
      this._x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
      this._y = e.offsetTop + Math.floor(e.offsetHeight / 2);
    },
    show: function() {
      return "(" + this.x + ", " + this.y + ")";
    }
  };

  // Track the mouse position relative to the center of the container.
  mouse.setOrigin(container);

  //-----------------------------------------

  var counter = 0;
  var updateRate = 10;
  var isTimeToUpdate = function() {
    return counter++ % updateRate === 0;
  };

  //-----------------------------------------

  var onMouseEnterHandler = function(event) {
    update(event);
  };

  var onMouseLeaveHandler = function() {
     // inner.style = "";
     var style = "rotateX(" + 0 + "deg) rotateY(" + 0 + "deg)";
     inner.style.transform = style;
     inner.style.webkitTransform = style;
     inner.style.mozTransform = style;
     inner.style.msTransform = style;
     inner.style.oTransform = style;
    //update(event);
  };

  var onMouseMoveHandler = function(event) {
    if (isTimeToUpdate()) {
      update(event);
    }
  };

  //-----------------------------------------

  var update = function(event) {
    mouse.updatePosition(event);
    updateTransformStyle(
      (mouse.y / inner.offsetHeight / 2).toFixed(2),
      (mouse.x / inner.offsetWidth / 2).toFixed(2)
    );
  };

  var updateTransformStyle = function(x, y) {
    var style = "rotateX(" + x + "deg) rotateY(" + y + "deg)";
    inner.style.transform = style;
    inner.style.webkitTransform = style;
    inner.style.mozTransform = style;
    inner.style.msTransform = style;
    inner.style.oTransform = style;
  };

  //-----------------------------------------

  container.onmouseenter = onMouseEnterHandler;
  container.onmouseleave = onMouseLeaveHandler;
  container.onmousemove = onMouseMoveHandler;
})();
