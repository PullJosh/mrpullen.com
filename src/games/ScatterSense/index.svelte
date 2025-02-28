<script>
  import {
    generateLinearScatter,
    generateEllipticalScatter,
    generateClusteredScatter,
    generateNonlinearScatter,
    generateRandomScatter,
    getCorrelationCoefficient,
  } from "./scatterplot-logic";
  import { fly } from "svelte/transition";
  import { Howl } from "howler";
  import popSrc from "./pop.mp3";
  import correctSrc from "./correct.mp3";
  import wrongSrc from "./wrong.mp3";

  import confetti from "canvas-confetti";

  const pop = new Howl({ src: [popSrc] });
  const correct = new Howl({ src: [correctSrc] });
  const wrong = new Howl({ src: [wrongSrc] });

  let score = $state(0);
  let level = $state(1);
  let levelScore = $state(0);
  let showLevelScore = $state(false);
  let attemptsRemaining = $state(5);

  let showLevelScreen = $state(false);

  let points = $state(generateLinearScatter());
  let shownPoints = $state(0);

  let realR = $derived(getCorrelationCoefficient(points));
  let showRealR = $state(false);
  let animatedRealR = $state(0);
  let chosenR = $state(0);

  regenerate(); // Start the game

  function regenerate() {
    points = generateLinearScatter();
    chosenR = 0;
    showRealR = false;
    animateInPoints();
  }

  function animateInPoints() {
    shownPoints = 0;

    let lastSoundStartTime = -Infinity;
    const revealOne = () => {
      shownPoints += 1;

      // Play a sound, but limit the number of sounds playing at once
      const now = Date.now();
      if (now - lastSoundStartTime > 50) {
        pop.play();
        lastSoundStartTime = now;
      }

      if (shownPoints < points.length) {
        // Slow down as we approach the end
        const remaining = points.length - shownPoints;
        const duration = 100 / remaining ** 0.5;
        setTimeout(revealOne, duration);
      }
    };

    revealOne();
  }

  const ANIMATE_REAL_R_DURATION = 3000;

  function animateInRealR() {
    const start = Date.now();
    const end = start + ANIMATE_REAL_R_DURATION;
    const startValue = realR < 0 ? 1 : -1; // Start from the opposite side
    const endValue = realR;
    showRealR = true;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const update = () => {
      const now = Date.now();
      if (now >= end) {
        animatedRealR = endValue;
        return;
      }
      const progress = (now - start) / ANIMATE_REAL_R_DURATION;
      animatedRealR =
        startValue + (endValue - startValue) * easeOutCubic(progress);
      requestAnimationFrame(update);
    };
    update();
  }

  const LEVEL_SCORE_DURATION = 1000;

  function check() {
    const diff = Math.floor(Math.abs(realR - chosenR) * 100) / 100; // To the nearest hundredth; will always be between 0 and 2
    let questionScore = 500 * (diff + 1) ** -20 - 500 * (diff - 1);
    if (questionScore < 0) questionScore = 0;
    if (questionScore > 1000) questionScore = 1000;
    questionScore = Math.round(questionScore);
    animateInRealR();

    setTimeout(() => {
      levelScore = questionScore;
      showLevelScore = true;
      if (questionScore === 1000) {
        showStars();
      }
      if (questionScore > 0) {
        correct.play();
      } else {
        wrong.play();
      }
      setTimeout(() => {
        showLevelScore = false;
      }, LEVEL_SCORE_DURATION);

      score += questionScore;
      attemptsRemaining -= 1;

      if (score >= 3000) {
        showLevelScreen = true;
      } else if (attemptsRemaining === 0) {
        showLevelScreen = true;
      }
    }, ANIMATE_REAL_R_DURATION);
  }

  function showStars() {
    var defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }

  function nextLevel() {
    level += 1;
    score = 0;
    attemptsRemaining = 5;
    showLevelScreen = false;
    regenerate();
  }
</script>

<div class="game">
  <div style="display: flex; flex-direction: column; width: 100%">
    <div
      style="position: relative; width: 100%; height: 24px; background: #777; display: flex; justify-content: space-between; align-items: center; padding: 16px; box-sizing: border-box; color: white; text-shadow: 0 1px 1px #000a"
    >
      <div
        style="position: absolute; top: 0; left: 0; width: {(Math.min(
          score,
          3000
        ) /
          3000) *
          100}%; height: 100%; background: green"
      ></div>
      <span style="position: relative">Score: {score} / 3000</span>
      <span style="position: relative"
        >Guesses remaining: {attemptsRemaining}</span
      >
    </div>
  </div>

  <h1>Level {level}</h1>

  <svg viewBox="0 0 400 400" class="scatterplot">
    {#each points as point, index}
      {#if index < shownPoints}
        <circle
          cx={point.x * 400}
          cy={(1 - point.y) * 400}
          r="5"
          fill="black"
        />
      {/if}
    {/each}
  </svg>

  <div class="guess-grid" style="display: grid">
    <span>Guess:</span>
    <input
      type="range"
      class="range"
      bind:value={chosenR}
      min={-1}
      max={1}
      step={0.01}
      disabled={shownPoints < points.length || showRealR}
    />
    <span>r = {chosenR.toFixed(2)}</span>
    {#if showRealR}
      <span>Real:</span>
      <input
        type="range"
        class="range"
        value={animatedRealR}
        min={-1}
        max={1}
        step={0.01}
        disabled
      />
      <span>r = {animatedRealR.toFixed(2)}</span>
    {:else}
      <span>Real:</span>
      <span></span>
      <span></span>
    {/if}
  </div>

  {#if showLevelScore}
    <div
      class="levelScore"
      in:fly={{ y: 100, duration: LEVEL_SCORE_DURATION }}
      out:fly={{ y: -100, duration: LEVEL_SCORE_DURATION }}
      style="color: {levelScore > 0
        ? 'green'
        : 'red'}; font-size: {levelScore === 1000 ? '8em' : '6em'}"
    >
      +{levelScore}
    </div>
  {/if}

  {#if showRealR}
    <button onclick={regenerate} disabled={animatedRealR !== realR}>
      Next
    </button>
  {:else}
    <button onclick={check}>Check</button>
  {/if}

  {#if showLevelScreen}
    {#if score >= 3000}
      <div class="level-screen" style="background: green">
        <h1>You beat level {level}!</h1>
        <p>You earned {score}/3000 points on this level.</p>
        <button onclick={nextLevel}>Next level</button>
      </div>
    {:else}
      <div class="level-screen" style="background: red">
        <h1>You lose.</h1>
        <p>
          You beat {Math.max(0, level - 1)} levels and earned {score}/3000
          points on level
          {level}.
        </p>
        <button onclick={() => window.location.reload()}>Replay</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .game {
    width: 640px;
    height: 480px;
    border: 1px solid black;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: relative;
  }

  .scatterplot {
    border: 1px solid black;
    width: 400px;
    height: 400px;
  }

  .guess-grid {
    display: grid;
    grid-template-columns: 40px 400px 80px;
    gap: 10px;
  }

  .levelScore {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .level-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 100;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
