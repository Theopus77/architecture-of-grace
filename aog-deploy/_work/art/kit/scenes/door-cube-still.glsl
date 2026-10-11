/* Front-page door "The Cube" (AOG-CUBE-DOOR-V2, 2026-10-10) — Jimmy: "Can you fix the sketch? I don't like it."
   A quiet pencil still life: one Rubik's Cube on the table, its top layer turned a little. Sizes in metres. */
#define TOP .22
#define CAM_POS vec3(-0.1281,0.0977,-0.1518)
#define CAM_TGT vec3(-0.0229,0.0068,0.0542)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.25,.85,-.75)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "cubeparts.glsl"
