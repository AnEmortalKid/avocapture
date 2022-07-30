import { AppLoader } from "./appLoader";

describe("AppLoader", () => {
  test("calls onFinished callback after function completes", async () => {
    const al = new AppLoader();

    let onFinished = jest.fn();

    al.onFinished(onFinished);
    await al.load(jest.fn());

    expect(onFinished).toHaveBeenCalled();
  });
});
