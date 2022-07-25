export function semVerCompare(oldVer, newVer) {
  const oldChunks = oldVer.split(".").map((i) => parseInt(i));
  const newChunks = newVer.split(".").map((i) => parseInt(i));

  // compare equal numbers, return difference if not equal
  for (var i = 0; i < 3; i++) {
    if (oldChunks[i] !== newChunks[i]) {
      if (oldChunks[i] > newChunks[i]) {
        return 1;
      }
      return -1;
    }
  }

  // everything is equal
  return 0;
}
