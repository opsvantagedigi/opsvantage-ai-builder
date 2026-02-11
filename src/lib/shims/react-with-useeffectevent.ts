// Shim React to provide useEffectEvent on React 18 while re-exporting the real module.
import * as ReactReal from "react/index.js";

// Polyfill useEffectEvent if missing (React 19 API)
const useEffectEvent = (fn: (...args: any[]) => any) => ReactReal.useCallback(fn, []);
// @ts-expect-error augment missing export
(ReactReal as any).useEffectEvent = (ReactReal as any).useEffectEvent || useEffectEvent;

export * from "react/index.js";
export { useEffectEvent };
export default ReactReal;
