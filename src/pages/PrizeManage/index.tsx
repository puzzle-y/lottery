import { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Space,
  Typography,
  Popconfirm,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useLotteryStore } from '@/store';
import type { Prize } from '@/types';
import './index.css';

const { Title } = Typography;

export default function PrizeManage() {
  const { prizes, addPrize, updatePrize, removePrize, reorderPrizes } = useLotteryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [form] = Form.useForm();

  const sortedPrizes = [...prizes].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    setEditingPrize(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    form.setFieldsValue({
      name: prize.name,
      count: prize.count,
      enabled: prize.enabled,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    removePrize(id);
    message.success('奖项已删除');
  };

  const handleSave = (values: any) => {
    if (editingPrize) {
      updatePrize(editingPrize.id, {
        name: values.name,
        count: values.count,
        enabled: values.enabled,
      });
      message.success('奖项已更新');
    } else {
      const newPrize: Prize = {
        id: `prize_${Date.now()}`,
        name: values.name,
        count: values.count,
        enabled: values.enabled,
        order: prizes.length,
        createdAt: new Date().toISOString(),
      };
      addPrize(newPrize);
      message.success('奖项已添加');
    }
    setIsModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPrizes = [...sortedPrizes];
    [newPrizes[index - 1], newPrizes[index]] = [newPrizes[index], newPrizes[index - 1]];
    reorderPrizes(
      newPrizes.map((p, i) => ({ ...p, order: i }))
    );
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedPrizes.length - 1) return;
    const newPrizes = [...sortedPrizes];
    [newPrizes[index], newPrizes[index + 1]] = [newPrizes[index + 1], newPrizes[index]];
    reorderPrizes(
      newPrizes.map((p, i) => ({ ...p, order: i }))
    );
  };

  const columns = [
    {
      title: '顺序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (order: number) => (
        <span className="order-badge">{order + 1}</span>
      ),
    },
    {
      title: '奖项名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Prize) => (
        <Space>
          <TrophyOutlined
            style={{
              color: record.enabled ? '#ffd700' : '#999',
              fontSize: 18,
            }}
          />
          <span className={record.enabled ? 'prize-name' : 'prize-name disabled'}>
            {name}
          </span>
        </Space>
      ),
    },
    {
      title: '抽奖人数',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      render: (count: number) => (
        <span className="count-badge">{count} 人</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: Prize) => (
        <Switch
          checked={enabled}
          onChange={(checked) => updatePrize(record.id, { enabled: checked })}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Prize, index: number) => (
        <Space>
          <Button
            type="text"
            icon={<ArrowUpOutlined />}
            onClick={() => handleMoveUp(index)}
            disabled={index === 0}
          />
          <Button
            type="text"
            icon={<ArrowDownOutlined />}
            onClick={() => handleMoveDown(index)}
            disabled={index === sortedPrizes.length - 1}
          />
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此奖项？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="prize-manage">
      <Card
        title={
          <div className="card-header">
            <Title level={4} className="card-title">
              <TrophyOutlined /> 奖项管理
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="add-btn"
            >
              添加奖项
            </Button>
          </div>
        }
        className="prize-card"
      >
        {sortedPrizes.length > 0 ? (
          <Table
            columns={columns}
            dataSource={sortedPrizes}
            rowKey="id"
            pagination={false}
            className="prize-table"
          />
        ) : (
          <Empty
            description="暂无奖项，请点击上方按钮添加"
            className="empty-state"
          />
        )}
      </Card>

      <Modal
        title={editingPrize ? '编辑奖项' : '添加奖项'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
        className="prize-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ enabled: true, count: 1 }}
        >
          <Form.Item
            name="name"
            label="奖项名称"
            rules={[{ required: true, message: '请输入奖项名称' }]}
          >
            <Input placeholder="例如：一等奖、特等奖" />
          </Form.Item>
          <Form.Item
            name="count"
            label="抽奖人数"
            rules={[{ required: true, message: '请输入抽奖人数' }]}
          >
            <InputNumber
              min={1}
              max={1000}
              style={{ width: '100%' }}
              placeholder="请输入计划抽奖人数"
            />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
