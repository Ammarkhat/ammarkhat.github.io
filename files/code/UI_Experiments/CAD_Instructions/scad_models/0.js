let txt = `
union(){
	difference(){
		cube([95,74,16]);
		union(){
			translate([76,16,-1]) cube([21,16,18]);
			translate([76,24,-1]) cylinder(d=16,h=18);
		}
	}
	union(){
		translate([0,32,16]) cube([16,42,48]);
		translate([0,0,0]) cube([16,32,32]);
		translate([0,32,32]) rotate([0,90,0]) cylinder(d=64,h=16);
	}
	difference(){
		translate([16,32,16]) cube([40,42,27]);
		translate([36,75,44]) rotate([90,0,0]) cylinder(d=24,h=44);
	}
	difference(){
		translate([56,64,16]) cube([39,10,27]);
		translate([56,64,43]) rotate([0,34.69]) cube([95,22,48]);
	}
}
`;

var csg_tree2= ParseScadText(txt);