var last_pos={"x":0,"y":0};
var ctx;
var mouse_is_down=false;
var horiz_lines = [];
var vert_lines = [];
var new_line = { "x0" : 0, "y0" : 0,
                 "x1" : 0, "y1" : 0,
                 "valid": false };

function drawdot(dot_x,dot_y) {
//        var c=document.getElementById("canvas");
//        var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle="#ff0000";
    ctx.arc(dot_x,dot_y,3,0,2*Math.PI);
    ctx.fill();
}

function on_mousedown(evt) {
    /* find the closest two dots and draw line conntecting them */
    var x = evt.clientX;
    var y = evt.clientY;

    var dot_x = Math.floor((x+0)/20)*20;
    var dot_y = Math.floor((y+0)/20)*20;
//    console.log("x="+x+" y="+y+" dot_x="+dot_x+" dot_y="+dot_y);
    if( dot_x > 10 && dot_x < 220 && dot_y > 10 && dot_y < 220 ) {
        drawdot(dot_x,dot_y);
        last_pos.x = dot_x;
        last_pos.y = dot_y;
        mouse_is_down = true;
    }
    return false;
}

//    function on_contextmenu(evt) {
//        alert("context!"+evt.clientX+" "+evt.clientY);
//        return false;
//    }


var PI_4 = Math.PI/4;       /* pi/4 */
var PI_3_4 = (Math.PI*3)/4; /* 3*pi/4 */

function on_mousemove(evt) {

    if( !mouse_is_down ) {
        return false;
    }

    /* erase entire canvas 
     * https://stackoverflow.com/questions/7365436/erasing-previously-drawn-lines-on-an-html5-canvas
     */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    draw_dots();
    draw_board();

    /* the -10 is because the event point doesn't line up with the tip of
     * the arrow  (weird; needs investigation)
     */
    var x=evt.clientX-10;
    var y=evt.clientY-10;

    /* draw new line */
    ctx.beginPath();
    ctx.moveTo(last_pos.x,last_pos.y);
    ctx.lineTo(x,y);
    ctx.strokeStyle="black";
    ctx.stroke();

//        console.log("draw line="+
//                    last_pos.x+","+last_pos.y+","+
//                    x+","+y );


    /* Note my x,y are swapped to row,col and atan2() wants atan2(y,x). Weird, huh? */
    var theta;
    theta = Math.atan2((x-last_pos.x),(y-last_pos.y));

//        console.log("xdelta=" + (x-last_pos.x) +
//                   " ydelta=" + (y-last_pos.y) + 
//                   " theta=" + theta);

    var snap_x = 0;
    var snap_y = 0;
    if( theta < 0 ) {
        if( theta > -PI_4 ) {
            /* down */
            snap_y = 1;
        }
        else if( theta > -PI_3_4 ) {
            /* left */
            snap_x = -1;
        }
        else {
            /* up */
            snap_y = -1;
        }
    }
    else {
        if( theta < PI_4 ) {
            /* down */
            snap_y = 1;
        }
        else if( theta < PI_3_4 ) {
            /* right */
            snap_x = 1;
        }
        else {
            /* up */
            snap_y = -1;
        }
    }

//    console.log( "snap_x="+snap_x+" snap_y="+snap_y );

    /* assume user is off the grid until proven otherwise */
    new_line.valid = false;

    new_endpoint_x = last_pos.x + snap_x*20;
    new_endpoint_y = last_pos.y + snap_y*20;

    if( new_endpoint_x >= 20 && new_endpoint_x <= 200 &&
        new_endpoint_y >= 20 && new_endpoint_y <= 200 ) 
    {
        new_line.x0 = last_pos.x;
        new_line.y0 = last_pos.y;
        new_line.x1 = last_pos.x + snap_x*20;
        new_line.y1 = last_pos.y + snap_y*20;
        new_line.valid = true;

        ctx.beginPath();
        ctx.moveTo(new_line.x0,new_line.y0);
        ctx.lineTo(new_line.x1,new_line.y1);
        ctx.strokeStyle="blue";
        ctx.stroke();
    }

    return false;
}

function on_mouseup(evt) {

    if( !mouse_is_down ) {
        return false;
    }
    mouse_is_down = false;

    if( new_line.valid ) {
        /* set the board position as dotted (note x,y reversed to row,col) */
//        console.log("last_pos.x="+last_pos.x+" last_pos.y="+last_pos.y);

        var row=0;
        var col=0;

        if( new_line.x0 < new_line.x1 ) {
            /* horizontal right */
            row = new_line.y0;
            col = new_line.x0;
        }
        else if( new_line.x0 > new_line.x1 ) {
            /* horizontal left */
            row = new_line.y0;
            col = new_line.x1;
        }
        if( new_line.y0 < new_line.y1 ) {
            /* vertical down */
            row = new_line.y0;
            col = new_line.x0;
        }
        else if( new_line.y0 > new_line.y1 ) {
            /* vertical up */
            row = new_line.y1;
            col = new_line.x0;
        }

        if( new_line.x0 != new_line.x1 ) {
            /* adjust horizontal lines */
            horiz_lines[row/20-1][col/20-1] = 1;
        }
        if( new_line.y0 != new_line.y1 ) {
            /* adjust vertical lines */
            vert_lines[row/20-1][col/20-1] = 1;
        }
    }

    /* redraw board to erase user's unconnected line */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    draw_dots();
    draw_board();

    return false;
}

function draw_dots() {
    var i=0;
    var j=0;
    var x = 20;
    var y = 20;
    for( i=0 ; i<10 ; i++ ) {
        for( j=0 ; j<10 ; j++ ) {
            ctx.beginPath();
            ctx.arc(x,y,3,0,2*Math.PI);
            if( mouse_is_down && x==last_pos.x && y==last_pos.y ) {
                /* draw currently selected dot (if any) */
                ctx.fillStyle="#ff0000";
            }
            else {
                ctx.fillStyle="#000000";
            }
            ctx.fill();
            x += 20;
        }
        x = 20;
        y += 20;
    }
}

function draw_board() 
{
    var i=0;
    var j=0;
    var x=20;
    var y=20;
    for( i=0 ; i<10 ; i++ ) {   /* foreach row */
        for( j=0 ; j<10 ; j++ ) {   /* foreach col */
            if( vert_lines[i][j] ) { 
                ctx.beginPath();
                ctx.moveTo(x,y);
                ctx.lineTo(x,y+20);
                ctx.strokeStyle="blue";
                ctx.stroke();
            }
            if( horiz_lines[i][j] ) { 
                ctx.beginPath();
                ctx.moveTo(x,y);
                ctx.lineTo(x+20,y);
                ctx.strokeStyle="blue";
                ctx.stroke();
            }
            x += 20;
        }
        x = 20;
        y += 20;
    }
}

function create_empty_board() 
{
    var board = [];
    var i=0;
    var j=0;
    for( i=0 ; i<20 ; i++ ) {
        board[i] = [];
        for( j=0 ; j<20 ; j++ ) {
            board[i][j] = 0;
        }
    }

    return board;
}

function run() {
    ctx = canvas.getContext('2d');

    horiz_lines = create_empty_board();
    vert_lines = create_empty_board();

    draw_dots();

    ctx.canvas.onmousedown = on_mousedown;
    ctx.canvas.onmouseup = on_mouseup;
//    ctx.canvas.onmousemove = on_mousemove;
    ctx.canvas.addEventListener("mousemove",on_mousemove,true);

//    ctx.canvas.onclick = on_click;
//    ctx.canvas.oncontextmenu = on_contextmenu;
}

window.onload=function() {
    run();
}

