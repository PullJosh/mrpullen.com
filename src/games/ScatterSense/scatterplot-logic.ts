// Define the type for a point.
export interface Point {
  x: number;
  y: number;
}

// Helper: Generate a normally distributed random number (mean = 0, stddev = 1)
// using the Box–Muller transform.
function gaussianRandom(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Avoid 0
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Helper: Get a random integer between min and max (inclusive).
function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Helper: Append a random number of outlier points to the existing inlier points.
// Outliers are uniformly generated over a slightly expanded area.
function addOutliers(
  points: Point[],
  outlierFractionRange: [number, number] = [0, 0.15],
  margin: number = 0.2
): Point[] {
  const n = points.length;
  // Choose a random fraction within the given range.
  const fraction =
    outlierFractionRange[0] +
    Math.random() * (outlierFractionRange[1] - outlierFractionRange[0]);
  const numOutliers = randomInt(0, Math.floor(fraction * n));
  for (let i = 0; i < numOutliers; i++) {
    // Outliers are generated over a slightly wider area than [0, 1].
    const x = -margin + Math.random() * (1 + 2 * margin);
    const y = -margin + Math.random() * (1 + 2 * margin);
    points.push({ x, y });
  }
  return points;
}

// Helper: Move/scale the points so that no point is outside the [0, 1] range.
// Also apply a small margin to keep points away from the edges.
function fitWindow(points: Point[], margin: number = 0.1): Point[] {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  return points.map((p) => ({
    x: ((p.x - minX) / xRange) * (1 - 2 * margin) + margin,
    y: ((p.y - minY) / yRange) * (1 - 2 * margin) + margin,
  }));
}

// Helper: Randomize the order of the points.
function shufflePoints(points: Point[]): Point[] {
  const shuffled = points.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper: Apply all post-processing steps to the generated points.
function postProcess(points: Point[]): Point[] {
  return fitWindow(shufflePoints(points));
}

/**
 * Generates a linear-ish scatter plot with extra variability.
 *
 * The slope and noise are randomly chosen from wide ranges, and the line is
 * constructed to pass near (0.5, 0.5). Inlier x-values are drawn from [0.1, 0.9]
 * to keep the data centered.
 *
 * @param pointsRange Range for number of inlier points (default [30, 120])
 * @param slopeRange Range for the line's slope (default [-5, 5])
 * @param noiseRange Range for the noise magnitude (default [0.01, 0.5])
 * @param outlierFractionRange Fraction of inlier count to use as outliers (default [0, 0.15])
 */
export function generateLinearScatter(
  pointsRange: [number, number] = [30, 120],
  slopeRange: [number, number] = [-5, 5],
  noiseRange: [number, number] = [0.01, 0.5],
  outlierFractionRange: [number, number] = [0, 0.15]
): Point[] {
  const numPoints = randomInt(pointsRange[0], pointsRange[1]);
  const slope = slopeRange[0] + Math.random() * (slopeRange[1] - slopeRange[0]);
  const noise = noiseRange[0] + Math.random() * (noiseRange[1] - noiseRange[0]);
  // Compute intercept so that the line passes through (0.5, 0.5).
  const intercept = 0.5 - slope * 0.5;
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const x = 0.1 + Math.random() * 0.8; // Keep x mostly in [0.1, 0.9]
    const n = gaussianRandom() * noise;
    const y = slope * x + intercept + n;
    points.push({ x, y });
  }
  return postProcess(addOutliers(points, outlierFractionRange));
}

/**
 * Generates an elliptical scatter plot with extra variability.
 *
 * The horizontal and vertical spreads (sigmaX, sigmaY) and rotation angle are
 * randomly chosen from wide ranges. Most points will cluster around the center.
 *
 * @param pointsRange Range for number of inlier points (default [30, 120])
 * @param center Center of the ellipse (default { x: 0.5, y: 0.5 })
 * @param sigmaXRange Range for the standard deviation in the x-direction (default [0.03, 0.2])
 * @param sigmaYRange Range for the standard deviation in the y-direction (default [0.03, 0.2])
 * @param angleRange Range for the rotation angle in radians (default [0, 2π])
 * @param outlierFractionRange Fraction of inlier count to use as outliers (default [0, 0.15])
 */
export function generateEllipticalScatter(
  pointsRange: [number, number] = [30, 120],
  center: Point = { x: 0.5, y: 0.5 },
  sigmaXRange: [number, number] = [0.03, 0.2],
  sigmaYRange: [number, number] = [0.03, 0.2],
  angleRange: [number, number] = [0, 2 * Math.PI],
  outlierFractionRange: [number, number] = [0, 0.15]
): Point[] {
  const numPoints = randomInt(pointsRange[0], pointsRange[1]);
  const sigmaX =
    sigmaXRange[0] + Math.random() * (sigmaXRange[1] - sigmaXRange[0]);
  const sigmaY =
    sigmaYRange[0] + Math.random() * (sigmaYRange[1] - sigmaYRange[0]);
  const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const u = gaussianRandom() * sigmaX;
    const v = gaussianRandom() * sigmaY;
    const xOffset = u * cosA - v * sinA;
    const yOffset = u * sinA + v * cosA;
    points.push({ x: center.x + xOffset, y: center.y + yOffset });
  }
  return postProcess(addOutliers(points, outlierFractionRange));
}

/**
 * Generates a clustered ("patchy") scatter plot with extra variability.
 *
 * The number of clusters is randomly chosen from a range, and each cluster's
 * center is generated in a narrower region (to keep clusters near the center).
 * Cluster spreads are chosen randomly from a wide range.
 *
 * @param pointsRange Range for number of inlier points (default [30, 120])
 * @param clusterCountRange Range for the number of clusters (default [2, 5])
 * @param clusterSpreadRange Range for the cluster spread (default [0.01, 0.2])
 * @param outlierFractionRange Fraction of inlier count to use as outliers (default [0, 0.15])
 */
export function generateClusteredScatter(
  pointsRange: [number, number] = [30, 120],
  clusterCountRange: [number, number] = [2, 5],
  clusterSpreadRange: [number, number] = [0.01, 0.2],
  outlierFractionRange: [number, number] = [0, 0.15]
): Point[] {
  const numPoints = randomInt(pointsRange[0], pointsRange[1]);
  const numClusters = randomInt(clusterCountRange[0], clusterCountRange[1]);
  const points: Point[] = [];
  // Generate cluster centers within a central sub-region.
  const clusters: Point[] = [];
  for (let i = 0; i < numClusters; i++) {
    clusters.push({
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
    });
  }
  const clusterSpread =
    clusterSpreadRange[0] +
    Math.random() * (clusterSpreadRange[1] - clusterSpreadRange[0]);
  for (let i = 0; i < numPoints; i++) {
    const cluster = clusters[randomInt(0, numClusters - 1)];
    const x = cluster.x + gaussianRandom() * clusterSpread;
    const y = cluster.y + gaussianRandom() * clusterSpread;
    points.push({ x, y });
  }
  return postProcess(addOutliers(points, outlierFractionRange));
}

/**
 * Generates a non-linear scatter plot with extra variability.
 *
 * Four different trends are supported—quadratic, exponential, sinusoidal, and
 * circular—and the underlying parameters of each shape are randomized so that
 * you get a different type of non-linear pattern each time. Inlier x-values
 * are kept in a central range.
 *
 * @param type The type of non-linear trend. If not provided, one is chosen at random.
 *             (Supported types: 'quadratic', 'exponential', 'sinusoidal', 'circular')
 * @param pointsRange Range for number of inlier points (default [30, 120])
 * @param noiseRange Range for noise to add (default [0.01, 0.5])
 * @param outlierFractionRange Fraction of inlier count to use as outliers (default [0, 0.15])
 */
export function generateNonlinearScatter(
  type: "quadratic" | "exponential" | "sinusoidal" | "circular" = (
    ["quadratic", "exponential", "sinusoidal", "circular"] as const
  )[randomInt(0, 3)],
  pointsRange: [number, number] = [30, 120],
  noiseRange: [number, number] = [0.01, 0.5],
  outlierFractionRange: [number, number] = [0, 0.15]
): Point[] {
  const numPoints = randomInt(pointsRange[0], pointsRange[1]);
  const points: Point[] = [];
  const noise = noiseRange[0] + Math.random() * (noiseRange[1] - noiseRange[0]);

  switch (type) {
    case "quadratic": {
      // Quadratic: y = 1 - a*(x - 0.5)^2 with a in [1, 4]
      const a = 1 + Math.random() * 3;
      for (let i = 0; i < numPoints; i++) {
        const x = 0.1 + Math.random() * 0.8;
        let y = 1 - a * Math.pow(x - 0.5, 2);
        y += gaussianRandom() * noise;
        points.push({ x, y });
      }
      break;
    }
    case "exponential": {
      // Exponential: y = (exp(k*x) - 1) / (exp(k) - 1) with k in [1, 4]
      const k = 1 + Math.random() * 3;
      for (let i = 0; i < numPoints; i++) {
        const x = 0.1 + Math.random() * 0.8;
        let y = (Math.exp(k * x) - 1) / (Math.exp(k) - 1);
        y += gaussianRandom() * noise;
        points.push({ x, y });
      }
      break;
    }
    case "sinusoidal": {
      // Sinusoidal: y = 0.5 + A * sin(2π * f * x + φ)
      const amplitude = 0.2 + Math.random() * 0.3; // [0.2, 0.5]
      const frequency = 1 + Math.random() * 2; // [1, 3]
      const phase = Math.random() * 2 * Math.PI;
      for (let i = 0; i < numPoints; i++) {
        const x = 0.1 + Math.random() * 0.8;
        let y = 0.5 + amplitude * Math.sin(2 * Math.PI * frequency * x + phase);
        y += gaussianRandom() * noise;
        points.push({ x, y });
      }
      break;
    }
    case "circular": {
      // Circular: Points arranged around a circle centered at (0.5, 0.5)
      // Base radius is randomized in [0.2, 0.4].
      const baseRadius = 0.2 + Math.random() * 0.2;
      for (let i = 0; i < numPoints; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r = baseRadius + gaussianRandom() * noise;
        const x = 0.5 + r * Math.cos(theta);
        const y = 0.5 + r * Math.sin(theta);
        points.push({ x, y });
      }
      break;
    }
  }
  return postProcess(addOutliers(points, outlierFractionRange));
}

/**
 * Generates a completely random scatter plot with a uniform distribution.
 *
 * Inlier points are generated in a slightly tighter range ([0.05, 0.95]) to keep
 * them centered, and outliers are added as usual.
 *
 * @param pointsRange Range for number of inlier points (default [30, 120])
 * @param outlierFractionRange Fraction of inlier count to use as outliers (default [0, 0.15])
 */
export function generateRandomScatter(
  pointsRange: [number, number] = [30, 120],
  outlierFractionRange: [number, number] = [0, 0.15]
): Point[] {
  const numPoints = randomInt(pointsRange[0], pointsRange[1]);
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    // Generate inliers in a centered range.
    const x = 0.05 + Math.random() * 0.9;
    const y = 0.05 + Math.random() * 0.9;
    points.push({ x, y });
  }
  return postProcess(addOutliers(points, outlierFractionRange));
}

export function getCorrelationCoefficient(points: Point[]) {
  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);
  const sumYY = points.reduce((acc, p) => acc + p.y * p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
  );
  return numerator / denominator;
}
