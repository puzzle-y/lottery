import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Slider,
  Select,
  Space,
  Divider,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  BgColorsOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useLotteryStore } from '@/store';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Settings() {
  const { config, updateConfig } = useLotteryStore();
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const handleValuesChange = () => {
    setHasChanges(true);
  };

  const handleSave = (values: any) => {
    updateConfig({
      title: values.title,
      subtitle: values.subtitle,
      footer: values.footer,
      animationSpeed: values.animationSpeed,
      animationEffect: values.animationEffect,
    });
    message.success('设置已保存');
    setHasChanges(false);
  };

  const handleReset = () => {
    form.setFieldsValue({
      title: '2026 AI 年会抽奖',
      subtitle: '新春快乐 · 万事如意',
      footer: '© 2026 公司年会抽奖系统',
      animationSpeed: 1,
      animationEffect: 'default',
    });
    setHasChanges(true);
  };

  return (
    <div className="settings-page">
      <Card
        title={
          <div className="card-header">
            <Title level={4} className="card-title">
              <SettingOutlined /> 系统设置
            </Title>
          </div>
        }
        className="settings-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={handleValuesChange}
          initialValues={{
            title: config.title,
            subtitle: config.subtitle,
            footer: config.footer,
            animationSpeed: config.animationSpeed,
            animationEffect: config.animationEffect,
          }}
          className="settings-form"
        >
          <div className="section-title">
            <BgColorsOutlined /> 界面配置
          </div>
          <Divider className="custom-divider" />

          <Form.Item
            name="title"
            label="系统标题"
            rules={[{ required: true, message: '请输入系统标题' }]}
          >
            <Input placeholder="请输入系统标题" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label="副标题"
            rules={[{ required: true, message: '请输入副标题' }]}
          >
            <Input placeholder="请输入副标题" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="footer"
            label="页脚信息"
            rules={[{ required: true, message: '请输入页脚信息' }]}
          >
            <Input placeholder="请输入页脚信息" maxLength={100} showCount />
          </Form.Item>

          <div className="section-title" style={{ marginTop: 32 }}>
            <ThunderboltOutlined /> 动画效果
          </div>
          <Divider className="custom-divider" />

          <Form.Item
            name="animationEffect"
            label="动画效果模式"
          >
            <Select placeholder="请选择动画效果">
              <Option value="default">默认模式</Option>
              <Option value="fast">快速模式</Option>
              <Option value="slow">慢速模式</Option>
              <Option value="crazy">疯狂模式</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="animationSpeed"
            label="动画速度"
          >
            <Slider
              min={0.5}
              max={3}
              step={0.5}
              marks={{
                0.5: '慢',
                1: '正常',
                2: '快',
                3: '极快',
              }}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                className="save-btn"
              >
                保存设置
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="large"
              >
                恢复默认
              </Button>
            </Space>
            {hasChanges && (
              <Text type="warning" className="unsaved-tip">
                有未保存的更改
              </Text>
            )}
          </Form.Item>
        </Form>

        <div className="preview-section">
          <div className="section-title">
            <BgColorsOutlined /> 预览效果
          </div>
          <Divider className="custom-divider" />
          <div className="preview-box">
            <div className="preview-header">
              <h2 className="preview-title">{form.getFieldValue('title') || config.title}</h2>
              <span className="preview-subtitle">{form.getFieldValue('subtitle') || config.subtitle}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
