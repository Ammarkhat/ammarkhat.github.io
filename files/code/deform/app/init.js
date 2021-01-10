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

//var lightbulb = new THREE.Mesh(
//    new THREE.SphereGeometry(2, 16, 8),
//    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
//);
//scene.add(lightbulb);
//lightbulb.position.set(light.position.x, light.position.y, light.position.z);

var mesh_group = new THREE.Object3D()
scene.add(mesh_group);

var loader = new THREE.PLYLoader();
var multimaterial;
var material;
var base_color = new THREE.Color(0xffffff);
loader.load(meshFileUrl1, function (geometry) {

    var mesh_geometry = geometry;
    //var material = new THREE.MeshPhongMaterial( { color: 0x0055ff, specular: 0x111111, shininess: 200 } );
    //var material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    material = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors });
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    //mesh = new THREE.Mesh(geometry, material);
    multimaterial = [material, new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true })];
    allmesh = THREE.SceneUtils.createMultiMaterialObject(geometry, multimaterial);
    //allmesh.position.set(0, 0, 0);
    if (do_rotate)
    allmesh.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
    mesh = allmesh.children[0];
    allmesh.children[1].visible = false;
    //mesh.scale.set( 0.001, 0.001, 0.001 );

    if (geometry.colors.length > 0) {
        var bc = geometry.colors[0];
        base_color.setRGB(bc.r, bc.g, bc.b);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    $("#info_div").append(" <br/>Mesh loaded successfully!! ");
    scene.add(allmesh);

    //vnh = new THREE.FaceNormalsHelper(mesh, 4, 0x000000);
    //vnh.visible = true;
    //mesh.add(vnh);

    //vvv = new THREE.VertexNormalsHelper(mesh, 10, 0x00ffff, 5);
    //vvv.visible = true;
    //mesh.add(vvv);
});


loader.load(pointsFileUrl1, function (geometry) {
    //var material = new THREE.MeshPhongMaterial({ color: 0x0055ff, specular: 0x111111, shininess: 200 });

    points = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.5,
        color: 0xff0000
    }));
    //points.position.set(0, 0, 0);
    if (do_rotate)
    points.rotation.set(0, -Math.PI / 2, -Math.PI / 2);

    $("#info_div").append(" <br/>Points loaded successfully!! ");
    scene.add(points);

    vvv = new THREE.VertexNormalsHelper(points, 10, 0x00ffff, 5);
    vvv.visible = true;
    points.add(vvv);

    bbox = new THREE.BoundingBoxHelper(points, 0xff0000);
    bbox.update();
    //scene.add(bbox);
});

camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
var axes = new THREE.AxisHelper(axisLength);
scene.add(axes);