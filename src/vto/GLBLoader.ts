import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export async function loadGlasses(scene: THREE.Scene, path: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      path,

      (gltf) => {
        const model = gltf.scene;

        // STEP 1: Sembunyikan helper node (alpha=0 di material aslinya)
        const helperNames = [
          "bridge_center", "left_lens_center", "right_lens_center",
          "left_hinge", "right_hinge"
        ];
        helperNames.forEach(name => {
          const node = model.getObjectByName(name);
          if (node) node.visible = false;
        });

        // STEP 2: Material lensa — set transparent + depthWrite false
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Apply DoubleSide to everything for safety, especially temples
            if (child.material instanceof THREE.Material) {
              child.material.side = THREE.DoubleSide;
            }

            if (child.name === "left_lens" || child.name === "right_lens") {
              const mat = child.material as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity = 0.4;
              mat.depthWrite = false; // lensa tidak block objek di belakangnya
            }
          }
        });

        scene.add(model);
        resolve(model);
      },
      undefined,
      (error) => {
        console.error("Error loading GLB:", error);
        reject(error);
      }
    );
  });
}
