//******************************** We need to define 6 things : ********************************
//
//      1- Cameras     
//      2- Lasers      
//      3- Lights      
//      4- Structures  
//      5- Mesh        
//      5- Scene        
//      7- Movement    
//
//*********************************************************************************************


function Init_Scene() {
    //********************************1- Define Cameras********************************

    var innerCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30);
    innerCamera.position.set(10, 10, 5);
    innerCamera.up = new THREE.Vector3(0, 0, 1);
    innerCamera.lookAt(new THREE.Vector3(0, 0, 0));
    listOfCameras.push(innerCamera);

    //********************************2- Define Lasers********************************
    var laser1 = { direction: new THREE.Vector3(-15, 0, 0), upperDirection: new THREE.Vector3(-15, 0, 5.2), lowerDirection: new THREE.Vector3(-15, 0, -10), originPoint: new THREE.Vector3(15, 0, 5), height: 10 };
    listOfLasers.push(laser1);

    var laser2 = { direction: new THREE.Vector3(0, -15, 0), upperDirection: new THREE.Vector3(0, -15, 5.2), lowerDirection: new THREE.Vector3(0, -15, -10), originPoint: new THREE.Vector3(0, 15, 5), height: 10 };
    listOfLasers.push(laser2);

    //********************************3- Define Lights********************************

    var lightsDistance = 20;
    var l1 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l1);
    var l2 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l2);
    var l3 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l3);
    var l4 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l4);
    var l5 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l5);
    var l6 = new THREE.PointLight(0xffffff, 1, 0); listOfLights.push(l6);
    l1.position.set(0, 0, lightsDistance * 5);
    l2.position.set(lightsDistance * 2, 0, lightsDistance);
    l3.position.set(-lightsDistance * 2, 0, lightsDistance);
    l4.position.set(0, lightsDistance * 2, lightsDistance);
    l5.position.set(0, -lightsDistance * 2, lightsDistance);
    l6.position.set(0, 0, -lightsDistance * 5);

    //********************************4- Define Structure********************************
    var geometry = new THREE.CylinderGeometry(6, 6, .2, 32);
    var material = new THREE.MeshPhongMaterial({ color: 0x111111 });
    var cylinderS = new THREE.Mesh(geometry, material);
    cylinderS.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
    cylinderS.position.set(0, 0, 0);
    listOfStructures.push(cylinderS);

    //********************************5- Define Target Mesh******************************
    meshFileUrl1 = 'data/bracket.txt';

    //********************************6- Define basic scene parameters*******************
    cameraPosition = [20, 10, 5];
    axisLength = 50;

}


//********************************7- Define Movement*******************

var totalAngle = 0;
var angleIncrement = 0.1;

function firstStep() {
    mesh.scale.set(.1, .1, .1);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(-3.5, 3.5, 0);
    UpdateMesh();
}

function MovementStep() {
    if (totalAngle >= 2 * Math.PI)
        stopSimulation = true;

    if (mesh) {
        //if (listOfLasers) {
        //    listOfLasers[0].originPoint = new THREE.Vector3(15 * Math.cos(totalAngle), 15 * Math.sin(totalAngle), 5);
        //    listOfLasers[0].upperDirection = new THREE.Vector3(15 * Math.cos(totalAngle), 15 * Math.sin(totalAngle), 5.2).negate();
        //    listOfLasers[0].direction = new THREE.Vector3(15 * Math.cos(totalAngle), 15 * Math.sin(totalAngle), 0).negate();
        //    listOfLasers[0].lowerDirection = new THREE.Vector3(15 * Math.cos(totalAngle), 15 * Math.sin(totalAngle), -5.2).negate();
        //    VisualizeLasers();
        //}
        mesh.rotation.z += angleIncrement;
        //mesh.rotation.x += angleIncrement;
        totalAngle += angleIncrement;
    }
}