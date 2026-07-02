import type { Glasses } from "../types/glasses";

export const GLASSES_CATALOG: Glasses[] = [
  {
    id: "coba4-deepar",
    name: "Optik Tunggal",
    sku: "/coba4_fixed.glb",
    color: "#8B5CF6",
    type: "local",
    deeparEffect: "/coba4.deepar",
    lensWidthMm: 52,
    bridgeMm: 17,
    framePdMm: 69,
    frameWidthMm: 145.14,
    // Node mapping sesuai hierarki model client (coba4_fixed.glb)
    // Lihat docs/3d_model_specification.md untuk standar yang benar
    nodeMapping: {
      frame: "Frame",
      lensInner: "LensInner",
      lensOuter: "LensOuter",
      rootNode: "coba4_fixed.glb",
      baseScale: 100, // Coba4 requires 100x scale in DeepAR
    },
  },
  // {
  //   id: "coba-rayban",
  //   name: "Rayban 4196",
  //   sku: "/cobarayban.glb",
  //   color: "#8B8CF2",
  //   type: "local",
  //   deeparEffect: "/cobarayban.deepar",
  //   lensWidthMm: 61,
  //   bridgeMm: 22.5,
  //   framePdMm: 69,
  //   frameWidthMm: 144.5,
  //   // Node mapping sesuai hierarki model client (coba4_fixed.glb)
  //   // Lihat docs/3d_model_specification.md untuk standar yang benar
  //   nodeMapping: {
  //     frame: "Frame",
  //     lensInner: "LensInner",
  //     lensOuter: "LensOuter",
  //     rootNode: "cobarayban.glb",
  //     baseScale: 100, // Coba4 requires 100x scale in DeepAR
  //   },
  // },
  {
    id: "rayban-deepar",
    name: "RayBan DeepAR",
    sku: "/rayban.deepar",
    color: "#F59E0B",
    type: "local",
    deeparEffect: "/rayban.deepar",
    pdCalibrationMm: 45,
    // Node mapping standar DeepAR (RayBan)
    nodeMapping: {
      frame: "Plastic",
      lensInner: "LensesMultiply",
      lensOuter: "LensesAdd",
      rootNode: "RayBanLow",
      baseScale: 1, // RayBan is 1x scale
    },
  },
  // {
  //   id: "2023-deepar",
  //   name: "2023 Party DeepAR",
  //   sku: "/2023.deepar",
  //   color: "#0EF529",
  //   type: "local",
  //   deeparEffect: "/2023.deepar",
  //   pdCalibrationMm: 45,

  //   nodeMapping: {
  //     frame: "white_base",
  //     // Model 2023 tidak memiliki pasangan LensesMultiply/LensesAdd.
  //     // Gunakan node light transparan yang sama agar lensOuter tidak dipanggil dua kali.
  //     lensInner: "lights_opacity",
  //     lensOuter: "lights_opacity",
  //     rootNode: "2023_glasses.fbx",
  //     baseScale: 1,
  //   },
  // },
];
