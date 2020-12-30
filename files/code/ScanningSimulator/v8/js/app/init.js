/// <reference path="../lib/three.js" />
$("#info_div").append(" Loading... ");
var scene = new THREE.Scene();
var sceneContainer1 = new THREE.Object3D();
scene.add(sceneContainer1);
var sceneContainer2 = new THREE.Object3D();
scene.add(sceneContainer2);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// STATS
stats = new Stats();
document.body.appendChild(stats.domElement);

camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
var axes = new THREE.AxisHelper(axisLength);
sceneContainer1.add(axes);

window.addEventListener('resize', function () {

    camera.aspect = window.innerWidth / (2*window.innerHeight);
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    innerCamera.aspect = window.innerWidth / (window.innerHeight);
    innerCamera.updateProjectionMatrix();

}, false);


//******************************** We need to define 6 things : ********************************
//
//      1- Cameras     (drag and drop)
//      2- Lasers      (drag and drop)
//      3- Lights      (drag and drop)
//      4- Structures  (file load)
//      5- Mesh        (file load)
//      6- Movement    (Script)
//
//*********************************************************************************************


var listOfCameras = new Array();
var listOfLasers = new Array();
var listOfLights = new Array();
var listOfStructures = new Array();


//********************************User defined function to fill the previous arrays**
Init_Scene();

//********************************Define Cameras********************************
for (var i = 0; i < listOfCameras.length; i++) {
    var cam = listOfCameras[i];
    var innerCameraHelper = new THREE.CameraHelper(cam);
    sceneContainer1.add(innerCameraHelper);

}
var innerCamera = listOfCameras[0];

//********************************Define Lasers********************************
//Visualize Lasers
var laser_group;
function VisualizeLasers() {
    if (laser_group)
        sceneContainer1.remove(laser_group);

    laser_group = new THREE.Object3D();
    sceneContainer1.add(laser_group);

    for (var i = 0; i < listOfLasers.length; i++) {
        var l = listOfLasers[i];
        VisualizeLaser(l, laser_group);
    }

}
function VisualizeLaser(laser, laser_group) {
    var geometry = new THREE.CylinderGeometry(.1, .1, 1, 32);
    var material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.lookAt(laser.upperDirection.clone().cross(laser.lowerDirection));
    cylinder.position.set(laser.originPoint.x, laser.originPoint.y, laser.originPoint.z)
    laser_group.add(cylinder);
    VisualizeRay(laser.originPoint, laser.upperDirection, laser_group);
    VisualizeRay(laser.originPoint, laser.lowerDirection, laser_group);

    //defineSpotLight(laser.originPoint, laser.direction);
}

//function defineSpotLight(origin, ray) {
//    var spotLight = new THREE.SpotLight(0xff0000, 0.5, 30, .1, 1, 1);
//    spotLight.position.set(origin.x, origin.y, origin.z);
//    scene.add(spotLight);
//    var spotLightHelper = new THREE.SpotLightHelper(spotLight);
//    scene.add(spotLightHelper);

//}

VisualizeLasers();

//********************************Define Lights********************************
var nlights = listOfLights.length;
for (var i = 0; i < nlights; i++) {
    var light = listOfLights[i];
    scene.add(light);
    var lightbulb = new THREE.Mesh(
        new THREE.SphereGeometry(.5, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    sceneContainer1.add(lightbulb);
    lightbulb.position.set(light.position.x, light.position.y, light.position.z);
}

//********************************Define Structure********************************
for (var i = 0; i < listOfStructures.length; i++) {
    var cs = listOfStructures[i];
    sceneContainer1.add(cs);
}



//********************************5- Define Target Mesh*****************************
var mesh_group = new THREE.Object3D()
sceneContainer1.add(mesh_group);

var loader = new THREE.PLYLoader();
var multimaterial;
var material;
var base_color = new THREE.Color(0xffffff);
loader.load(meshFileUrl1, function (geometry) {

    material = new THREE.MeshLambertMaterial({ color: 0x666666, vertexColors: THREE.NoColors });
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    mesh = new THREE.Mesh(geometry, material);
    sceneContainer1.add(mesh);

    //multimaterial = [material, new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true })];
    //allmesh = THREE.SceneUtils.createMultiMaterialObject(geometry, multimaterial);
    //if (do_rotate)
    //    allmesh.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
    //mesh = allmesh.children[0];
    //allmesh.children[1].visible = false;
    //sceneContainer1.add(allmesh);

    if (geometry.colors.length > 0) {
        var bc = geometry.colors[0];
        base_color.setRGB(bc.r, bc.g, bc.b);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    $("#info_div").append(" <br/>Mesh loaded successfully!! ");


    //vnh = new THREE.FaceNormalsHelper(mesh, 4, 0x000000);
    //vnh.visible = true;
    //mesh.add(vnh);

    //vvv = new THREE.VertexNormalsHelper(mesh, 10, 0x00ffff, 5);
    //vvv.visible = true;
    //mesh.add(vvv);

    firstStep();
});

