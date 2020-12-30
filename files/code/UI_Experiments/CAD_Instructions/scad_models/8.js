let txt = `
union(){
    difference(){
        cube([80,70,50.5]);
        translate([15,0,0]) rotate([48,0,0]) cube([30,100,75]);
        translate([55,0,0]) rotate([48,0,0]) cube([30,100,75]);
        translate([55,20,22.2]) cube([30,40,40]);
        translate([80,60,22.2]) rotate([0,-41.5,0]) cube([25,10,75]);
    }
    translate([80,20,0]) cube([30,50,22.2]);
    translate([110,70,11.1]) rotate([90,0,0]) cylinder(h=50, r=11.1);
}
`;

var csg_tree2= ParseScadText(txt);