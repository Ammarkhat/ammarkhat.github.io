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

String.prototype.replaceAll = function(f,r){return this.split(f).join(r);}

function ParseScadText(txt){
	var txtClean = txt.replaceAll(" ", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll("()", "");
	var currentWord="";
	var currentNode=null;
	for(var i=0;i<txtClean.length;i++){
		var c=txtClean[i];
		if(c=="{"){
			var newNode={children:[]};
			newNode.type = currentWord;
			currentWord='';
			newNode.parentNode=currentNode;
			if(currentNode)
				currentNode.children.push(newNode);
			currentNode=newNode;
		}else if(c=="}"){
			if(currentWord)
				currentNode.children.push(currentWord);
			currentWord='';
			if(currentNode.parentNode)
				currentNode=currentNode.parentNode;
		}else if(c==";"){
			currentNode.children.push(currentWord);
			currentWord='';
		}else{
			currentWord+=c;
		}
	}
	
	var root = ParseTreeNode(currentNode);
	return root;
}

function ParseTreeNode(currentNode){
	if(typeof(currentNode)=="string"){
		var node = {};
		var ti;
		if((ti=currentNode.indexOf("cube"))!=-1){
			var coordsStr = currentNode.substring(ti+6);
			ti=coordsStr.indexOf(']');
			coordsStr = coordsStr.substring(0,ti);
			var coordsCol = coordsStr.split(',');
			var x = Number.parseFloat(coordsCol[0]);
			var y = Number.parseFloat(coordsCol[1]);
			var z = Number.parseFloat(coordsCol[2]);
			node={
				type:"cube",
				radius:[x/2,y/2,z/2]
			};
		}
		if(currentNode.indexOf("cylinder")!=-1){
			var d=-1;
			
			ti=currentNode.indexOf("d=");
			if(ti!=-1){
				var dStr = currentNode.substring(ti+2);
				ti=GetNextIndex(dStr);
				dStr = dStr.substring(0,ti);
				d = Number.parseFloat(dStr);
			}else{
				ti=currentNode.indexOf("r=");
				var dStr = currentNode.substring(ti+2);
				ti=GetNextIndex(dStr);
				dStr = dStr.substring(0,ti);
				d = Number.parseFloat(dStr);
				d = d * 2;
			}
			ti=currentNode.indexOf("h=");
			var hStr = currentNode.substring(ti+2);
			ti=GetNextIndex(hStr);
			hStr = hStr.substring(0,ti);
			var h = Number.parseFloat(hStr);
			node={
				type:"cylinder",
				radius: d/2,
				height: h
			};
		}
		
		if((ti=currentNode.indexOf("translate"))!=-1)
		{
			var coordsStr = currentNode.substring(ti+11);
			ti=coordsStr.indexOf(']');
			coordsStr = coordsStr.substring(0,ti);
			var coordsCol = coordsStr.split(',');
			var x = Number.parseFloat(coordsCol[0]);
			var y = Number.parseFloat(coordsCol[1]);
			var z = Number.parseFloat(coordsCol[2]);
			node.translate=[x,y,z];
		}
		
		if((ti=currentNode.indexOf("rotate"))!=-1)
		{
			var coordsStr = currentNode.substring(ti+8);
			ti=coordsStr.indexOf(']');
			coordsStr = coordsStr.substring(0,ti);
			var coordsCol = coordsStr.split(',');
			var x = Number.parseFloat(coordsCol[0]);
			var y = Number.parseFloat(coordsCol[1]);
			var z = Number.parseFloat(coordsCol[2]);
			if(x!=0)
			node.rotateX=x;
			if(y!=0)
			node.rotateY=y;
			if(z!=0)
			node.rotateZ=z;
		}
		return node;
	}else{
		var type=currentNode.type;
		if(type=="difference")
			type="subtract";
		var node = {
			type:"operation",
			operation:type,
			children:[]
		};
		if(currentNode.children){
			for(var i=0;i<currentNode.children.length;i++){
				var childNode = ParseTreeNode(currentNode.children[i]);
				node.children.push(childNode);
			}
		}
		return node;
	}
}

function GetNextIndex(dStr){
	var cInd = dStr.indexOf(',');
	var bInd = dStr.indexOf(')');
	if(cInd==-1)
		return bInd;
	if(bInd==-1)
		return cInd;
	return (bInd<cInd?bInd:cInd);
}