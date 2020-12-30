
function ExportScenePoints() {
    scene.remove(sceneContainer1);
    exportToObj("points");
    scene.add(sceneContainer1);
}

function ExportAll() {
    //scene.remove(allmesh);
    if (vertices_group)
        scene.remove(vertices_group);
    exportToObj("points");
    //scene.add(allmesh);
}

function exportToObj(filename) {
    var exporter = new THREE.OBJExporter();
    var result = exporter.parse(scene);

    var textToWrite = result;
    var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    var fileNameToSaveAs = filename + '.obj';

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}


function ExportCameraImage() {
    var imgData, imgNode;
    var strDownloadMime = "image/octet-stream";

    try {

        //Inner Camera
        if (laser_group)
            laser_group.visible = false;
        axes.visible = false;
        innerCameraHelper.visible = false;
        sceneContainer1.visible = true;
        sceneContainer2.visible = false;

        var width = Math.floor(window.innerWidth);
        var height = Math.floor(window.innerHeight);
        renderer.setViewport(0, 0, width, height);
        renderer.setScissor(0, 0, width, height);
        renderer.setScissorTest(true);
        renderer.setClearColor(0xccffcc);
        innerCamera.aspect = width / height;
        innerCamera.updateProjectionMatrix();
        renderer.render(scene, innerCamera);
        var strMime = "image/jpeg";
        imgData = renderer.domElement.toDataURL(strMime);
        saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");
    } catch (e) {
        console.log(e);
        return;
    }
}

function saveFile(strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}