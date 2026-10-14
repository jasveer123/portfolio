"""Render the loading / static-fallback poster from the web camera (projector off).

  Blender -b ~/Desktop/Slide_Projector.blend --python scripts/render-poster.py -- public/projector/poster.png
"""
import bpy, sys
argv = sys.argv[sys.argv.index("--") + 1:]
O = bpy.data.objects
s = bpy.context.scene
cam = O["Camera_Main"]; cam.location.x += 0.06; cam.data.lens = 34
for n in ["Vase_Ceramic", "Olive_Branches", "Olive_Leaves", "Bowl_Clay", "Book_1", "Pen_Cup", "Pencils"]:
    if O[n].parent is None: O[n].location.x -= 0.22
for o in O:
    if o.name.startswith("Wall_Card_") or o.name in {"projection_beam", "projection_dust_particles", "Pull_Chain_Ring", "Projection_Wash"}:
        o.hide_render = True
for n in ["projection_bulb_light", "lens_glow_point", "vent_glow_L", "vent_glow_R", "indicator_light"]:
    O[n].hide_render = True
m = bpy.data.materials["MAT_Wall_Plaster"]
for node in m.node_tree.nodes:
    if node.type == "BSDF_PRINCIPLED":
        for name in ("Emission Color", "Emission Strength"):
            for l in list(node.inputs[name].links): m.node_tree.links.remove(l)
        node.inputs["Emission Strength"].default_value = 0
for mat in ["MAT_Lens_Glow", "MAT_Indicator_Amber"]:
    for node in bpy.data.materials[mat].node_tree.nodes:
        if node.type == "BSDF_PRINCIPLED": node.inputs["Emission Strength"].default_value = 0
s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 1600, 900, 100
s.render.filepath = argv[0]
bpy.ops.render.render(write_still=True)
