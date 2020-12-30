let txt = `
union(){
    difference(){
        cube([10,70,50]);
        translate([-5,10,40]) rotate([0,90,0]) cylinder(h=20, r=5);
        translate([-5,60,40]) rotate([0,90,0]) cylinder(h=20, r=5);
    }
    difference(){
        union(){
            translate([60,35,0]) cylinder(h=20, r=15);
            translate([0,20,0]) cube([60,30,20]);
        }
        translate([60,35,0]) cylinder(h=20, r=5);
    }
    difference(){
        translate([0,30,0]) cube([50,10,50]);
        translate([0,30,57.5]) rotate([0,37,0]) cube([70,10,50]);    
    }
    difference(){
        translate([10,10,0]) cube([10,10,20]);
        translate([20,10,0]) cylinder(h=20, r=10);
    }
    difference(){
        translate([10,50,0]) cube([10,10,20]);
        translate([20,60,0]) cylinder(h=20, r=10);
    }
}
`;

var csg_tree2= ParseScadText(txt);