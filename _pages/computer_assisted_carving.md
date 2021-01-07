---
title: "Computer Assisted Carving (Ph.D. Research)"
excerpt: "Computer Assisted Carving (Ph.D. Research)"
permalink: /computer_assisted_carving/
author_profile: true
---

“Personal fabrication” field lies in the cross-section between digital fabrication and the manual craft experience. Carving is a craft that’s especially hard for novices. Carving a 3d model without any visual feedback is difficult because the user is creating the object from a mental image. It’s also hard for novices to figure out the steps in 3d to carve a model.
In my Ph.D. research, we introduced a projector-camera system to help novices carve 3D models.

![](/images/carving.jpg)

The system works by projecting guidance colors to guide the user in carving, while 3d scanning the material at the same time to update the guidance colors. By this system, we hope to enable novices to use their hands and manual tools to engage with the material, and to practice the carving craft to enhance their manual skills at the same time.
Carving is usually done in stages. First, the rough carving stage where the user wants to remove most of the material quickly, without over-cutting the model. For this stage, we introduced a method that can automatically analyze a 3D model and generate a series of optimized cutting steps. Then using a projector to project these cutting steps as a guide. The user will perform the cut by following the guide showing which parts of the material should be removed until he reaches the target shape.

![](/images/carving_stages.png)

The second stage is the fine carving stage, where the user moves to a different tool to accurately carve the fine details of the model. We help the user at this stage by projecting accurate guidance colors onto the material in real-time. The real-time aspect of our method provides continuous feedback to the user that’s important in carving to help the user to adjust his carving speed to avoid penetrating the target model surface while allowing him to carve fine details at a sub-millimeter accuracy.

![](/images/carving_results.png)

## Differential 3D Scanning:
3D scanning plays an important role in the field of personal fabrication. However, it’s tedious to scan the whole object when the user applies modifications to the physical object during prototyping. We introduced “Differential 3D Scanning”, a method to capture only the partial changes that the user applies in each design iteration. This allows the designer to save time, and to preserve the other unchanged parts of the 3d model, where we can keep both the geometry and the topology of these parts. 

![](/images/differential_scanning.png) 

Hattab, Ammar, Ian Gonsher, Daniel Moreno, and Gabriel Taubin. <a href="../files/differential_3d_scanning.pdf">"Differential 3d scanning."</a> IEEE computer graphics and applications 3 (2017): 43-51.
Hattab, Ammar, and Gabriel Taubin. <a href="../files/3d_modeling_scanning.pdf">"3D Modeling by Scanning Physical Modifications."</a> Graphics, Patterns and Images (SIBGRAPI), 2015 28th SIBGRAPI Conference on. IEEE, 2015.

### Deformable changes synchronization
In the case when the physical changes are smooth (As captured in the scanned point cloud). We propose a deformable model, where we deform the reference model until it matches the point cloud.
<br/>
<a href="../files/code/deform/bunny1.html"> Try it online </a>
*note: click DeformMesh button to start the deformation.
