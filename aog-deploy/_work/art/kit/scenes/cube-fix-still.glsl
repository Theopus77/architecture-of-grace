/* The Cube room, "Fix my real cube" (AOG-CUBE-DOOR-V1, 2026-10-10) — pencil still life: a Rubik's Cube with its top
   layer turned part way, one top corner missing, and that corner and an edge piece lying popped out beside it
   ("I have a Rubik's Cube that has been altered. I have no idea how to make it right"). Sizes in metres. */
#define POPPED
#define CAM_POS vec3(-0.1635,0.1201,-0.2131)
#define CAM_TGT vec3(-0.0271,0.0021,0.0543)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.25,.85,-.75)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "cubeparts.glsl"
