let txt = `
difference(){
    cube([100,70,75]);
    translate([35,0,10]) rotate([48,0,0]) cube([30,100,75]);
    translate([0,0,10]) rotate([48,0,0]) cube([25,100,75]);
    translate([75,0,10]) rotate([48,0,0]) cube([30,100,75]);
    translate([75,20,40]) cube([30,40,40]);
    translate([0,20,40]) cube([25,40,40]);
    translate([-30,60,40.7]) rotate([0,35.35,0]) cube([25,10,75]);
    translate([100,60,40]) rotate([0,-35.55,0]) cube([25,10,75]);
}


`;

var csg_tree2= ParseScadText(txt);