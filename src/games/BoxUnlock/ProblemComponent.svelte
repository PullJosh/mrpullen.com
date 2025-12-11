<script lang="ts">
  import { MathQuill } from "svelte-mathquill";
  import {
    areFactoredPolynomialsEqual,
    parseFactoredLatex,
    parseLatexPolynomial,
    simplifiedPolynomialsAreEqual,
    type FactoredPolynomial,
    type SimplifiedPolynomial,
  } from "./parseInput";
  import Katex from "../../components/Katex.svelte";

  const {
    problemNumber,
    answerType,
    prompt,
    answer,
    nextProblem,
  }: {
    problemNumber: number;
    answerType: "simplified" | "factorized";
    prompt: {
      text?: string;
      math?: string;
      defaultAnswer?: string;
    };
    answer: SimplifiedPolynomial | FactoredPolynomial;

    nextProblem?: () => string;
  } = $props();

  let latex = $state(prompt.defaultAnswer ?? "");

  const correct = $derived(
    answerType === "simplified"
      ? simplifiedPolynomialsAreEqual(
          parseLatexPolynomial(latex),
          answer as SimplifiedPolynomial
        ) && parseLatexPolynomial(latex).isSimplified
      : areFactoredPolynomialsEqual(
          parseFactoredLatex(latex),
          answer as FactoredPolynomial
        )
  );
  let answerSubmitted = $state(false);
</script>

<div class="box">
  <strong style:display="block">Lock #{problemNumber}</strong>
  {#if prompt.text}
    <div>{prompt.text}</div>
  {/if}
  {#if prompt.math}
    <div><Katex latex={prompt.math} /></div>
  {/if}

  <br />

  <strong style:display="block">Answer</strong>
  <div style="display: flex; align-items: stretch; gap: 8px;">
    {#if answerSubmitted && correct}
      <Katex {latex} />
    {:else}
      <MathQuill
        style="flex-grow:1;"
        bind:latex={
          () => latex,
          (value) => {
            answerSubmitted = false;
            latex = value;
          }
        }
      />
    {/if}
    {#if prompt.defaultAnswer}
      <button
        onclick={() => (latex = prompt.defaultAnswer ?? "")}
        disabled={answerSubmitted && correct}>Reset</button
      >
    {/if}
  </div>

  <br />

  <div>
    {#if answerSubmitted}
      {#if correct}
        ✅ Correct! <button
          onclick={() => {
            if (nextProblem) {
              const newLatex = nextProblem();
              latex = newLatex ?? "";
              answerSubmitted = false;
            }
          }}
          disabled={!nextProblem}>Next</button
        >
      {:else}
        ❌ Incorrect. Try again.
      {/if}
    {:else}
      <button onclick={() => (answerSubmitted = true)}>Submit Answer</button>
    {/if}
  </div>
</div>

<style>
  .box {
    border: 2px solid black;
    min-width: 300px;
    padding: 16px;
  }
</style>
