/* Pacman-ish in javascript. An excuse to learn more HTML Canvas.
 *
 * davep 18-Aug-2014
 */

const PI_4 = Math.PI/4.0;
const MOUTH_ANGLE = Math.PI/64.0;

const DIRECTION_NONE=0;
const DIRECTION_NORTH=1;
const DIRECTION_SOUTH=2;
const DIRECTION_EAST=3;
const DIRECTION_WEST=4;

var opening = false;
var direction = DIRECTION_SOUTH;
//var direction = DIRECTION_EAST;
var start_angle = 5*PI_4;
var end_angle = 3*PI_4;
var pos_x = 100;
var pos_y = 100;

var visible=1;

var canvas;
var ctx;

function calc_next_pos()
{
    /* moving EAST/WEST */
    switch( direction ) {
        case DIRECTION_WEST :
            if( pos_x > 50 ) {
                pos_x -= 1;
            }
            break;

        case DIRECTION_EAST :
            if( pos_x < 590 ) {
                pos_x += 1;
            }
            break;

        case DIRECTION_NORTH :
            if( pos_y > 50 ) {
                pos_y -= 1;
            }
            break;

        case DIRECTION_SOUTH :
            if( pos_y < 430 ) {
                pos_y += 1;
            }
            break;
    }
}

function calc_next_mouth_1()
{
    /* facing EAST */
    if( opening ) {
        /* mouth is opening */
        start_angle += MOUTH_ANGLE;
        end_angle -= MOUTH_ANGLE;

        if( start_angle >= PI_4 ) {
            /* mouth fully open; start closing */
            opening = false;
            start_angle = PI_4;
            end_angle = -PI_4;
        }
    }
    else { 
        /* mouth is closing */
        start_angle -= MOUTH_ANGLE;
        end_angle += MOUTH_ANGLE;

        if( start_angle <= 0 ) {
            /* mouth fully closed */
            opening = true;
            start_angle = 0;
            end_angle = Math.PI*2;
        }
    }
}

function calc_next_mouth_2()
{
    /* facing WEST */
    if( opening ) {
        /* mouth is opening */
        start_angle += MOUTH_ANGLE;
        end_angle -= MOUTH_ANGLE;

        if( start_angle >= 5*PI_4 ) {
            /* mouth fully open; start closing */
            opening = false;
            start_angle = 5*PI_4;
            end_angle = 3*PI_4;
        }
    }
    else { 
        /* mouth is closing */
        start_angle -= MOUTH_ANGLE;
        end_angle += MOUTH_ANGLE;

        if( start_angle <= 4*PI_4 ) {
            /* mouth fully closed */
            opening = true;
            start_angle = 4*PI_4;
            end_angle = 4*PI_4;
        }
    }
}

function draw1() 
{
    /* erase entire canvas 
     * https://stackoverflow.com/questions/7365436/erasing-previously-drawn-lines-on-an-html5-canvas
     */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

    ctx.fillStyle="#ffff38";
    ctx.beginPath();
    ctx.moveTo(pos_x,100);


//    console.log(opening,angle_offset,start_angle,end_angle);

    /* FIXME no circle drawn if start_angle==end_angle (causes flickering);
     * Want to find a better way to do this than another special case compare.
     */
    if( Math.abs(end_angle-start_angle) < MOUTH_ANGLE ) {
        /* draw full circle */
        ctx.arc(pos_x,100,50,0,2*Math.PI,false);
    }
    else { 
        ctx.arc(pos_x,100,50,start_angle,end_angle,false);
    }

    ctx.fill();

    calc_next_mouth_2();
//    calc_next_mouth_1();

    calc_next_pos();
}

var idx=0;

function draw() 
{
    /* erase entire canvas 
     * https://stackoverflow.com/questions/7365436/erasing-previously-drawn-lines-on-an-html5-canvas
     */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

    ctx.fillStyle="#ffff38";
    ctx.beginPath();
    ctx.moveTo(pos_x,pos_y);


//    console.log(opening,angle_offset,start_angle,end_angle);

    /* FIXME no circle drawn if start_angle==end_angle (causes flickering);
     * Want to find a better way to do this than another special case compare.
     */


    var start_angle=0;
    var end_angle=0;

    if( direction==DIRECTION_NORTH) {
        start_angle = north_mouth[idx][0];
        end_angle = north_mouth[idx][1];
    }
    else if( direction==DIRECTION_SOUTH ) {
        start_angle = south_mouth[idx][0];
        end_angle = south_mouth[idx][1];
    }
    else if( direction==DIRECTION_EAST ) {
        start_angle = east_mouth[idx][0];
        end_angle = east_mouth[idx][1];
    }
    else if( direction==DIRECTION_WEST ) {
        start_angle = west_mouth[idx][0];
        end_angle = west_mouth[idx][1];
    }
    else {
    }

    ctx.arc(pos_x,pos_y,50,start_angle,end_angle,false);

    idx = (idx+1) % 33;

    ctx.fill();

    calc_next_pos();
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

function on_keydown(evt) 
{
    switch( evt.keyCode )
    {
        case KEY_UP:
            console.log("direction from %d to %d",direction,DIRECTION_NORTH);
            direction = DIRECTION_NORTH;
            break;
        case KEY_DOWN:
            console.log("direction from %d to %d",direction,DIRECTION_SOUTH);
            direction = DIRECTION_SOUTH;
            break;
        case KEY_LEFT:
            console.log("direction from %d to %d",direction,DIRECTION_WEST);
            direction = DIRECTION_WEST;
            break;
        case KEY_RIGHT:
            console.log("direction from %d to %d",direction,DIRECTION_EAST);
            direction = DIRECTION_EAST;
            break;
    }

}

/* Double Buffering??
 * https://stackoverflow.com/questions/2795269/does-html5-canvas-support-double-buffering
 *
 * Doesn't seem to be necessary. Amazing how smooth this is considering how
 * crappy my code is!
 */

function run() 
{
    canvas = document.getElementById('my_canvas1');
    ctx = canvas.getContext('2d');

    const FRAME_RATE=100;
    var intervalTime = 1000/FRAME_RATE;
    setInterval(draw,intervalTime);

    ctx.canvas.onkeydown = on_keydown;
    document.onkeydown = on_keydown;
}

window.onload=function() 
{
    run();
}

