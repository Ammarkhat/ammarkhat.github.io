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

var stopped = false;

function Stop() {
    stopped = true;
}

function Resume() {
    stopped = false;
}


var start_deforming = false;
var split_long_edges = true;
function SetUpdateEdgeLength(i, vj) {
    if (sourceEdges) {
        var vj_i = -1;
        if (vj.index) {
            vj_i = vj.index;
        } else {
            vj_i = mesh.geometry.vertices.indexOf(vj);
        }
        var vertexIndexA = Math.min(i, vj_i);
        var vertexIndexB = Math.max(i, vj_i);
        var key = vertexIndexA + "_" + vertexIndexB;
        if (key in sourceEdges) {
            sourceEdges[key].updateEdgeLength = true;
        }
    }
}

var split_counter = 0;

var k_neighbors = 2;
var step_counter = 0;

function DeformingStep() {
    if (stopped)
        return;
    step_counter++;
    $("#info_div").text(String(step_counter));

    var shrinkage_in = guiControlPanel.shrinkage_in;
    var shrinkage_out = guiControlPanel.shrinkage_out;

    var normalexpansion = guiControlPanel.normalexpansion;
    var speed = guiControlPanel.speed;
    var allStopped = true;

    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var v = mesh.geometry.vertices[i];
        if (v.changed && !v.finished) {
            if (!v.gradient) {
                v.gradient = new THREE.Vector3(0, 0, 0);
                v.signed_distance = GetValueSpheres(v, v.gradient);
            }

            allStopped = false;
            var normal_direction_sign = v.signed_distance > 0 ? 1 : (v.signed_distance == 0 ? 0 : -1);

            var dEi = new THREE.Vector3(0, 0, 0);

            //Compute gradient of energy function 
            var shrink_energy_sum = new THREE.Vector3(0, 0, 0);
            var neighbors = v.vertice_incident_vertices;
            for (var npi = 0; npi < neighbors.length; npi++) {
                var vj = neighbors[npi];
                var sub = new THREE.Vector3(0, 0, 0);
                sub.subVectors(mesh.geometry.vertices[i], vj);
                shrink_energy_sum.add(sub);

                SetUpdateEdgeLength(i, vj);
            }
            shrink_energy_sum.multiplyScalar(shrinkage_out * 2);
            dEi.add(shrink_energy_sum);

            //Get Normal Direction
            var vertex_normal = new THREE.Vector3();
            for (var j = 0; j < v.vertice_incident_faces.length; j++) {
                var face = v.vertice_incident_faces[j];
                if (face)
                    vertex_normal.add(face.normal)
            }
            vertex_normal.multiplyScalar(normal_direction_sign * 1 / (v.vertice_incident_faces.length));
            //vertex_normal.multiplyScalar(normalexpansion * normal_direction_sign); //-1 * v.signed_distance
            //dEi.add(vertex_normal);

            //Get Gradient Direction
            var vertex_gradient = v.gradient.clone();
            vertex_gradient.add(vertex_normal); vertex_gradient.multiplyScalar(0.5);
            vertex_gradient.multiplyScalar(normalexpansion); //-1 * v.signed_distance
            dEi.add(vertex_gradient);

            var pre_v = v.clone();
            v.set(v.x - dEi.x * speed, v.y - dEi.y * speed, v.z - dEi.z * speed);

            //check if signed_distance changed from in to out
            var gradient = new THREE.Vector3(0, 0, 0);
            var new_signed_distance = GetValueSpheres(v, gradient);
            if (v.signed_distance * new_signed_distance < 0) {
                //stop
                v.finished = true;
                v.set(pre_v.x, pre_v.y, pre_v.z);
            }
            v.signed_distance = new_signed_distance;
            v.gradient = gradient;
            v.updateEdgeLength = true;
        }
    }

    VisualizeGradients();

    SetColorsAccordingToSignedDistance();

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.colorsNeedUpdate = true;

    if (!allStopped) {
        split_counter++;
        if (split_long_edges) {
            if (split_counter % 10 == 0)
                SplitLongEdges(false);

            if (split_counter % 20 == 0)
                DeepUpdateMesh();
        }
        //console.log("SC: " + String(split_counter));

        //changed_tree = new kdTree(changed_vertices.slice(0), distanceFunction, ["x", "y", "z"]);
    }
}

var sourceEdges = {};
//var subdivisionModifier = new THREE.SubdivisionModifier(1);
//var edgeCollapseModifier = new THREE.EdgeCollapseModifier();

function SplitLongEdges(firstTime, percentage) {

    //sourceEdges = subdivisionModifier.modify(sourceEdges, firstTime, mesh.geometry, max_edge, true);

    if (!percentage)
        percentage = 1;

    var subdivisionModifier = new THREE.SubdivisionModifier(1);
    subdivisionModifier.modify(mesh.geometry, max_edge / percentage, true);

    ComputeVertexNeighbhors(mesh.geometry.vertices, mesh.geometry.faces);

    //sourceEdges = edgeCollapseModifier.modify(sourceEdges, mesh.geometry, min_edge, true);

    //ComputeVertexNeighbhors(mesh.geometry.vertices, mesh.geometry.faces);

    ////compute faces vertex colors
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        var face = mesh.geometry.faces[i];
        face.vertexColors = new Array();
        face.vertexColors.push(mesh.geometry.colors[face.a]);
        face.vertexColors.push(mesh.geometry.colors[face.b]);
        face.vertexColors.push(mesh.geometry.colors[face.c]);
    }

    mesh.geometry.computeFaceNormals();
    mesh.geometry.dynamic = true;
    mesh.geometry.computeVertexNormals(true);

    //if (wfh)
    //    scene.remove(wfh);
    //wfh = new THREE.WireframeHelper(mesh, 0x000000);
    //wfh.visible = true;
    //scene.add(wfh);

    //if (vnh)
    //    mesh.remove(vnh);
    //vnh = new THREE.FaceNormalsHelper(mesh, 4, 0x000000);
    //vnh.visible = true;
    //mesh.add(vnh);

    //if (vvv)
    //    mesh.remove(vvv);
    //vvv = new THREE.VertexNormalsHelper(mesh, 10, 0x00ffff, 5);
    //vvv.visible = true;
    //mesh.add(vvv);
}

function DeepUpdateMesh() {
    var g = new THREE.Geometry();
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        g.vertices.push(mesh.geometry.vertices[i]);
    }
    for (var i = 0; i < mesh.geometry.colors.length; i++) {
        g.colors.push(mesh.geometry.colors[i]);
    }
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        g.faces.push(mesh.geometry.faces[i]);
    }
    //var newMesh = new THREE.Mesh(g, material);

    scene.remove(allmesh);

    allmesh = THREE.SceneUtils.createMultiMaterialObject(g, multimaterial);
    mesh = allmesh.children[0];
    allmesh.children[1].visible = _wireframe;
    if (do_rotate)
        allmesh.rotation.set(0, -Math.PI / 2, -Math.PI / 2);

    scene.add(allmesh);

}

var maxD = -1;
var minD = -1;

function DeformMesh() {
    Find();

    if (split_long_edges) {
        SplitLongEdges(true);
        DeepUpdateMesh();
    }

    start_deforming = true;

    $("#info_div").append(" done... ");
}

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
}

function pushIfNotExist(array, item) {
    if (array.indexOf(item) == -1)
        array.push(item);
}

function distanceFunction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
}

function Subdivide() {
    SplitLongEdges(true, 2);
    DeepUpdateMesh();
    mesh.geometry.computeFaceNormals();
}
