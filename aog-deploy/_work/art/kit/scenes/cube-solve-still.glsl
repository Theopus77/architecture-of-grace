/* The Cube room, "Solve with me" (AOG-CUBE-DOOR-V1, 2026-10-10) — pencil still life: a mixed Rubik's Cube in the middle of a turn. Sizes in metres. */
#define CAM_POS vec3(-0.1160,0.0985,-0.1559)
#define CAM_TGT vec3(-0.0115,0.0081,0.0489)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#define TOP .5
#include "studio.glsl"
#include "cubeparts.glsl"
