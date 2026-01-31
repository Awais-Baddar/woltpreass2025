import "@testing-library/jest-dom/vitest";
import { beforeAll, afterAll, afterEach } from "vitest";
import { configure } from "@testing-library/dom";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

// Make getByTestId() use the spec attribute:
configure({ testIdAttribute: "data-test-id" });

// Cleanup DOM between tests (prevents multiple app copies in <body>)
afterEach(() => cleanup());

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
