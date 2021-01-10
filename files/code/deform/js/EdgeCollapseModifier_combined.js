THREE.EdgeCollapseModifier = function () {

};

// Applies the "modify" pattern
THREE.EdgeCollapseModifier.prototype.modify = function (sourceEdges, geometry, minEdge, onlyChanged) {

    sourceEdges = this.CollapseEdges(sourceEdges, geometry, minEdge, onlyChanged);

	delete geometry.__tmpVertices;

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	return sourceEdges;

};

( function() {

	// Some constants
	var WARNINGS = ! true; // Set to true for development
	var ABC = [ 'a', 'b', 'c' ];  
	

	function getEdge( a, b, map ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + "_" + vertexIndexB;

		return map[ key ];

	}

	function processEdge( a, b, vertices, map, face ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + "_" + vertexIndexB;

		var edge;

		if ( key in map ) {

			edge = map[ key ];

		} else {
			
			var vertexA = vertices[ vertexIndexA ];
			var vertexB = vertices[ vertexIndexB ];

			edge = {
				a: vertexA, // pointer reference
				b: vertexB,
				newVertex: null,
				aIndex: vertexIndexA, // numbered reference
				bIndex: vertexIndexB,
				faces: [] // pointers to face
			};

			map[ key ] = edge;

		}

		edge.faces.push( face );
        	

	}

	function getKey(a, b) {
	    var vertexIndexA = Math.min(a, b);
	    var vertexIndexB = Math.max(a, b);

	    var key = vertexIndexA + "_" + vertexIndexB;
	    return key;
	}

	function updateEdge(edge, key, collapsedEdge, vertices, map, keys, removedfaces) {

	    //remove the removed face from edge faces
	    for (var i = 0; i < removedfaces.length; i++) {
	        var index = edge.faces.indexOf(removedfaces[i]);
	        if (index > -1)
	            edge.faces.splice(index, 1);
	    }

	    if (edge == collapsedEdge)
	        return;
        
	    var existingEdge;
	    var existingEdgeKey;
	    var eA;
	    var eB;
	    if (edge.aIndex == collapsedEdge.bIndex) {
	        eA = Math.min(edge.bIndex, collapsedEdge.aIndex);
	        eB = Math.max(edge.bIndex, collapsedEdge.aIndex);
	    } else if (edge.bIndex == collapsedEdge.bIndex) {
	        eA = Math.min(edge.aIndex, collapsedEdge.aIndex);
	        eB = Math.max(edge.aIndex, collapsedEdge.aIndex);
	    }
	    existingEdgeKey = eA + "_" + eB;
	    if (existingEdgeKey in map) {
	        existingEdge = map[existingEdgeKey];
	        for (var i = 0; i < removedfaces.length; i++) {
	            var index = existingEdge.faces.indexOf(removedfaces[i]);
	            if (index > -1)
	                existingEdge.faces.splice(index, 1);
	        }
	        //update existing edge faces
	        if (edge.faces == existingEdge.faces) {
	            console.log("Same edge!!");
	        }
	        for (var i = 0; i < edge.faces.length; i++) {
	            existingEdge.faces.push(edge.faces[i]);
	        }
	    } else {
	        var vertexA = vertices[eA];
	        var vertexB = vertices[eB];

	        newEdge = {
	            a: vertexA, // pointer reference
	            b: vertexB,
	            newVertex: null,
	            aIndex: eA, // numbered reference
	            bIndex: eB,
	            faces: edge.faces
	        };

	        //Add new edge
	        map[existingEdgeKey] = newEdge;
	        keys.push(existingEdgeKey);
	    }

	    var index = keys.indexOf(key);
	    if (index > -1)
	        keys.splice(index, 1);

	    //delete map[key];

	}

	function generateLookups( vertices, faces, edges, onlyChanged ) {

		var i, il, face, edge;

		for ( i = 0, il = faces.length; i < il; i ++ ) {

			face = faces[ i ];			

			if (onlyChanged) {
			    if (!(vertices[face.a].changed && !vertices[face.a].finished)
                    && !(vertices[face.b].changed && !vertices[face.b].finished)
                    && !(vertices[face.c].changed && !vertices[face.c].finished))
			        continue;
			}

			processEdge( face.a, face.b, vertices, edges, face );
			processEdge( face.b, face.c, vertices, edges, face );
			processEdge( face.c, face.a, vertices, edges, face );

		}

	}

	function newFace(newFaces, a, b, c) {
	    var face = new THREE.Face3(a, b, c);
	    face.color = new THREE.Color(0x44dd66);
	    face.color.setRGB(Math.random(), Math.random(), Math.random());
	    newFaces.push(face);

	}

	function addEdgeToIncidentEdges(a, b, bIncidentEdges, sourceEdges) {
	    var vertexIndexA = Math.min(a, b);
	    var vertexIndexB = Math.max(a, b);
	    var key = vertexIndexA + "_" + vertexIndexB;
	    if (key in sourceEdges) {
	        var edge = sourceEdges[key];
	        edge.key = key;
	        if (bIncidentEdges.indexOf(edge) == -1) {
	            bIncidentEdges.push(edge);
	        }
	    } else {
	        console.log("not in source edges: " + key);
	    }
	}


	/////////////////////////////

	// Performs one iteration of Subdivision
	THREE.EdgeCollapseModifier.prototype.CollapseEdges = function (sourceEdges, geometry, minEdge, onlyChanged) {
	    if(!minEdge)
	        minEdge=0;

	    var tmp = new THREE.Vector3();

	    var oldVertices, oldFaces;

	    var n, l, i, il, j, k;
        
	    oldVertices = geometry.vertices; // { x, y, z}
	    oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
	    var oldColors =geometry.colors;

	    /******************************************************
		 *
		 * Step 0: Preprocess Geometry to Generate edges Lookup
		 *
		 *******************************************************/
	    if (!sourceEdges) {
	        sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }

	        generateLookups(oldVertices, oldFaces, sourceEdges, onlyChanged);
	    }

	    /******************************************************
		 *
		 *	Step 1. 
		 *	For each edge, check its length
		 *
		 *******************************************************/

	    var other, currentEdge, face;
	    var connectedFaces;
	    var minEdgeSq = minEdge * minEdge;
	    keys = Object.keys(sourceEdges);
	    var numberOfSplits = 0;

	    do {
	        var k_index = Math.floor(Math.random() * (keys.length-1));
	        var currentedge_k = keys[k_index];
	        keys.splice(k_index, 1);
	        currentEdge = sourceEdges[currentedge_k];
	        if (!(currentEdge.a.changed && !currentEdge.a.finished && currentEdge.b.changed && !currentEdge.b.finished))
	            continue;

	        //if (numberOfSplits > 200)
	        //    continue;

	        if (minEdgeSq > 0) {
	            if (!currentEdge.length || currentEdge.updateEdgeLength) {
	                currentEdge.length = currentEdge.a.distanceToSquared(currentEdge.b);
	                currentEdge.updateEdgeLength = false;
	            }

	            if (currentEdge.length > minEdgeSq) // if edge length greater than the minimum, dont collapse it
	                continue;
	        }
	        numberOfSplits++;
	        //edge needs collapse

	        //check if we can collapse it
	        var numberOfSharedIncidentVertices = 0;
	        for (var j = 0; j < currentEdge.a.vertice_incident_vertices.length; j++) {
	            var va = currentEdge.a.vertice_incident_vertices[j];
	            for (var k = 0; k < currentEdge.b.vertice_incident_vertices.length; k++) {
	                var vb = currentEdge.b.vertice_incident_vertices[k];
	                if (va == vb)
	                    numberOfSharedIncidentVertices++;
	            }
	        }
	         if (numberOfSharedIncidentVertices > 2)
	            continue;

	        //step 1 

	        //remove vertex b (replace it with a)
	        currentEdge.b.removed = true;
	        //currentEdge.a.set((currentEdge.b.x + currentEdge.a.x) / 2, (currentEdge.b.y + currentEdge.a.y) / 2, (currentEdge.b.z + currentEdge.a.z) / 2);
	        var b_incident_edges = new Array();
	        for (var j = 0; j < currentEdge.b.vertice_incident_faces.length; j++) {

	            var face = currentEdge.b.vertice_incident_faces[j];
	            var exit = false;
	            for (var k = 0; k < currentEdge.faces.length; k++) {
	                if (face == currentEdge.faces[k]) { //if its one of the removed faces, don't update it for now
	                    exit = true;
	                }
	            }
	            if (exit)
	                continue;

	            var incidentVertex1 = null;
	            var incidentVertex2 = null;

	            if (face.a == currentEdge.bIndex) {
	                incidentVertex1 =oldVertices[face.b];
	                incidentVertex2 = oldVertices[face.c];
	                addEdgeToIncidentEdges(face.a, face.b, b_incident_edges, sourceEdges);
	                addEdgeToIncidentEdges(face.a, face.c, b_incident_edges, sourceEdges);
	                face.a = currentEdge.aIndex;
	            }
	            if (face.b == currentEdge.bIndex) {
	                incidentVertex1 = oldVertices[face.a];
	                incidentVertex2 = oldVertices[face.c];
	                addEdgeToIncidentEdges(face.b, face.a, b_incident_edges, sourceEdges);
	                addEdgeToIncidentEdges(face.b, face.c, b_incident_edges, sourceEdges);
	                face.b = currentEdge.aIndex;
	            }
	            if (face.c == currentEdge.bIndex) {
	                incidentVertex1 = oldVertices[face.a];
	                incidentVertex2 = oldVertices[face.b];
	                addEdgeToIncidentEdges(face.c, face.a, b_incident_edges, sourceEdges);
	                addEdgeToIncidentEdges(face.c, face.b, b_incident_edges, sourceEdges);
	                face.c = currentEdge.aIndex;
	            }
	            if (currentEdge.a.vertice_incident_faces.indexOf(face) == -1)
	                currentEdge.a.vertice_incident_faces.push(face);

	            if (incidentVertex1) {
	                if (currentEdge.a.vertice_incident_vertices.indexOf(incidentVertex1) == -1)
	                    currentEdge.a.vertice_incident_vertices.push(incidentVertex1);

	                if (incidentVertex1.vertice_incident_vertices.indexOf(currentEdge.a) == -1)
	                    incidentVertex1.vertice_incident_vertices.push(currentEdge.a);
	            }
	            if (incidentVertex2) {
	                if (currentEdge.a.vertice_incident_vertices.indexOf(incidentVertex2) == -1)
	                    currentEdge.a.vertice_incident_vertices.push(incidentVertex2);

	                if (incidentVertex2.vertice_incident_vertices.indexOf(currentEdge.a) == -1)
	                    incidentVertex2.vertice_incident_vertices.push(currentEdge.a);
	            }
	        }

	        for (var j = 0; j < currentEdge.faces.length; j++) {
	            var face = currentEdge.faces[j];
	            var index = oldVertices[face.a].vertice_incident_faces.indexOf(face);
	            if (index > -1)
	                oldVertices[face.a].vertice_incident_faces.splice(index, 1);

	            var index = oldVertices[face.b].vertice_incident_faces.indexOf(face);
	            if (index > -1)
	                oldVertices[face.b].vertice_incident_faces.splice(index, 1);

	            var index = oldVertices[face.c].vertice_incident_faces.indexOf(face);
	            if (index > -1)
	                oldVertices[face.c].vertice_incident_faces.splice(index, 1);
	        }

	        for (var j = 0; j < currentEdge.faces.length; j++) {
	            var face = currentEdge.faces[j];
	            var index = currentEdge.a.vertice_incident_faces.indexOf(face);
	            if (index > -1)
	                currentEdge.a.vertice_incident_faces.splice(index, 1);
	        }

	        //step 3 remove the two incident faces from faces array
	        for (var j = 0; j < currentEdge.faces.length; j++) {
	            var face = currentEdge.faces[j];
	            var index = oldFaces.indexOf(face);
	            if (index > -1)
	                oldFaces.splice(index, 1);
	            face.remove = true;
	        }

	        var removedFaces = currentEdge.faces.slice(0);

	        //step 2 update edges array
	        for (var j = 0; j < b_incident_edges.length; j++) {
	            var e = b_incident_edges[j];
	            if (e.aIndex == currentEdge.bIndex || e.bIndex == currentEdge.bIndex) {
	                updateEdge(e, e.key, currentEdge, oldVertices, sourceEdges, keys, removedFaces);//currentEdge.faces
	            } 
	        }
	        
	       
	    } while (keys.length > 0);

		// Overwrite old arrays
		geometry.vertices = oldVertices;
		geometry.faces = oldFaces;
		geometry.colors = oldColors;

		// console.log('done');
		return sourceEdges;
	};


} )();
