# 云端部署指南 - Firebase版本

## 📦 部署方案

使用 **Firebase** 实现云端数据同步和托管，完全免费（小团队使用量足够）。

## 🚀 部署步骤

### 第一步：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称，如 "customer-crm"
4. 完成创建

### 第二步：启用服务

在 Firebase 控制台中：

1. **Firestore Database**
   - 左侧菜单 → "Firestore Database" → "创建数据库"
   - 选择"测试模式"（开发时）或"生产模式"
   - 选择服务器位置（亚洲选 asia-east1）

2. **Authentication**
   - 左侧菜单 → "Authentication" → "Get started"
   - 启用"电子邮件/密码"登录方式

3. **Hosting**（可选，用于部署网站）
   - 左侧菜单 → "Hosting" → "Get started"

### 第三步：获取配置信息

1. 在 Firebase 控制台，点击项目设置（齿轮图标）
2. 找到"您的应用"部分，点击"网络应用"图标 `</>`
3. 注册应用，获取配置代码：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 第四步：配置文件

将获取的配置信息填入 `js/firebase-config.js` 文件中。

### 第五步：设置安全规则

在 Firestore Database 的"规则"标签中，设置以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户集合
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 客户集合
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId || 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 跟进记录集合
    match /followups/{followupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId ||
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 第六步：部署网站

#### 方法1：Firebase Hosting（推荐）

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化项目
cd e:\the
firebase init

# 选择 Hosting
# 选择已创建的项目
# Public directory: . (当前目录)
# Configure as single-page app: No
# Set up automatic builds: No

# 部署
firebase deploy
```

部署后会得到一个网址，如：`https://your-project.web.app`

#### 方法2：其他托管平台

也可以部署到：
- Vercel (vercel.com)
- Netlify (netlify.com)
- GitHub Pages

只需将 `e:\the` 文件夹上传即可。

---

## 📱 使用说明

部署后：
1. 访问部署的网址
2. 首次需要管理员注册并手动在 Firebase 控制台将其角色设为 admin
3. 之后其他用户可以正常注册，等待管理员审批

---

## 🔐 初始管理员设置

1. 注册第一个账号
2. 在 Firebase 控制台 → Firestore Database
3. 找到 users 集合，找到你的用户记录
4. 将 `role` 字段改为 `admin`
5. 将 `status` 字段改为 `active`

---

## 💰 费用说明

Firebase 免费额度（Spark 计划）：
- Firestore: 50K 读取/天，20K 写入/天，1GB 存储
- Hosting: 10GB 流量/月
- 足够 5-30 人团队使用

超出可升级到按量付费（Blaze 计划），价格很低。

---

## 🆘 问题排查

### 数据不同步
- 检查网络连接
- 查看浏览器控制台错误
- 确认 Firebase 配置正确

### 无法登录
- 确认 Authentication 已启用
- 检查安全规则配置

### 权限错误
- 确认 Firestore 安全规则已设置
- 检查用户角色字段

---

如有其他问题，可参考 [Firebase 文档](https://firebase.google.com/docs)
