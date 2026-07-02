// Util geometri murni untuk pengukuran PD (dipakai PDCaptureView & PDAdjustView).

export type Point = {
  x: number;
  y: number;
};

export type IrisLandmarks = {
  center: Point;
  right: Point;
  top: Point;
  left: Point;
  bottom: Point;
};

export const IRIS_DIAMETER_MM = 11.7; // Average adult visible iris diameter.
export const MIN_VALID_PD_MM = 45;
export const MAX_VALID_PD_MM = 75;

export const LEFT_EYE_CONTOUR_INDICES = [
  263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388,
  466,
];
export const RIGHT_EYE_CONTOUR_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
];

export const distance = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const medianPoint = (points: Point[]): Point => ({
  x: median(points.map((p) => p.x)),
  y: median(points.map((p) => p.y)),
});

export const averagePoints = (points: Point[]): Point => {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
};

export const getBounds = (points: Point[]) =>
  points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

/** Pusat iris dari landmark: pakai center MediaPipe jika konsisten dengan tepi iris. */
export const getReliableIrisCenter = (iris: IrisLandmarks): Point => {
  const edgeCenter = averagePoints([
    iris.right,
    iris.top,
    iris.left,
    iris.bottom,
  ]);
  const irisRadius = Math.max(
    distance(iris.left, iris.right),
    distance(iris.top, iris.bottom),
  );

  return distance(iris.center, edgeCenter) <= irisRadius * 0.35
    ? iris.center
    : edgeCenter;
};

/** Refinement pusat pupil dari pixel gelap di sekitar estimasi landmark. */
export const refinePupilCenterFromPixels = (
  frameCtx: CanvasRenderingContext2D,
  estimate: Point,
  eyeContour: Point[],
): Point => {
  const bounds = getBounds(eyeContour);
  const eyeWidth = Math.max(1, bounds.maxX - bounds.minX);
  const eyeHeight = Math.max(1, bounds.maxY - bounds.minY);
  const marginX = eyeWidth * 0.16;
  const marginY = Math.max(eyeHeight * 0.35, 4);
  const startX = Math.max(0, Math.floor(bounds.minX - marginX));
  const startY = Math.max(0, Math.floor(bounds.minY - marginY));
  const endX = Math.min(
    frameCtx.canvas.width,
    Math.ceil(bounds.maxX + marginX),
  );
  const endY = Math.min(
    frameCtx.canvas.height,
    Math.ceil(bounds.maxY + marginY),
  );
  const width = endX - startX;
  const height = endY - startY;

  if (width < 8 || height < 6) return estimate;

  const imageData = frameCtx.getImageData(startX, startY, width, height);
  const luminances: number[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];
    luminances.push(red * 0.299 + green * 0.587 + blue * 0.114);
  }

  const sorted = [...luminances].sort((a, b) => a - b);
  const darkCutoff = sorted[Math.floor(sorted.length * 0.18)] ?? 75;
  const threshold = clamp(darkCutoff + 18, 28, 95);
  const eyeCenter = averagePoints(eyeContour);
  const radiusX = Math.max(eyeWidth * 0.42, 8);
  const radiusY = Math.max(eyeHeight * 0.9, 6);
  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;
  let darkPixelCount = 0;

  for (let index = 0; index < luminances.length; index++) {
    const luminance = luminances[index];
    if (luminance > threshold) continue;

    const x = startX + (index % width);
    const y = startY + Math.floor(index / width);
    const normalizedX = (x - eyeCenter.x) / radiusX;
    const normalizedY = (y - eyeCenter.y) / radiusY;
    const isInsideEyeSearchArea = normalizedX ** 2 + normalizedY ** 2 <= 1;
    if (!isInsideEyeSearchArea) continue;

    const distanceFromEstimate = distance({ x, y }, estimate);
    if (distanceFromEstimate > eyeWidth * 0.34) continue;

    const weight = (threshold - luminance + 1) ** 1.4;
    weightedX += x * weight;
    weightedY += y * weight;
    totalWeight += weight;
    darkPixelCount++;
  }

  if (darkPixelCount < Math.max(6, eyeWidth * 0.08) || totalWeight === 0) {
    return estimate;
  }

  const refined = {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
  };

  return distance(refined, estimate) <= eyeWidth * 0.28 ? refined : estimate;
};

export const isIrisCenterInsideNearestEye = (
  irisCenter: Point,
  eyeContours: Point[][],
) => {
  const nearestEye = eyeContours.reduce(
    (nearest, contour) => {
      const contourCenter = averagePoints(contour);
      const contourDistance = distance(irisCenter, contourCenter);
      return contourDistance < nearest.distance
        ? { contour, distance: contourDistance }
        : nearest;
    },
    { contour: eyeContours[0], distance: Number.POSITIVE_INFINITY },
  );

  const bounds = getBounds(nearestEye.contour);
  const eyeWidth = Math.max(1, bounds.maxX - bounds.minX);
  const eyeHeight = Math.max(1, bounds.maxY - bounds.minY);
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const horizontalMargin = eyeWidth * 0.08;
  const verticalMargin = eyeHeight * 0.2;

  return (
    irisCenter.x >= bounds.minX - horizontalMargin &&
    irisCenter.x <= bounds.maxX + horizontalMargin &&
    irisCenter.y >= bounds.minY - verticalMargin &&
    irisCenter.y <= centerY + eyeHeight * 0.45
  );
};

/**
 * Estimasi head pose sederhana dari geometri landmark (tanpa transformation matrix):
 * - roll: sudut garis antar-pupil terhadap horizontal
 * - yaw: asimetri jarak hidung ke tepi wajah kiri/kanan
 */
export const estimateHeadPose = (
  pupilA: Point,
  pupilB: Point,
  noseTip: Point,
  leftFaceEdge: Point,
  rightFaceEdge: Point,
) => {
  const rawRollDeg = Math.abs(
    (Math.atan2(pupilB.y - pupilA.y, pupilB.x - pupilA.x) * 180) / Math.PI,
  );
  // Garis antar-pupil bisa mengarah kiri->kanan atau sebaliknya (0° atau 180°)
  const rollDeg = Math.min(rawRollDeg, 180 - rawRollDeg);

  const dLeft = distance(noseTip, leftFaceEdge);
  const dRight = distance(noseTip, rightFaceEdge);
  const yawRatio = Math.abs(dLeft - dRight) / Math.max(1, dLeft + dRight);

  return {
    rollDeg,
    yawRatio,
    isRollOk: rollDeg < 8,
    isYawOk: yawRatio < 0.22,
  };
};
