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
var lines_group;
var init = false;
var triangles;

function ComputeIntersections() {
    if (!mesh)
        return;

    if (lines_group)
        scene.remove(lines_group);

    lines_group = new THREE.Object3D();
    scene.add(lines_group);

    var isoVertices = new Array();
    var isoEdges = new Array();

    if (!init) {
        triangles = new Array();
        var vertices = mesh.geometry.vertices;
        var faces = mesh.geometry.faces;
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            var a = face.a;
            var b = face.b;
            var c = face.c;
            var triangle = [vertices[a], vertices[b], vertices[c]];
            triangles.push(triangle);
        }
        init = true;
    }

    //itPlane
    var laserPlane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
    IntersectPlaneWithFaces(triangles, laserPlane, isoEdges, isoVertices);

    for (var i = 0; i < isoEdges.length; i++) {
        var l = isoEdges[i];
        AddLine(l.f, l.s);
    }
}

function IntersectPlaneWithFaces(triangles, itPlane, isoEdges, isoVertices) {
    for (var i = 0; i < triangles.length; i++) {
        IntersectPlaneWithTriangle(triangles[i], itPlane, isoEdges, isoVertices);
    }
}

function IntersectPlaneWithTriangle(triangle, plane, isoEdges, isoVertices) {    
    var pts = new Array();
    for (var j = 0; j < triangle.length; j++) {
        var vj = triangle[j].clone();
        var vj1 = (j < triangle.length - 1 ? triangle[j + 1] : triangle[0]).clone();
        
        var edge = new THREE.Line3(vj, vj1);
        var pt = plane.intersectLine(edge);
        if (pt) {
            pts.push(pt);
        } 
    }
    if (pts.length == 2) {
        pushToIsoEdges(isoEdges, isoVertices, pts[0], pts[1]);
    }
}

function pushToIsoVertices(isoVertices, v0_raw) {
    var v0;
    var v0_found = false;
    for (var i = 0; i < isoVertices.length; i++) {
        var v = isoVertices[i];
        if (!v)
            continue;
        if (v.x == v0_raw.x && v.y == v0_raw.y && v.z == v0_raw.z) {
            v0_found = true;
            v0 = v;
            if (v0_raw.edgePoint)
                v0.edgePoint = true;
        }
    }
    if (!v0_found) {
        v0 = v0_raw;
        isoVertices.push(v0);
    }
    return v0;
}

function pushToIsoEdges(isoEdges, isoVertices, v0_raw, v1_raw) {
    var v0, v1;
    var v0_found = false;
    var v1_found = false;
    for (var i = 0; i < isoVertices.length; i++) {
        var v = isoVertices[i];
        if (v.x == v0_raw.x && v.y == v0_raw.y && v.z == v0_raw.z) {
            v0_found = true;
            v0 = v;
        }
        if (v.x == v1_raw.x && v.y == v1_raw.y && v.z == v1_raw.z) {
            v1_found = true;
            v1 = v;
        }
    }
    if (!v0_found) {
        v0 = v0_raw;
        isoVertices.push(v0);
    }
    if (!v1_found) {
        v1 = v1_raw;
        isoVertices.push(v1);
    }
    for (var i = 0; i < isoEdges.length; i++) {
        var e = isoEdges[i];
        if ((e.f == v0 && e.s == v1) || (e.f == v1 && e.s == v0)) {
            return e;
        }
    }
    var e = { f: v0, s: v1 };
    isoEdges.push(e);
    return e;
}

function AddLine(v1, v2) {
    var cc = 0xff0000;
    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(v1);
    line_geometry.vertices.push(v2);
    var line = new THREE.Line(line_geometry, new THREE.LineBasicMaterial({ color: cc, opacity: 1, linewidth: 3 }));
    lines_group.add(line);
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