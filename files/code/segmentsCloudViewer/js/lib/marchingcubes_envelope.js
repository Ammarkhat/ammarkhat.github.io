function ApplyMarchingCubes(cells) {

    // Marching Cubes Algorithm

    // Vertices may occur along edges of cube, when the values at the edge's endpoints
    //   straddle the isolevel value.
    // Actual position along edge weighted according to function values.
    var vlist = new Array(12);

    var geometry = new THREE.Geometry();
    var vertexIndex = 0;

    for (var cell_index = 0; cell_index < cells.length; cell_index++) {
        var cell = cells[cell_index];
        var set = true;
        for (var i = 0; i < cell.vertices.length; i++) {
            if (!cell.vertices[i].valueSet)
            {
                set = false;
                break;
            }
        }
        if (!set)
            continue;
        //bottom
        var a2 = cell.a2;
        var b2 = cell.b2;
        var c2 = cell.c2;
        var d2 = cell.d2;

        //top
        var a1 = cell.a1;
        var b1 = cell.b1;
        var c1 = cell.c1;
        var d1 = cell.d1;


        // store scalar values corresponding to vertices
        var value0 = a2.f;
        value1 = b2.f;
        value2 = c2.f;
        value3 = d2.f;
        value4 = a1.f;
        value5 = b1.f;
        value6 = c1.f;
        value7 = d1.f;

        // place a "1" in bit positions corresponding to vertices whose
        //   isovalue is less than given constant.

        var isolevel = 0;

        var cubeindex = 0;
        if (value0 < isolevel) cubeindex |= 1;
        if (value1 < isolevel) cubeindex |= 2;
        if (value2 < isolevel) cubeindex |= 4;
        if (value3 < isolevel) cubeindex |= 8;
        if (value4 < isolevel) cubeindex |= 16;
        if (value5 < isolevel) cubeindex |= 32;
        if (value6 < isolevel) cubeindex |= 64;
        if (value7 < isolevel) cubeindex |= 128;

        // bits = 12 bit number, indicates which edges are crossed by the isosurface
        var bits = THREE.edgeTable[cubeindex];

        // if none are crossed, proceed to next iteration
        if (bits === 0) continue;

        // check which edges are crossed, and estimate the point location
        //    using a weighted average of scalar values at edge endpoints.
        // store the vertex in an array for use later.
        var mu = 0.5;

        // bottom of the cube
        if (bits & 1) {
            mu = (isolevel - value0) / (value1 - value0);
            vlist[0] = a2.clone().lerp(b2, mu);
        }
        if (bits & 2) {
            mu = (isolevel - value1) / (value2 - value1);
            vlist[1] = b2.clone().lerp(c2, mu);
        }
        if (bits & 4) {
            mu = (isolevel - value2) / (value3 - value2);
            vlist[2] = c2.clone().lerp(d2, mu);
        }
        if (bits & 8) {
            mu = (isolevel - value3) / (value0 - value3);
            vlist[3] = d2.clone().lerp(a2, mu);
        }
        // top of the cube
        if (bits & 16) {
            mu = (isolevel - value4) / (value5 - value4);
            vlist[4] = a1.clone().lerp(b1, mu);
        }
        if (bits & 32) {
            mu = (isolevel - value5) / (value6 - value5);
            vlist[5] = b1.clone().lerp(c1, mu);
        }
        if (bits & 64) {
            mu = (isolevel - value6) / (value7 - value6);
            vlist[6] = c1.clone().lerp(d1, mu);
        }
        if (bits & 128) {
            mu = (isolevel - value7) / (value4 - value7);
            vlist[7] = d1.clone().lerp(a1, mu);
        }
        // vertical lines of the cube
        if (bits & 256) {
            mu = (isolevel - value0) / (value4 - value0);
            vlist[8] = a2.clone().lerp(a1, mu);
        }
        if (bits & 512) {
            mu = (isolevel - value1) / (value5 - value1);
            vlist[9] = b2.clone().lerp(b1, mu);
        }
        if (bits & 1024) {
            mu = (isolevel - value2) / (value6 - value2);
            vlist[10] = c2.clone().lerp(c1, mu);
        }
        if (bits & 2048) {
            mu = (isolevel - value3) / (value7 - value3);
            vlist[11] = d2.clone().lerp(d1, mu);
        }

        // construct triangles -- get correct vertices from triTable.
        var i = 0;
        cubeindex <<= 4;  // multiply by 16... 
        // "Re-purpose cubeindex into an offset into triTable." 
        //  since each row really isn't a row.

        cell.reconstructedVertices = new Array();

        // the while loop should run at most 5 times,
        //   since the 16th entry in each row is a -1.
        while (THREE.triTable[cubeindex + i] != -1) {
            var index1 = THREE.triTable[cubeindex + i];
            var index2 = THREE.triTable[cubeindex + i + 1];
            var index3 = THREE.triTable[cubeindex + i + 2];
            var vi1 = vlist[index1].clone();
            var vi2 = vlist[index2].clone();
            var vi3 = vlist[index3].clone();
            geometry.vertices.push(vi1);
            geometry.vertices.push(vi2);
            geometry.vertices.push(vi3);

            vi1.faceIndex = geometry.faces.length ;
            vi2.faceIndex = geometry.faces.length ;
            vi3.faceIndex = geometry.faces.length;

            cell.reconstructedVertices.push(vi1); cell.reconstructedVertices.push(vi2); cell.reconstructedVertices.push(vi3);
            var face = new THREE.Face3(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            geometry.faces.push(face);

            geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)]);

            vertexIndex += 3;
            i += 3;
        }
    }

    //geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
}