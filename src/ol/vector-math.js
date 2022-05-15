export function elementWiseVectorProduct(va, vb) {
  return [va[0] * vb[0], va[1] * vb[1]];
}

export function addVectors(va, vb, vc) {
  if (vc) {
    return [va[0] + vb[0] + vc[0], va[1] + vb[1] + vc[1]];
  }
  return [va[0] + vb[0], va[1] + vb[1]];
}

export function scaleVector(v, c) {
  return [v[0] * c, v[1] * c];
}

/**
 * @returns the planar distance between the coordinates of two points.
 * @private
 */
export function getPlanarDistance(p0, p1) {
  return Math.hypot(Math.abs(p0[0] - p1[0]), Math.abs(p0[1] - p1[1]));
}

/**
 * @returns a vector which is orthogonal to the line between two points.
 * @private
 */
export function getOrthogonalBasisVector(cp1, cp2) {
  const cp3 = [cp1[0], cp2[1]];
  const cp4 = [cp2[0], cp1[1]];

  const len = getPlanarDistance(cp1, cp2);
  const rise = getPlanarDistance(cp1, cp3);
  const run = getPlanarDistance(cp1, cp4);

  const riseFactor = rise / len;
  let runFactor = run / len;

  if (((cp1[0] - cp2[0]) * (cp1[1] - cp2[1])) < 0) {
    runFactor *= -1;
  }

  return [
    (-1) * riseFactor,
    runFactor,
  ];
}
