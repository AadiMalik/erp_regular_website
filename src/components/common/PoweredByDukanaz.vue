<template>
  <span class="powered-by-dukanaz" aria-label="Powered by Dukanaz">
    <img
      src="/brand/dukanaz-icon.png"
      alt=""
      class="powered-by-dukanaz__icon"
      width="18"
      height="18"
      aria-hidden="true"
    >
    <span class="powered-by-dukanaz__text">
      Powered by <strong>Dukan<span class="powered-by-dukanaz__accent">az</span></strong>
    </span>
  </span>
</template>

<style scoped>
.powered-by-dukanaz {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: inherit;
  font-size: inherit;
  line-height: 1.2;
}

.powered-by-dukanaz__icon {
  flex-shrink: 0;
  object-fit: contain;
}

.powered-by-dukanaz__text {
  font-weight: 400;
}

.powered-by-dukanaz__accent {
  color: #2dd4bf;
}
</style>
