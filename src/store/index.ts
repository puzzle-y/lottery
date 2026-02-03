import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Person, Prize, WinnerRecord, SystemConfig, LotteryState } from '@/types';

interface LotteryStore {
  // 人员列表
  persons: Person[];
  setPersons: (persons: Person[]) => void;
  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  clearPersons: () => void;
  markAsWinner: (personId: string, prizeId: string) => void;
  resetWinners: () => void;
  
  // 奖项列表
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  reorderPrizes: (prizes: Prize[]) => void;
  
  // 中奖记录
  winnerRecords: WinnerRecord[];
  addWinnerRecord: (record: WinnerRecord) => void;
  removeWinnerRecord: (id: string) => void;
  clearWinnerRecords: () => void;
  
  // 系统配置
  config: SystemConfig;
  updateConfig: (config: Partial<SystemConfig>) => void;
  
  // 抽奖状态
  lotteryState: LotteryState;
  setLotteryState: (state: Partial<LotteryState>) => void;
  resetLotteryState: () => void;
  
  // 获取未中奖人员
  getAvailablePersons: () => Person[];
  // 获取已中奖人员
  getWinners: () => Person[];
  // 获取启用的奖项
  getEnabledPrizes: () => Prize[];
}

const defaultConfig: SystemConfig = {
  title: '2026 AI 年会抽奖',
  subtitle: '新春快乐 · 万事如意',
  footer: '© 2026 公司年会抽奖系统',
  animationSpeed: 1,
  animationEffect: 'default',
};

const defaultLotteryState: LotteryState = {
  isRunning: false,
  currentPrize: null,
  selectedPerson: null,
  remainingCount: 0,
};

export const useLotteryStore = create<LotteryStore>()(
  persist(
    (set, get) => ({
      persons: [],
      setPersons: (persons) => set({ persons }),
      addPerson: (person) => set((state) => ({ persons: [...state.persons, person] })),
      removePerson: (id) => set((state) => ({ persons: state.persons.filter((p) => p.id !== id) })),
      clearPersons: () => set({ persons: [] }),
      markAsWinner: (personId, prizeId) =>
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === personId
              ? { ...p, isWinner: true, prizeId, winTime: new Date().toISOString() }
              : p
          ),
        })),
      resetWinners: () =>
        set((state) => ({
          persons: state.persons.map((p) => ({
            ...p,
            isWinner: false,
            prizeId: undefined,
            winTime: undefined,
          })),
        })),

      prizes: [],
      setPrizes: (prizes) => set({ prizes }),
      addPrize: (prize) => set((state) => ({ prizes: [...state.prizes, prize] })),
      updatePrize: (id, prize) =>
        set((state) => ({
          prizes: state.prizes.map((p) => (p.id === id ? { ...p, ...prize } : p)),
        })),
      removePrize: (id) => set((state) => ({ prizes: state.prizes.filter((p) => p.id !== id) })),
      reorderPrizes: (prizes) => set({ prizes }),

      winnerRecords: [],
      addWinnerRecord: (record) =>
        set((state) => ({ winnerRecords: [record, ...state.winnerRecords] })),
      removeWinnerRecord: (id) =>
        set((state) => ({ winnerRecords: state.winnerRecords.filter((r) => r.id !== id) })),
      clearWinnerRecords: () => set({ winnerRecords: [] }),

      config: defaultConfig,
      updateConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),

      lotteryState: defaultLotteryState,
      setLotteryState: (state) =>
        set((s) => ({ lotteryState: { ...s.lotteryState, ...state } })),
      resetLotteryState: () => set({ lotteryState: defaultLotteryState }),

      getAvailablePersons: () => get().persons.filter((p) => !p.isWinner),
      getWinners: () => get().persons.filter((p) => p.isWinner),
      getEnabledPrizes: () => get().prizes.filter((p) => p.enabled).sort((a, b) => a.order - b.order),
    }),
    {
      name: 'lottery-storage',
    }
  )
);
