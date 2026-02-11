// Shim for React Compiler runtime when running on React 18
// React Compiler-generated packages expect helper exports from "react/compiler-runtime".
// We provide minimal no-op/helpers that map to existing React/JSX runtime functions.
import * as ReactJSXRuntime from "react/jsx-runtime";

// Export named helper `c` expected by @portabletext editor plugins.
// It typically wraps a value for memoization; here we just return the input or invoke if function.
export const c = <T>(value: T): T => {
  if (typeof value === "function") {
    // If compiler hands us a thunk, execute it once.
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (value as unknown as Function)() as T;
  }
  return value;
};

// Fallback re-export of jsx helpers to keep parity with jsx-runtime if requested.
export const jsx = ReactJSXRuntime.jsx;
export const jsxs = ReactJSXRuntime.jsxs;
export const Fragment = ReactJSXRuntime.Fragment;
