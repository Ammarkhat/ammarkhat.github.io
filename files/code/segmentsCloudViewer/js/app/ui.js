//GUI Controls
var guiControlPanel;

//http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
var MyControlsPanel = function () {
    this.points = true;
    this.lines = true;
};

function DefineUI() {
    guiControlPanel = new MyControlsPanel();
    var gui = new dat.GUI();

    var pointsVisibleControl = gui.add(guiControlPanel, 'points');
    pointsVisibleControl.onChange(function (value) {
        points.visible = value;
    });

    var linesVisibleControl = gui.add(guiControlPanel, 'lines');
    linesVisibleControl.onChange(function (value) {
        lines_group.visible = value;
    });
}