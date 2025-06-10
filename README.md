# AI 照片贴纸生成器

一个基于 Next.js 和 Replicate API 的 AI 照片贴纸生成器，可以将普通人像照片转换为可爱的贴纸风格。

## 功能特点

- 📸 支持上传本地图片
- 🎨 自动将人脸转换为贴纸风格
- 🚀 实时处理和预览
- 💫 美观的用户界面
- ⚡️ 快速的响应速度

## 技术栈

- **前端框架**: Next.js 14
- **样式**: Tailwind CSS
- **AI 模型**: Replicate API (face-to-sticker model)
- **语言**: TypeScript
- **部署**: Vercel (推荐)

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── generate-sticker/
│   │       └── route.ts      # 贴纸生成 API 路由
│   ├── page.tsx              # 主页面组件
│   └── layout.tsx            # 应用布局
├── lib/
│   └── env-check.ts          # 环境变量检查工具
└── types/
    └── env.d.ts              # 环境变量类型定义
```

### 核心文件说明

1. `src/app/page.tsx`
   - 主页面组件
   - 处理图片上传
   - 显示生成结果
   - 错误处理和用户反馈

2. `src/app/api/generate-sticker/route.ts`
   - 处理图片生成请求
   - 与 Replicate API 交互
   - 错误处理和状态管理

3. `src/lib/env-check.ts`
   - 环境变量验证
   - 启动时检查配置

## 安装和设置

1. 克隆项目：
```bash
git clone <repository-url>
cd ai-photo-sticker
```

2. 安装依赖：
```bash
npm install
```

3. 环境变量配置：

创建 `.env.local` 文件并添加：
```env
NEXT_PUBLIC_REPLICATE_API_TOKEN=your_replicate_api_token_here
```

4. 启动开发服务器：
```bash
npm run dev
```

## 使用说明

### 上传图片要求

- **支持格式**: JPG、PNG
- **大小限制**: 最大 5MB
- **图片要求**:
  - 清晰的人脸照片
  - 正面角度
  - 光线充足
  - 避免戴墨镜

### 最佳实践

1. **选择合适的照片**:
   - 使用正面照片
   - 确保人脸清晰可见
   - 避免过度滤镜或处理

2. **处理过程**:
   - 上传照片后等待处理
   - 处理时间约 10-30 秒
   - 生成完成后自动显示结果

### 错误处理

常见错误及解决方案：

1. **图片格式错误**:
   - 确保使用 JPG 或 PNG 格式
   - 检查文件大小是否超限

2. **人脸检测失败**:
   - 使用更清晰的照片
   - 确保照片中有完整人脸
   - 调整光线和角度

3. **生成超时**:
   - 检查网络连接
   - 重试上传
   - 尝试压缩图片大小

## API 接口

### 生成贴纸

**端点**: `/api/generate-sticker`

**方法**: POST

**请求体**:
```typescript
{
  image: string; // base64 编码的图片或图片 URL
}
```

**响应**:
```typescript
{
  imageUrl: string; // 生成的贴纸图片 URL
}
```

**错误响应**:
```typescript
{
  error: string;
  details?: string;
}
```

## 开发指南

### 添加新功能

1. 创建新的 API 路由:
```typescript
// src/app/api/your-endpoint/route.ts
export async function POST(request: Request) {
  // 实现你的逻辑
}
```

2. 添加前端组件:
```typescript
// src/components/YourComponent.tsx
"use client";

export default function YourComponent() {
  // 实现你的组件
}
```

### 环境变量类型

在 `src/types/env.d.ts` 中定义新的环境变量：

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_REPLICATE_API_TOKEN: string;
    // 添加新的环境变量
  }
}
```

## 部署

推荐使用 Vercel 部署：

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT

## 作者

[Your Name]

## 致谢

- [Replicate](https://replicate.com/) - AI 模型支持
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
