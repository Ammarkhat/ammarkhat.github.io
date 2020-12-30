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

function ComputeVertexNeighbhors(mesh_vertices, mesh_faces) {

    for (var i = 0; i < mesh_vertices.length; i++) {
        mesh_vertices[i].vertice_incident_faces = (new Array());
        mesh_vertices[i].vertice_incident_vertices = (new Array());
    }
    for (var i = 0; i < mesh_faces.length; i++) {
        var face = mesh_faces[i];
        var v1 = mesh_vertices[face.a];
        v1.index = face.a;
        var v2 = mesh_vertices[face.b];
        v2.index = face.b;
        var v3 = mesh_vertices[face.c];
        v3.index = face.c;

        pushIfNotExist(v1.vertice_incident_vertices, v2);
        pushIfNotExist(v1.vertice_incident_vertices, v3);
        pushIfNotExist(v2.vertice_incident_vertices, v1);
        pushIfNotExist(v2.vertice_incident_vertices, v3);
        pushIfNotExist(v3.vertice_incident_vertices, v1);
        pushIfNotExist(v3.vertice_incident_vertices, v2);

        pushIfNotExist(v1.vertice_incident_faces, face);
        pushIfNotExist(v2.vertice_incident_faces, face);
        pushIfNotExist(v3.vertice_incident_faces, face);
    }

    for (var i = 0; i < mesh_faces.length; i++) {
        var face = mesh_faces[i];
        var va = mesh_vertices[face.a];
        var vb = mesh_vertices[face.b];
        var vc = mesh_vertices[face.c];
        var neighbor_faces = new Array();
        for (var j = 0; j < va.vertice_incident_faces.length; j++) {
            var fj = va.vertice_incident_faces[j];
            if (fj != face && neighbor_faces.indexOf(fj) == -1)
                neighbor_faces.push(fj);
        }
        for (var j = 0; j < vb.vertice_incident_faces.length; j++) {
            var fj = vb.vertice_incident_faces[j];
            if (fj != face && neighbor_faces.indexOf(fj) == -1)
                neighbor_faces.push(fj);
        }
        for (var j = 0; j < vc.vertice_incident_faces.length; j++) {
            var fj = vc.vertice_incident_faces[j];
            if (fj != face && neighbor_faces.indexOf(fj) == -1)
                neighbor_faces.push(fj);
        }
        face.neighbor_faces = neighbor_faces;
    }
}

function pushIfNotExist(array, item) {
    if (array.indexOf(item) == -1)
        array.push(item);
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

var targetList = [];
var INTERSECTED = null;
//document.addEventListener('mousemove', onDocumentMouseMove, false);
function onDocumentMouseMove(event) {
    if (!mesh)
        return;

    if (targetList.length == 0) {
        targetList.push(mesh);
    }

    var mouse = { x: 0, y: 0 };
    var projector = new THREE.Projector();
    //var base_color = new THREE.Color(0x44dd66);
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
            //INTERSECTED.face.color = base_color;  
            if (INTERSECTED.face.selected) {
                INTERSECTED.face.vertexColors[0].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
                INTERSECTED.face.vertexColors[1].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
                INTERSECTED.face.vertexColors[2].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
            } else {
                INTERSECTED.face.vertexColors[0].setRGB(base_color.r, base_color.g, base_color.b);
                INTERSECTED.face.vertexColors[1].setRGB(base_color.r, base_color.g, base_color.b);
                INTERSECTED.face.vertexColors[2].setRGB(base_color.r, base_color.g, base_color.b);
            }
            INTERSECTED = intersects[0];
            INTERSECTED.face.vertexColors[0].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[1].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            INTERSECTED.face.vertexColors[2].setRGB(highlightedColor.r, highlightedColor.g, highlightedColor.b);
            // upsdate mouseSphere coordinates and update colors
            //mouseSphereCoords = [INTERSECTED.point.x, INTERSECTED.point.y, INTERSECTED.point.z];
            INTERSECTED.object.geometry.colorsNeedUpdate = true;
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED) {
            //INTERSECTED.face.color = base_color;
            if (INTERSECTED.face.selected) {
                INTERSECTED.face.vertexColors[0].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
                INTERSECTED.face.vertexColors[1].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
                INTERSECTED.face.vertexColors[2].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
            } else {
                INTERSECTED.face.vertexColors[0].setRGB(base_color.r, base_color.g, base_color.b);
                INTERSECTED.face.vertexColors[1].setRGB(base_color.r, base_color.g, base_color.b);
                INTERSECTED.face.vertexColors[2].setRGB(base_color.r, base_color.g, base_color.b);
            }
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

//document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	
function onDocumentMouseDown( event ) 
{
    if (!reconstructedMesh)
        return;

    if (!reconstructedMesh.visible)
        return;

    if (targetList.length == 0) {
        targetList.push(reconstructedMesh);
    }

    var mouse = { x: 0, y: 0 };
    var projector = new THREE.Projector();
    //var base_color = new THREE.Color(0x44dd66);
    var highlightedColor = new THREE.Color(0xddaa00);
    var selectedColor = new THREE.Color(0x4466dd);

    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();
	
    //console.log("Click.");
	
    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects( targetList );
	
    // if there is one (or more) intersections
    if ( intersects.length > 0 )
    {
        console.log("Hit @ " + toString( intersects[0].point ) );
        // change the color of the closest face.
        //intersects[0].face.color.setRGB(0.8 * Math.random() + 0.2, 0, 0);
        if (intersects[0].face.selected) {
            intersects[0].face.selected = false;
            intersects[0].face.vertexColors[0].setRGB(base_color.r, base_color.g, base_color.b);
            intersects[0].face.vertexColors[1].setRGB(base_color.r, base_color.g, base_color.b);
            intersects[0].face.vertexColors[2].setRGB(base_color.r, base_color.g, base_color.b);
        } else {
            intersects[0].face.selected = true;
            intersects[0].face.vertexColors[0].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
            intersects[0].face.vertexColors[1].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
            intersects[0].face.vertexColors[2].setRGB(selectedColor.r, selectedColor.g, selectedColor.b);
        }
        intersects[0].object.geometry.colorsNeedUpdate = true;
        INTERSECTED = intersects[0];
    }

}

function toString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }
