---
title: "3D Scanning CAD Objects"
excerpt: "3D Scanning CAD Objects"
permalink: /3d_scanning_cad/
author_profile: true
---

3D scanning is an important component in the field of 3D design and fabrication. Most often, users want to design around existing physical parts while they don’t have the source 3d models for these parts. In these cases, the user can 3d scan the existing parts, and use the scanned models as inputs to the CAD application to generate parts that connect, hold, or cover them. However, the result of 3D scanning is usually a point cloud representing sample points taken from the surface of the object. Converting this point cloud to a CAD model useful for design is called reverse engineering, which’s a tedious process that requires a lot of manual work. More often, people choose to rebuild the model from scratch than using a 3D scanner for the purpose. I am working on developing new 3D scanning methods with the goal of outputting a CAD model ready to be used for design.

![](/images/scanning_cad.png) 

## 3D Scanning Sharp Edges with Infrared Light

In this work we propose using an active lighting method to detect sharp edges in images (using the non-realistic rendering method), and using a stereo camera to 3D reconstruct the detected sharp edges of an object. Repeating this process from multiple views will give us a complete connected edges of the model. By directly reconstructing the 3D sharp features of the model, we allow the user to easily read measurments from them, or to reverse engineer a CAD model using them. 
![](/images/sharp_edges.png) 

In the initial experiments of this work we used an Intel Realsense D415 stereo camera and attached two IR flash lights to the left and right of the camera. 
![](/images/d415.jpg =350x) 

## 3D Scanning Marked Edges

Rather than 3D scanning and reverse engineering the whole object, in many cases, all we need is to capture specific parts of the object (for example to attach other objects to it). In this work we propose allowing the user to use a marker to mark the desired edges, and then using a stereo camera to 3D reconstruct the detected marked edges of an object from multiple views. This also would allow us to capture smooth curves from the object surface which might be missed by the previous method. On the other hand, to avoid possible segmentation errors, we allow the user to use different marker colors for each edge type (straight, quadratic, or spline curve).
![](/images/marked_edges.png) 

## 3D Rigid Registration of CAD Point-Clouds
 
3D scanners are used to capture the shape of a real-world object to produce a 3D virtual model on the computer. The process usually involves capturing 3D data (in the form of a 3D point-cloud) of the same physical object from multiple views. Each view is selected to cover the object from a certain direction to capture the whole object. But, the views are usually not related to each other. So, it’s important to align these views to produce one merged point cloud that could be then reconstructed into a 3D surface.

The alignment step is not a trivial task. And it usually needs enough overlap between the two views, such that we could use the overlapping parts of the point-clouds to find the best alignment. Most often, the alignment step is formulated as an optimization problem that depends on the geometry of the pointclouds. 
If we have some prior knowledge about the geometry of the point clouds, can we exploit it to solve the alignment problem? In this work, we focus on a certain type of objects coming from industrial and mechanical applications. Those objects which are designed by CAD systems, and tend to be composed of simple geometric shapes like planes, cylinders, cones, etc

In this work, we assume that we have two point-clouds representing two different views of a CAD object. We propose an algorithm that first detects the basic shapes in the two pointclouds. Then it searches for the best combination of basic shapes that gives the best alignment. Finding the best alignment problem is divided into two sub-problems, first, finding the best rotation and then, finding the best translation. At last a few iterations of the iterative closest point “ICP” algorithm are applied to get a fine registration between the two point-clouds.

<a href="https://www.youtube.com/watch?v=1lywE9oIh7Q&list=PLlcmSy90JQvaIWkVSUOfpvXJcQEAqtEpZ">Watch this video for an example</a>

Hattab, A. and Taubin, G., 2018, March. <a href="../files/registration_paper.pdf">3D Rigid Registration of Cad Point-Clouds</a>. In Computing Sciences and Engineering (ICCSE), 2018 International Conference on (pp. 1-6). IEEE.

![](/images/register.png) 

## Other 3D Scanning Experiments

###  Integrate 3D Laser Scanning with 3D Printer
We attached a line laser and a USB camera to the 3D printer. And we used the 3D printer mechanical movement for 3D scanning. This integration enables many applications. And the resulting point cloud is more uniform compared to turntable scanners.

<a href="../files/final_laser_integrate_printer.pdf">Presentation</a>

![](/images/laser.jpg) 

###  Hand-held laser 3D scanner
We built a hand-held laser 3D scanner that includes a line laser and a stereo camera. We implemented the circular markers based tracking to track the device position and orientation.

![](/images/hand_held_scanner.jpg) 

![](/images/3d_face.png) 

###  3D Laser Scanning Simulator

To understand the 3D scanning process, and to find the best structure for the 3D scanner, we built a 3D laser scanning simulator; where the user can upload his own 3D model and then set the position and orientation for a number of laser lines, and the camera, then he can start the simulation. The result point cloud will try to approximate the real 3D scanning result.

<a href="../files/code/v7/index.html">Try it online</a>

![](/images/simulator.png) 
