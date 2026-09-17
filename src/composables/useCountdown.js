import { reactive, onMounted, onUnmounted } from 'vue';

export function useCountdown(targetDate) {
  const remaining = reactive({ days: '00', hours: '00', mins: '00', secs: '00' });
  let timer = null;

  function tick() {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    const s = Math.floor(diff / 1000);
    remaining.days = String(Math.floor(s / 86400)).padStart(2, '0');
    remaining.hours = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    remaining.mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    remaining.secs = String(s % 60).padStart(2, '0');
  }

  onMounted(() => {
    tick();
    timer = setInterval(tick, 1000);
  });
  onUnmounted(() => clearInterval(timer));

  return remaining;
}
