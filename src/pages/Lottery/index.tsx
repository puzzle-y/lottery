import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Select, Space, Tag, message } from 'antd';
import { TrophyOutlined, GiftOutlined, CrownOutlined, FireOutlined, FullscreenOutlined, FullscreenExitOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useLotteryStore } from '@/store';
import { shuffleArray } from '@/utils/animation';
import { triggerCelebration } from '@/utils/confetti';
import type { Person, Prize } from '@/types';
import './index.css';



const { Option } = Select;

// 生成球体表面点坐标
function generateSpherePoints(count: number, radius: number) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push({ x: x * radius, y: y * radius, z: z * radius });
  }
  return points;
}

export default function Lottery() {
  const { 
    prizes, 
    persons,
    getEnabledPrizes, 
    markAsWinner, 
    addWinnerRecord, 
    winnerRecords, 
    config 
  } = useLotteryStore();
  
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [spherePersons, setSpherePersons] = useState<Person[]>([]);
  const [currentWinners, setCurrentWinners] = useState<Person[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const rollIntervalRef = useRef<number | null>(null);
  const lotteryRef = useRef<HTMLDivElement>(null);

  const enabledPrizes = getEnabledPrizes();
  
  // 计算当前奖项已中奖人数
  const drawnCountForPrize = useMemo(() => {
    if (!selectedPrize) return 0;
    return winnerRecords.filter(r => r.prizeId === selectedPrize.id).length;
  }, [selectedPrize, winnerRecords]);

  // 当前奖项剩余可抽取人数
  const remainingForPrize = useMemo(() => {
    if (!selectedPrize) return 0;
    return Math.max(0, selectedPrize.count - drawnCountForPrize);
  }, [selectedPrize, drawnCountForPrize]);

  // 获取真正可参与抽奖的人员（排除所有已中奖人员）
  const availablePersons = useMemo(() => {
    const winnerIds = new Set(winnerRecords.map(r => r.personId));
    return persons.filter(p => !winnerIds.has(p.id));
  }, [persons, winnerRecords]);

  const spherePoints = useMemo(() => {
    return generateSpherePoints(60, 280);
  }, []);

  const handlePrizeSelect = (prizeId: string) => {
    const prize = prizes.find(p => p.id === prizeId);
    if (prize) {
      setSelectedPrize(prize);
      setCurrentWinners([]);
      setShowWinnerModal(false);
      // 计算该奖项已抽人数
      const alreadyDrawn = winnerRecords.filter(r => r.prizeId === prize.id).length;
      const remaining = Math.max(0, prize.count - alreadyDrawn);
      setDrawCount(Math.min(5, remaining)); // 默认每批5人
      setShowConfig(false);
    }
  };

  const startRolling = () => {
    if (!selectedPrize) {
      message.warning('请先选择奖项');
      return;
    }
    if (remainingForPrize === 0) {
      message.warning(`【${selectedPrize.name}】已抽满 ${selectedPrize.count} 人`);
      return;
    }
    if (availablePersons.length === 0) {
      message.warning('没有可抽奖人员');
      return;
    }

    // 计算本次实际抽取人数
    const actualDrawCount = Math.min(drawCount, remainingForPrize, availablePersons.length);
    
    if (actualDrawCount <= 0) {
      message.warning('没有可抽奖人员');
      return;
    }

    setIsRolling(true);
    setShowWinnerModal(false);
    setCurrentWinners([]);

    // 快速旋转动画
    const rotateInterval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 4,
        y: prev.y + 6
      }));
    }, 30);

    // 随机更换球体上的人员
    rollIntervalRef.current = setInterval(() => {
      const shuffled = shuffleArray(availablePersons);
      setSpherePersons(shuffled.slice(0, 60));
    }, 80);

    // 4秒后停止并抽取
    setTimeout(() => {
      clearInterval(rotateInterval);
      performDraw(actualDrawCount);
    }, 4000);
  };

  const performDraw = (count: number) => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }

    setIsRolling(false);

    // 从可用人员中随机抽取
    const shuffled = shuffleArray(availablePersons);
    const selectedWinners = shuffled.slice(0, count);

    setCurrentWinners(selectedWinners);
    setSpherePersons(selectedWinners);
    setShowWinnerModal(true);

    // 立即记录中奖，确保所有人都被记录
    if (selectedPrize) {
      selectedWinners.forEach((winner, index) => {
        markAsWinner(winner.id, selectedPrize.id);
        addWinnerRecord({
          id: `record_${Date.now()}_${index}_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)}`,
          personId: winner.id,
          personName: winner.name,
          employeeId: winner.employeeId,
          prizeId: selectedPrize.id,
          prizeName: selectedPrize.name,
          winTime: new Date().toLocaleString('zh-CN'),
        });
      });
    }

    triggerCelebration();
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      lotteryRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => message.error('无法进入全屏'));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // 空闲时缓慢旋转
  useEffect(() => {
    if (!isRolling && !showWinnerModal && selectedPrize) {
      const interval = setInterval(() => {
        setRotation(prev => ({
          x: prev.x + 0.1,
          y: prev.y + 0.2
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRolling, showWinnerModal, selectedPrize]);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // 计算本次抽奖后奖项剩余人数
  const afterDrawRemaining = useMemo(() => {
    if (!selectedPrize) return 0;
    const currentDrawnCount = winnerRecords.filter(r => r.prizeId === selectedPrize.id).length;
    return Math.max(0, selectedPrize.count - currentDrawnCount);
  }, [selectedPrize, winnerRecords]);

  return (
    <div ref={lotteryRef} className={`lottery-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 喜庆背景 */}
      <div className="festive-bg">
        <div className="red-gradient" />
        <div className="gold-particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="gold-particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} />
          ))}
        </div>
        <div className="lanterns">
          <div className="lantern left">🏮</div>
          <div className="lantern right">🏮</div>
        </div>
      </div>

      {/* 控制按钮 */}
      <button className="control-btn fullscreen-toggle" onClick={toggleFullscreen}>
        {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        {isFullscreen ? '退出' : '全屏'}
      </button>
      <button className="control-btn config-toggle" onClick={() => setShowConfig(!showConfig)}>
        <SettingOutlined />
        {showConfig ? '隐藏' : '设置'}
      </button>

      {/* 标题 */}
      <div className="lottery-title">
        <FireOutlined className="fire-left" />
        <div className="title-content">
          <h1 className="main-title">{config.title}</h1>
          <p className="sub-title">{config.subtitle}</p>
        </div>
        <FireOutlined className="fire-right" />
      </div>

      {/* 配置面板 */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            className="config-area"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="config-box">
              <div className="config-row">
                <span className="label">选择奖项</span>
                <Select
                  placeholder="🏆 请选择奖项"
                  onChange={handlePrizeSelect}
                  value={selectedPrize?.id}
                  className="prize-select"
                  getPopupContainer={n => n.parentNode as HTMLElement}
                >
                  {enabledPrizes.map(prize => (
                    <Option key={prize.id} value={prize.id}>
                      <Space>
                        <GiftOutlined />
                        <span>{prize.name}</span>
                        <Tag color="red">{prize.count}人</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              {selectedPrize && (
                <>
                  <div className="config-row">
                    <span className="label">每批抽取</span>
                    <div className="count-btns">
                      {[1, 3, 5, 10, 20].map(num => (
                        <button
                          key={num}
                          className={`count-btn ${drawCount === num ? 'active' : ''}`}
                          onClick={() => setDrawCount(num)}
                          disabled={num > selectedPrize.count}
                        >
                          {num}人
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="prize-tags">
                    <span className="tag"><CrownOutlined /> {selectedPrize.name}</span>
                    <span className="tag">计划: {selectedPrize.count}人</span>
                    <span className={`tag ${remainingForPrize === 0 ? 'completed' : 'highlight'}`}>
                      剩余: {remainingForPrize}人
                      {remainingForPrize === 0 && ' ✓'}
                    </span>
                    <span className="tag">可参与: {availablePersons.length}人</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D球体抽奖区 */}
      <div className="sphere-area">
        {selectedPrize ? (
          <div className="sphere-wrapper">
            <div 
              className="sphere"
              style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
            >
              {(isRolling ? spherePersons : availablePersons.slice(0, 60)).map((person, i) => {
                const point = spherePoints[i % spherePoints.length];
                return (
                  <div
                    key={`${person.id}-${i}`}
                    className="person-tag"
                    style={{
                      transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
                    }}
                  >
                    <span className="tag-avatar">{person.name[0]}</span>
                    <span className="tag-name">{person.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-tip">
            <div className="tip-icon">🎁</div>
            <div className="tip-text">请先选择奖项开始抽奖</div>
          </div>
        )}
      </div>

      {/* 开始按钮 */}
      {selectedPrize && (
        <div className="action-area">
          <div className="btn-group">
            <button 
              className={`start-btn ${isRolling ? 'rolling' : ''}`}
              onClick={startRolling}
              disabled={availablePersons.length === 0 || remainingForPrize === 0}
            >
              {isRolling ? (
                <>
                  <span className="btn-shine" />
                  <span className="btn-text">抽奖中...</span>
                </>
              ) : (
                <>
                  <GiftOutlined className="btn-icon" />
                  <span className="btn-text">
                    {remainingForPrize === 0 
                      ? '奖项已完成' 
                      : `抽取 ${Math.min(drawCount, remainingForPrize)} 人`
                    }
                  </span>
                </>
              )}
            </button>
            {!isRolling && (
              <button 
                className="back-btn"
                onClick={() => {
                  setSelectedPrize(null);
                  setCurrentWinners([]);
                  setShowConfig(true);
                }}
              >
                返回选择奖项
              </button>
            )}
          </div>
        </div>
      )}

      {/* 中奖弹窗 */}
      <AnimatePresence>
        {showWinnerModal && currentWinners.length > 0 && (
          <motion.div 
            className="winner-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-overlay" onClick={() => setShowWinnerModal(false)} />
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <button className="close-btn" onClick={() => setShowWinnerModal(false)}>
                <CloseOutlined />
              </button>
              
              <div className="modal-header">
                <TrophyOutlined className="trophy-icon" />
                <h2 className="modal-title">🎉 恭喜中奖 🎉</h2>
                <TrophyOutlined className="trophy-icon" />
              </div>

              <div className="prize-name">{selectedPrize?.name}</div>
              <div className="draw-info">
                本批抽出 {currentWinners.length} 人，奖项还剩 {afterDrawRemaining} 人
              </div>

              <div className="winners-scroll-container">
                <div className={`simple-winners-list people-count-${currentWinners.length}`}>
                  {currentWinners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      className="simple-winner-item"
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: 'spring' }}
                    >
                      <div className="simple-winner-name">{winner.name}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                {afterDrawRemaining > 0 ? (
                  <button 
                    className="confirm-btn continue-btn" 
                    onClick={() => {
                      setShowWinnerModal(false);
                      // 自动调整下次抽取人数
                      const nextDraw = Math.min(drawCount, afterDrawRemaining);
                      setDrawCount(nextDraw);
                    }}
                  >
                    继续抽奖（还剩{afterDrawRemaining}人）
                  </button>
                ) : (
                  <button 
                    className="confirm-btn next-btn" 
                    onClick={() => {
                      setShowWinnerModal(false);
                      setSelectedPrize(null);
                      setCurrentWinners([]);
                      setShowConfig(true);
                      message.success('当前奖项已完成！请选择下一个奖项');
                    }}
                  >
                    奖项完成，选择下一个
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
