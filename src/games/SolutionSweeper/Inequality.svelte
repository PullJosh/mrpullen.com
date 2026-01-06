<script lang="ts">
  import { getPlaneContext } from "./planeContext";

  interface Props {
    point: [number, number];
    slope: number;

    stroke: "solid" | "dashed" | "none";
    fillSide: "above" | "below" | "none";
    color: "red" | "blue";
  }

  const { point, slope, stroke, fillSide, color }: Props = $props();

  const { domain, range } = getPlaneContext();

  // Keep in mind that SVG y-coordinates increase downward
  // but we want mathematical slope (rise over run, where positive y is up)

  function f(x: number): number {
    return slope * (x - point[0]) + point[1];
  }

  const x1 = domain[0];
  const y1 = f(x1);
  const x2 = domain[1];
  const y2 = f(x2);
</script>

<line
  x1="{((x1 - domain[0]) / (domain[1] - domain[0])) * 100}%"
  y1="{100 - ((y1 - range[0]) / (range[1] - range[0])) * 100}%"
  x2="{((x2 - domain[0]) / (domain[1] - domain[0])) * 100}%"
  y2="{100 - ((y2 - range[0]) / (range[1] - range[0])) * 100}%"
  stroke={color}
  stroke-width="2"
  stroke-dasharray={stroke === "dashed" ? "4,4" : "none"}
  visibility={stroke === "none" ? "hidden" : "visible"}
/>

<pattern
  id="diagonalHatchRightRed"
  patternUnits="userSpaceOnUse"
  width="2"
  height="2"
>
  <rect width="2" height="2" fill="red" fill-opacity="0.2" />
  <path
    d="M-0.5,0.5 l1,-1
           M0,2 l2,-2
           M1.5,2.5 l1,-1"
    style="stroke:red; stroke-width:0.3"
    stroke-opacity="0.4"
  />
</pattern>

<pattern
  id="diagonalHatchLeftBlue"
  patternUnits="userSpaceOnUse"
  width="2"
  height="2"
>
  <rect width="2" height="2" fill="blue" fill-opacity="0.2" />
  <path
    d="M0,0 l2,2
           M-0.5,1.5 l1,1
           M1.5,-0.5 l1,1"
    style="stroke:blue; stroke-width:0.3"
    stroke-opacity="0.4"
  />
</pattern>

{#if fillSide === "above"}
  {@const points = [
    `${((domain[0] - domain[0]) / (domain[1] - domain[0])) * 100},${100 - ((f(domain[0]) - range[0]) / (range[1] - range[0])) * 100}`,
    `${((domain[1] - domain[0]) / (domain[1] - domain[0])) * 100},${100 - ((f(domain[1]) - range[0]) / (range[1] - range[0])) * 100}`,
    `100,0`,
    `0,0`,
  ].join(" ")}
  <polygon
    {points}
    fill={color === "red"
      ? "url(#diagonalHatchRightRed)"
      : "url(#diagonalHatchLeftBlue)"}
  />
{:else if fillSide === "below"}
  {@const points = [
    `${((domain[0] - domain[0]) / (domain[1] - domain[0])) * 100},${100 - ((f(domain[0]) - range[0]) / (range[1] - range[0])) * 100}`,
    `${((domain[1] - domain[0]) / (domain[1] - domain[0])) * 100},${100 - ((f(domain[1]) - range[0]) / (range[1] - range[0])) * 100}`,
    `100,100`,
    `0,100`,
  ].join(" ")}
  <polygon
    {points}
    fill={color === "red"
      ? "url(#diagonalHatchRightRed)"
      : "url(#diagonalHatchLeftBlue)"}
  />
{/if}
