import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Empty,
  Popconfirm,
  message,
  DatePicker,
} from 'antd';
import {
  TrophyOutlined,
  ExportOutlined,
  DeleteOutlined,
  HistoryOutlined,
  GiftOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLotteryStore } from '@/store';
import { exportWinnersToExcel } from '@/utils/excel';
import dayjs from 'dayjs';
import type { WinnerRecord } from '@/types';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Results() {
  const { winnerRecords, removeWinnerRecord, clearWinnerRecords, prizes, persons } = useLotteryStore();
  const [selectedPrize, setSelectedPrize] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // 过滤记录
  const filteredRecords = useMemo(() => {
    return winnerRecords.filter(record => {
      // 按奖项过滤
      if (selectedPrize !== 'all' && record.prizeId !== selectedPrize) {
        return false;
      }
      
      // 按日期过滤
      if (dateRange[0] && dateRange[1]) {
        const recordDate = dayjs(record.winTime);
        if (recordDate.isBefore(dateRange[0]) || recordDate.isAfter(dateRange[1])) {
          return false;
        }
      }
      
      return true;
    });
  }, [winnerRecords, selectedPrize, dateRange]);

  // 统计数据
  const stats = useMemo(() => {
    const totalPrizes = new Set(winnerRecords.map(r => r.prizeId)).size;
    const totalWinners = winnerRecords.length;
    const todayWinners = winnerRecords.filter(r => 
      dayjs(r.winTime).isSame(dayjs(), 'day')
    ).length;
    
    return { totalPrizes, totalWinners, todayWinners };
  }, [winnerRecords]);

  // 导出Excel
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      message.warning('没有可导出的记录');
      return;
    }
    
    const filename = `中奖记录_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}`;
    exportWinnersToExcel(filteredRecords, filename);
    message.success('导出成功');
  };

  // 删除记录
  const handleDelete = (id: string) => {
    removeWinnerRecord(id);
    message.success('记录已删除');
  };

  // 清空所有记录
  const handleClearAll = () => {
    clearWinnerRecords();
    message.success('所有记录已清空');
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '奖项',
      dataIndex: 'prizeName',
      key: 'prizeName',
      render: (name: string) => (
        <Space>
          <GiftOutlined style={{ color: '#ffd700' }} />
          <span className="prize-name">{name}</span>
        </Space>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (id: string) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <span>{id}</span>
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'personName',
      key: 'personName',
      render: (name: string) => (
        <span className="winner-name">{name}</span>
      ),
    },
    {
      title: '中奖时间',
      dataIndex: 'winTime',
      key: 'winTime',
      render: (time: string) => (
        <Tag color="blue" className="time-tag">
          <HistoryOutlined /> {time}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: WinnerRecord) => (
        <Popconfirm
          title="确定删除此记录？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="results-page">
      {/* 统计卡片 */}
      <div className="stats-row">
        <Card className="stat-card">
          <TrophyOutlined className="stat-icon" />
          <div className="stat-content">
            <Text className="stat-label">已开奖奖项</Text>
            <Title level={3} className="stat-value">{stats.totalPrizes}</Title>
          </div>
        </Card>
        <Card className="stat-card">
          <GiftOutlined className="stat-icon" />
          <div className="stat-content">
            <Text className="stat-label">总中奖人数</Text>
            <Title level={3} className="stat-value">{stats.totalWinners}</Title>
          </div>
        </Card>
        <Card className="stat-card">
          <HistoryOutlined className="stat-icon" />
          <div className="stat-content">
            <Text className="stat-label">今日中奖</Text>
            <Title level={3} className="stat-value">{stats.todayWinners}</Title>
          </div>
        </Card>
      </div>

      {/* 主内容区 */}
      <Card
        title={
          <div className="card-header">
            <Title level={4} className="card-title">
              <TrophyOutlined /> 中奖记录
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
                disabled={filteredRecords.length === 0}
                className="export-btn"
              >
                导出Excel
              </Button>
              {winnerRecords.length > 0 && (
                <Popconfirm
                  title="确定清空所有记录？"
                  description="此操作不可恢复！"
                  onConfirm={handleClearAll}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    清空记录
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        }
        className="results-card"
      >
        {/* 过滤器 */}
        <div className="filters">
          <Space size="middle" wrap>
            <div className="filter-item">
              <Text className="filter-label">奖项筛选：</Text>
              <Select
                value={selectedPrize}
                onChange={setSelectedPrize}
                style={{ width: 180 }}
                className="filter-select"
              >
                <Option value="all">全部奖项</Option>
                {prizes.map(prize => (
                  <Option key={prize.id} value={prize.id}>
                    {prize.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="filter-item">
              <Text className="filter-label">时间范围：</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates || [null, null])}
                className="filter-picker"
              />
            </div>
          </Space>
        </div>

        {/* 记录表格 */}
        {filteredRecords.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            className="results-table"
          />
        ) : (
          <Empty
            description={
              <div className="empty-content">
                <p>暂无中奖记录</p>
                {winnerRecords.length > 0 && (
                  <p className="empty-hint">请调整筛选条件</p>
                )}
              </div>
            }
            className="empty-state"
          />
        )}
      </Card>
    </div>
  );
}
