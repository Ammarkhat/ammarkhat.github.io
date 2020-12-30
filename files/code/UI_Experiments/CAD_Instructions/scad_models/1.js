let txt = `
difference(){
    union(){    
        cube([10,130,50]);
        translate([65,60,0]) cylinder(h=50, r=50);
        translate([125,10,0]) cube([10,100,50]);
        translate([5,45,0]) cube([20,30,50]);
        translate([85,20,10]) cube([40,80,30]);
        difference(){
            translate([5,0,20]) cube([50,130,10]);
            translate([50,90,20]) rotate([0,0,45]) cube([50,80,10]);
            translate([10,0,20]) rotate([0,0,-65]) cube([50,80,10]);
        }
    }
    
    translate([65,60,0]) cylinder(h=50, r=40);
    translate([-5,60,25]) rotate([0,90,0]) cylinder(h=50, r=7);
    translate([100,35,15]) cube([50,50,20]);

    translate([-5,10,10]) rotate([0,90,0]) cylinder(h=20, r=4);
    translate([-5,10,40]) rotate([0,90,0]) cylinder(h=20, r=4);
    translate([-5,120,10]) rotate([0,90,0]) cylinder(h=20, r=4);
    translate([-5,120,40]) rotate([0,90,0]) cylinder(h=20, r=4);
    
    translate([120,15,5]) rotate([0,90,0]) cylinder(h=20, r=2.5);
    translate([120,15,45]) rotate([0,90,0]) cylinder(h=20, r=2.5);
    translate([120,105,5]) rotate([0,90,0]) cylinder(h=20, r=2.5);
    translate([120,105,45]) rotate([0,90,0]) cylinder(h=20, r=2.5);

}
`;

var csg_tree2= ParseScadText(txt);