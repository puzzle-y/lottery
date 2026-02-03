import { Layout as AntLayout, Menu, Button, Modal, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  GiftOutlined,
  TeamOutlined,
  TrophyOutlined,
  HistoryOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useLotteryStore } from '@/store';
import './index.css';

const { Header, Sider, Content, Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
  { key: '/prizes', icon: <GiftOutlined />, label: <Link to="/prizes">奖项管理</Link> },
  { key: '/persons', icon: <TeamOutlined />, label: <Link to="/persons">人员管理</Link> },
  { key: '/lottery', icon: <TrophyOutlined />, label: <Link to="/lottery">开始抽奖</Link> },
  { key: '/results', icon: <HistoryOutlined />, label: <Link to="/results">中奖记录</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">系统设置</Link> },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { config, resetWinners, clearWinnerRecords, clearPersons, setPrizes } = useLotteryStore();

  const handleReset = () => {
    Modal.confirm({
      title: '重置抽奖系统',
      content: '确定要重置整个抽奖系统吗？这将清除所有中奖记录和状态，但会保留奖项设置和人员列表。',
      okText: '确定重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        resetWinners();
        clearWinnerRecords();
        message.success('抽奖系统已重置');
        navigate('/');
      },
    });
  };

  const handleFullReset = () => {
    Modal.confirm({
      title: '完全重置系统',
      content: '确定要完全重置系统吗？这将清除所有数据，包括人员列表、奖项设置和中奖记录！此操作不可恢复！',
      okText: '确定完全重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        resetWinners();
        clearWinnerRecords();
        clearPersons();
        setPrizes([]);
        message.success('系统已完全重置');
        navigate('/');
      },
    });
  };

  return (
    <AntLayout className="lottery-layout">
      <Header className="lottery-header">
        <div className="header-content">
          <div className="header-title">
            <div className="logo-icon">🎊</div>
            <div className="title-text">
              <h1 className="main-title">{config.title}</h1>
              <span className="sub-title">{config.subtitle}</span>
            </div>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              danger
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className="reset-btn"
            >
              重置抽奖
            </Button>
            <Button
              danger
              onClick={handleFullReset}
              className="full-reset-btn"
            >
              完全重置
            </Button>
          </div>
        </div>
      </Header>
      <AntLayout className="lottery-main">
        <Sider
          width={200}
          className="lottery-sider"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="lottery-menu"
          />
        </Sider>
        <AntLayout className="lottery-content-wrapper">
          <Content className="lottery-content">{children}</Content>
          <Footer className="lottery-footer">
            <div className="footer-content">
              <span>{config.footer}</span>
            </div>
          </Footer>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
}
