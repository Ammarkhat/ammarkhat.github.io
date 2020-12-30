let txt = `
union(){
    difference(){
        translate([0,44,0]) cube([94,17,16]);
		union(){
			translate([0,44,5]) rotate([0,-45,0]) cube([30,17,16]);
			translate([78,44,20]) rotate([0,45,0]) cube([30,17,16]);
		}
    }
    translate([29.5,44,16]) cube([35,17,6]);
    difference(){
        translate([34,0,0]) cube([26,44,16]);
		union(){
			translate([47,30,5]) cylinder(h=16, r=7);
			translate([40,0,5]) cube([14,30,16]);
		}
    }
    translate([29.5,52.5,22]) rotate([0,90,0]) cylinder(h=35, r=8.5);
    difference(){
        translate([29.5,52.5,20.5]) cube([35,52,10]);
        translate([47,80,20.5]) cylinder(h=10, r=8.5);
    }
    translate([29.5,94.5,30.5]) cube([35,10,10]);
    translate([47,104.5,40.5]) rotate([90,0,0]) cylinder(h=10, r=8.5);
}
`;

var csg_tree2= ParseScadText(txt);