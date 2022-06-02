
export class BasePlugin {

  name() {
    // todo maybe don't need if things export?
    throw new Error("Unimplemented");
  }

  initialize(settings) {
    throw new Error("Unimplemented");
  }

  teardown() {
    throw new Error("Unimplemented");
  }

  notifyModifying() {
    throw new Error("Unimplemented");
  }

  notifyModifyApply(newSettings) {
    throw new Error("Unimplemented");
  }

  notifyModifyCancel() {
    throw new Error("Unimplemented");
  }

}