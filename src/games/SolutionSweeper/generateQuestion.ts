export interface Inequality {
  point: [number, number];
  slope: number;
  stroke: "solid" | "dashed" | "none";
  fillSide: "above" | "below" | "none";
}

export interface Question {
  id: string;
  inequalities: Inequality[];
  points: {
    coordinates: [number, number];
    isSolution: boolean;
  }[];
}

function generateInequality({
  fillSideOptions = ["above", "below", "none"],
  strokeOptions = ["solid", "dashed"],
}: {
  fillSideOptions?: ("above" | "below" | "none")[];
  strokeOptions?: ("solid" | "dashed")[];
} = {}): Inequality {
  const point: [number, number] = [
    Math.floor(Math.random() * 9) - 4,
    Math.floor(Math.random() * 9) - 4,
  ];

  const slopeOptions = [-2, -1, -0.5, 0.5, 1, 2];
  const slope = slopeOptions[Math.floor(Math.random() * slopeOptions.length)];

  const fillSide =
    fillSideOptions[Math.floor(Math.random() * fillSideOptions.length)];

  const stroke =
    fillSide === "none"
      ? "solid"
      : strokeOptions[Math.floor(Math.random() * strokeOptions.length)];

  return { point, slope, stroke, fillSide };
}

export function generateQuestion(level: 1 | 2 | 3 | 4 | 5 | 6 | 7): Question {
  switch (level) {
    case 1: {
      const inequality = generateInequality({
        strokeOptions: ["solid"],
        fillSideOptions: ["none"],
      });

      const f = (x: number): number =>
        inequality.slope * (x - inequality.point[0]) + inequality.point[1];

      const truePoints = select(
        getAllCorrectPointsOnLine(f),
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(truePoints, [inequality], 4);

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality],
        points,
      };
    }
    case 2: {
      const inequality = generateInequality({
        strokeOptions: ["solid"],
        fillSideOptions: ["above", "below", "none"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(truePoints, [inequality], 4);

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality],
        points,
      };
    }
    case 3: {
      const inequality = generateInequality({
        strokeOptions: ["dashed"],
        fillSideOptions: ["above", "below"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(truePoints, [inequality], 4);

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality],
        points,
      };
    }
    case 4: {
      const inequality = generateInequality({
        strokeOptions: ["solid", "dashed"],
        fillSideOptions: ["above", "below", "none"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(truePoints, [inequality], 4);

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality],
        points,
      };
    }
    case 5: {
      const inequality1 = generateInequality({
        strokeOptions: ["solid"],
        fillSideOptions: ["above", "below"],
      });

      const inequality2 = generateInequality({
        strokeOptions: ["solid"],
        fillSideOptions: ["above", "below"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality1, inequality2],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(
        truePoints,
        [inequality1, inequality2],
        4
      );

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality1, inequality2],
        points,
      };
    }
    case 6: {
      const inequality1 = generateInequality({
        strokeOptions: ["solid", "dashed"],
        fillSideOptions: ["above", "below"],
      });

      const inequality2 = generateInequality({
        strokeOptions: ["solid"],
        fillSideOptions: ["none"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality1, inequality2],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(
        truePoints,
        [inequality1, inequality2],
        4
      );

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality1, inequality2],
        points,
      };
    }
    case 7: {
      const inequality1 = generateInequality({
        strokeOptions: ["solid", "dashed"],
        fillSideOptions: ["above", "below", "none"],
      });

      const inequality2 = generateInequality({
        strokeOptions: ["solid", "dashed"],
        fillSideOptions: ["above", "below", "none"],
      });

      const truePoints = generateTruePointsForInequalities(
        [inequality1, inequality2],
        Math.floor(Math.random() * 3) + 1
      );

      const points = generateDecoyPoints(
        truePoints,
        [inequality1, inequality2],
        4
      );

      return {
        id: Math.random().toString(36).substring(2),
        inequalities: [inequality1, inequality2],
        points,
      };
    }
    default: {
      level satisfies never;
      throw new Error("Unsupported level");
    }
  }
}

function getAllCorrectPointsOnLine(
  f: (x: number) => number
): [number, number][] {
  const xOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  return xOptions
    .map((x) => [x, f(x)] as [number, number])
    .filter(([, y]) => y > -5 && y < 5);
}

function select<T>(arr: T[], n: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function generateDecoyPoints(
  truePoints: [number, number][],
  inequalities: Inequality[],
  desiredTotalCount: number
): { coordinates: [number, number]; isSolution: boolean }[] {
  const isTrue = (pt: [number, number]) => {
    return inequalities.every((inequality) => pointChecker(inequality)(pt));
  };

  const xOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const yOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  let decoyPointOptions: [number, number][] = [];
  for (const x of xOptions) {
    for (const y of yOptions) {
      const point: [number, number] = [x, y];
      if (!isTrue(point)) {
        decoyPointOptions.push(point);
      }
    }
  }

  for (const x of xOptions) {
    for (const line of inequalities) {
      const y = line.slope * (x - line.point[0]) + line.point[1];
      const point: [number, number] = [x, y];
      if (
        y > -5 &&
        y < 5 &&
        !isTrue(point) &&
        !decoyPointOptions.some((pt) => pt[0] === x && pt[1] === y)
      ) {
        decoyPointOptions.push(point);
      }
    }
  }

  const decoyPointsOnABoundary = decoyPointOptions.filter((pt) =>
    isOnAtLeastOneBoundary(pt, inequalities)
  );

  const decoyPointsNotOnABoundary = decoyPointOptions.filter(
    (pt) => !isOnAtLeastOneBoundary(pt, inequalities)
  );

  const chosenDecoyPoints: [number, number][] = selectHalfFromFirstArray(
    decoyPointsOnABoundary,
    decoyPointsNotOnABoundary,
    desiredTotalCount - truePoints.length
  );

  return [
    ...truePoints.map((pt) => ({ coordinates: pt, isSolution: true })),
    ...chosenDecoyPoints.map((pt) => ({ coordinates: pt, isSolution: false })),
  ];
}

function generateTruePointsForInequalities(
  inequalities: Inequality[],
  desiredCount: number
): [number, number][] {
  const truePoints: [number, number][] = [];
  const xOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const yOptions = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  for (const x of xOptions) {
    for (const y of yOptions) {
      const point: [number, number] = [x, y];
      if (inequalities.every((inequality) => pointChecker(inequality)(point))) {
        truePoints.push(point);
      }
    }
  }

  for (const line of inequalities) {
    for (const x of xOptions) {
      const y = line.slope * (x - line.point[0]) + line.point[1];
      const point: [number, number] = [x, y];
      if (
        y > -5 &&
        y < 5 &&
        !truePoints.some((pt) => pt[0] === x && pt[1] === y) &&
        inequalities.every((inequality) => pointChecker(inequality)(point))
      ) {
        truePoints.push(point);
      }
    }
  }

  const truePointsOnABoundary = truePoints.filter((pt) =>
    isOnAtLeastOneBoundary(pt, inequalities)
  );

  const truePointsNotOnABoundary = truePoints.filter(
    (pt) => !isOnAtLeastOneBoundary(pt, inequalities)
  );

  console.log(
    "True points on a boundary:",
    truePointsOnABoundary,
    "True points not on a boundary:",
    truePointsNotOnABoundary
  );

  let selectedPoints: [number, number][] = selectHalfFromFirstArray(
    truePointsOnABoundary,
    truePointsNotOnABoundary,
    desiredCount
  );

  return selectedPoints;
}

function isOnAtLeastOneBoundary(
  point: [number, number],
  inequalities: Inequality[]
): boolean {
  return inequalities.some((inequality) => {
    const checker = pointChecker({
      ...inequality,
      fillSide: "none",
      stroke: "solid",
    });
    return checker(point);
  });
}

function pointChecker(
  inequality: Inequality
): (pt: [number, number]) => boolean {
  const { point, slope, fillSide, stroke } = inequality;

  return (pt: [number, number]) => {
    const [x0, y0] = point;
    const [x, y] = pt;

    const lineY = slope * (x - x0) + y0;

    if (fillSide === "above") {
      if (stroke === "dashed") {
        return y > lineY;
      } else {
        return y >= lineY;
      }
    } else if (fillSide === "below") {
      if (stroke === "dashed") {
        return y < lineY;
      } else {
        return y <= lineY;
      }
    } else {
      return y === lineY;
    }
  };
}

function selectHalfFromFirstArray<T>(
  arr1: T[],
  arr2: T[],
  totalCount: number
): T[] {
  const selected: T[] = [];
  for (let i = 0; i < Math.ceil(totalCount / 2); i++) {
    if (arr1.length === 0) break;
    const index = Math.floor(Math.random() * arr1.length);
    selected.push(arr1.splice(index, 1)[0]);
  }
  while (selected.length < totalCount && arr2.length > 0) {
    const index = Math.floor(Math.random() * arr2.length);
    selected.push(arr2.splice(index, 1)[0]);
  }
  return selected;
}
