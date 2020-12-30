/*
Copyright 2019, Brown University, Providence, RI.

                        All Rights Reserved

Permission to use, copy, modify, and distribute this software and
its documentation for any purpose other than its incorporation into a
commercial product or service is hereby granted without fee, provided
that the above copyright notice appear in all copies and that both
that copyright notice and this permission notice appear in supporting
documentation, and that the name of Brown University not be used in
advertising or publicity pertaining to distribution of the software
without specific, written prior permission.

BROWN UNIVERSITY DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR ANY
PARTICULAR PURPOSE.  IN NO EVENT SHALL BROWN UNIVERSITY BE LIABLE FOR
ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

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
});

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


//********************************Define Cameras********************************

var innerCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30);
innerCamera.position.set(10, 10, 5);
innerCamera.up = new THREE.Vector3(0, 0, 1);
innerCamera.lookAt(new THREE.Vector3(0, 0, 0));
listOfCameras.push(innerCamera);

var innerCameraHelper = new THREE.CameraHelper(innerCamera);
sceneContainer1.add(innerCameraHelper);

//********************************Define Lasers********************************
var newLaser = { direction: new THREE.Vector3(-15, 0, 0), upperDirection: new THREE.Vector3(-15, 0, 5.2), lowerDirection: new THREE.Vector3(-15, 0, -10), originPoint: new THREE.Vector3(15, 0, 5), height: 10 };
listOfLasers.push(newLaser);

//var geometry = new THREE.PlaneGeometry(3, 3, 32);
//var material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
//var plane = new THREE.Mesh(geometry, material);
//plane.rotation.set(Math.PI / 2, 0, 0);
//plane.position.set(15,0,0)
//sceneContainer1.add(plane);


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

//********************************Define Lights********************************
var nlights = 6;
for (var i = 0; i < nlights; i++) {
    listOfLights[i] = new THREE.PointLight(0xffffff, 1, 0);
}

listOfLights[0].position.set(0, 0, lightsDistance * 5);
listOfLights[1].position.set(lightsDistance * 2, 0, lightsDistance);
listOfLights[2].position.set(-lightsDistance * 2, 0, lightsDistance);
listOfLights[3].position.set(0, lightsDistance * 2, lightsDistance);
listOfLights[4].position.set(0, -lightsDistance * 2, lightsDistance);
listOfLights[5].position.set(0, 0, -lightsDistance * 5);

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
var geometry = new THREE.CylinderGeometry(6, 6, .2, 32);
var material = new THREE.MeshPhongMaterial({ color: 0x111111 });
var cylinderS = new THREE.Mesh(geometry, material);
cylinderS.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
cylinderS.position.set(0, 0, 0)

sceneContainer1.add(cylinderS);
listOfStructures.push(cylinderS);
