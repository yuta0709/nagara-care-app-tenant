import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./api-schema/openapi.yaml",
    output: {
      target: "./app/api",
      client: "react-query",
      override: {
        mutator: {
          path: "./app/api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
