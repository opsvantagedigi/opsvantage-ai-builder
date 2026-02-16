// Shim for React Compiler runtime when running on React 18.
// React Compiler-generated packages import helpers from "react/compiler-runtime".
// Re-export React APIs so calls like createContext/useState continue to work.
import * as React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";

export const createContext = React.createContext;
export const useContext = React.useContext;
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useMemo = React.useMemo;
export const useCallback = React.useCallback;
export const useRef = React.useRef;
export const useReducer = React.useReducer;
export const useLayoutEffect = React.useLayoutEffect;
export const useImperativeHandle = React.useImperativeHandle;
export const useTransition = React.useTransition;
export const useDeferredValue = React.useDeferredValue;
export const useId = React.useId;
export const useSyncExternalStore = React.useSyncExternalStore;
export const memo = React.memo;
export const forwardRef = React.forwardRef;
export const createElement = React.createElement;
export const cloneElement = React.cloneElement;
export const isValidElement = React.isValidElement;
export const Children = React.Children;
export const Suspense = React.Suspense;
export const lazy = React.lazy;
export const startTransition = React.startTransition;

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
