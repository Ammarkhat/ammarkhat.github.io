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
    this.variance = 0.5;
    this.percentage = 0.5;
    this.threshold = 0.0008;
    this.attraction_threshold = 0.02;
    this.shrinkage_out = 0.01;
    this.shrinkage_in = 0.99;
    this.normalexpansion = -0.3;
    this.speed = 0.1;
    this.wireframe = false;
    this.faceNormals = false;
    this.vertexNormals = false;
    this.mesh = true;
    this.points = true;
    this.splitLongEdges = true;
    this.changeColors = true;
    this.rainbowColor = true;
    this.DeformMesh = function () { DeformMesh(); };
    this.Reset = function () { Reset(); };
    this.Find = function () { Find(); };
    this.FindPositive = function () { FindPositive(); };
    this.FindNegative = function () { FindNegative(); };
    this.ProjectPoints = function () { ProjectPoints(); };
    this.FindIterative = function () { FindIterative(); };
    this.AddGaussianNoise = function () { AddGaussianNoise(); };
    this.Subdivide = function () { Subdivide(); };
    this.Stop = function () { Stop(); };
    this.Resume = function () { Resume(); };
    this.AttractPoints = function () { AttractPoints(); };
    this.ComputeContours = function () { ComputeContours(); };
    this.SmoothContours1 = function () { SmoothContours(); };
    this.SmoothContours = function () { SmoothContoursLaplacian(); };
};


function DefineUI() {
    guiControlPanel = new MyControlsPanel();
    var gui = new dat.GUI();

    //****************************************************************************************//
    var f00 = gui.addFolder('Data');
    f00.add(guiControlPanel, 'AddGaussianNoise');
    f00.add(guiControlPanel, 'variance', 0, 10);
    f00.add(guiControlPanel, 'percentage', 0, 1);

    //****************************************************************************************//
    var f0 = gui.addFolder('Rendering');
    var meshVisibleControl = f0.add(guiControlPanel, 'mesh');
    meshVisibleControl.onChange(function (value) {
        mesh.visible = value;
    });
    var pointsVisibleControl = f0.add(guiControlPanel, 'points');
    pointsVisibleControl.onChange(function (value) {
        points.visible = value;
    });
    var WireframeVisibleControl = f0.add(guiControlPanel, 'wireframe');
    WireframeVisibleControl.onChange(function (value) {
        allmesh.children[1].visible = value;
        _wireframe = value;
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
    var rainbowColorControl = f0.add(guiControlPanel, 'rainbowColor');
    //****************************************************************************************//
    var f1 = gui.addFolder('3D Registration');

    //****************************************************************************************//
    var f2 = gui.addFolder('Finding Changes');
    f2.add(guiControlPanel, 'threshold', 0, 0.2);
    f2.add(guiControlPanel, 'attraction_threshold', 0, 0.2);
    var changeColorsControl = f2.add(guiControlPanel, 'changeColors');
    changeColorsControl.onChange(function (value) {
        change_colors = value;
        //SplitLongEdges();
    });
    f2.add(guiControlPanel, 'Reset');
    f2.add(guiControlPanel, 'AttractPoints');
    f2.add(guiControlPanel, 'Find');
    f2.add(guiControlPanel, 'FindPositive');
    f2.add(guiControlPanel, 'FindNegative');
    f2.add(guiControlPanel, 'ProjectPoints');
    f2.add(guiControlPanel, 'FindIterative');
    f2.add(guiControlPanel, 'Subdivide');
    f2.add(guiControlPanel, 'ComputeContours');
    f2.add(guiControlPanel, 'SmoothContours');
    f2.add(guiControlPanel, 'SmoothContours1');

    f2.open();
    //****************************************************************************************//
    var f3 = gui.addFolder('Deformation');
    f3.add(guiControlPanel, 'shrinkage_in', 0, 0.99);
    f3.add(guiControlPanel, 'shrinkage_out', 0, 0.99);
    f3.add(guiControlPanel, 'normalexpansion', -1, 1);
    f3.add(guiControlPanel, 'speed', 0, 1);    
    var splitLongEdgesControl = f3.add(guiControlPanel, 'splitLongEdges');
    splitLongEdgesControl.onChange(function (value) {
        split_long_edges = value;
        //SplitLongEdges();
    });
    
    f3.add(guiControlPanel, 'Stop');
    f3.add(guiControlPanel, 'Resume');
    f3.add(guiControlPanel, 'DeformMesh');
}