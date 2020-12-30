/// <reference path="../lib/three.js" />
/// <reference path="../lib/TransformControls.js" />
console.log("loading");
$("#info_div").append(" Loading... ");
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// STATS
stats = new Stats();
document.body.appendChild(stats.domElement);

var nlights = 6;
var lights = [];
for (var i = 0; i < nlights; i++) {
    lights[i] = new THREE.PointLight(0xffffff, 1, 0);
}

lights[0].position.set(0, 0, lightsDistance * 5);
lights[1].position.set(lightsDistance * 2, 0, lightsDistance);
lights[2].position.set(-lightsDistance * 2, 0, lightsDistance);
lights[3].position.set(0, lightsDistance * 2, lightsDistance);
lights[4].position.set(0, -lightsDistance * 2, lightsDistance);
lights[5].position.set(0, 0, -lightsDistance * 5);

for (var i = 0; i < nlights; i++) {
    scene.add(lights[i]);
}

var loader = new THREE.PLYLoader();
var multimaterial;
var material;
var base_color = new THREE.Color(0xffffff);

loader.load(pointsFileUrl1, function (geometry) {
    //var filteredVertices = new Array();
    //var filteredColors = new Array();
    //for (var i = 0; i < geometry.vertices.length; i++) {
    //    var v = geometry.vertices[i];
    //    if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)) {
    //        continue;
    //    }
    //    filteredVertices.push(v);
    //    filteredColors.push(geometry.colors[i]);
    //}

    points = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: THREE.VertexColors
    }));
    //points.position.set(0, 0, 0);
        //points.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
    scene.add(points);

    $("#info_div").append(" <br/>Points loaded successfully!! ");

    console.log("Points loaded successfully!! ");

    ShiftByCentroid();
    points.scale.set(0.4, 0.4, 0.4);
    points.rotation.y += Math.PI;
    points.rotation.x -= Math.PI / 2;
    //points.rotation.z += Math.PI / 3;

    UpdatePointsPositions();

    AddLines();
});

camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
var axes = new THREE.AxisHelper(axisLength);
scene.add(axes);

window.addEventListener('resize', function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);

function UpdatePointsPositions() {
    points.updateMatrix();
    points.geometry.applyMatrix(points.matrix);
    points.matrix.identity();
    points.geometry.verticesNeedUpdate = true;
    points.position.set(0, 0, 0);
    points.rotation.set(0, 0, 0);
    points.scale.set(1, 1, 1);
}

function ShiftByCentroid() {
    var c = findCentroid(points.geometry.vertices);
    var T = [0, 0, 0];
    T[0] = -c.x;
    T[1] = -c.y;
    T[2] = -c.z;
    var m = new THREE.Matrix4();
    m.set(
			1, 0, 0, T[0],
			0, 1, 0, T[1],
			0, 0, 1, T[2],
			0, 0, 0, 1
		);
    points.geometry.applyMatrix(m);
    
}
function findCentroid(vertices) {
    var result = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < vertices.length; i++) {
        var v = vertices[i];
        result.add(v);
    }
    result.multiplyScalar(1 / vertices.length);
    return result;
}

var lines_group;
function AddLines() {
    if (lines_group)
        scene.remove(lines_group);

    lines_group = new THREE.Object3D();
    scene.add(lines_group);

    var vertices = points.geometry.vertices;
    var colors = points.geometry.colors;

    var positions = [];
    var bcolors = [];
    
    for (var i = 0; i < vertices.length; i++) {
        var v = vertices[i];
        var c = colors[i];
        positions.push(v.x, v.y, v.z);
        bcolors.push(c.r, c.g, c.b);
    }
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(bcolors), 3));
    //geometry.computeBoundingSphere();

    var mesh = new THREE.LineSegments(geometry, material);
    lines_group.add(mesh);
}


function AddLinesOld() {
    if (lines_group)
        scene.remove(lines_group);

    lines_group = new THREE.Object3D();
    scene.add(lines_group);

    var vertices = points.geometry.vertices;
    for (var i = 0; i < vertices.length; i+=2) {
        var v1 = vertices[i];
        var v2 = vertices[i+1];

        AddLine(v1, v2, 0xff0000, lines_group);
    }
}

function AddLine(v1, v2, lcolor, lgroup) {
    var cc = lcolor;
    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(v1);
    line_geometry.vertices.push(v2);
    var line = new THREE.Line(line_geometry, new THREE.LineBasicMaterial({ color: cc, opacity: 1, linewidth: 3 }));
    lgroup.add(line);
}