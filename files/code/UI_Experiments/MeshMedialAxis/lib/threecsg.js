/*
    adapted from THREE.CSG
    @author Chandler Prall <chandler.prall@gmail.com> http://chandler.prallfamily.com

    Wrapper for Evan Wallace's CSG library (https://github.com/evanw/csg.js/)
    Provides CSG capabilities for Three.js models.

    Provided under the MIT License

*/
THREE.CSG = {
    // convert CSG object to three.js mesh.
    fromCSG: function(csg, defaultColor) {

        var i, j, vertices, face,
            three_geometry = new THREE.Geometry(),
            polygons = csg.toPolygons();

        if ( !CSG ) {
            throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
        }

        polygons.forEach(function(polygon) {
            // polygon shared null? -> defaultColor, else extract color
            var vertices = polygon.vertices.map(function(vertex) {
                return this.getGeometryVertex(three_geometry, vertex.pos);
            }, this);

            if ( vertices[0] === vertices[vertices.length - 1] ) {
                vertices.pop( );
            }

            // create a mesh face using color (not opacity~material)
            for (var k = 2; k < vertices.length; k++) {
                face = new THREE.Face3( vertices[0], vertices[k-1], vertices[k],
                    new THREE.Vector3().copy(polygon.plane.normal));
                three_geometry.faces.push( face );
            }
        }, this);

		return three_geometry;
    },

    getGeometryVertex: function (geometry, vertex_position) {
        // var i;
        // // If Vertex already exists
        // // once required this should be done with the BSP info
        // for ( i = 0; i < geometry.vertices.length; i++ ) {
        //  if ( geometry.vertices[i].x === vertex_position.x &&
        //      geometry.vertices[i].y === vertex_position.y &&
        //      geometry.vertices[i].z === vertex_position.z ) {
        //      return i;
        //  }
        // }
        geometry.vertices.push(new THREE.Vector3( vertex_position.x, vertex_position.y, vertex_position.z ) );
        return geometry.vertices.length - 1;
    }
};