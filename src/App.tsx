import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import PrizeManage from '@/pages/PrizeManage';
import PersonManage from '@/pages/PersonManage';
import Lottery from '@/pages/Lottery';
import Results from '@/pages/Results';
import Settings from '@/pages/Settings';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#dc2626',
          colorError: '#dc2626',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prizes" element={<PrizeManage />} />
            <Route path="/persons" element={<PersonManage />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
