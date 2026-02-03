// 人员信息
export interface Person {
  id: string;
  employeeId: string;
  name: string;
  isWinner: boolean;
  prizeId?: string;
  winTime?: string;
}

// 奖项信息
export interface Prize {
  id: string;
  name: string;
  count: number;
  enabled: boolean;
  order: number;
  createdAt: string;
}

// 中奖记录
export interface WinnerRecord {
  id: string;
  personId: string;
  personName: string;
  employeeId: string;
  prizeId: string;
  prizeName: string;
  winTime: string;
}

// 系统配置
export interface SystemConfig {
  title: string;
  subtitle: string;
  footer: string;
  animationSpeed: number;
  animationEffect: 'default' | 'fast' | 'slow' | 'crazy';
}

// 抽奖状态
export interface LotteryState {
  isRunning: boolean;
  currentPrize: Prize | null;
  selectedPerson: Person | null;
  remainingCount: number;
}

// Excel导入结果
export interface ExcelImportResult {
  success: boolean;
  data: Person[];
  errors: string[];
  totalCount: number;
}
