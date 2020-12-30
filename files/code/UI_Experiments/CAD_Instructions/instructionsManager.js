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

var listOfObjectsToSubtract=[];
var listOfObjectsToAdd=[];
var xLevels = [];
var yLevels = [];
var zLevels = [];
var listOfBounds = [];
var listOfInstructions = [];
var steps_bounding_boxes;
var boundingBoxesObj;
var fullObj;
var fullObjWithoutCylinders;
var emptyBoxes = {};
var allEmptyBoxes = [];
var allowConcatenateBottom = true;
var allowOnlyBoxes = true;

function GenerateListOfInstructions(){
	fullObj = ParseNodeFull(csg_tree2);
	
	ParseNodeNC(csg_tree2,false);
	
	var bounds = fullObj.getBounds();
	var dimensions = [bounds[1].x-bounds[0].x, bounds[1].y-bounds[0].y, bounds[1].z-bounds[0].z];
	var boundingBox= CSG.cube({radius: [dimensions[0]/2,dimensions[1]/2,dimensions[2]/2], resolution: 16, center: [dimensions[0]/2, dimensions[1]/2, dimensions[2]/2] });
	boundingBox=boundingBox.translate([bounds[0].x, bounds[0].y, bounds[0].z]);
		
	boundingBoxesObj = ParseNode(csg_tree2);
	
	var combinedSubtraction;
	for(var j=0;j<listOfObjectsToSubtract.length;j++){
		if(combinedSubtraction){
			listOfObjectsToSubtract[j] = listOfObjectsToSubtract[j].subtract(combinedSubtraction);
			combinedSubtraction = combinedSubtraction.union(listOfObjectsToSubtract[j]);
		}else{
			combinedSubtraction=listOfObjectsToSubtract[j];
		}
	}
	
	takenVolumeObject = fullObj;
	for(var j=0;j<listOfObjectsToSubtract.length;j++){
		if(takenVolumeObject)
			takenVolumeObject = takenVolumeObject.union(listOfObjectsToSubtract[j]);
		else
			takenVolumeObject  = listOfObjectsToSubtract[j];		
	}
	
	steps_bounding_boxes = CompleteBoundingBoxObj(boundingBoxesObj);
	
	//Actually Building the instructions
	listOfInstructions.push(boundingBox);  //Just the box
	
	var currentObj = boundingBox;
	for(var i=0;i<steps_bounding_boxes.length;i++){
		var obj = steps_bounding_boxes[i];
		currentObj = currentObj.subtract(obj);
		currentObj.difference = obj;
		listOfInstructions.push(currentObj);
	}
	
	for(var i=0;i<listOfObjectsToAdd.length;i++){
		var diff = listOfObjectsToAdd[i].subtract(takenVolumeObject);
		if(diff && diff.polygons.length>0){
			
			//if(listOfObjectsToAdd[i].type=="cylinder"){
			//	var plane1 = CSG.Plane.fromNormalAndPoint(normal, point);
			//	var diff1 = diff.cutByPlane(plane1);
			//}else{
				diff.isToAdd=true;
				currentObj = currentObj.subtract(diff);
				currentObj.difference = diff;
				listOfInstructions.push(currentObj);	
			//}						
		}
	}
	for(var i=0;i<listOfObjectsToSubtract.length;i++){
		var obj = listOfObjectsToSubtract[i];
		obj = obj.subtract(fullObj);
		currentObj = currentObj.subtract(obj);
		currentObj.difference = obj;
		listOfInstructions.push(currentObj);
	}
	
	//listOfInstructions[listOfInstructions.length-1]=fullObj;
}

function ParseNodeFull(node){
	var obj_before_transform;
	if(node.type=="operation"){
		if(node.operation=="union"){
			if(node.left && node.right){
				var left = ParseNodeFull(node.left);
				var right = ParseNodeFull(node.right);
				obj_before_transform= left.union(right);
			}else if(node.children){
				obj_before_transform = ParseNodeFull(node.children[0]);
				for(var i=1;i<node.children.length;i++){
					obj_before_transform = obj_before_transform.union(ParseNodeFull(node.children[i]));
				}
			}
		}else if(node.operation=="intersect"){
			var left = ParseNodeFull(node.left);
			var right = ParseNodeFull(node.right);
			obj_before_transform= left.intersect(right);
		}else if(node.operation=="subtract"){
			if(node.left && node.right){
				var left = ParseNodeFull(node.left);
				var right = ParseNodeFull(node.right);
				obj_before_transform= left.subtract(right);
			}else if(node.children){
				var left = ParseNodeFull(node.children[0]);
				var right;
				for(var i=1;i<node.children.length;i++){
					var c = ParseNodeFull(node.children[i]);
					if(!right){
						right = c;
					}else{
						right = right.union(c);
					}
				}
				obj_before_transform= left.subtract(right);							
			}
		}
	}else{
		if(node.type=="cube"){
			obj_before_transform= CSG.cube({radius: node.radius, resolution: 16, center: [node.radius[0], node.radius[1], node.radius[2]] });
		}else if(node.type=="sphere"){
			obj_before_transform= CSG.sphere({radius: node.radius, resolution: 16});
		}else if(node.type=="cylinder"){
			obj_before_transform= CSG.cylinder({radius: node.radius, start: [0,0,0], end: [0,0,node.height]});
		}
	}
	var result = obj_before_transform;
	if(node.rotateX)
		result=result.rotateX(node.rotateX);
	if(node.rotateY)
		result=result.rotateY(node.rotateY);
	if(node.rotateZ)
		result=result.rotateZ(node.rotateZ);
	if(node.translate)
		result=result.translate(node.translate);
	
	return result;
}

function ParseNodeNC(node, negative){
	var obj_before_transform;
	if(node.type=="operation"){
		if(node.operation=="union"){
			if(node.left && node.right){
				var left = ParseNodeNC(node.left, negative);
				var right = ParseNodeNC(node.right, negative);
				obj_before_transform= left.union(right);
			}else if(node.children){
				obj_before_transform = ParseNodeNC(node.children[0], negative);
				for(var i=1;i<node.children.length;i++){
					obj_before_transform = obj_before_transform.union(ParseNodeNC(node.children[i], negative));
				}
			}
		}else if(node.operation=="intersect"){
			var left = ParseNodeNC(node.left, negative);
			var right = ParseNodeNC(node.right, negative);
			obj_before_transform= left.intersect(right);
		}else if(node.operation=="subtract"){
			if(node.left && node.right){
				var left = ParseNodeNC(node.left, negative);
				var right = ParseNodeNC(node.right, !negative);
				obj_before_transform= left.subtract(right);
			}else if(node.children){
				var left = ParseNodeNC(node.children[0], negative);
				var right;
				for(var i=1;i<node.children.length;i++){
					var c = ParseNodeNC(node.children[i], !negative);
					if(!right){
						right = c;
					}else{
						right = right.union(c);
					}
				}
				obj_before_transform= left.subtract(right);							
			}
		}
	}else{
		if(node.type=="cube"){
			obj_before_transform= CSG.cube({radius: node.radius, resolution: 16, center: [node.radius[0], node.radius[1], node.radius[2]] });
		}else if(node.type=="sphere"){
			obj_before_transform= CSG.sphere({radius: node.radius, resolution: 16});
		}else if(node.type=="cylinder"){
			obj_before_transform= CSG.cylinder({radius: node.radius, start: [0,0,0], end: [0,0,node.height]});
		}
	}
	var result = obj_before_transform;
	if(node.rotateX)
		result=result.rotateX(node.rotateX);
	if(node.rotateY)
		result=result.rotateY(node.rotateY);
	if(node.rotateZ)
		result=result.rotateZ(node.rotateZ);
	if(node.translate)
		result=result.translate(node.translate);
	
	if(node.type!="operation" && node.type!="cylinder" && !negative){
		if(fullObjWithoutCylinders){
			fullObjWithoutCylinders=fullObjWithoutCylinders.union(result);
		}else{
			fullObjWithoutCylinders=result;
		}
	}
	
	return result;
}

function ParseNode(node, negative){
	var objectsToPush = [];
	var obj_before_transform;
	if(node.type=="operation"){
		if(node.operation=="union"){
			if(node.left && node.right){
				var left = ParseNode(node.left, negative);
				var right = ParseNode(node.right, negative);
				obj_before_transform= left.union(right);
			}else if(node.children){
				obj_before_transform = ParseNode(node.children[0], negative);
				for(var i=1;i<node.children.length;i++){
					var right = ParseNode(node.children[i], negative);
					if(right)
						obj_before_transform = obj_before_transform.union(right);
				}
			}
		}else if(node.operation=="intersect"){
			var left = ParseNode(node.left, negative);
			var right = ParseNode(node.right, negative);
			obj_before_transform= left.intersect(right);
		}else if(node.operation=="subtract"){
			if(node.left && node.right){
				var left = ParseNode(node.left, negative);
				var right = ParseNode(node.right, true);
				if(!negative)
					objectsToPush.push(right);
				//obj_before_transform= left.subtract(right);
				obj_before_transform= left;
			}else if(node.children){
				obj_before_transform = ParseNode(node.children[0], negative);
				for(var i=1;i<node.children.length;i++){
					var right = ParseNode(node.children[i], true);
					if(!negative)
						objectsToPush.push(right);
				}
			}
		}
	}else{
		if(node.type=="cube"){
			obj_before_transform= CSG.cube({radius: node.radius, resolution: 16, center: [node.radius[0], node.radius[1], node.radius[2]] });
		}else if(node.type=="sphere"){
			obj_before_transform= CSG.sphere({radius: node.radius, resolution: 16});
		}else if(node.type=="cylinder"){
			obj_before_transform= CSG.cylinder({radius: node.radius, start: [0,0,0], end: [0,0,node.height]});
		}
	}
	
	var result = obj_before_transform;
	result=ApplyTransform(node, result);
	
	for(var i=0;i<objectsToPush.length;i++){
		var res = objectsToPush[i];
		res=ApplyTransform(node, res);
		res = res.intersect(result);
		listOfObjectsToSubtract.push(res);
	}
	
	if(node.type!="operation" && !negative){
		if(node.type=="cylinder"){
			result = result.subtract(fullObjWithoutCylinders);
		}
		var bounds = result.getBounds();
		var dimensions = [bounds[1].x-bounds[0].x, bounds[1].y-bounds[0].y, bounds[1].z-bounds[0].z];
		var newObj= CSG.cube({radius: [dimensions[0]/2,dimensions[1]/2,dimensions[2]/2], resolution: 16, center: [dimensions[0]/2, dimensions[1]/2, dimensions[2]/2] });
		newObj=newObj.translate([bounds[0].x, bounds[0].y, bounds[0].z]);
		
		var diff = newObj.subtract(result);
		if(diff && diff.polygons.length>0){
			var diff_full_intersect = fullObj.intersect(diff);
			if(!diff_full_intersect || diff_full_intersect.polygons.length==0){
				diff.type=node.type;
				listOfObjectsToAdd.push(diff);
			}else{
				/*if(node.type=='cylinder')
				{
					var geo = THREE.CSG.fromCSG(diff,[0, 0, 1]);
					var material = new THREE.MeshPhongMaterial({
						color: 0xAAAAAA, specular: 0x111111, shininess: 50, side: THREE.DoubleSide
						,vertexColors: THREE.FaceColors
					});
					var result= new THREE.Mesh(geo,material);
					result.position.x = 200;//(listOfInstructions.length-i-1);
					scene.add( result );	
				}*/
				bounds.IsComplexAddition=true;
				//return null;
			}
		}
		
		AddBoundsToArrays(bounds);
		
		
		result = newObj;
	}
	return result;
}

function AddNumberToArray(n, array){
	if(array.indexOf(n)==-1){
		for(var i=0;i<array.length;i++){
			if(Math.abs(array[i]-n)<0.00001){
				return;
			}
		}
		array.push(n);
	}
}

function AddBoundsToArrays(bounds){
	listOfBounds.push(bounds);
	AddNumberToArray(bounds[0].x, xLevels);
	AddNumberToArray(bounds[0].y, yLevels);
	AddNumberToArray(bounds[0].z, zLevels);
	AddNumberToArray(bounds[1].x, xLevels);
	AddNumberToArray(bounds[1].y, yLevels);
	AddNumberToArray(bounds[1].z, zLevels);
}

function ApplyTransform(node, result){
	if(node.rotateX)
		result=result.rotateX(node.rotateX);
	if(node.rotateY)
		result=result.rotateY(node.rotateY);
	if(node.rotateZ)
		result=result.rotateZ(node.rotateZ);
	if(node.translate)
		result=result.translate(node.translate);
	return result;
}

function CompleteBoundingBoxObj(boundingBoxesObj){
	var newObjectsToSubtract=[];
	xLevels.sort(function(a, b) {
	  return a - b;
	});
	yLevels.sort(function(a, b) {
	  return a - b;
	});
	zLevels.sort(function(a, b) {
	  return a - b;
	});
	console.log("xLevels: " + JSON.stringify(xLevels));
	console.log("yLevels: " + JSON.stringify(yLevels));
	console.log("zLevels: " + JSON.stringify(zLevels));
	
	
	//Step0: find empty boxes
	var eb_index = 0;
	for(var k=0;k<zLevels.length-1;k++){
		var z1 = zLevels[k];
		var z2 = zLevels[k+1];
		for(var i=0;i<xLevels.length-1;i++){
			var x1 = xLevels[i];
			var x2 = xLevels[i+1];
			for(var j=0;j<yLevels.length-1;j++){
				var y1 = yLevels[j];
				var y2 = yLevels[j+1];
				if(!boxInsideBounds(x1,x2,y1,y2,z1,z2,listOfBounds)){
					var ep = [x1,x2,y1,y2,z1,z2, i, j, k, eb_index];
					
					if(!IntersectEmptyBoxWithShape(ep))
						continue;
					
					if(!(k in emptyBoxes))
						emptyBoxes[k] = [];
					emptyBoxes[k].push(ep);
					allEmptyBoxes.push(ep);
				
					eb_index++;
				}
			}
		}
	}
	
	if(allowOnlyBoxes){
		//while there exist empty boxes not used:
		//				GetLargestBoxInZLevel
		//				ConcatenateLowerLevelsIfPossible
		
		var s=0;
		var keys = Object.keys(emptyBoxes);
		for(var k=keys.length-1;k>=0;k--){//start from the largest z level
			var key = keys[k];
			var eb = emptyBoxes[key].slice();
			var it = 0;
			while(eb.length>0 && it<100){
				it++;
				var ebs = GetLargestBoxInZLevel(eb);
				if(ebs.length>0){						
					for(var i=0;i<ebs.length;i++){
						var e = ebs[i];
						eb.splice(eb.indexOf(e),1);
					}
					var ebs_c=ConcatenateLowerLevelsIfPossible(ebs, k, keys, emptyBoxes);
					SetEmptyBoxesSegment(ebs_c,s);
					s++;
					var cube=GetOneCube(ebs_c);
					cube.isBoundingBox=true;
					newObjectsToSubtract.push(cube);
				}
			}
		}
	}
	else{
		//Third try
		var depth = zLevels.length-1;
		var width = xLevels.length-1;
		var height = yLevels.length-1;
		
		//Build voxel array of emptyBoxes
		var voxels = new Array();
		for(var k=0;k<depth;k++){
			voxels[k] = new Array();
			for(var i=0;i<width;i++){
				voxels[k][i] = new Array();
				for(var j=0;j<height;j++)
					voxels[k][i][j]=-1;			
			}
		}
		
		//Fill voxel array
		var keys = Object.keys(emptyBoxes);
		for(var k=0;k<keys.length;k++){
			var key = keys[k];
			var ebs = emptyBoxes[key];
			for(var i=0;i<ebs.length;i++){
				var eb = ebs[i];
				var i_x = eb[6];
				var j_y = eb[7];
				var k_z = eb[8];
				voxels[k_z][i_x][j_y]=eb;
			}
		}
		
		//Start Algorithm3
		var keys = Object.keys(emptyBoxes);
		for(var k=keys.length-1;k>=0;k--){//start from the largest z level
			var key = keys[k];
			var eb = emptyBoxes[key].slice();
			var depthArray = ComputeDepthArrayOfCurrentZLevel(eb, key,width,height, voxels); //classify each box as how deep it's
			
			//Segment emptyboxes in this level based on depthArray.
			var segments = segment_level_emptyboxes_based_on_depthArray(depthArray,eb, width,height,voxels[key].slice());
			
			for(var s=0;s<segments.length;s++){
				var ebs = segments[s];
				if(ebs.length>0){				
					for(var i=0;i<ebs.length;i++){
						var e = ebs[i];
						eb.splice(eb.indexOf(e),1);
					}
					var ebs_c=ebs;
					if(allowConcatenateBottom)
						ebs_c=ConcatenateLowerLevelsIfPossible(ebs, k, keys, emptyBoxes, voxels);
					SetEmptyBoxesSegment(ebs_c,s);
					var cube=GetOneCube(ebs_c);
					cube.isBoundingBox=true;
					newObjectsToSubtract.push(cube);
				}
			}
		}
	}
	
	function SetEmptyBoxesSegment(ebs_c,s){
		for(var k=0;k<ebs_c.length;k++){
			var e = ebs_c[k];
			e.segment=s+1;
		}
	}
	
	
	/*
	//second try:
	//build voxel array of emptyBoxes
	var voxels = new Array();
	for(var k=0;k<zLevels.length-1;k++){
		voxels[k] = new Array();
		for(var i=0;i<xLevels.length-1;i++){
			voxels[k][i] = new Array();
			for(var j=0;j<yLevels.length-1;j++)
				voxels[k][i][j]=-1;			
		}
	}
	
	var keys = Object.keys(emptyBoxes);
	for(var k=0;k<keys.length;k++){
		var key = keys[k];
		var ebs = emptyBoxes[key];
		for(var i=0;i<ebs.length;i++){
			var eb = ebs[i];
			voxels[eb[6]][eb[7]][eb[8]]=eb;
		}
	}
	
	do{
		var possibleBoxes = FindPossibleBoxes(voxels);
		var bestBox = GetBestPossbileBox(possibleBoxes);
		var cube=GetOneCube(bestBox.ebs);
		cube.isBoundingBox=true;
		newObjectsToSubtract.push(cube);
		RemoveFoundBoxes(emptyBoxes,bestBox.ebs);
	}while(CountEmptyBoxes(emptyBoxes)>0);
	*/
	
	
	
	return newObjectsToSubtract;
}

function segment_level_emptyboxes_based_on_depthArray(depthArray,ebs, width,height,ebs_layer){
	var segments = new Array();
	
	var ebs_working = ebs.slice();
	var currentEb;
	
	while(ebs_working.length>0){
		var segment = [];
		currentEb = ebs_working.pop();
		segment.push(currentEb);
		RegionGrowing(currentEb,segment,ebs_working,depthArray,width,height,ebs_layer);
		segments.push(segment);
	}
	ComputeSegmentsViewScore(segments);
	segments.sort(function (a, b) {
	    return a.view_score - b.view_score;
	});
	return segments;
}

function ComputeSegmentsViewScore(segments){
	for(var s=0;s<segments.length;s++){
		var ebs = segments[s];

		var average_x=0;
		var average_y=0;
		for(var i=0;i<ebs.length;i++){
			var eb = ebs[i];
			var i_x = eb[6];
			var j_y = eb[7];
			average_x+=i_x;
			average_y+=j_y;
		}
		average_x/=ebs.length;
		average_y/=ebs.length;
		segments[s].view_score=average_x+average_y;
	}
}

function RegionGrowing(currentEb,segment,ebs,depthArray,width,height, ebs_layer){
	var i = currentEb[6];
	var j = currentEb[7];
	var d = depthArray[i][j];
	ebs_layer[i][j]=-1;
	
	var directions = [];
	
	//check left
	if(i>0)
		directions.push([i-1,j]);
	
	//check right
	if(i<width-1)
		directions.push([i+1,j]);
	
	//check top
	if(j>0)
		directions.push([i,j-1]);
	
	//check bottom
	if(j<height-1)
		directions.push([i,j+1]);
	
	for(var dir = 0;dir<directions.length;dir++){
		var r = directions[dir][0];
		var c = directions[dir][1];
		if(ebs_layer[r][c]!=-1 && depthArray[r][c]==d){//same depth, same segment
			var ebDir = ebs_layer[r][c];
			var index = ebs.indexOf(ebDir);
			if (index > -1)
				ebs.splice(index, 1);
			segment.push(ebDir);			
			RegionGrowing(ebDir,segment,ebs,depthArray,width,height,ebs_layer);
		}
	}	
}

function ComputeDepthArrayOfCurrentZLevel(ebs, z_level,width,height, voxels){
	var depth = new Array();
	for(var i=0;i<width;i++){
		depth[i] = new Array();
		for(var j=0;j<height;j++){
			for(var k=z_level;k>=0;k--){//start from the largest z level
				if(voxels[k][i][j]==-1)
					break;
			}
			depth[i][j]=z_level-k;
		}
	}
	return depth;
}

function FindPossibleBoxes(voxels, emptyBoxes){
	var result = [];
	var keys = Object.keys(emptyBoxes);
	for(var k=0;k<keys.length;k++){
		var key = keys[k];
		var ebs = emptyBoxes[key];
		for(var i=0;i<ebs.length;i++){
			var eb = ebs[i];
			var eb_result = FindPossibleBoxesStartingFrom(eb, voxels);
			result = result.concat(eb_result);
		}
	}
	return result;	
}

function FindPossibleBoxesStartingFrom(eb, voxels){
	var i = eb[6];
	var j = eb[7];
	var k = eb[8];
}

function GetBestPossbileBox(possibleBoxes){
	var best_score = -1;
	var best_score_box;
	for(var i=0;i<possibleBoxes.length;i++){
		var score = CalculateBoxScore(possibleBoxes[i]);
		if(score>best_score ||best_score==-1){
			best_score = score;
			best_score_box = possibleBoxes[i];
		}
	}
	return best_score_box;
}

function CalculateBoxScore(box){
	
}

function RemoveFoundBoxes(emptyBoxes,foundEBs){
	for(var i=0;i<foundEBs.length;i++){
		var e = foundEBs[i];
		var key = e[8];
		emptyBoxes[key].splice(emptyBoxes[key].indexOf(e),1);
	}
}

function CountEmptyBoxes(emptyBoxes){
	var result = 0;
	var keys = Object.keys(emptyBoxes);
	for(var k=keys.length-1;k>=0;k--){//start from the largest z level
		var key = keys[k];
		var eb = emptyBoxes[key].slice();
		result+=eb.length;
	}
	return result;	
}

//GetLargestBoxInZLevel that has at least two sides
function GetLargestBoxInZLevel(eb){
	var result = [];
	var largetXLevel = -1;
	for(var i=0;i<eb.length;i++){
		var x = eb[i][6];
		if(x>largetXLevel || largetXLevel==-1){
			largetXLevel=x;
		}
	}
	//get all empty boxes in the first row (x level) of this z level
	var ebs_x = getEBsInX(eb,largetXLevel);
	var y_pre = ebs_x[0][7];

	//make sure they are connected in y
	result.push(ebs_x[0]);
	for(var i=1;i<ebs_x.length;i++){
		var y = ebs_x[i][7];
		if(y==(y_pre+1))
			result.push(ebs_x[i]);
		else
			break;
		y_pre = y;
	}
	ebs_x=result;
	
	//for each empty box in the first row, search for it in the second row and add it if it's found
	for(var k=largetXLevel-1;k>=0;k--){
		var levelEB = getEBsInX(eb,k);
		if(levelEB.length ==0)
			break;
		var foundEBs = [];
		var oneItemNotFound=false;
		for(var i=0;i<ebs_x.length;i++){
			var e = ebs_x[i];
			var found=false;
			for(var j=0;j<levelEB.length;j++){
				var ebj = levelEB[j];
				if(e[7]==ebj[7])
				{
					found = true;
					foundEBs.push(ebj);
					break;
				}
			}
			if(!found){
				oneItemNotFound=true;
				break;
			}
		}
		
		//All ebs are found in this row, then add them to the current box
		if(!oneItemNotFound)
			result = result.concat(foundEBs);
		else
			return result;
	}
	return result;
}

function getEBsInX(eb,x_level){
	var result = [];
	for(var i=0;i<eb.length;i++){
		var x = eb[i][6];
		if(x==x_level)
			result.push(eb[i]);
	}
	return result;
}

function ConcatenateLowerLevelsIfPossible(ebs, level_k, keys, emptyBoxes, voxels){
	var result = ebs;
	for(var k=level_k-1;k>=0;k--){
		var key = keys[k];
		var levelEB = emptyBoxes[key];
		var foundEBs = [];
		var oneItemNotFound=false;
		for(var i=0;i<ebs.length;i++){
			var eb = ebs[i];
			//check if we find a box with the same x and y levels in this layer
			var found=false;
			for(var j=0;j<levelEB.length;j++){
				var ebj = levelEB[j];
				if(eb[6]==ebj[6] && eb[7]==ebj[7])
				{
					found = true;
					foundEBs.push(ebj);
					break;
				}
			}
			if(!found){
				oneItemNotFound=true;
				break;
			}
		}
		if(oneItemNotFound){
			//exit this layer
			return result;
		}else{
			//All ebs are found in this bottom layer, then add them to the current box
		
			result = result.concat(foundEBs);
			for(var i=0;i<foundEBs.length;i++){
				var e = foundEBs[i];
				emptyBoxes[key].splice(emptyBoxes[key].indexOf(e),1);
				if(voxels){							
					var i_x = e[6];
					var j_y = e[7];
					var k_z = e[8];
					voxels[k_z][i_x][j_y]=-1;
				}
			}
		}
	}
	return result;
}


function GetOneCube(ebs)
{					
	var result;	
	for(var i=0;i<ebs.length;i++){
	   var ei=ebs[i].intersection;
	   if(!result){
		result=ei;
	   }else{
		result = result.union(ei);
	   }
	}
	return result;
}

function GetOneCubeOld(ebs)
{					
	var result;	
	for(var i=0;i<ebs.length;i++){
	   var ei=GetCube(ebs[i]);
	   if(!result){
		result=ei;
	   }else{
		result = result.union(ei);
	   }
	}
	return result;
}

function GetCube(e)
{
	var x1=e[0],x2=e[1],y1=e[2],y2=e[3],z1=e[4],z2=e[5];
	var bounds = [{x:x1,y:y1,z:z1},{x:x2,y:y2,z:z2}];
	var dimensions = [bounds[1].x-bounds[0].x, bounds[1].y-bounds[0].y, bounds[1].z-bounds[0].z];
	var newObj= CSG.cube({radius: [dimensions[0]/2,dimensions[1]/2,dimensions[2]/2], resolution: 16, center: [dimensions[0]/2, dimensions[1]/2, dimensions[2]/2] });
	newObj=newObj.translate([bounds[0].x, bounds[0].y, bounds[0].z]);
	return newObj;
}

function GetOneCubeBackup(ebs){
	var minx=-1, maxx=-1;
	var miny=-1, maxy=-1;
	var minz=-1, maxz=-1;
	for(var i=0;i<ebs.length;i++){
		var e = ebs[i];
		var x1=e[0],x2=e[1],y1=e[2],y2=e[3],z1=e[4],z2=e[5];
		if(x1<minx || minx==-1)
			minx = x1;
		if(x2>maxx || maxx==-1)
			maxx = x2;
		if(y1<miny || miny==-1)
			miny = y1;
		if(y2>maxy || maxy==-1)
			maxy = y2;
		if(z1<minz || minz==-1)
			minz = z1;
		if(z2>maxz || maxz==-1)
			maxz = z2;
	}
	var bounds = [{x:minx,y:miny,z:minz},{x:maxx,y:maxy,z:maxz}];
	var dimensions = [bounds[1].x-bounds[0].x, bounds[1].y-bounds[0].y, bounds[1].z-bounds[0].z];
	var newObj= CSG.cube({radius: [dimensions[0]/2,dimensions[1]/2,dimensions[2]/2], resolution: 16, center: [dimensions[0]/2, dimensions[1]/2, dimensions[2]/2] });
	newObj=newObj.translate([bounds[0].x, bounds[0].y, bounds[0].z]);
	return newObj;
}

function getRandomInt(max) {
	return randomColor({			   
			   luminosity: 'dark',
			   hue: 'red'
			}); 
	
  //return Math.floor(Math.random() * Math.floor(max));
}

function IntersectEmptyBoxWithShape(box){
	var dimensions = [box[1]-box[0], box[3]-box[2], box[5]-box[4]];
	var newObj= CSG.cube({radius: [dimensions[0]/2,dimensions[1]/2,dimensions[2]/2], resolution: 16, center: [dimensions[0]/2, dimensions[1]/2, dimensions[2]/2] });
	newObj=newObj.translate([box[0], box[2], box[4]]);
	newObj = newObj.subtract(takenVolumeObject);
	if(!newObj || newObj.polygons.length==0){
		return false;
	}
	box.intersection = newObj;
	return true;
}

var segmentColors= {};

function Drawbox(box, useSegmentColor){
	var c = getRandomInt(65000);
	
	if(useSegmentColor && box.segment){
		if(box.segment in segmentColors){
			c = segmentColors[box.segment];
		}else{
			c = randomColor({			   
			   luminosity: 'dark'
			}); 
			segmentColors[box.segment]=c;
		}
	}
	
	var i_x = box[6];
	var j_y = box[7];
	var k_z = box[8];
	
	//if(i_x==2 && j_y==2 && k_z==3)
	//	c =0x00ff00;
	
	/*var c=0xff0000;
	if(key == 0){
		c =0xff0000;
	}else if(key == 1){
		c =0x00ff00;
	}else if(key == 2){
		c =0x0000ff;
	}else{
		c =getRandomInt(65000);
	}*/
	
	var geo = THREE.CSG.fromCSG(box.intersection);
	var material = new THREE.MeshPhongMaterial({
		color: c, specular: 0x111111, shininess: 50, side: THREE.DoubleSide
		,vertexColors: THREE.FaceColors
	});
	var result= new THREE.Mesh(geo,material);
	result.position.sub(geoCenter);
	scene.add( result );
	
	/*var edges= new THREE.LineSegments( new THREE.EdgesGeometry( geo ), new THREE.LineBasicMaterial( { color: 0x000000 } ) );
	edges.position.sub(geoCenter);
	scene.add(edges);*/
}


function DrawboxBackup(box, key){
	var dimensions = [box[1]-box[0], box[3]-box[2], box[5]-box[4]];
	
	var c=0xff0000;
	if(key == 0){
		c =0xff0000;
	}else if(key == 1){
		c =0x00ff00;
	}else if(key == 2){
		c =0x0000ff;
	}else{
		c =getRandomInt(65000);
	}
	var geometry = new THREE.BoxGeometry( dimensions[0], dimensions[1], dimensions[2] );
	var material = new THREE.MeshBasicMaterial( {color: c} ); //, transparent:true, opacity:0.5
	var cube = new THREE.Mesh( geometry, material );					
	cube.position.set(box[0]+dimensions[0]/2, box[2]+dimensions[1]/2, box[4]+dimensions[2]/2);
	scene.add( cube );
	
	var edges= new THREE.LineSegments( new THREE.EdgesGeometry( geometry ), new THREE.LineBasicMaterial( { color: 0x000000 } ) );
	edges.position.set(box[0]+dimensions[0]/2, box[2]+dimensions[1]/2, box[4]+dimensions[2]/2);
	scene.add(edges);
}

function boxInsideBounds(x1,x2,y1,y2,z1,z2,listOfBounds){
	for(var i=0;i<listOfBounds.length;i++){
		if(listOfBounds[i].IsComplexAddition)
			continue;
		var bb_min = listOfBounds[i][0];
		var bb_max = listOfBounds[i][1];
		if((x1>=bb_min.x && x2<=bb_max.x)&&(y1>=bb_min.y && y2<=bb_max.y)&&(z1>=bb_min.z && z2<=bb_max.z)){
			return true;
		}
	}
	return false;
}

function SampleJsCAD() {
	var cube = CSG.cube({radius: [10,20,20], resolution: 16}).rotateX(45);
	var sphere = CSG.sphere({radius: 10, resolution: 16}).translate([5, 5, 5]);
	return cube.union(sphere);
}