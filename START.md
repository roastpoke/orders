# 🚀 Firebase云端版部署指南

## 第一步：创建Firebase项目（5分钟）

1. 访问 https://console.firebase.google.com
2. 点击"添加项目"，输入项目名（如：customer-crm）
3. 完成创建

## 第二步：启用服务

### 1. Firestore Database
- 左侧菜单 → Firestore Database → 创建数据库
- 选择"测试模式"
- 位置选择：asia-east1（亚洲-香港）

### 2. Authentication
- 左侧菜单 → Authentication → Get started
- 启用"电子邮件/密码"

### 3. 获取配置
- 项目设置 → 您的应用 → Web应用
- 复制配置代码，替换`js/firebase-config.js`中的配置

## 第三步：设置安全规则

Firestore Database → 规则，粘贴以下规则：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /followups/{followupId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 第四步：部署网站

### 方法1：Vercel（推荐）
```bash
npm install -g vercel
cd e:\the
vercel
```

### 方法2：Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 第五步：设置第一个管理员

1. 在网站注册第一个账号
2. Firebase控制台 → Firestore Database
3. 找到users集合中你的记录
4. 编辑：`role: "admin"`, `status: "active"`

## ✅ 完成！

所有设备都可以访问网址，数据实时同步！

## 📝 注意事项

- 首次部署需要配置Firebase
- 测试账号数据在Firestore中
- 免费额度足够30人团队使用
- 中国大陆访问Firebase可能较慢，建议用Vercel部署

## 🆘 遇到问题？

1. Firebase无法访问 → 使用科学上网工具
2. 国内访问慢 → 考虑使用Leancloud替代
3. 数据不同步 → 检查安全规则是否设置

---
**重要**：Firebase配置完成后，所有设备都能实时同步数据！
