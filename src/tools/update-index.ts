import { rebuildIndex } from "../utils/index-updater.js";

export function updateIndex(): string {
  rebuildIndex();
  return JSON.stringify({
    message: "Index rebuilt successfully.",
  });
}
