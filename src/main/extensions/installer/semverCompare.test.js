import { semVerCompare } from "./semverCompare";


describe('semverCompare', () => {

  const versionTests = [
    ['0.0.1', '0.0.1', 0],
    ['0.0.2', '0.0.1', 1],
    ['0.0.1', '0.0.2', -1],
    ['0.1.0', '0.0.1', 1],
    ['0.0.1', '0.1.0', -1],
    ['0.1.1', '0.1.0', 1],
    ['0.1.1', '0.1.2', -1],
    ['0.1.2', '0.1.2', 0],
    ['0.3.0', '0.1.0', 1],
    ['1.0.0', '0.1.0', 1],
    ['1.0.0', '1.1.0', -1],
    ['1.0.0', '2.0.0', -1],
    ['1.0.0', '1.0.0', 0],
  ]
  test.each(versionTests)("compares (%s,%s) correctly as %s", (left, right, outcome) => {
    expect(semVerCompare(left, right)).toEqual(outcome);
  });
});