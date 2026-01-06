<script lang="ts">
  import CoordinatePlane from "./CoordinatePlane.svelte";
  import { generateQuestion, type Question } from "./generateQuestion";
  import Inequality from "./Inequality.svelte";

  import { Howl } from "howler";
  import correctSrc from "./correct.mp3";
  import wrongSrc from "./wrong.mp3";

  const correct = new Howl({ src: [correctSrc] });
  const wrong = new Howl({ src: [wrongSrc] });

  let points = $state(0);
  let numberOfQuestionsAnswered = $state(0);
  let question = $state<Question>(generateQuestion(1));
  let selectedPointIndices = $state<number[]>([]);

  let gameState = $state<
    | "not-started"
    | "playing"
    | "lost-wrong-answer"
    | "lost-not-all-answers"
    | "lost-out-of-time"
  >("not-started");

  interface Timer {
    startTime: number | null;
    startValue: number;
  }

  let timerVisible = $state(false);

  let timer = $state<Timer>({ startTime: null, startValue: 30 });
  function getCurrentTimeRemaining(): number {
    if (timer.startTime === null) {
      return timer.startValue;
    } else {
      const elapsed = (Date.now() - timer.startTime) / 1000;
      return Math.max(0, timer.startValue - elapsed);
    }
  }

  let timeRemaining = $state<number>(getCurrentTimeRemaining());
  $effect(() => {
    const interval = setInterval(() => {
      timeRemaining = getCurrentTimeRemaining();

      if (timerVisible && timeRemaining <= 0 && gameState === "playing") {
        wrong.play();
        gameState = "lost-out-of-time";
      }
    }, 100);

    return () => clearInterval(interval);
  });

  function nextQuestion() {
    selectedPointIndices = [];
    numberOfQuestionsAnswered += 1;
    let level: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 1;
    if (numberOfQuestionsAnswered >= 15) {
      level = 7;
    } else if (numberOfQuestionsAnswered >= 12) {
      level = 6;
    } else if (numberOfQuestionsAnswered >= 9) {
      level = 5;
    } else if (numberOfQuestionsAnswered >= 7) {
      level = 4;
    } else if (numberOfQuestionsAnswered >= 5) {
      level = 3;
    } else if (numberOfQuestionsAnswered >= 3) {
      level = 2;
    }
    question = generateQuestion(level);
  }

  function resetGame() {
    question = generateQuestion(1);
    selectedPointIndices = [];
    numberOfQuestionsAnswered = 0;
    gameState = "not-started";
    points = 0;
    resetTimer();
  }

  function addToTimer(seconds: number) {
    const currentRemaining = getCurrentTimeRemaining();
    timer = {
      startTime: Date.now(),
      startValue: currentRemaining + seconds,
    };
  }

  function pauseTimer() {
    timeRemaining = getCurrentTimeRemaining();
    timer = {
      startTime: null,
      startValue: timeRemaining,
    };
  }

  function resetTimer() {
    timer = { startTime: null, startValue: 30 };
  }
</script>

<div style="width: 400px;">
  <div style="margin-bottom: 10px; text-align: center; font-size: 18px;">
    Points: {points} &bull; Questions answered: {numberOfQuestionsAnswered}
  </div>
  <div
    style="position: relative; width: 400px; height: 400px; border: 1px solid black;"
  >
    {#key question.id}
      <CoordinatePlane domain={[-5, 5]} range={[-5, 5]}>
        {#if gameState !== "not-started"}
          {#each question.inequalities as ineq, index}
            <Inequality
              point={ineq.point}
              slope={ineq.slope}
              stroke={ineq.stroke}
              fillSide={ineq.fillSide}
              color={index === 0 ? "red" : "blue"}
            />
          {/each}
          {#each question.points as point, index}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            {#if selectedPointIndices.includes(index) && point.isSolution}
              <!-- Green for correct point -->
              <circle
                cx="{((point.coordinates[0] - -5) / (5 - -5)) * 100}%"
                cy="{100 - ((point.coordinates[1] - -5) / (5 - -5)) * 100}%"
                r="2"
                fill="green"
                style="pointer-events: none"
              />
            {:else if selectedPointIndices.includes(index) && !point.isSolution}
              <!-- X for incorrect point -->
              <g
                transform="translate({((point.coordinates[0] - -5) / (5 - -5)) *
                  100} {100 - ((point.coordinates[1] - -5) / (5 - -5)) * 100})"
                style="pointer-events: none"
              >
                <line
                  x1="-2"
                  y1="-2"
                  x2="2"
                  y2="2"
                  stroke="darkred"
                  stroke-width="1"
                />
                <line
                  x1="-2"
                  y1="2"
                  x2="2"
                  y2="-2"
                  stroke="darkred"
                  stroke-width="1"
                />
              </g>
            {:else if !selectedPointIndices.includes(index)}
              <!-- Unselected point -->
              <circle
                cx="{((point.coordinates[0] - -5) / (5 - -5)) * 100}%"
                cy="{100 - ((point.coordinates[1] - -5) / (5 - -5)) * 100}%"
                r="4"
                fill="transparent"
                style="cursor: pointer"
                onclick={() => {
                  selectedPointIndices = [...selectedPointIndices, index];
                  if (point.isSolution) {
                    correct.play();
                    addToTimer(3 * 0.9 ** points);
                    points += 1;
                  } else {
                    wrong.play();
                    pauseTimer();
                    gameState = "lost-wrong-answer";
                  }
                }}
              />
              <circle
                cx="{((point.coordinates[0] - -5) / (5 - -5)) * 100}%"
                cy="{100 - ((point.coordinates[1] - -5) / (5 - -5)) * 100}%"
                r="2"
                fill="black"
                style="pointer-events: none"
              />
            {/if}
          {/each}
        {/if}
      </CoordinatePlane>
    {/key}
  </div>
  <div
    style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px; margin-top: 10px;"
  >
    {#if gameState === "not-started"}
      <button
        onclick={() => {
          gameState = "playing";
          timer = { startTime: Date.now(), startValue: 30 };
        }}
      >
        Start Game
      </button>
    {/if}
    {#if gameState === "lost-wrong-answer"}
      <div>You selected an incorrect point. Game Over!</div>
      <button
        onclick={() => {
          resetGame();
        }}
      >
        Try Again
      </button>
    {/if}
    {#if gameState === "lost-not-all-answers"}
      <div>You missed at least one solution. Game Over!</div>
      <button
        onclick={() => {
          resetGame();
        }}
      >
        Try Again
      </button>
    {/if}
    {#if gameState === "lost-out-of-time"}
      <div>Your time ran out. Game Over!</div>
      <button
        onclick={() => {
          resetGame();
        }}
      >
        Try Again
      </button>
    {/if}
    {#if gameState === "playing"}
      <button
        onclick={() => {
          // Check if all solutions have been found
          const allSolutionsFound = question.points
            .filter((p) => p.isSolution)
            .every((p, i) => selectedPointIndices.includes(i));
          if (allSolutionsFound) {
            nextQuestion();
          } else {
            wrong.play();
            pauseTimer();
            gameState = "lost-not-all-answers";
          }
        }}
      >
        Next
      </button>
    {/if}
  </div>
  <div
    style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 30px;"
  >
    <label>
      <input
        type="checkbox"
        bind:checked={timerVisible}
        disabled={gameState !== "not-started"}
        style="transform: scale(1.5); margin-right: 10px; vertical-align: middle;"
      />
      Timer mode
    </label>
    {#if timerVisible}
      <span style="font-size: 36px; font-weight: bold; color: darkblue;">
        {timeRemaining.toFixed(2)} seconds
      </span>
    {/if}
  </div>
</div>
