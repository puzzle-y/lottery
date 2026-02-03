import { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Button, Badge, Empty } from 'antd';
import { TrophyOutlined, ArrowRightOutlined, UserOutlined, GiftOutlined } from '@ant-design/icons';
import { useLotteryStore } from '@/store';
import { motion } from 'framer-motion';
import './index.css';

const { Title, Text } = Typography;

// "2026" 字样布局定义 - 使用网格坐标
const TEXT_2026 = [
  // "2"
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
  { x: 2, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
  { x: 0, y: 3 },
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
  // "0"
  { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
  { x: 4, y: 1 }, { x: 6, y: 1 },
  { x: 4, y: 2 }, { x: 6, y: 2 },
  { x: 4, y: 3 }, { x: 6, y: 3 },
  { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
  // "2"
  { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
  { x: 10, y: 1 },
  { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 },
  // "6"
  { x: 12, y: 0 }, { x: 13, y: 0 }, { x: 14, y: 0 },
  { x: 12, y: 1 },
  { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 2 },
  { x: 12, y: 3 }, { x: 14, y: 3 },
  { x: 12, y: 4 }, { x: 13, y: 4 }, { x: 14, y: 4 },
];

export default function Home() {
  const { persons, prizes, getEnabledPrizes, getWinners, winnerRecords, config } = useLotteryStore();
  const [animatedCards, setAnimatedCards] = useState<Set<number>>(new Set());

  const enabledPrizes = getEnabledPrizes();
  const winners = getWinners();
  const availablePersons = persons.filter(p => !p.isWinner);

  // 计算需要多少张卡片来组成 "2026"
  const totalTextCards = TEXT_2026.length;

  // 准备显示在 "2026" 布局中的卡片数据
  const displayCards = useMemo(() => {
    const cards = [];
    const shuffledPersons = [...availablePersons].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < totalTextCards; i++) {
      if (i < shuffledPersons.length) {
        cards.push({
          type: 'person',
          data: shuffledPersons[i],
          index: i,
        });
      } else {
        cards.push({
          type: 'empty',
          data: null,
          index: i,
        });
      }
    }
    return cards;
  }, [availablePersons, totalTextCards]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAnimated = new Set<number>();
      const count = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * totalTextCards);
        newAnimated.add(idx);
      }
      setAnimatedCards(newAnimated);
    }, 2000);

    return () => clearInterval(interval);
  }, [totalTextCards]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="home-page">
      {/* 统计卡片 */}
      <div className="stats-cards">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="stat-card persons-card">
            <div className="stat-icon">
              <UserOutlined />
            </div>
            <div className="stat-info">
              <Text className="stat-label">参与人数</Text>
              <Title level={3} className="stat-value">{persons.length}</Title>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="stat-card prizes-card">
            <div className="stat-icon">
              <GiftOutlined />
            </div>
            <div className="stat-info">
              <Text className="stat-label">奖项数量</Text>
              <Title level={3} className="stat-value">{enabledPrizes.length}</Title>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="stat-card winners-card">
            <div className="stat-icon">
              <TrophyOutlined />
            </div>
            <div className="stat-info">
              <Text className="stat-label">已中奖</Text>
              <Title level={3} className="stat-value">{winners.length}</Title>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="stat-card remaining-card">
            <div className="stat-icon">
              <ArrowRightOutlined />
            </div>
            <div className="stat-info">
              <Text className="stat-label">剩余名额</Text>
              <Title level={3} className="stat-value">{availablePersons.length}</Title>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 2026 AI 字样展示 */}
      {persons.length > 0 ? (
        <motion.div
          className="text-display-section"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Title level={3} className="section-title">
            <span className="gradient-text">🎊 2026 年会抽奖 🎊</span>
          </Title>
          
          <div className="text-grid-container">
            <div className="text-grid">
              {TEXT_2026.map((pos, idx) => {
                const card = displayCards[idx];
                const isAnimated = animatedCards.has(idx);
                
                return (
                  <motion.div
                    key={idx}
                    className={`text-card ${card?.type === 'person' ? 'has-person' : 'empty'} ${isAnimated ? 'animated' : ''}`}
                    style={{
                      gridColumn: pos.x + 1,
                      gridRow: pos.y + 1,
                    }}
                    variants={cardVariants}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    {card?.type === 'person' && card.data ? (
                      <>
                        <div className="card-glow"></div>
                        <div className="person-card-content">
                          <div className="person-avatar">
                            {card.data.name.charAt(0)}
                          </div>
                          <div className="person-info">
                            <div className="person-name">{card.data.name}</div>
                            <div className="person-id">{card.data.employeeId}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="empty-card-content">
                        <div className="placeholder-icon">✨</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <Empty
          description={
            <div className="empty-content">
              <p>暂无人员数据</p>
              <p className="empty-hint">请先导入人员列表，系统将自动生成 "2026 AI" 字样展示</p>
            </div>
          }
          className="empty-state"
        />
      )}

      {/* 快速操作 */}
      <div className="quick-actions">
        <Title level={4} className="actions-title">快速操作</Title>
        <div className="action-buttons">
          <Button
            type="primary"
            size="large"
            icon={<TrophyOutlined />}
            href="#/lottery"
            className="action-btn primary"
          >
            开始抽奖
          </Button>
          <Button
            size="large"
            icon={<GiftOutlined />}
            href="#/prizes"
            className="action-btn"
          >
            管理奖项
          </Button>
          <Button
            size="large"
            icon={<UserOutlined />}
            href="#/persons"
            className="action-btn"
          >
            导入人员
          </Button>
        </div>
      </div>
    </div>
  );
}
