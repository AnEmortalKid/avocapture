import { NpmInstaller } from "./npmInstaller";
import { ZipInstaller } from "./ZipInstaller";

export function getInstallers() {
  return [new ZipInstaller(), new NpmInstaller()];
}
