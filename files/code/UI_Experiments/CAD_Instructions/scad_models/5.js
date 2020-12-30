let txt = `
difference(){
    cube([150,50,50]);
    translate([50,0,35]) rotate([0,15,0]) cube([160,50,50]);
    translate([-5,25,5]) rotate([0,95,0]) cylinder(h=160, r=20);
    translate([50,0,35]) rotate([0,-20,0]) cube([10,50,20]);
    translate([10,10,35]) cube([25,30,20]);
}
`;

var csg_tree2= ParseScadText(txt);