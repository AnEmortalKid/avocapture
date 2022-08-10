import { ZipInstaller } from "./ZipInstaller";

describe("ZipInstaller", () => {
  test("y", async () => {
    const zi = new ZipInstaller();
    zi.installTo(
      "J:\\Workspaces\\avocapture\\builtin\\ziptest\\avocapture-search-on-hotkey.zip",
      "J:\\Workspaces\\avocapture\\builtin\\ziptest\\dest"
    );
    await Promise.resolve();
  });
});
