/// <reference path="../lib/three.js" />
var reconstructed_points_group;
var vertices_group;
var arrows_group;
var init = false;
var triangles;

function CreateReconstructedPointsGroup(vertices) {
    var reconstructed_points_geometry = new THREE.Geometry();
    reconstructed_points_geometry.vertices = vertices;
    reconstructed_points_group = new THREE.Points(reconstructed_points_geometry, new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.01,
        vertexColors: THREE.NoColors
    }));
    //reconstructed_points_group = new THREE.Object3D();
    sceneContainer2.add(reconstructed_points_group);
}


function ComputeIntersections() {
    if (!mesh)
        return;

    if (!reconstructed_points_group) {
        CreateReconstructedPointsGroup(new Array());
        //first time

    } else {
        //reconstructed_points_group.rotation.z += angleIncrement;
        mesh.updateMatrix();
        reconstructed_points_group.matrix = mesh.matrix;
        //reconstructed_points_group.updateMatrix();
        reconstructed_points_group.geometry.applyMatrix(reconstructed_points_group.matrix);
        reconstructed_points_group.matrix.identity();
        reconstructed_points_group.geometry.verticesNeedUpdate = true;
        reconstructed_points_group.position.set(0, 0, 0);
        reconstructed_points_group.rotation.set(0, 0, 0);
        reconstructed_points_group.scale.set(1, 1, 1);
    }

    if (vertices_group)
        sceneContainer1.remove(vertices_group);

    vertices_group = new THREE.Object3D();
    sceneContainer1.add(vertices_group);


    if (arrows_group)
        sceneContainer1.remove(arrows_group);

    arrows_group = new THREE.Object3D();
    sceneContainer1.add(arrows_group);

    var raycasts = new Array();
    for (var i = 0; i < listOfLasers.length; i++) {
        var laser = listOfLasers[i];
        var originPoint = laser.originPoint;
        var rays = GenerateRays(100, laser.upperDirection, laser.lowerDirection);
        for (var j = 0; j < rays.length; j++) {
            var ray = rays[j];
            //VisualizeRay(originPoint, ray, arrows_group);
            var raycast1 = new THREE.Raycaster(originPoint, ray.clone().normalize());
            raycasts.push(raycast1);
        }
    }

    var intersectionPoints = new Array();
    for (var i = 0; i < raycasts.length; i++) {
        var raycast1 = raycasts[i];
        var intersection1 = raycast1.intersectObject(mesh);
        var intersects1 = intersection1 && intersection1.length > 0;
        if (intersects1 ) {
            var pt1 = intersection1[0].point;
            intersectionPoints.push(pt1);
        }
    }

    for (var i = 0; i < intersectionPoints.length; i++) {
        VisualizePoint(intersectionPoints[i], vertices_group);
        reconstructed_points_group.geometry.vertices.push(intersectionPoints[i]);
    }
    sceneContainer2.remove(reconstructed_points_group);
    CreateReconstructedPointsGroup(reconstructed_points_group.geometry.vertices);
}

function GenerateRays(count, upperDirection, lowerDirection) {
    var rays = new Array();
    for (var i = 0; i < count; i++) {
        var ray = upperDirection.clone().lerp(lowerDirection, i / (count - 1));
        rays.push(ray);
    }
    return rays;
}

function GenerateRaysOld(count, height, margin) {
    var rays = new Array();
    var step = (height + 2 * margin) / count;
    var initialZ = (-height / 2) - margin;
    for (var i = 0; i < count; i++) {
        var z = initialZ + i * step;
        var ray = new THREE.Vector3(-15, 0, z);
        rays.push(ray);
    }
    return rays;
}


function cross(a, b) {
    return new THREE.Vector3().crossVectors(a, b);
}

function sub(a, b) {
    return new THREE.Vector3().subVectors(a, b);
}
function subVectors(a, b) {
    return new THREE.Vector3().subVectors(a, b);
}
function VisualizeRay(origin, ray, arrows_group) {
    var dir = ray.clone();
    var length = ray.length();
    var hex = 0x000000;    
    var arrowHelper = new THREE.ArrowHelper(dir.normalize(), origin, length, hex);
    arrows_group.add(arrowHelper);
}
function VisualizePoint(v, group) {
    var color = 0xff0000;   
    var r = 0.05;    
    var vertex = new THREE.Mesh(
        new THREE.SphereGeometry(r, 10, 5),
        new THREE.MeshBasicMaterial({ color: color })
    );
    vertex.position.set(v.x, v.y, v.z);
    group.add(vertex);

    return vertex;
}
