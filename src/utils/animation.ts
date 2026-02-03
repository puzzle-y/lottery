/**
 * 动画效果配置
 */
export const animationConfigs = {
  default: {
    speed: 100,
    duration: 3000,
    easeOut: true,
  },
  fast: {
    speed: 50,
    duration: 2000,
    easeOut: true,
  },
  slow: {
    speed: 200,
    duration: 5000,
    easeOut: true,
  },
  crazy: {
    speed: 30,
    duration: 4000,
    easeOut: false,
  },
};

/**
 * 获取动画配置
 */
export function getAnimationConfig(effect: keyof typeof animationConfigs) {
  return animationConfigs[effect] || animationConfigs.default;
}

/**
 * 缓动函数
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * 缓动函数 - 弹性效果
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * 随机打乱数组
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 生成随机颜色（喜庆风格）
 */
export function getRandomFestiveColor(): string {
  const colors = [
    '#ff0000', // 红
    '#ffd700', // 金
    '#ff6b6b', // 浅红
    '#ffa500', // 橙
    '#ff1493', // 深粉
    '#dc143c', // 深红
    '#ff8c00', // 深橙
    '#ffb6c1', // 浅粉
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成渐变背景
 */
export function getRandomGradient(): string {
  const gradients = [
    'linear-gradient(135deg, #ff0000 0%, #ffd700 100%)',
    'linear-gradient(135deg, #dc143c 0%, #ff8c00 100%)',
    'linear-gradient(135deg, #ff1493 0%, #ffa500 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #ffd700 100%)',
    'linear-gradient(135deg, #ffa500 0%, #ff0000 100%)',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}
