let txt = `
union(){
    translate([35,20,0]) cube([10,30,50]);
    difference(){
        union(){
            translate([60,35,10]) cylinder(h=30, r=15);
            translate([40,20,10]) cube([20,30,30]);
        }
        translate([60,35,10]) cylinder(h=30, r=10);
    }
    difference(){
        union(){
            translate([25,30,0]) cube([15,10,50]);
            translate([25,40,25]) rotate([90,0,0]) cylinder(h=10, r=25);
        }
        translate([23,45,25]) rotate([90,0,0]) cylinder(h=25, r=10);
    }
}
`;

var csg_tree2= ParseScadText(txt);