import { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Upload,
  Modal,
  message,
  Space,
  Typography,
  Popconfirm,
  Empty,
  Alert,
  List,
  Tag,
  Progress,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useLotteryStore } from '@/store';
import { parseExcelFile } from '@/utils/excel';
import type { Person } from '@/types';
import './index.css';

const { Title, Text } = Typography;

export default function PersonManage() {
  const { persons, setPersons, clearPersons, getWinners } = useLotteryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    data: Person[];
    errors: string[];
    totalCount: number;
  } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const winners = getWinners();
  const availableCount = persons.length - winners.length;

  const handleUpload = async (file: File) => {
    setIsImporting(true);
    try {
      const result = await parseExcelFile(file);
      setImportResult(result);
      setIsModalOpen(true);
      
      if (result.success) {
        message.success(`成功解析 ${result.totalCount} 条人员数据`);
      } else {
        message.warning('解析完成，但存在一些问题，请查看详情');
      }
    } catch (error) {
      message.error('文件解析失败');
    } finally {
      setIsImporting(false);
    }
    return false;
  };

  const handleConfirmImport = () => {
    if (importResult?.data) {
      // 保留已中奖人员的状态
      const winnerIds = new Set(winners.map(w => w.employeeId));
      const mergedData = importResult.data.map(person => ({
        ...person,
        isWinner: winnerIds.has(person.employeeId),
      }));
      setPersons(mergedData);
      message.success(`成功导入 ${importResult.data.length} 条人员数据`);
      setIsModalOpen(false);
      setFileList([]);
    }
  };

  const handleClear = () => {
    Modal.confirm({
      title: '清空人员列表',
      content: '确定要清空所有人员数据吗？此操作不可恢复！',
      okText: '确定清空',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        clearPersons();
        message.success('人员列表已清空');
      },
    });
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (id: string, record: Person) => (
        <Space>
          <UserOutlined style={{ color: record.isWinner ? '#52c41a' : '#ffd700' }} />
          <span className={record.isWinner ? 'winner-id' : ''}>{id}</span>
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Person) => (
        <span className={record.isWinner ? 'winner-name' : ''}>
          {name}
          {record.isWinner && (
            <Tag color="success" className="winner-tag">已中奖</Tag>
          )}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isWinner',
      key: 'isWinner',
      width: 120,
      render: (isWinner: boolean) => (
        <Tag color={isWinner ? 'success' : 'default'}>
          {isWinner ? '已中奖' : '未中奖'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="person-manage">
      <Card
        title={
          <div className="card-header">
            <Title level={4} className="card-title">
              <TeamOutlined /> 人员管理
            </Title>
            <Space>
              <Upload
                accept=".xlsx,.xls"
                beforeUpload={handleUpload}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                showUploadList={false}
              >
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={isImporting}
                  className="upload-btn"
                >
                  导入Excel
                </Button>
              </Upload>
              {persons.length > 0 && (
                <Popconfirm
                  title="确定清空人员列表？"
                  onConfirm={handleClear}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    清空列表
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        }
        className="person-card"
      >
        {persons.length > 0 ? (
          <>
            <div className="stats-bar">
              <div className="stat-item">
                <Text className="stat-label">总人数</Text>
                <Text className="stat-value total">{persons.length}</Text>
              </div>
              <div className="stat-item">
                <Text className="stat-label">已中奖</Text>
                <Text className="stat-value winner">{winners.length}</Text>
              </div>
              <div className="stat-item">
                <Text className="stat-label">未中奖</Text>
                <Text className="stat-value available">{availableCount}</Text>
              </div>
              <Progress
                percent={Math.round((winners.length / persons.length) * 100)}
                strokeColor={{ '0%': '#ffd700', '100%': '#dc2626' }}
                trailColor="rgba(255, 255, 255, 0.1)"
                className="progress-bar"
              />
            </div>
            <Table
              columns={columns}
              dataSource={persons}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              className="person-table"
              size="small"
            />
          </>
        ) : (
          <Empty
            description={
              <div className="empty-content">
                <p>暂无人员数据</p>
                <p className="empty-hint">
                  请上传Excel文件，格式要求：第一列"工号"，第二列"姓名"
                </p>
              </div>
            }
            className="empty-state"
          />
        )}
      </Card>

      <Modal
        title="导入预览"
        open={isModalOpen}
        onOk={handleConfirmImport}
        onCancel={() => setIsModalOpen(false)}
        okText="确认导入"
        cancelText="取消"
        width={700}
        className="import-modal"
        okButtonProps={{ disabled: !importResult?.data.length }}
      >
        {importResult && (
          <div className="import-preview">
            <div className="import-stats">
              <div className="import-stat success">
                <CheckCircleOutlined />
                <span>成功解析: {importResult.totalCount} 条</span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="import-stat error">
                  <WarningOutlined />
                  <span>问题数量: {importResult.errors.length} 个</span>
                </div>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <Alert
                message="发现以下问题"
                description={
                  <List
                    size="small"
                    dataSource={importResult.errors.slice(0, 10)}
                    renderItem={(item) => (
                      <List.Item>
                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                }
                type="warning"
                showIcon
                className="error-alert"
              />
            )}

            <div className="preview-title">数据预览（前10条）</div>
            <Table
              columns={[
                { title: '工号', dataIndex: 'employeeId', key: 'employeeId' },
                { title: '姓名', dataIndex: 'name', key: 'name' },
              ]}
              dataSource={importResult.data.slice(0, 10)}
              rowKey="id"
              pagination={false}
              size="small"
              className="preview-table"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
