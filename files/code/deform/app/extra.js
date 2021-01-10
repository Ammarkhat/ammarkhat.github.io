
function textSprite(text) {
    var font = "Arial",
        size = 130,
        color = "#676767";
    padding = 100;

    font = "bold " + size + "px " + font;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = font;

    // get size data (height depends only on font size)
    var metrics = context.measureText(text),
        textWidth = metrics.width;
    canvas.width = textWidth + 3;
    canvas.height = size + 3;

    context.font = font;
    context.fillStyle = color;
    context.fillText(text, 0, size + 3);
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var pmesh = new THREE.Mesh(
    new THREE.PlaneGeometry(canvas.width, canvas.height),
    new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    }));
    pmesh.scale.normalize().multiplyScalar(0.004);
    return pmesh;
}


function ShowVerticesSignedDistanceLabels() {
    mesh.geometry.computeVertexNormals();
    var l = mesh.geometry.vertices.length;
    //l = 500;

    var axis = new THREE.Vector3(0, 0, 1);

    for (var i = 0; i < l; i++) {
        var ssd = 0;
        var mv = mesh.geometry.vertices[i];
        var sprite = textSprite(String(mv.signed_distance.toFixed(5)));
        sprite.position.set(mv.x, mv.y, mv.z);
        var n = mv.n.clone().normalize().negate();
        var cros = (new THREE.Vector3(0, 0, 0)).crossVectors(axis, n);
        sprite.setRotationFromAxisAngle(cros, Math.acos(axis.dot(n)));
        sprite.position.add(n.negate().multiplyScalar(0.2));
        mesh.add(sprite);
    }

}

var targetList = [];

function onDocumentMouseMove(event) {
    if (!mesh)
        return;

    if (targetList.length == 0) {
        targetList.push(mesh);
    }

    var mouse = { x: 0, y: 0 }, INTERSECTED;
    var projector = new THREE.Projector();
    var baseColor = new THREE.Color(0x44dd66);
    var highlightedColor = new THREE.Color(0xddaa00);
    var selectedColor = new THREE.Color(0x4466dd);

    // update the mouse variable
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(targetList);

    // INTERSECTED = the object in the scene currently closest to the camera 
    //		and intersected by the Ray projected from the mouse position 	

    // if there is one (or more) intersections
    if (intersects.length > 0) {	// case if mouse is not currently over an object
        if (INTERSECTED == null) {
            INTERSECTED = intersects[0];
            //INTERSECTED.face.color = highlightedColor;
            INTERSECTED.face.vertexColors[0].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[1].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[2].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            console.log(INTERSECTED.face.a, INTERSECTED.face.b, INTERSECTED.face.c);
        }
        else {	// if thse mouse is over an object
            //INTERSECTED.face.color = baseColor;                        
            INTERSECTED.face.vertexColors[0].setRGB(baseColor.r, baseColor.g, baseColor.b);
            INTERSECTED.face.vertexColors[1].setRGB(baseColor.r, baseColor.g, baseColor.b);
            INTERSECTED.face.vertexColors[2].setRGB(baseColor.r, baseColor.g, baseColor.b);

            INTERSECTED = intersects[0];
            INTERSECTED.face.vertexColors[0].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[1].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[2].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            console.log(INTERSECTED.face.a, INTERSECTED.face.b, INTERSECTED.face.c);
            // upsdate mouseSphere coordinates and update colors
            //mouseSphereCoords = [INTERSECTED.point.x, INTERSECTED.point.y, INTERSECTED.point.z];
            INTERSECTED.object.geometry.colorsNeedUpdate = true;
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED) {
            //INTERSECTED.face.color = baseColor;
            INTERSECTED.face.vertexColors[0].setRGB(baseColor.r, baseColor.g, baseColor.b);
            INTERSECTED.face.vertexColors[1].setRGB(baseColor.r, baseColor.g, baseColor.b);
            INTERSECTED.face.vertexColors[2].setRGB(baseColor.r, baseColor.g, baseColor.b);

            INTERSECTED.object.geometry.colorsNeedUpdate = true;
        }
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"

        INTERSECTED = null;
        //mouseSphereCoords = null;


    }

    if (INTERSECTED && INTERSECTED.object && INTERSECTED.object.geometry)
        INTERSECTED.object.geometry.colorsNeedUpdate = true;
}