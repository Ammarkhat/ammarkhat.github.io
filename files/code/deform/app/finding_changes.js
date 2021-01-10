
var start_edge_smoothing = false;

function AttractPoints() {
    currentTime = performance.now();
    $("#info_div").append(" <br/> Smoothing Point Cloud: ");

    attraction_threshold = mesh.geometry.boundingSphere.radius * guiControlPanel.attraction_threshold; // 0.02;
    find_threshold = mesh.geometry.boundingSphere.radius * 0.0005; //guiControlPanel.threshold; // 0.0008;

    points_vertices = points.geometry.vertices;

    tree_mesh = new kdTree(mesh.geometry.vertices.slice(0), distanceFunction, ["x", "y", "z"]);
    tree_points = new kdTree(points_vertices.slice(0), distanceFunction, ["x", "y", "z"]);

    var kn = 30;
    for (var i = 0; i < points_vertices.length; i++) {
        var point = points_vertices[i];
        nearest_arr = tree_points.nearest(point, kn);//, [maxDistance]);
        point.nearest_arr = nearest_arr;
        var move_it = true;

        for (var j = 0; j < kn; j++) {
            var neighbor_point = nearest_arr[j][0];
            if (!neighbor_point.mesh_distance) {
                nearest_mesh = tree_mesh.nearest(neighbor_point, 1);
                neighbor_point.mesh_vertex = nearest_mesh[0][0];
                neighbor_point.mesh_distance = nearest_mesh[0][1];
            }

            if (neighbor_point.mesh_distance > attraction_threshold) {
                move_it = false;
            }
        }

        //if (point.mesh_distance < find_threshold) {
        //    move_it = true;
        //}

        if (move_it) {
            //move that point into the mesh
            if (!point.mesh_distance) {
                nearest_mesh = tree_mesh.nearest(point, 1);
                point.mesh_vertex = nearest_mesh[0][0];
                point.mesh_distance = nearest_mesh[0][1];
            }
            point.x = point.mesh_vertex.x;
            point.y = point.mesh_vertex.y;
            point.z = point.mesh_vertex.z;
            point.moved = true;
        }
        //else if (point.mesh_distance > 0 && point.mesh_distance < attraction_threshold) {
        //    for (var j = 0; j < 10; j++) {
        //        var neighbor_point = nearest_arr[j][0];
        //        if(neighbor_point!=point)
        //            point.add(neighbor_point);
        //    }
        //    point.divideScalar(11);
        //}
    }
    points.geometry.verticesNeedUpdate = true;
    points.geometry.colorsNeedUpdate = true;

    t = performance.now();
    $("#info_div").append(" done... " + (t - currentTime).toFixed(2) + ' ms.');
    currentTime = t;
}

var _doStep2 = false;
function Find() {

    currentTime = performance.now();
    $("#info_div").append(" <br/> Finding changed regions: ");

    ComputeVertexNeighbhors(mesh.geometry.vertices, mesh.geometry.faces);

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.colorsNeedUpdate = true;

    threshold_distance = guiControlPanel.threshold;
    threshold = mesh.geometry.boundingSphere.radius * threshold_distance; // 0.005;

    mesh.geometry.dynamic = true;

    //establish a KD-Tree
    points_vertices = points.geometry.vertices;
    $("#info_div").append(" <br/> building KD-trees... ");
    tree_points = new kdTree(points_vertices.slice(0), distanceFunction, ["x", "y", "z"]);
    $("#info_div").append(" done... ");

    //for every point on the point cloud, find the nearest point on the mesh
    $("#info_div").append(" <br/> finding closest points... ");

    //define the region that should change
    maxD = mesh.geometry.boundingSphere.radius * 0.002 * 30;
    minD = -1 * maxD;

    BuildRegularGrid();

    EstimateSpheresRadius();

    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var ssd = 0;
        var mv = mesh.geometry.vertices[i];
        var gradient = new THREE.Vector3(0, 0, 0);
        mv.signed_distance = GetValueSpheres(mv, gradient);
        mv.gradient = gradient;
        if (mv.contour_vertex) {
            mv.changed = false;
            mv.signed_distance = 0;
            continue;
        }
        if (Math.abs(mv.signed_distance) > threshold)
            mv.changed = true;


        //nearest_arr = tree_points.nearest(mv, 1);//, [maxDistance]);
        //var distance = nearest_arr[0][1];
        //var point = nearest_arr[0][0];
        //mv.distance = distance;
        //mv.signed_distance = GetValuePlane(point, distance, mv);


        //var mesh_index = i;//mesh.geometry.vertices.indexOf(mesh_vertex);
        //if (Math.abs(mv.signed_distance) > threshold)
        //    mv.changed = true;
    }

    //step2 : by average?
    if (_doStep2) {
        //for (var k = 0; k < 3; k++) {
        for (var i = 0; i < mesh.geometry.vertices.length; i++) {
            var mv = mesh.geometry.vertices[i];
            var numOfChanged = 0;
            var numOfUnChanged = 0;
            for (var j = 0; j < mv.vertice_incident_vertices.length; j++) {
                var nj = mv.vertice_incident_vertices[j];
                numOfChanged += nj.changed ? 1 : 0;
                numOfUnChanged += nj.changed ? 0 : 1;
            }
            if (numOfChanged > numOfUnChanged)
                mv.changed = true;
            else if (numOfUnChanged > numOfChanged)
                mv.changed = false;
        }
        // }                    
    }
    //changed_tree = new kdTree(changed_vertices.slice(0), distanceFunction, ["x", "y", "z"]);

    SetColorsAccordingToSignedDistance();
    
    //ShowVerticesSignedDistanceLabels();

    VisualizeGradients();
    t = performance.now();
    $("#info_div").append(" done... " + (t - currentTime).toFixed(2) + ' ms.');
    currentTime = t;
}


function Reset() {
    var bc = base_color;
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        mesh.geometry.colors[i].setRGB(bc.r, bc.g, bc.b);
    }
    mesh.geometry.colorsNeedUpdate = true;
}

var edgesMap = {};

function CheckEdge(a, b, vertices, colors, face, newIsoVertices) {

    var ep = 10;

    var vertexIndexA = Math.min(a, b);
    var vertexIndexB = Math.max(a, b);

    var key = vertexIndexA + "_" + vertexIndexB;

    if (!(key in edgesMap)) {
        edgesMap[key] = null;

        if (((vertices[a].changed) && !(vertices[b].changed)) || (!(vertices[a].changed) && (vertices[b].changed))) {
            //create new vertex
            var f0 = vertices[a].signed_distance;
            var f1 = vertices[b].signed_distance;
            var newX = 0;
            var newY = 0;
            var newZ = 0;

            //if (f0 == 0 || f1 == 0) {
            var newVertexPos = RecursiveSearchForZero(vertices[a], vertices[b], f0, f1, 0)
            newX = newVertexPos.x;
            newY = newVertexPos.y;
            newZ = newVertexPos.z;

            //}
            //else {
            //    var t = Math.abs(f0) / (Math.abs(f0) + Math.abs(f1));
            //    newX = vertices[a].x * (1 - t) + vertices[b].x * t;
            //    newY = vertices[a].y * (1 - t) + vertices[b].y * t;
            //    newZ = vertices[a].z * (1 - t) + vertices[b].z * t;
            //}

            var newVertex = null;
            var la = newVertexPos.distanceTo(vertices[a]);
            var lb = newVertexPos.distanceTo(vertices[b]);
            if (lb == 0 || (la / lb) > ep) {
                newVertex = vertices[b];
            } else if (la == 0 || (lb / la) > ep) {
                newVertex = vertices[a];
            } else {
                newVertex = new THREE.Vector3(newX, newY, newZ);
                newVertex.index = vertices.length;
                vertices.push(newVertex);

                var aC = colors[a];
                var bC = colors[b];
                if (aC && bC) {
                    var newColor = new THREE.Color((aC.r + bC.r) / 2, (aC.g + bC.g) / 2, (aC.b + bC.b) / 2);
                    colors.push(newColor);
                }
            }
            newVertex.contour_vertex = true;
            edgesMap[key] = newVertex;
            newIsoVertices.push(newVertex);

            newVertex.originalX = newVertex.x;
            newVertex.originalY = newVertex.y;
            newVertex.originalZ = newVertex.z;
        }
    }
}
var eps = 0.0001;
function RecursiveSearchForZero(v0, v1, f0, f1, depth) {
    var v_center = new THREE.Vector3((v0.x + v1.x) / 2, (v0.y + v1.y) / 2, (v0.z + v1.z) / 2);

    if (Math.abs(f0) < eps)
        f0 = 0;
    if (Math.abs(f1) < eps)
        f1 = 0;

    if (depth > 20 || f1 == f0) {
        return v_center;
    }

    var f_center = GetValueSpheres(v_center);
    //if (Math.abs(f_center) > 0 && Math.abs(f_center) < eps) {
    //    return v_center;
    //}
    if (Math.abs(f_center) < eps)
        f_center = 0;

    if (f0 == 0) {
        if (f_center == 0) {
            return RecursiveSearchForZero(v_center, v1, f_center, f1, depth + 1);
        } else {
            return RecursiveSearchForZero(v0, v_center, f0, f_center, depth + 1);
        }
    } else if (f1 == 0) {
        if (f_center == 0) {
            return RecursiveSearchForZero(v0, v_center, f0, f_center, depth + 1);
        } else {
            return RecursiveSearchForZero(v_center, v1, f_center, f1, depth + 1);
        }
    }
    else {
        var t = Math.abs(f0) / (Math.abs(f0) + Math.abs(f1));
        return new THREE.Vector3(v0.x * (1 - t) + v1.x * t, v0.y * (1 - t) + v1.y * t, v0.z * (1 - t) + v1.z * t);
    }
}

function GetEdgeVertex(a, b, vertices, face) {

    var vertexIndexA = Math.min(a, b);
    var vertexIndexB = Math.max(a, b);

    var key = vertexIndexA + "_" + vertexIndexB;

    if (key in edgesMap) {
        return edgesMap[key];
    }
    return null;
}

var lines_group;
var lines_geometries = new Array();
var newIsoVertices = new Array();
function ComputeContours() {
    var faces = mesh.geometry.faces;
    var vertices = mesh.geometry.vertices;
    var colors = mesh.geometry.colors;
    var i, il, face;
    for (i = 0, il = faces.length; i < il; i++) {

        face = faces[i];

        if (!(vertices[face.a].changed) && !(vertices[face.b].changed) && !(vertices[face.c].changed))
            continue;

        CheckEdge(face.a, face.b, vertices, colors, face, newIsoVertices);
        CheckEdge(face.b, face.c, vertices, colors, face, newIsoVertices);
        CheckEdge(face.c, face.a, vertices, colors, face, newIsoVertices);
    }

    mesh.geometry.faces = CreateLinesFromVertices();
    DeepUpdateMesh();
    mesh.geometry.computeFaceNormals();
    ComputeVertexNeighbhors(mesh.geometry.vertices, mesh.geometry.faces);
}

function CreateLinesFromVertices() {
    if (lines_group) {
        scene.remove(lines_group);
    }
    lines_group = new THREE.Object3D();
    scene.add(lines_group);

    var newFaces = new Array();
    var faces = mesh.geometry.faces;
    var vertices = mesh.geometry.vertices;
    var colors = mesh.geometry.colors;
    var i, il, face;

    for (i = 0, il = faces.length; i < il; i++) {

        face = faces[i];

        var va = vertices[face.a];
        var vb = vertices[face.b];
        var vc = vertices[face.c];

        if (!(va.changed) && !(vb.changed) && !(vc.changed))
            continue;

        var v1 = GetEdgeVertex(face.a, face.b);
        var v2 = GetEdgeVertex(face.b, face.c);
        var v3 = GetEdgeVertex(face.c, face.a);

        var numberOfVertices = (v1 != null ? 1 : 0) + (v2 != null ? 1 : 0) + (v3 != null ? 1 : 0);

        if (numberOfVertices == 2) {
            var firstV = null; var firstV_index = null;
            var secondV = null; var secondV_index = null;

            var eV1 = false;
            var eV2 = false;
            var eV3 = false;

            var eV1_index = -1;
            var eV2_index = -1;
            var eV3_index = -1;

            if (v1 != null) {
                firstV = v1; eV1 = true; eV1_index = v1.index;
                if (v2 != null) {
                    secondV = v2; eV2 = true; eV2_index = v2.index;
                }
                else {
                    secondV = v3; eV3 = true; eV3_index = v3.index;
                }
            } else {
                firstV = v2; eV2 = true; eV2_index = v2.index;
                secondV = v3; eV3 = true; eV3_index = v3.index;
            }

            if (firstV == secondV)
                continue;

            if (!firstV.other_vertices)
                firstV.other_vertices = new Array();
            if (firstV.other_vertices.indexOf(secondV) == -1)
                firstV.other_vertices.push(secondV);
            if (!secondV.other_vertices)
                secondV.other_vertices = new Array();
            if (secondV.other_vertices.indexOf(firstV) == -1)
                secondV.other_vertices.push(firstV);

            var geometry = new THREE.Geometry();
            geometry.vertices.push(firstV);
            geometry.vertices.push(secondV);
            var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 1, linewidth: 3 }));
            lines_group.add(line);
            lines_geometries.push(geometry);

            //now if needed cut the face into two faces along the edge
            var realNumberOfNewVertices = 0;
            eV1 = eV1 && v1 != va && v1 != vb;
            eV2 = eV2 && v2 != va && v2 != vb;
            eV3 = eV3 && v3 != va && v3 != vb;
            if (eV1)
                realNumberOfNewVertices++;
            if (eV2)
                realNumberOfNewVertices++;
            if (eV3)
                realNumberOfNewVertices++;

            if (realNumberOfNewVertices == 1) {
                if (eV1) {
                    newFace(newFaces, eV1_index, face.b, face.c, colors);
                    newFace(newFaces, face.a, eV1_index, face.c, colors);
                    face.deleted = true;
                }
                if (eV2) {
                    newFace(newFaces, face.a, face.b, eV2_index, colors);
                    newFace(newFaces, face.a, eV2_index, face.c, colors);
                    face.deleted = true;
                }
                if (eV3) {
                    newFace(newFaces, face.a, face.b, eV3_index, colors);
                    newFace(newFaces, eV3_index, face.b, face.c, colors);
                    face.deleted = true;
                }
            } else if (realNumberOfNewVertices == 2) {
                if (eV1 && eV2) {
                    newFace(newFaces, eV1_index, face.b, eV2_index, colors);
                    newFace(newFaces, eV1_index, eV2_index, face.a, colors);
                    newFace(newFaces, face.a, eV2_index, face.c, colors);
                    face.deleted = true;
                }
                if (eV1 && eV3) {
                    newFace(newFaces, face.a, eV1_index, eV3_index, colors);
                    newFace(newFaces, eV1_index, face.b, eV3_index, colors);
                    newFace(newFaces, eV3_index, face.b, face.c, colors);
                    face.deleted = true;
                }
                if (eV2 && eV3) {
                    newFace(newFaces, face.a, face.b, eV3_index, colors);
                    newFace(newFaces, eV3_index, face.b, eV2_index, colors);
                    newFace(newFaces, eV3_index, eV2_index, face.c, colors);
                    face.deleted = true;
                }
            } else {
                //console.log("face without new vertices");
            }

        }
    }

    var i = 0;
    do {
        if (i < faces.length) {
            if (faces[i].deleted)
                faces.splice(i, 1);
            else
                i++;
        }
    } while (i < faces.length);

    return faces.concat(newFaces);
}

function newFace(newFaces, a, b, c, colors) {
    var face = new THREE.Face3(a, b, c);
    face.color = new THREE.Color(0x44dd66);
    face.color.setRGB(Math.random(), Math.random(), Math.random());
    face.vertexColors = new Array();
    face.vertexColors.push(colors[a]);
    face.vertexColors.push(colors[b]);
    face.vertexColors.push(colors[c]);

    newFaces.push(face);
}

function SmoothContoursLaplacian() {

    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;

    //smoothVertices = new Array();

    //smooth vertices positions along edges
    var faces = mesh.geometry.faces;
    var vertices = mesh.geometry.vertices;
    var i, il, face;

    for (var i = 0; i < newIsoVertices.length; i++) {
        var v = newIsoVertices[i];
        var p = v.clone();
        var n = v.n;
        var q = v.clone();//.clone();
        for (var j = 0; j < v.other_vertices.length; j++) {
            q.add(v.other_vertices[j]);
        }
        q.divideScalar(v.other_vertices.length + 1);
        var sub = new THREE.Vector3(0, 0, 0).subVectors(p, q);
        q.add(n.multiplyScalar(n.dot(sub)));
        v.set(q.x, q.y, q.z);
    }

    for (var i = 0; i < lines_geometries.length; i++) {
        lines_geometries[i].verticesNeedUpdate = true;
    }
    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;

    SmoothRegionsAroundContour();
}

var verticesAroundContour = new Array();

function SmoothRegionsAroundContour() {

    //two rings layer
    verticesAroundContour = new Array();
    for (var i = 0; i < newIsoVertices.length; i++) {
        var v = newIsoVertices[i];
        for (var j = 0; j < v.vertice_incident_vertices.length; j++) {
            var vj = v.vertice_incident_vertices[j];
            if (newIsoVertices.indexOf(vj) == -1 && verticesAroundContour.indexOf(vj) == -1)
                verticesAroundContour.push(vj);

            for (var k = 0; k < vj.vertice_incident_vertices.length; k++) {
                var vk = vj.vertice_incident_vertices[k];
                if (newIsoVertices.indexOf(vk) == -1 && verticesAroundContour.indexOf(vk) == -1)
                    verticesAroundContour.push(vk);
            }
        }
    }

    //apply tangantial relaxation
    for (var i = 0; i < verticesAroundContour.length; i++) {
        var v = verticesAroundContour[i];
        var p = v.clone();
        var n = v.n;
        var q = v.clone();//.clone();
        for (var j = 0; j < v.vertice_incident_vertices.length; j++) {
            q.add(v.vertice_incident_vertices[j]);
        }
        q.divideScalar(v.vertice_incident_vertices.length + 1);
        var sub = new THREE.Vector3(0, 0, 0).subVectors(p, q);
        q.add(n.multiplyScalar(n.dot(sub)));
        v.set(q.x, q.y, q.z);
    }

    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
}

//var smoothVertices;
function SmoothContours() {
    start_edge_smoothing = true;
}

function EdgeSmoothingStep() {
    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;

    //smooth vertices positions along edges
    var faces = mesh.geometry.faces;
    var vertices = mesh.geometry.vertices;
    var i, il, face;

    var shrinkage_in = guiControlPanel.shrinkage_in;
    var shrinkage_out = guiControlPanel.shrinkage_out;
    var speed = guiControlPanel.speed;
    var allStopped = false;

    for (var i = 0; i < newIsoVertices.length; i++) {
        var v = newIsoVertices[i];

        var dEi = new THREE.Vector3(0, 0, 0);

        //Compute gradient of energy function 
        var shrink_energy_sum = new THREE.Vector3(0, 0, 0);
        for (var j = 0; j < v.other_vertices.length; j++) {
            var vj = v.other_vertices[j];
            var sub = new THREE.Vector3(0, 0, 0);
            sub.subVectors(v, vj);
            shrink_energy_sum.add(sub);
        }
        shrink_energy_sum.multiplyScalar(shrinkage_out * 2);
        dEi.add(shrink_energy_sum);

        //Data term
        var data_energy_sum = new THREE.Vector3(v.x - v.originalX, v.y - v.originalY, v.z - v.originalZ);
        data_energy_sum.multiplyScalar(shrinkage_out * 2);
        dEi.add(data_energy_sum);

        v.set(v.x - dEi.x * speed, v.y - dEi.y * speed, v.z - dEi.z * speed);
    }

    for (var i = 0; i < newIsoVertices.length; i++) {

    }

    for (var i = 0; i < lines_geometries.length; i++) {
        lines_geometries[i].verticesNeedUpdate = true;
    }
    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
}

function SetColorsAccordingToSignedDistance() {
    if (change_colors) {
        var rainbow = new Rainbow(); // by default, range is 0 to 100
        for (var i = 0; i < mesh.geometry.vertices.length; i++) {
            var mv = mesh.geometry.vertices[i];
            if (mv.changed) {
                var mapped_ssd = 0;
                if (mv.signed_distance > 0) {
                    mapped_ssd = mv.signed_distance * 50 / maxD;
                    mapped_ssd = mapped_ssd + 50;
                    if (mapped_ssd > 100)
                        mapped_ssd = 100;
                } else if (mv.signed_distance == 0) {
                    mapped_ssd = 50;
                } else if (mv.signed_distance < 0) {
                    mapped_ssd = mv.signed_distance * 50 / maxD;
                    mapped_ssd = mapped_ssd + 50;
                    if (mapped_ssd < 0)
                        mapped_ssd = 0;
                }
                mapped_ssd = 100 - mapped_ssd;
                var hex = rainbow.colourAt(mapped_ssd);
                r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
                g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
                b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;

                mesh.geometry.colors[i].setRGB(r, g, b);

            }
        }
        mesh.geometry.colorsNeedUpdate = true;
    }
}
