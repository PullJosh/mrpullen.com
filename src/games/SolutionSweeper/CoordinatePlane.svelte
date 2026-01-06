<script lang="ts">
  import type { Snippet } from "svelte";
  import { setPlaneContext } from "./planeContext";

  interface Props {
    domain: [number, number];
    range: [number, number];
    children?: Snippet;
  }

  const { domain, range, children }: Props = $props();

  function getTicks(start: number, end: number): number[] {
    const ticks = [];
    for (let i = Math.floor(start); i <= Math.ceil(end); i++) {
      ticks.push(i);
    }
    return ticks;
  }

  const xTicks = $derived(getTicks(...domain));
  const yTicks = $derived(getTicks(...range));

  setPlaneContext({ domain, range });
  $effect(() => {
    setPlaneContext({ domain, range });
  });
</script>

<svg
  width="100%"
  height="100%"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
  <g>
    {#each xTicks as xTick}
      <line
        x1="{((xTick - domain[0]) / (domain[1] - domain[0])) * 100}%"
        y1="0"
        x2="{((xTick - domain[0]) / (domain[1] - domain[0])) * 100}%"
        y2="100%"
        stroke="#ccc"
        stroke-width="0.5"
        stroke-dasharray="2,2"
      />
    {/each}

    {#each yTicks as yTick}
      <line
        x1="0"
        y1="{((yTick - range[0]) / (range[1] - range[0])) * 100}%"
        x2="100%"
        y2="{((yTick - range[0]) / (range[1] - range[0])) * 100}%"
        stroke="#ccc"
        stroke-width="0.5"
        stroke-dasharray="2,2"
      />
    {/each}

    <line
      x1="0"
      y1="{((0 - range[0]) / (range[1] - range[0])) * 100}%"
      x2="100%"
      y2="{((0 - range[0]) / (range[1] - range[0])) * 100}%"
      stroke="black"
      stroke-width="0.5"
    />
    <line
      x1="{((0 - domain[0]) / (domain[1] - domain[0])) * 100}%"
      y1="0"
      x2="{((0 - domain[0]) / (domain[1] - domain[0])) * 100}%"
      y2="100%"
      stroke="black"
      stroke-width="0.5"
    />
  </g>

  {@render children?.()}
</svg>
