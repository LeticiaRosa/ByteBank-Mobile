// Re-export both server and client environments
// export { serverEnv } from "./server.js";
export { clientEnv } from "./client.js";

// Types
// export type ServerEnv = typeof import("./server.js").serverEnv;
export type ClientEnv = typeof import("./client.js").clientEnv;
