"""
Bake the Slide_Projector scene for the web.

  /Applications/Blender.app/Contents/MacOS/Blender -b ~/Desktop/Slide_Projector.blend \
      --python scripts/bake-projector.py -- public/models [samples]

Outputs (never saves the .blend):
  public/models/projector.glb              geometry (Draco), original names, extras.bake = atlas group
  public/models/bake/<group>-room.png      Cycles COMBINED bake, room lights only (projector off)
  public/models/bake/<group>-lamp.png      Cycles COMBINED bake, projector lights only
  public/models/bake/manifest.json         encoding scale + projection rectangle + camera

Lighting is stored as  enc = (linear / SCALE) ** (1 / 2.2)  so two states can be
mixed linearly in the browser:  colour = room + level * lamp.
"""
import bpy, bmesh, sys, os, json, math, time
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "public/models")
SAMPLES = int(argv[1]) if len(argv) > 1 else 384
BAKE_DIR = os.path.join(OUT, "bake")
os.makedirs(BAKE_DIR, exist_ok=True)
SCALE = 3.0

scene = bpy.context.scene
assert scene.name == "Slide_Projector", scene.name
O = bpy.data.objects

def log(*a):
    print("[bake]", *a, flush=True)

# ---------------------------------------------------------------- composition
# Framing chosen for legibility: slightly longer lens, projection a little larger,
# plant moved left so it no longer covers the projection.
cam = O["Camera_Main"]
cam.location.x += 0.06
cam.data.lens = 34
for n in ["Vase_Ceramic", "Olive_Branches", "Olive_Leaves", "Bowl_Clay", "Book_1", "Pen_Cup", "Pencils"]:
    if O[n].parent is None:
        O[n].location.x -= 0.22
# pivot for the swaying plant: top centre of the vase (before the vase is merged into the desk)
_vase = O["Vase_Ceramic"]
plant_pivot = [_vase.location.x, _vase.location.y, _vase.location.z + max(v.co.z for v in _vase.data.vertices) * _vase.scale.z]
wash = O["Projection_Wash"]
wash.location.x = -0.02
wash.scale = (1.06, 1, 1.06)
bpy.context.view_layer.update()
# (matrix_world of this plane is not evaluated in background mode — use its transform directly;
# the plane's mesh is already vertical, ±1.025 × ±0.6 in local X/Z)
bb = wash.data.vertices
lx = [v.co.x for v in bb]; lz = [v.co.z for v in bb]
rect = {
    "x0": wash.location.x + min(lx) * wash.scale.x, "x1": wash.location.x + max(lx) * wash.scale.x,
    "z0": wash.location.z + min(lz) * wash.scale.z, "z1": wash.location.z + max(lz) * wash.scale.z,
    "y": wash.location.y,
}
log("projection rect", rect)
wash_loc = wash.location.copy()
# the wash plane is an emitter — it would bake a bright rectangle into the "room" state
O.remove(wash, do_unlink=True)

for o in list(O):
    if o.name.startswith("Wall_Card_") or o.name in {"projection_beam", "projection_dust_particles", "Pull_Chain_Ring", "Film_Strip"}:
        O.remove(o, do_unlink=True)

lens = O["lens_glow_point"]
lens_origin = O.new("lens_origin", None)
scene.collection.objects.link(lens_origin)
lens_origin.parent = lens.parent
lens_origin.matrix_world = lens.matrix_world.copy()

# The plaster material paints a glowing "projection" rectangle into the wall (emission).
# The web app draws the real projection, so remove that emission before baking.
wall_mat = bpy.data.materials.get("MAT_Wall_Plaster")
if wall_mat and wall_mat.use_nodes:
    nt = wall_mat.node_tree
    for node in nt.nodes:
        if node.type == "BSDF_PRINCIPLED":
            for name in ("Emission Color", "Emission Strength"):
                for link in list(node.inputs[name].links):
                    nt.links.remove(link)
            node.inputs["Emission Strength"].default_value = 0.0
        if node.type == "EMISSION":
            node.inputs["Strength"].default_value = 0.0
    for link in list(nt.links):
        if link.to_node.type == "ADD_SHADER" or (link.to_node.type == "MIX_SHADER" and link.from_node.type == "EMISSION"):
            log("wall shader link", link.from_node.type, "->", link.to_node.type)

# ---------------------------------------------------------------- mesh prep
bpy.ops.object.select_all(action="DESELECT")
meshes = [o for o in scene.objects if o.type == "MESH"]
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.make_single_user(object=True, obdata=True, material=False)
with bpy.context.temp_override(selected_objects=meshes, selected_editable_objects=meshes, active_object=meshes[0]):
    bpy.ops.object.convert(target="MESH")
bpy.ops.object.select_all(action="DESELECT")

def join(target, names):
    t = O.get(target)
    parts = [O[n] for n in names if n in O and n != target and O[n].type == "MESH"]
    if not t or not parts:
        return
    for p in parts:
        for c in list(p.children):
            if c not in parts:
                mw = c.matrix_world.copy(); c.parent = t; c.matrix_world = mw
    with bpy.context.temp_override(active_object=t, selected_objects=[t, *parts], selected_editable_objects=[t, *parts]):
        bpy.ops.object.join()

names = [o.name for o in scene.objects]
join("Desk_Top_Rustic", [n for n in names if n.startswith("Book_") or n in
     {"Bowl_Clay", "Vase_Ceramic", "Pen_Cup", "Pencils", "Brass_Tin", "Fountain_Pen", "Fountain_Pen_Brass"}])
join("Olive_Branches", ["Olive_Leaves"])
O["Olive_Branches"].name = "olive_plant"
join("Floor", [n for n in names if n.startswith("Desk_Leg") or n == "Chair_Back"])
static_proj = [n for n in names if n.startswith(("screw", "rubber_foot", "vent_", "handle_hinge", "lens_bracket")) or n in {
    "body_top_plate", "front_bezel", "fan_grille", "fan_opening", "cable_socket", "indicator_bezel",
    "eject_button_bezel", "power_switch_base", "next_slide_button_plate", "previous_slide_button_plate",
    "side_button_bezel", "side_indicator_bezel", "focus_wheel_plate"}]
join("projector_body", static_proj)
join("next_slide_button", ["next_slide_button_mark", "next_slide_button_mark.001"])
join("previous_slide_button", ["previous_slide_button_mark"])
join("power_plug", ["plug_pin", "plug_pin.001"])

def descendants(o):
    out = []
    for c in o.children:
        out.append(c); out += descendants(c)
    return out

proj_meshes = [o for o in descendants(O["Projector_Root"]) if o.type == "MESH"]
plant = O["olive_plant"]
GROUPS = {
    "wall": ([O["Wall"]], 2048),
    "plant": ([plant], 1024),
    "room": ([O["Floor"]], 1024),
    "projector": (proj_meshes, 2048),
}
desk = [o for o in scene.objects if o.type == "MESH"
        and not any(o in g[0] for g in GROUPS.values())]
GROUPS["desk"] = (desk, 4096)
for g, (objs, _) in GROUPS.items():
    log(g, len(objs), "objects")

# ---------------------------------------------------------------- lightmap UVs
for g, (objs, _) in GROUPS.items():
    for o in objs:
        me = o.data
        if len(me.uv_layers):
            me.uv_layers[me.uv_layers.active_index].active_render = True  # textures keep their UVs
        bake = me.uv_layers.new(name="bake")
        me.uv_layers.active = bake  # smart_project + bake write into this one
        o["bake"] = g
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    # lightmap pack copes with the desk's many small props; smart project keeps
    # continuous islands (fewer seams) on the wall, floor and projector
    method = os.environ.get("UV_METHOD") or ("lightmap" if g in ("desk", "plant") else "smart")
    if method == "lightmap":
        bpy.ops.uv.lightmap_pack(PREF_CONTEXT="ALL_FACES", PREF_PACK_IN_ONE=True, PREF_NEW_UVLAYER=False,
                                 PREF_BOX_DIV=12, PREF_MARGIN_DIV=0.15)
    else:
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0, area_weight=0.0, scale_to_bounds=False)
        bpy.ops.uv.select_all(action="SELECT")
        bpy.ops.uv.average_islands_scale()
        bpy.ops.uv.pack_islands(udim_source="CLOSEST_UDIM", rotate=True, scale=True, margin_method="FRACTION",
                                margin=0.002, shape_method=os.environ.get("UV_SHAPE", "CONCAVE"))
    bpy.ops.object.mode_set(mode="OBJECT")


def uv_stats(objs):
    """Fraction of the atlas covered by UV triangles (packing efficiency)."""
    total = 0.0
    for o in objs:
        uv = o.data.uv_layers["bake"].data
        for poly in o.data.polygons:
            pts = [uv[i].uv for i in poly.loop_indices]
            a = 0.0
            for k in range(len(pts)):
                x1, y1 = pts[k]; x2, y2 = pts[(k + 1) % len(pts)]
                a += x1 * y2 - x2 * y1
            total += abs(a) / 2
    return total

for g, (objs, _) in GROUPS.items():
    log(f"uv coverage {g}: {uv_stats(objs):.2f}")
if os.environ.get("BAKE_DRYRUN"):
    raise SystemExit(0)

# ---------------------------------------------------------------- lighting states
ROOM_LIGHTS = ["Fill_Front_Soft", "Key_Sunset_Right", "Leaf_Shadow_Spot", "Room_Ambient_Bounce", "Projector_Front_Kicker"]
# projection_bulb_light carries a rectangular gobo; the browser draws the projection itself
# (exactly aligned with the content), so it stays off in both states.
LAMP_LIGHTS = ["lens_glow_point", "vent_glow_L", "vent_glow_R", "indicator_light"]
GLOW_MATS = ["MAT_Lens_Glow", "MAT_Indicator_Amber"]

# soft bounce from the bright projection back into the room
bpy.ops.object.light_add(type="AREA", location=(wash_loc.x, rect["y"] - 0.02, (rect["z0"] + rect["z1"]) / 2))
bounce = bpy.context.object
bounce.name = "projection_bounce"
bounce.data.shape = "RECTANGLE"
bounce.data.size = rect["x1"] - rect["x0"]
bounce.data.size_y = rect["z1"] - rect["z0"]
bounce.data.energy = 14
bounce.data.color = (1.0, 0.86, 0.68)
bounce.rotation_euler = (math.radians(-90), 0, 0)  # area lights emit along local −Z → world −Y, into the room

world_orig = scene.world
black = bpy.data.worlds.new("bake_black")
black.use_nodes = True
black.node_tree.nodes["Background"].inputs[1].default_value = 0.0

glow_strength = {}
for m in GLOW_MATS:
    mat = bpy.data.materials.get(m)
    p = next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None) if mat else None
    if p:
        glow_strength[m] = p.inputs["Emission Strength"].default_value

def set_state(state):
    room = state == "room"
    for n in ROOM_LIGHTS:
        if n in O: O[n].hide_render = not room
    for n in LAMP_LIGHTS + ["projection_bounce"]:
        if n in O: O[n].hide_render = room
    if "projection_bulb_light" in O: O["projection_bulb_light"].hide_render = True
    scene.world = world_orig if room else black
    for m, s in glow_strength.items():
        p = next(n for n in bpy.data.materials[m].node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        p.inputs["Emission Strength"].default_value = 0.0 if room else s

plant.visible_shadow = False
leaf = O["Leaf_Shadow_Spot"]
leaf_dir = leaf.matrix_world.to_quaternion() @ Vector((0, 0, -1))

scene.render.engine = "CYCLES"
# CPU: Metal kernel compilation for bakes can take far longer than the bake itself.
scene.cycles.device = os.environ.get("BAKE_DEVICE", "CPU")
if scene.cycles.device == "GPU":
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.refresh_devices()
    for d in prefs.devices:
        d.use = d.type == "METAL"
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = False
scene.cycles.use_denoising = False
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 6
scene.render.threads_mode = "FIXED"
scene.render.threads = os.cpu_count() or 8
scene.render.bake.margin = 8
scene.render.bake.use_clear = True

manifest = {"scale": SCALE, "gamma": 2.2, "groups": {}, "rect": rect}

def denoise(rgb, sigma=1.1):
    """Mask-aware gaussian: smooths path-tracing noise without bleeding across empty atlas space."""
    mask = (rgb.sum(axis=2) > 1e-6).astype(np.float32)
    r = 3
    k = np.exp(-(np.arange(-r, r + 1) ** 2) / (2 * sigma * sigma)).astype(np.float32)
    k /= k.sum()
    def conv(a):
        out = np.zeros_like(a)
        for i, w in enumerate(k):
            out += w * np.roll(a, i - r, axis=0)
        a2 = out
        out = np.zeros_like(a2)
        for i, w in enumerate(k):
            out += w * np.roll(a2, i - r, axis=1)
        return out
    num = conv(rgb * mask[..., None])
    den = conv(mask)[..., None]
    out = np.where(den > 1e-4, num / np.maximum(den, 1e-4), rgb)
    return np.where(mask[..., None] > 0, out, rgb)


def bake_group(g, objs, size, state):
    img = bpy.data.images.new(f"bake_{g}_{state}", size, size, float_buffer=True, alpha=False)
    nodes_added = []
    for o in objs:
        for slot in o.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes:
                continue
            node = mat.node_tree.nodes.get("__bake__") or mat.node_tree.nodes.new("ShaderNodeTexImage")
            node.name = "__bake__"
            node.image = img
            mat.node_tree.nodes.active = node
            nodes_added.append(node)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    t = time.time()
    bpy.ops.object.bake(type="COMBINED")
    log(f"baked {g}/{state} {size}px in {time.time() - t:.1f}s")
    px = np.empty(size * size * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(size, size, 4)
    rgb = px[..., :3]
    log(f"  p50={np.percentile(rgb, 50):.3f} p99={np.percentile(rgb, 99):.3f} max={rgb.max():.3f}")
    rgb = denoise(rgb)
    enc = np.clip(rgb / SCALE, 0, 1) ** (1 / 2.2)
    out = bpy.data.images.new(f"enc_{g}_{state}", size, size, alpha=False)
    out.colorspace_settings.name = "Non-Color"
    o4 = np.concatenate([enc, np.ones((size, size, 1), np.float32)], axis=2)
    out.pixels.foreach_set(o4.ravel())
    out.filepath_raw = os.path.join(BAKE_DIR, f"{g}-{state}.png")
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(img)
    bpy.data.images.remove(out)

only = os.environ.get("BAKE_ONLY")
for state in ["room", "lamp"]:
    set_state(state)
    for g, (objs, size) in GROUPS.items():
        if only and g not in only.split(","):
            continue
        bake_group(g, objs, size, state)
        manifest["groups"][g] = size

set_state("room")

# ---------------------------------------------------------------- export
for o in list(O):
    if o.type == "LIGHT":
        O.remove(o, do_unlink=True)
for m in bpy.data.materials:
    if m.use_nodes:
        n = m.node_tree.nodes.get("__bake__")
        if n:
            m.node_tree.nodes.remove(n)
        # strip textures from the GLB — the baked atlases replace them
        for n in list(m.node_tree.nodes):
            if n.type == "TEX_IMAGE":
                m.node_tree.nodes.remove(n)

for o in scene.objects:
    if o.type == "MESH":
        for l in [l for l in o.data.uv_layers if l.name != "bake"]:
            o.data.uv_layers.remove(l)

rw, rh = scene.render.resolution_x, scene.render.resolution_y
manifest["camera"] = {
    "location": list(cam.location), "rotation_euler": list(cam.rotation_euler),
    "lens": cam.data.lens, "sensor_width": cam.data.sensor_width, "aspect": rw / rh,
}
manifest["lens_origin"] = list(lens_origin.matrix_world.translation)
manifest["leaf_light"] = {
    "location": list(leaf.matrix_world.translation), "direction": list(leaf_dir),
    "spot_size": leaf.data.spot_size, "spot_blend": leaf.data.spot_blend, "radius": leaf.data.shadow_soft_size,
}
manifest["plant_pivot"] = plant_pivot
with open(os.path.join(BAKE_DIR, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=1)

bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUT, "projector.glb"), export_format="GLB", use_selection=False,
    export_apply=True, export_yup=True, export_lights=False, export_cameras=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_extras=True, export_animations=False, export_materials="EXPORT", export_image_format="NONE",
)
log("done", os.path.getsize(os.path.join(OUT, "projector.glb")))
