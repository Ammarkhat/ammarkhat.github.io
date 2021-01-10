/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 *
 *	Subdivision Geometry Modifier 
 *		using Loop Subdivision Scheme
 *
 *	References:
 *		http://graphics.stanford.edu/~mdfisher/subdivision.html
 *		http://www.holmes3d.net/graphics/subdivision/
 *		http://www.cs.rutgers.edu/~decarlo/readings/subdiv-sg00c.pdf
 *
 *	Known Issues:
 *		- currently doesn't handle UVs
 *		- currently doesn't handle "Sharp Edges"
 *
 */

THREE.SubdivisionModifier = function ( subdivisions ) {

	this.subdivisions = ( subdivisions === undefined ) ? 1 : subdivisions;

};

// Applies the "modify" pattern
THREE.SubdivisionModifier.prototype.modify = function (geometry, maxEdge, onlyChanged) {

	var repeats = this.subdivisions;

	while ( repeats -- > 0 ) {

	    this.smooth(geometry, maxEdge, onlyChanged);

	}

	delete geometry.__tmpVertices;

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

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
				aIndex: a, // numbered reference
				bIndex: b,
				faces: [] // pointers to face
			};

			map[ key ] = edge;

		}

		edge.faces.push( face );
        	

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

	/////////////////////////////

	// Performs one iteration of Subdivision
	THREE.SubdivisionModifier.prototype.smooth = function (geometry, maxEdge, onlyChanged) {
	    if(!maxEdge)
	        maxEdge=0;

	    var tmp = new THREE.Vector3();

	    var oldVertices, oldFaces;
	    var newVertices, newFaces; // newUVs = [];

	    var n, l, i, il, j, k;
	    var metaVertices, sourceEdges;

	    // new stuff.
	    var sourceEdges, newEdgeVertices, newSourceVertices;

	    oldVertices = geometry.vertices; // { x, y, z}
	    oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
	    var oldColors =geometry.colors;

	    /******************************************************
		 *
		 * Step 0: Preprocess Geometry to Generate edges Lookup
		 *
		 *******************************************************/

	    sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }

	    generateLookups(oldVertices, oldFaces, sourceEdges, onlyChanged);


	    /******************************************************
		 *
		 *	Step 1. 
		 *	For each edge, create a new Edge Vertex,
		 *	then position it.
		 *
		 *******************************************************/

	    newEdgeVertices = [];
	    newEdgeColors = [];
	    var other, currentEdge, newVertex, face;
	    var edgeVertexWeight, adjacentVertexWeight, connectedFaces;
	    var maxEdgeSq = maxEdge * maxEdge;
	    for ( i in sourceEdges ) {

	        currentEdge = sourceEdges[i];
	        if (!(currentEdge.a.changed && !currentEdge.a.finished) && !(currentEdge.b.changed && !currentEdge.b.finished))
	            continue;

	        if (maxEdgeSq > 0) {
	            var d = currentEdge.a.distanceToSquared(currentEdge.b);
	            if (d < maxEdgeSq)
	                continue;
	        }

	        newVertex = new THREE.Vector3();

	        //edgeVertexWeight = 3 / 8;
	        //adjacentVertexWeight = 1 / 8;

	        edgeVertexWeight = 0.5;
	        adjacentVertexWeight = 0;

	        connectedFaces = currentEdge.faces.length;

	        // check how many linked faces. 2 should be correct.
	        if ( connectedFaces != 2 ) {

	            // if length is not 2, handle condition
	            edgeVertexWeight = 0.5;
	            adjacentVertexWeight = 0;

	            if ( connectedFaces != 1 ) {
	                if ( WARNINGS ) console.warn( 'Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge );
	            }
	        }
            
	        newVertex.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight);
	        newVertex.changed = true;

			tmp.set( 0, 0, 0 );

			for ( j = 0; j < connectedFaces; j ++ ) {
				face = currentEdge.faces[ j ];
				for ( k = 0; k < 3; k ++ ) {
					other = oldVertices[ face[ ABC[ k ] ] ];
					if ( other !== currentEdge.a && other !== currentEdge.b ) break;
				}
				tmp.add( other );
			}

			tmp.multiplyScalar( adjacentVertexWeight );
			newVertex.add( tmp );

			currentEdge.newVertex = newEdgeVertices.length;
			newEdgeVertices.push(newVertex);

			if (oldColors) {
			    var aC = oldColors[currentEdge.aIndex];
			    var bC = oldColors[currentEdge.bIndex];
			    if (aC && bC) {
			        var newColor = new THREE.Color((aC.r + bC.r) / 2, (aC.g + bC.g) / 2, (aC.b + bC.b) / 2);
			        newEdgeColors.push(newColor);
			    }
			}
			// console.log(currentEdge, newVertex);

		}

		/******************************************************
		 *
		 *	Step 2. 
		 *	Reposition each source vertices.
		 *
		 *******************************************************/
		newSourceVertices = oldVertices;

							   
		/******************************************************
		 *
		 *	Step 3. 
		 *	Generate Faces between source vertecies
		 *	and edge vertices.
		 *
		 *******************************************************/

		newVertices = newSourceVertices.concat(newEdgeVertices);
		newColors = oldColors.concat(newEdgeColors);
		var sl = newSourceVertices.length, edge1, edge2, edge3;
		newFaces = [];

		for (i = 0, il = oldFaces.length; i < il; i++) {

		    face = oldFaces[i];

		    //if (onlyChanged) {
		    //    if (!newVertices[face.a].changed && !newVertices[face.b].changed && !newVertices[face.c].changed)
		    //    {
		    //        newFaces.push(face);
		    //        continue;
		    //    }
		    //}

		    // find the 3 new edges vertex of each old face
		    var e1_obj = getEdge(face.a, face.b, sourceEdges);
		    var e2_obj = getEdge(face.b, face.c, sourceEdges);
		    var e3_obj = getEdge(face.c, face.a, sourceEdges);

		    var e1V = e1_obj && e1_obj.newVertex != null ? true : false;
		    var e2V = e2_obj && e2_obj.newVertex != null ? true : false;
		    var e3V = e3_obj && e3_obj.newVertex != null ? true : false;

		    var numberOfVertices = e1V && e2V && e3V ? 3 : (e1V && e2V || e1V && e3V || e2V && e3V ? 2 : (e1V || e2V || e3V ? 1 : 0));

		    if (e1V)
		        edge1 = e1_obj.newVertex + sl;
		    if (e2V)
		        edge2 = e2_obj.newVertex + sl;
		    if (e3V)
		        edge3 = e3_obj.newVertex + sl;

		    if (numberOfVertices == 0) {
		        newFaces.push(face);
		    } else if (numberOfVertices == 1) {
		        if (e1V) {
		            newFace(newFaces, edge1, face.b, face.c);
		            newFace(newFaces, face.a, edge1, face.c);
		        }
		        if (e2V) {
		            newFace(newFaces, face.a, face.b, edge2);
		            newFace(newFaces, face.a, edge2, face.c);
		        }
		        if (e3V) {
		            newFace(newFaces, face.a, face.b, edge3);
		            newFace(newFaces, edge3, face.b, face.c);
		        }
		    } else if (numberOfVertices == 2) {
		        if (e1V && e2V) {
		            newFace(newFaces, edge1, face.b, edge2);
		            newFace(newFaces, edge1, edge2, face.a);
		            newFace(newFaces, face.a, edge2, face.c);
		        }
		        if (e1V && e3V) {
		            newFace(newFaces, face.a, edge1, edge3);
		            newFace(newFaces, edge1, face.b, edge3);
		            newFace(newFaces, edge3, face.b, face.c);
		        }
		        if (e2V && e3V) {
		            newFace(newFaces, face.a, face.b, edge3);
		            newFace(newFaces, edge3, face.b, edge2);
		            newFace(newFaces, edge3, edge2, face.c);
		        }
		    } else if (numberOfVertices == 3) {
		        // create 4 faces.
		        newFace(newFaces, edge1, edge2, edge3);
		        newFace(newFaces, face.a, edge1, edge3);
		        newFace(newFaces, face.b, edge2, edge1);
		        newFace(newFaces, face.c, edge3, edge2);
		    }
		}

		// Overwrite old arrays
		geometry.vertices = newVertices;
		geometry.faces = newFaces;
		geometry.colors = newColors;

		// console.log('done');

	};


} )();
