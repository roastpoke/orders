/**
 * Firebase 配置文件
 * 请将此处配置替换为你的 Firebase 项目配置
 */

// Firebase 配置 - 部署时替换
const firebaseConfig = {
    apiKey: "AIzaSyDfbeH_XUcWdWMXJCIJWZXTE3wBFCTtuDA",  // 替换为你的
    authDomain: "customer-crm-e7151.firebaseapp.com",
    projectId: "customer-crm-e7151",
    storageBucket: "customer-crm-e7151.firebasestorage.app",
    messagingSenderId: "1052018704171",
    appId: "1:1052018704171:web:fb67973ebf5593ed7acf6e"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取服务实例
const db = firebase.firestore();
const auth = firebase.auth();

// 配置 Firestore 设置
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// 启用离线持久化
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('多个标签页打开，持久化只能在一个标签页中启用');
        } else if (err.code == 'unimplemented') {
            console.log('当前浏览器不支持持久化');
        }
    });

console.log('Firebase 初始化成功');
