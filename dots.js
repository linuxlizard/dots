/*  The dots game in JavaScript. Because I wanted to learn more JavaScript and
 *  HTML5 Canvas.
 *
 *  davep 27-Nov-2013
 *
 */

var last_pos={"x":0,"y":0};
var ctx;
var mouse_is_down=false;
var horiz_lines = [];
var vert_lines = [];
var squares = [];
var new_line = { "x0" : 0, "y0" : 0,
                 "x1" : 0, "y1" : 0,
                 "valid": false };

function drawdot(dot_x,dot_y) 
{
    ctx.beginPath();
    ctx.fillStyle="#ff0000";
    ctx.arc(dot_x,dot_y,3,0,2*Math.PI);
    ctx.fill();
}

function on_mousedown(evt) 
{
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


const PI_4 = Math.PI/4;       /* pi/4 */
const PI_3_4 = (Math.PI*3)/4; /* 3*pi/4 */

function on_mousemove(evt) 
{
    if( !mouse_is_down ) {
        return false;
    }

    /* erase entire canvas 
     * https://stackoverflow.com/questions/7365436/erasing-previously-drawn-lines-on-an-html5-canvas
     */
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
//    draw_dots();
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

function check_closures()
{
    /* Search entire board for squares with three edges and close them */
    var row=0;
    var col=0;
    var count = 0;

    while( 1 ) {
        /* Count number of squares captured. If we capture a square, we need to
         * continue to check if the closing line closed another new square
         */
        count = 0;

        for( row=0; row<squares.length ; row++ ) {
            for( col=0 ; col<squares[0].length ; col++ ) {
                if( squares[row][col] == 3 ) {
                    update_list = [ [row,col] ];
    //                /* this is mine! */
    //                squares[row][col] += 1;

                    console.log("claim row="+row+" col="+col);

                    /* choose neighboring square to update refcount */
                    if( horiz_lines[row][col]==0 ) {
                        horiz_lines[row][col] = 1;      // North
                        update_list.push( [row-1,col] ); // update above
                    }
                    else if( horiz_lines[row+1][col]==0 ) {
                        horiz_lines[row+1][col] = 1;    // South
                        update_list.push( [row+1,col] ); // update below
                    }
                    else if( vert_lines[row][col]==0 ) {
                        vert_lines[row][col] = 1;       // West
                        update_list.push( [row,col-1] ); // update left 
                    }
                    else if( vert_lines[row][col+1]==0 ) {
                        vert_lines[row][col+1] = 1;     // East
                        update_list.push( [row,col+1] ); // update right
                    }

                    update_squares_refcount( update_list );

                    count += 1;
                }
            }
        }

        /* we didn't capture any squares in that iteration so we don't need to
         * continue searching for new squares to capture */
        if( count==0 ) {
            break;
        }
    }

    sanity_check();
}

function update_squares_refcount( squares_list )
{
    /* squares_list[] is an array of [row,col] pairs of squares positions that
     * need to be incremented. Called when we need to update the reference
     * count on a square when a new line arrives.
     */
    console.log("update "+squares_list);

    var i=0;
    var square_row = 0;
    var square_col = 0;
    for( i=0 ; i<squares_list.length ; i++ ) {
        square_row = squares_list[i][0];
        square_col = squares_list[i][1];

        console.log( "update row="+square_row+" col="+square_col );

        /* if we are in range */
        if( square_row >= 0 && square_row < 9 &&
            square_col >=0 && square_col < 9 ) 
        {
            /* Increment reference count. When hits 3, the square can close. */
            console.log( "update refcount square_row=",square_row,
                    "square_col=",square_col );
            squares[square_row][square_col] += 1;
        }
    }
    sanity_check();
}

function sanity_check() 
{
    /* validate board */
    var row=0;
    var col=0;

    for( row=0; row<squares.length ; row++ ) {
        for( col=0 ; col<squares[0].length ; col++ ) {

            /* reference counter should always be in [0,4] */
            console.assert( squares[row][col] >= 0 && squares[row][col] <= 4 );

            /* check for horiz/vert boundaries not matching the squares (reference
             * count should exactly match the squares neighboring lines)
             */

            var count=0;
            count += horiz_lines[row][col];         // North 
            if( row+1 < horiz_lines.length )  {
                count += horiz_lines[row+1][col];   // South
            }
            count += vert_lines[row][col];          // West
            if( col+1 < vert_lines[0].length ) {
                count += vert_lines[row][col+1];    // East
            }
            if( count != squares[row][col] ) {
                console.log( "Sanity Error! square at row="+row+" col="+col+
                        " square="+squares[row][col]+" neighbor_count="+count );
                console.assert( count == squares[row][col] );
            }
        }

    }

}

function on_mouseup(evt) {

    if( !mouse_is_down ) {
        return false;
    }
    mouse_is_down = false;

    if( !new_line.valid ) {
        /* don't capture a line; just redraw a nice clean board */
        redraw_board();
        return false;
    }

    /* set the board position as dotted (note x,y reversed to row,col) */
//        console.log("last_pos.x="+last_pos.x+" last_pos.y="+last_pos.y);

    var row=0;
    var col=0;

    /* array of (row,col) of squares that border the new line */
    var border_squares = [];

    if( new_line.x0 < new_line.x1 ) {
        /* horizontal right (west).  a,b are bordering squares
         *     o   o   o
         *           a
         *     o   o-->o
         *           b
         *     o   o   o
         */
        row = new_line.y0/20-1;
        col = new_line.x0/20-1;
        border_squares.push([row-1,col],[row,col]);
    }
    else if( new_line.x0 > new_line.x1 ) {
        /* horizontal left (west).  a,b are bordering squares
         *     o   o   o
         *       a
         *     o<--o   o
         *       b
         *     o   o   o
         */
        row = new_line.y0/20-1;
        col = new_line.x1/20-1;
        border_squares.push([row-1,col],[row,col]);
    }
    if( new_line.y0 < new_line.y1 ) {
        /* vertical down (south).  a,b are bordering squares
         *     o   o   o
         *        
         *     o   o   o
         *       a v b
         *     o   o   o
         */
        row = new_line.y0/20-1;
        col = new_line.x0/20-1;
        border_squares.push([row,col-1],[row,col]);
    }
    else if( new_line.y0 > new_line.y1 ) {
        /* vertical up (north).  a,b are bordering squares
         *     o   o   o
         *       a ^ b
         *     o   o   o
         *        
         *     o   o   o
         */
        row = new_line.y1/20-1;
        col = new_line.x0/20-1;
        border_squares.push([row,col-1],[row,col]);
    }

    if( new_line.x0 != new_line.x1 ) {
        console.log("row="+row+" col="+col);
        /* adjust horizontal lines */
        /* did user choose a line already in-use? */
        if( horiz_lines[row][col] == 0 ) {
            horiz_lines[row][col] = 1;
            update_squares_refcount(border_squares);
            /* search for any three sided squares that can now be claimed */
            check_closures();
        }
    }
    if( new_line.y0 != new_line.y1 ) {
        /* adjust vertical lines */
        /* did user choose a line already in-use? */
        if( vert_lines[row][col] == 0 ) {
            vert_lines[row][col] = 1;
            update_squares_refcount(border_squares);
            /* search for any three sided squares that can now be claimed */
            check_closures();
        }
    }


    /* redraw board to erase user's unconnected line */
    redraw_board();

    sanity_check();

    return false;
}

function draw_dots() 
{
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

function draw_lines_and_squares()
{
    var i=0;
    var j=0;
    var x=20;
    var y=20;

    /* draw vertical lines */
    for( i=0 ; i<vert_lines.length ; i++ ) {   /* foreach row */
        for( j=0 ; j<vert_lines[0].length ; j++ ) {   /* foreach col */
            if( vert_lines[i][j] ) { 
                ctx.beginPath();
                ctx.moveTo(x,y);
                ctx.lineTo(x,y+20);
                ctx.strokeStyle="blue";
                ctx.stroke();
            }
            x += 20;
        }
        x = 20;
        y += 20;
    }

    /* draw horizontal lines */
    x=20;
    y=20;
    for( i=0 ; i<horiz_lines.length ; i++ ) {   /* foreach row */
        for( j=0 ; j<horiz_lines[0].length ; j++ ) {   /* foreach col */
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

    /* draw filled squares */
    x=20;
    y=20;
    for( i=0 ; i<squares.length ; i++ ) {   /* foreach row */
        for( j=0 ; j<squares[0].length ; j++ ) {   /* foreach col */
            if( squares[i][j]==4 ) {
                ctx.fillStyle="#000000";
                ctx.fillRect( x+1,y+1,18,18 );
            }
            x += 20;
        }
        x = 20;
        y += 20;
    }
}

function draw_board() 
{
    draw_lines_and_squares();
    draw_dots();
}

function redraw_board()
{
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    draw_board();
}

function create_empty_board(max_row,max_col) 
{
    var board = [];
    var i=0;
    var j=0;
    for( i=0 ; i<max_row ; i++ ) {
        board[i] = [];
        for( j=0 ; j<max_col ; j++ ) {
            board[i][j] = 0;
        }
    }

    return board;
}

function run() {
    ctx = canvas.getContext('2d');

    horiz_lines = create_empty_board(10,10);
    vert_lines = create_empty_board(10,10);
    squares = create_empty_board(9,9);

    /* temp for testing */
//    squares[0][0] = 4;
//    squares[1][1] = 4;

    draw_board();

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

