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
    this.StopSimulation = function () {  stopSimulation = true; };
    this.StartSimulation = function () { stopSimulation = false; animate(); };
};

function DefineUI() {
    guiControlPanel = new MyControlsPanel();
    var gui = new dat.GUI();

    //****************************************************************************************//
    var f00 = gui.addFolder('Data');
    f00.add(guiControlPanel, 'ExportPoints');
    f00.add(guiControlPanel, 'ExportImage');

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
    //****************************************************************************************//
    var f2 = gui.addFolder('Simulation');
    f2.add(guiControlPanel, 'StopSimulation');
    f2.add(guiControlPanel, 'StartSimulation');

    f2.open();
}