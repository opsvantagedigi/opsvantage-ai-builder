// Shim for React Compiler runtime when running on React 18.
// React Compiler-generated packages import helpers from "react/compiler-runtime".
// Re-export React APIs so calls like createContext/useState continue to work.
import * as React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

export * from "react";

// Export named helper `c` expected by React Compiler output.
// If a thunk is provided, execute it once, otherwise return the value.
export const c = <T>(value: T): T => {
  if (typeof value === "function") {
    return (value as unknown as () => T)();
  }
  return value;
};

export const jsx = ReactJSXRuntime.jsx;
export const jsxs = ReactJSXRuntime.jsxs;
export const Fragment = ReactJSXRuntime.Fragment;

export default React;
