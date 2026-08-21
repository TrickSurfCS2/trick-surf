<script setup lang="ts">
</script>

<template>
  <div class="kit-logo-wrapper">
    <svg viewBox="0 0 900 200" class="kit-logo-svg">
      <symbol id="s-text">
        <text text-anchor="middle" x="50%" y="80%">
          surfgxds
        </text>
        <text text-anchor="middle" x="50.8%" y="80%">
          surfgxds
        </text>
      </symbol>

      <g class="g-ants">
        <use xlink:href="#s-text" class="text-copy text-copy-1" />
        <use xlink:href="#s-text" class="text-copy text-copy-2" />
        <use xlink:href="#s-text" class="text-copy text-copy-3" />
        <use xlink:href="#s-text" class="text-copy text-copy-4" />
        <use xlink:href="#s-text" class="text-copy text-copy-5" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.kit-logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  user-select: none;
}

.kit-logo-svg {
  display: block;
  font:
    10.5em 'Rubik',
    Montserrat,
    sans-serif;
  width: 100%;
  height: 100%;
}

.text-copy {
  fill: none;
  stroke: var(--fg-accent-color);
  stroke-dasharray: 6% 29%;
  stroke-width: 5px;
  stroke-dashoffset: 0%;
  animation: stroke-offset 5.5s infinite linear;
}

.text-copy-1 {
  stroke: var(--fg-accent-color);
  animation-delay: -1s;
}

.text-copy-2 {
  stroke: var(--border-accent-color);
  animation-delay: -2s;
}

.text-copy-3 {
  stroke: var(--fg-action-color);
  animation-delay: -3s;
}

.text-copy-4 {
  stroke: var(--fg-highlight-color);
  animation-delay: -4s;
}

.text-copy-5 {
  stroke: var(--fg-primary-color);
  animation-delay: -5s;
}

// Dark theme colors
:root[data-theme='dark'] .kit-logo-wrapper,
[data-theme='dark'] .kit-logo-wrapper {
  .text-copy-1 {
    stroke: #c975de;
  }
  .text-copy-2 {
    stroke: #db90f5;
  }
  .text-copy-3 {
    stroke: #e879f9;
  }
  .text-copy-4 {
    stroke: #a855f7;
  }
  .text-copy-5 {
    stroke: #d946ef;
  }
}

// Light theme colors
:root[data-theme='light'] .kit-logo-wrapper,
[data-theme='light'] .kit-logo-wrapper {
  .text-copy-1 {
    stroke: #e16032;
  }
  .text-copy-2 {
    stroke: #f37a51;
  }
  .text-copy-3 {
    stroke: #fb923c;
  }
  .text-copy-4 {
    stroke: #ea580c;
  }
  .text-copy-5 {
    stroke: #c2410c;
  }
}

@keyframes stroke-offset {
  100% {
    stroke-dashoffset: -35%;
  }
}
</style>
