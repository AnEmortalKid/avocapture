import { NpmInstaller } from "./npmInstaller";
import { ZipInstaller } from "./zipInstaller";

export function getInstallers() {
  return [new ZipInstaller(), new NpmInstaller()];
}
