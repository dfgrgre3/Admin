"use client";

// Barrel — each domain's API calls live in its own module (see the files in
// this folder). Split out of a single 476-line api.ts so each concern is easy
// to find and review independently.

export * from "./mappers";
export * from "./draft-api";
export * from "./reference-api";
export * from "./teachers-api";
export * from "./chapters-api";
export * from "./lessons-api";
export * from "./pricing-api";
export * from "./videos-api";
export * from "./files-api";
export * from "./exams-api";
export * from "./assignments-api";
export * from "./certificates-api";
export * from "./seo-api";
