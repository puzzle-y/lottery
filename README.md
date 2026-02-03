# 年会抽奖系统

一个AI生成的年会抽奖系统，支持批量抽奖、奖项管理、人员管理等功能。

## 功能特性

- 🎉 年会抽奖：支持多种奖项设置和批量抽奖
- 👥 人员管理：支持导入和管理参与抽奖人员
- 🏆 奖项管理：灵活设置各类奖项及中奖名额
- 📊 结果统计：实时显示抽奖结果和统计数据
- 🎨 现代化UI：喜庆的红色主题设计，流畅的动画效果
- 📱 响应式布局：支持桌面端和移动端访问

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- Zustand (状态管理)
- Framer Motion (动画)
- Vite 5 (构建工具)

## 系统要求

- Node.js >= 16.0.0
- npm 或 yarn

## 安装与运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd lottery
```

### 2. 安装依赖

```bash
npm install
# 或者
yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
# 或者
yarn dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
# 或者
yarn build
```

### 5. 预览生产版本

```bash
npm run preview
# 或者
yarn preview
```

## 配置说明

### 环境变量

如需自定义端口或其他配置，可在项目根目录创建 `.env` 文件：

```env
# 开发服务器端口
VITE_PORT=3000
# API基础URL
VITE_API_BASE_URL=http://localhost:8080
```

## 使用指南

### 首页
- 查看参与抽奖人员总数
- 显示奖项数量和已中奖人数
- 动态展示 "2026" 字样

### 人员管理
- 导入参与抽奖的人员名单
- 支持批量导入（Excel格式）
- 查看和编辑人员信息

### 奖项管理
- 创建和编辑奖项
- 设置每个奖项的中奖人数
- 启用/禁用特定奖项

### 抽奖页面
- 选择奖项进行抽奖
- 3D球体展示参与抽奖人员
- 实时显示中奖结果
- 支持单次抽取或多轮抽取

### 结果页面
- 查看历史中奖记录
- 按奖项分类显示中奖者
- 导出中奖结果

## 部署指南

### 静态部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录下的文件上传至静态服务器

### Docker 部署

1. 构建镜像：
```bash
docker build -t lottery .
```

2. 运行容器：
```bash
docker run -d -p 80:80 lottery
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 文件结构

```
src/
├── components/     # 公共组件
├── pages/         # 页面组件
├── store/         # 状态管理
├── types/         # 类型定义
├── utils/         # 工具函数
├── App.tsx        # 主应用组件
└── main.tsx       # 入口文件
```

## 自定义配置

### 主题颜色

可通过修改 CSS 变量来自定义主题颜色：

```css
:root {
  --primary-color: #DC143C;  /* 主色调 - 深红色 */
  --secondary-color: #FFD700; /* 辅助色 - 金色 */
  --background-color: #8B0000; /* 背景色 - 深红色 */
}
```

### 页面标题

编辑 `src/store/index.ts` 中的配置来修改页面标题。

## 常见问题

### Q: 如何导入人员名单？
A: 在人员管理页面点击"导入人员"按钮，选择Excel格式的人员名单文件。

### Q: 抽奖结果如何保存？
A: 中奖记录会自动保存在浏览器本地存储中，支持导出功能。

### Q: 如何添加新奖项？
A: 在奖项管理页面点击"新增奖项"按钮，填写奖项名称和中奖人数。

## 许可证

MIT License