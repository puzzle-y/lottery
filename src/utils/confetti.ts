import confetti from 'canvas-confetti';

/**
 * 触发庆祝动画
 */
export function triggerCelebration() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // 从左侧发射
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffd700', '#ff6b6b', '#ffa500', '#ff1493'],
    });
    
    // 从右侧发射
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffd700', '#ff6b6b', '#ffa500', '#ff1493'],
    });
  }, 250);
}

/**
 * 触发简单庆祝动画
 */
export function triggerSimpleCelebration() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff0000', '#ffd700', '#ff6b6b', '#ffa500'],
    zIndex: 9999,
  });
}

/**
 * 触发金色雨动画
 */
export function triggerGoldenRain() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x: Math.random(), y: -0.1 },
      colors: ['#ffd700', '#ffa500', '#ff8c00'],
      gravity: 1.5,
      scalar: 1.2,
      zIndex: 9999,
    });
  }, 100);
}
