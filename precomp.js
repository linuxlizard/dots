
var east_mouth;
var west_mouth;
var north_mouth;
var south_mouth;

function init_one_mouth_lut(start_angle,end_angle)
{
    var i=0;
    var PI_4 = Math.PI/4.0;
    var ANGLE_STEPS = PI_4/16.0;

    var lut = Array(33);

    /* assume start full open */

    console.log(ANGLE_STEPS);

    /* closing */
    for( i=0 ; i<16 ; i++ ) {
        lut[i] = [start_angle,end_angle];
        start_angle -= ANGLE_STEPS;
        end_angle += ANGLE_STEPS;
    }

    /* fully closed (full circle) */
    lut[16] = [ 0, 2*Math.PI ];

    /* opening */
    for( i=17; i<33 ; i++ ) {
        start_angle += ANGLE_STEPS;
        end_angle -= ANGLE_STEPS;
        lut[i] = [start_angle,end_angle];
    }

    return lut;
}

function init_mouth_luts() 
{
    var PI_4 = Math.PI/4.0;

    /* http://www.w3schools.com/tags/canvas_arc.asp
     *
     * arc() goes clockwise 
     */

    /* south */
    south_mouth = init_one_mouth_lut(3*PI_4,PI_4);

    /* north */
    north_mouth = init_one_mouth_lut(-PI_4,5*PI_4);

    /* east */
    east_mouth = init_one_mouth_lut(PI_4,-PI_4);

    /* west */
    west_mouth = init_one_mouth_lut(-3*PI_4,3*PI_4);
}

init_mouth_luts();

console.log("hello,world!\n");
var i=0;
for(i=0;i<33;i++) {
    console.log(west_mouth[i]);
}


