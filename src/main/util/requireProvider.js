
import { createRequire } from "module";

export function requireProvider() {
  return createRequire(import.meta.url);
}