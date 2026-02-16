// Shim React to provide useEffectEvent on React 18 while re-exporting the real module.
import * as ReactReal from "react";

// Polyfill useEffectEvent if missing (React 19 API)
const useEffectEvent = (fn: (...args: any[]) => any) => ReactReal.useCallback(fn, []);
(ReactReal as any).useEffectEvent = (ReactReal as any).useEffectEvent || useEffectEvent;

export const createContext = ReactReal.createContext;
export const useContext = ReactReal.useContext;
export const useState = ReactReal.useState;
export const useEffect = ReactReal.useEffect;
export const useMemo = ReactReal.useMemo;
export const useCallback = ReactReal.useCallback;
export const useRef = ReactReal.useRef;
export const useReducer = ReactReal.useReducer;
export const useLayoutEffect = ReactReal.useLayoutEffect;
export const memo = ReactReal.memo;
export const forwardRef = ReactReal.forwardRef;
export const createElement = ReactReal.createElement;
export const Fragment = ReactReal.Fragment;
export { useEffectEvent };
export default ReactReal;
