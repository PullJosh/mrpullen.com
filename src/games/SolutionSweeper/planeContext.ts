import { createContext } from "svelte";

interface PlaneCtx {
  domain: [number, number];
  range: [number, number];
}

export const [getPlaneContext, setPlaneContext] = createContext<PlaneCtx>();
