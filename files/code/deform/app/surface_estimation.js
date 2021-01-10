
var rs;
function EstimateSpheresRadius() {
    $("#info_div").append(" <br/> Estimating spheres radius... ");
    //estimating spheres
    var points_vertices = points.geometry.vertices;
    rs = new Array();
    for (var i = 0; i < points_vertices.length; i++) {
        var pi = points_vertices[i];
        var ni = pi.n.clone().negate();
        var ri = 0;
        for (var j = 0; j < points_vertices.length; j++) {
            if (i == j)
                continue;
            var sub = new THREE.Vector3(0, 0, 0);
            sub.subVectors(points_vertices[j], points_vertices[i]);
            a = ni.dot(sub);
            b = sub.length();
            b = b * b;
            if (a - ri * b > 0) {
                ri = a / b;
            }
        }
        rs.push(ri);
        pi.r = ri;
        radius = 1 / (2 * ri);
        ni.normalize().multiplyScalar(radius);
        AddSphereToGridArray3D(pi, ni, radius);
    }

    $("#info_div").append(" <br/> done... ");
}

function AddSphereToGridArray3D(point, normal, radius) {
    var center = point.clone().add(normal);

    //Around sphere center
    var xMinSphere = center.x - radius; var yMinSphere = center.y - radius; var zMinSphere = center.z - radius;
    var xMaxSphere = center.x + radius; var yMaxSphere = center.y + radius; var zMaxSphere = center.z + radius;

    AddCubeToGridArray3D(point, xMinSphere, yMinSphere, zMinSphere, xMaxSphere, yMaxSphere, zMaxSphere);
        
    var step_x = 4*xRange / (size - 1);
    var step_y = 4*yRange / (size - 1);
    var step_z = 4*zRange / (size - 1);

    //Around point
    var xMinSphere = point.x - step_x; var yMinSphere = point.y - step_y; var zMinSphere = point.z - step_z;
    var xMaxSphere = point.x + step_x; var yMaxSphere = point.y + step_y; var zMaxSphere = point.z + step_z;

    AddCubeToGridArray3D(point, xMinSphere, yMinSphere, zMinSphere, xMaxSphere, yMaxSphere, zMaxSphere);

}

function GetPositionIndex(x, y, z) {
    var i = Math.floor((x - xMin) * size / xRange);
    var j = Math.floor((y - yMin) * size / yRange);
    var k = Math.floor((z - zMin) * size / zRange);
    if (i < 0)
        i = 0;
    if (j < 0)
        j = 0;
    if (k < 0)
        k = 0;
    return [i, j, k];
}

function AddCubeToGridArray3D(point, xMinSphere, yMinSphere, zMinSphere, xMaxSphere, yMaxSphere, zMaxSphere) {
    var i_min, j_min, k_min, i_max, j_max, k_max;

    var min = GetPositionIndex(xMinSphere, yMinSphere, zMinSphere);
    i_min = min[0]; j_min = min[1]; k_min = min[2];

    var max = GetPositionIndex(xMaxSphere, yMaxSphere, zMaxSphere);
    i_max = max[0]; j_max = max[1]; k_max = max[2];

    for (var i = i_min; i <= i_max; i++)
        for (var j = j_min; j <= j_max; j++)
            for (var k = k_min; k <= k_max; k++)
                if (gridVertices3D[i] && gridVertices3D[i][j] && gridVertices3D[i][j][k])
                    gridVertices3D[i][j][k].push(point);
}


var spheres_radius = 5;
var spheres_radius_squared = spheres_radius * spheres_radius;
var ri = 1 / (2 * spheres_radius);
function GetValueHemiSpheres(point, distance, vertex) {
    var normal = point.n.clone().negate();
    var center = point.clone();
    normal.normalize().multiplyScalar(spheres_radius);
    center.add(normal);

    var sub = new THREE.Vector3(0, 0, 0);
    sub.subVectors(vertex, center);
    b = sub.length();
    return -1 * ri * (spheres_radius_squared - (b * b))
}

function GetValuePlane(point, distance, vertex) {
    var normal = point.n;
    var sub = new THREE.Vector3(0, 0, 0);
    sub.subVectors(vertex, point);
    return normal.dot(sub);
}

function GetValueSpheres(vertex, normal) {
    var index = GetPositionIndex(vertex.x, vertex.y, vertex.z);

    var i = index[0], j = index[1], k = index[2];

    var value = -1;
    var sub_m;
    var n_m;
    var ri_m;
    var max_found = false;
    var points_vertices = new Array();
    if (gridVertices3D[i] && gridVertices3D[i][j] && gridVertices3D[i][j][k] && gridVertices3D[i][j][k].length > 0) {
        points_vertices = gridVertices3D[i][j][k]; //points.geometry.vertices;
    } else {
        points_vertices = points.geometry.vertices;
    }
    for (var j = 0; j < points_vertices.length; j++) {
        var ri = points_vertices[j].r;
        var sub = new THREE.Vector3(0, 0, 0);
        sub.subVectors(vertex, points_vertices[j]);
        var n = points_vertices[j].n.clone().negate();
        a = n.dot(sub);
        b = sub.length();
        b = b * b;
        c = a - ri * b;
        if (c > value || value == -1) {
            value = c; max_found = true;
            if (normal) {
                sub_m = sub; n_m = n; ri_m = ri; 
            }
        }
    }
    if (normal && max_found) {
        normal.subVectors(n_m, sub_m.multiplyScalar(2 * ri_m));
        if (value > 0) {
            normal.negate();
        }
    }
    return value;
}

function VisualizeGradients() {
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var mv = mesh.geometry.vertices[i];
        if (mv.changed) {
            var vertex2 = new THREE.Vector3().addVectors(mv, mv.gradient);

            if (!mv.gradient_line) {
                var geometry = new THREE.Geometry();

                var vertex = mv;
                geometry.vertices.push(vertex);

                var vertex2 = new THREE.Vector3().addVectors(vertex, mv.gradient);
                geometry.vertices.push(vertex2);

                mv.gradient_line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff00ff, opacity: 1 }));
                scene.add(mv.gradient_line);
            } else {
                mv.gradient_line.geometry.vertices[1].set(vertex2.x, vertex2.y, vertex2.z);
                mv.gradient_line.geometry.verticesNeedUpdate = true;
            }
        }
    }
}



//***************************************With Regular Grid**************************************//

var size = 20;
var bbox;
var cells = new Array();
var gridVertices;
var gridVertices3D;
var values = new Array();
var xMin = -1, yMin = -1, zMin = -1;
var xMax = -1, yMax = -1, zMax = -1;
var xRange = -1;
var yRange = -1;
var zRange = -1;

function BuildRegularGrid() {
    gridVertices3D = new Array();
    gridVertices = new Array();

    var size2 = size * size;
    var displacement = 0;
    xMin = bbox.box.min.x - displacement; yMin = bbox.box.min.y - displacement; zMin = bbox.box.min.z - displacement;
    xMax = bbox.box.max.x + displacement; yMax = bbox.box.max.y + displacement; zMax = bbox.box.max.z + displacement;
    xRange = xMax - xMin;
    yRange = yMax - yMin;
    zRange = zMax - zMin;

    // Generate a list of 3D vertices on a regular grid and compute values at those points
    for (var k = 0; k < size; k++) {
        gridVertices3D.push(new Array());
        for (var j = 0; j < size; j++) {
            gridVertices3D[k].push(new Array());
            for (var i = 0; i < size; i++) {
                // actual values
                var x = xMin + xRange * i / (size - 1);
                var y = yMin + yRange * j / (size - 1);
                var z = zMin + zRange * k / (size - 1);
                var vertex = new THREE.Vector3(x, y, z);
                gridVertices.push(vertex);
                gridVertices3D[k][j].push(new Array());
            }
        }
    }

    //loop over cells
    //for (var z = 0; z < size - 1; z++)
    //    for (var y = 0; y < size - 1; y++)
    //        for (var x = 0; x < size - 1; x++) {
    //            // index of base point, and also adjacent points on cube
    //            var p = x + size * y + size2 * z,
    //                px = p + 1,
    //                py = p + size,
    //                pxy = py + 1,
    //                pz = p + size2,
    //                pxz = px + size2,
    //                pyz = py + size2,
    //                pxyz = pxy + size2;
    //            cells.push([p, px, py, pxy, pz, pxz, pyz, pxyz]);
    //        }


}
