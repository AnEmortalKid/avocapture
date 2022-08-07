import { NpmInstaller } from "./npmInstaller";

export function getInstallers() {
  return [new NpmInstaller()];
}
