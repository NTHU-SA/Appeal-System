import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      // fileURLToPath decodes non-ASCII folders and Windows drive letters.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
