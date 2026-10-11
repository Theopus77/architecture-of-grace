/* The Cube room, "Learn to solve it" (AOG-CUBE-DOOR-V1, 2026-10-10) — pencil still life: a solved Rubik's Cube, every side one tone. Sizes in metres. */
#define CAM_POS vec3(-0.1322,0.1010,-0.1582)
#define CAM_TGT vec3(-0.0233,0.0070,0.0546)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.25,.85,-.75)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#define SOLVED
#define TOP 0.
#include "studio.glsl"
#include "cubeparts.glsl"
