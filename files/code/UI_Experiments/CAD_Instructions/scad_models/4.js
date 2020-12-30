let txt = `
difference(){
    union(){
        difference(){
            union(){
				translate([15,30,0]) cylinder(h=30, r=15);
				translate([60,30,0]) cylinder(h=30, r=30);
            }
            translate([15,30,0]) cylinder(h=40, r=7);    
        }
        translate([50,20,30]) cube([20,20,15]);
        translate([50,30,30]) cylinder(h=15, r=10);
        difference(){
            translate([60,5,30]) cube([10,50,15]);
            translate([60,5,30]) rotate([45,0,0]) cube([10,50,20]);
            translate([60,35,50]) rotate([-45,0,0]) cube([10,50,20]);    
        }
    }
    translate([50,30,0]) cylinder(h=60, r=5);    
}
`;

var csg_tree2= ParseScadText(txt);