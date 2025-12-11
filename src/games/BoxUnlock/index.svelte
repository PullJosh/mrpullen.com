<script lang="ts">
  import { MathQuillSetup, MathQuillSetupCDN } from "svelte-mathquill";
  import {
    type FactoredPolynomial,
    type SimplifiedPolynomial,
  } from "./parseInput";
  import ProblemComponent from "./ProblemComponent.svelte";

  type Problem =
    | {
        answerType: "simplified";
        prompt: {
          text?: string;
          math?: string;
          defaultAnswer?: string;
        };
        answer: SimplifiedPolynomial;
      }
    | {
        answerType: "factorized";
        prompt: {
          text?: string;
          math?: string;
          defaultAnswer?: string;
        };
        answer: FactoredPolynomial;
      };

  const problems: Problem[] = [
    {
      // #1
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`\left(x+2\right)\left(x-5\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 1, exponent: 2 },
          { coefficient: -3, exponent: 1 },
          { coefficient: -10, exponent: 0 },
        ],
        isSimplified: true,
      },
    },
    {
      // #2
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`\left(6x+2\right)\left(3x-7\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 18, exponent: 2 },
          { coefficient: -36, exponent: 1 },
          { coefficient: -14, exponent: 0 },
        ],
        isSimplified: true,
      },
    },
    {
      // #3
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`\left(3x-7\right)\left(2x+9\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 6, exponent: 2 },
          { coefficient: 13, exponent: 1 },
          { coefficient: -63, exponent: 0 },
        ],
        isSimplified: true,
      },
    },
    {
      // #4
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`\left(2x^3+3x\right)\left(4x-1\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 8, exponent: 4 },
          { coefficient: -2, exponent: 3 },
          { coefficient: 12, exponent: 2 },
          { coefficient: -3, exponent: 1 },
        ],
        isSimplified: true,
      },
    },
    {
      // #5
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`-6x^2-23x-20`,
        defaultAnswer: String.raw`\left(2x+\right)\left(-3x-4\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 2, exponent: 1 },
                { coefficient: 5, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: -3, exponent: 1 },
                { coefficient: -4, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #6
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`\left(5x^2-3x+1\right)\left(10x-8\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 50, exponent: 3 },
          { coefficient: -70, exponent: 2 },
          { coefficient: 34, exponent: 1 },
          { coefficient: -8, exponent: 0 },
        ],
        isSimplified: true,
      },
    },
    {
      // #7
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`-10x^2+50x-40`,
        defaultAnswer: String.raw`\left(+5\right)\left(2x-\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: -5, exponent: 1 },
                { coefficient: 5, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 2, exponent: 1 },
                { coefficient: -8, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #8
      answerType: "simplified",
      prompt: {
        text: "Simplify the polynomial:",
        math: String.raw`3\left(5x^2+8x-12\right)`,
      },
      answer: {
        variable: "x",
        terms: [
          { coefficient: 15, exponent: 2 },
          { coefficient: 24, exponent: 1 },
          { coefficient: -36, exponent: 0 },
        ],
        isSimplified: true,
      },
    },
    {
      // #9
      answerType: "factorized",
      prompt: {
        text: "Factor out the GCF (5x):",
        math: String.raw`15x^3+10x^2-20x`,
        defaultAnswer: String.raw`5x\left(\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [{ coefficient: 5, exponent: 1 }],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 3, exponent: 2 },
                { coefficient: 2, exponent: 1 },
                { coefficient: -4, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #10
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`21x^2+44x-32`,
        defaultAnswer: String.raw`\left(7x-4\right)\left(\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 7, exponent: 1 },
                { coefficient: -4, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 3, exponent: 1 },
                { coefficient: 8, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #11
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`x^2+5x+6`,
        defaultAnswer: String.raw`\left(x+2\right)\left(\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: 2, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: 3, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #12
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`x^2+3x-10`,
        defaultAnswer: String.raw`\left(x+\right)\left(x-\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: 5, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: -2, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #13
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`x^2-11x+30`,
        defaultAnswer: String.raw`\left(x-\right)\left(x-\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: -5, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: -6, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #14
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`x^2+9x-90`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: 15, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 1, exponent: 1 },
                { coefficient: -6, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #15
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`6x^2-7x-5`,
        defaultAnswer: String.raw`\left(-3x+\right)\left(\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: -3, exponent: 1 },
                { coefficient: 5, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: -2, exponent: 1 },
                { coefficient: -1, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
    {
      // #16
      answerType: "factorized",
      prompt: {
        text: "Factor the polynomial:",
        math: String.raw`12x^2+7x-45`,
        defaultAnswer: String.raw`\left(+9\right)\left(\right)`,
      },
      answer: {
        factors: [
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 4, exponent: 1 },
                { coefficient: 9, exponent: 0 },
              ],
            },
            power: 1,
          },
          {
            base: {
              variable: "x",
              terms: [
                { coefficient: 3, exponent: 1 },
                { coefficient: -5, exponent: 0 },
              ],
            },
            power: 1,
          },
        ],
      },
    },
  ];

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (event) => {
      console.log(event);
      if (
        event.key === "Enter" &&
        event.shiftKey &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        const problemNumber = Number(
          prompt("Enter problem number to jump to:")
        );
        if (
          !isNaN(problemNumber) &&
          problemNumber >= 1 &&
          problemNumber <= problems.length &&
          problemNumber === Math.floor(problemNumber)
        ) {
          currentProblemIndex = problemNumber - 1;
        }
      }
    });
  }

  let currentProblemIndex = $state(0);
  const currentProblem = $derived(problems[currentProblemIndex]);
</script>

<MathQuillSetupCDN />
<MathQuillSetup />

<div>
  <ProblemComponent
    problemNumber={currentProblemIndex + 1}
    answerType={currentProblem.answerType}
    prompt={currentProblem.prompt}
    answer={currentProblem.answer}
    nextProblem={currentProblemIndex < problems.length - 1
      ? () => {
          currentProblemIndex += 1;
          return problems[currentProblemIndex].prompt.defaultAnswer ?? "";
        }
      : undefined}
  />
</div>
