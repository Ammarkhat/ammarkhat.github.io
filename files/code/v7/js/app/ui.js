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

//GUI Controls
var guiControlPanel;

//http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
var MyControlsPanel = function () {
    this.faceNormals = false;
    this.vertexNormals = false;
    this.mesh = true;
    this.ExportPoints = function () { ExportScenePoints(); };
    this.ExportImage = function () { ExportCameraImage(); };
    this.ComputeIntersections = function () { ComputeIntersections(); };
};

function DefineUI() {
    guiControlPanel = new MyControlsPanel();
    var gui = new dat.GUI();

    //****************************************************************************************//
    var f00 = gui.addFolder('Data');
    f00.add(guiControlPanel, 'ExportPoints');
    f00.add(guiControlPanel, 'ExportImage');

    f00.open();
    //****************************************************************************************//
    var f0 = gui.addFolder('Rendering');
    var meshVisibleControl = f0.add(guiControlPanel, 'mesh');
    meshVisibleControl.onChange(function (value) {
        mesh.visible = value;
    });

    var vnh;
    var faceNormalsVisibleControl = f0.add(guiControlPanel, 'faceNormals');
    faceNormalsVisibleControl.onChange(function (value) {
        if (value) {
            vnh = new THREE.FaceNormalsHelper(mesh, 2, 0x000000);
            vnh.visible = true;
            mesh.add(vnh);
        } else {
            if (vnh) {
                vnh.visible = false;
            }
        }
    });

    var vvv;
    var vertexNormalsVisibleControl = f0.add(guiControlPanel, 'vertexNormals');
    vertexNormalsVisibleControl.onChange(function (value) {
        if (value) {
            vvv = new THREE.VertexNormalsHelper(mesh, 2, 0x00ffff, 5);
            vvv.visible = true;
            mesh.add(vvv);
        } else {
            if (vvv) {
                vvv.visible = false;
            }
        }
    });

    f0.add(guiControlPanel, 'ComputeIntersections');
    
}