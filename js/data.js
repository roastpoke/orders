/**
 * 数据存储模块
 * 使用 LocalStorage 进行本地数据持久化
 */

// 存储键名
const STORAGE_KEYS = {
    USERS: 'crm_users',
    CUSTOMERS: 'crm_customers',
    FOLLOWUPS: 'crm_followups',
    CURRENT_USER: 'crm_current_user'
};

// 默认测试账号
const DEFAULT_USERS = [
    {
        id: 'user_001',
        phone: '13800000001',
        password: 'admin123',
        name: '管理员',
        role: 'admin',
        status: 'active',
        createTime: '2024-01-01 00:00:00'
    },
    {
        id: 'user_002',
        phone: '13800000002',
        password: '123456',
        name: '张三',
        role: 'staff',
        status: 'active',
        createTime: '2024-01-01 00:00:00'
    },
    {
        id: 'user_003',
        phone: '13800000003',
        password: '123456',
        name: '李四',
        role: 'staff',
        status: 'active',
        createTime: '2024-01-01 00:00:00'
    },
    {
        id: 'user_004',
        phone: '13800000004',
        password: '123456',
        name: '王五',
        role: 'staff',
        status: 'active',
        createTime: '2024-01-01 00:00:00'
    }
];

// 示例客户数据
const DEFAULT_CUSTOMERS = [
    {
        id: 'cust_001',
        name: '陈女士',
        phone: '13912345678',
        source: '抖音',
        dueDate: '2024-06-15',
        budget: '20-50万',
        roomType: '3居室',
        status: '跟进中',
        remark: '对小区环境要求较高',
        ownerId: 'user_002',
        ownerName: '张三',
        createTime: '2024-03-10 09:30:00',
        updateTime: '2024-03-10 09:30:00'
    },
    {
        id: 'cust_002',
        name: '刘先生',
        phone: '13887654321',
        source: '门店',
        dueDate: '2024-05-20',
        budget: '50-100万',
        roomType: '4居室及以上',
        status: '新客户',
        remark: '首次到店咨询',
        ownerId: 'user_003',
        ownerName: '李四',
        createTime: '2024-03-10 10:15:00',
        updateTime: '2024-03-10 10:15:00'
    },
    {
        id: 'cust_003',
        name: '王女士',
        phone: '13765432198',
        source: '小红书',
        dueDate: '2024-07-01',
        budget: '10-20万',
        roomType: '2居室',
        status: '已成交',
        remark: '已签约',
        ownerId: 'user_002',
        ownerName: '张三',
        createTime: '2024-03-09 14:20:00',
        updateTime: '2024-03-10 11:00:00'
    }
];

// 示例跟进记录
const DEFAULT_FOLLOWUPS = [
    {
        id: 'follow_001',
        customerId: 'cust_001',
        type: '电话',
        content: '电话沟通了客户需求，客户对3居室感兴趣，预算在30万左右',
        userId: 'user_002',
        userName: '张三',
        createTime: '2024-03-10 10:00:00'
    },
    {
        id: 'follow_002',
        customerId: 'cust_003',
        type: '面谈',
        content: '客户到店签约，交付定金5000元',
        userId: 'user_002',
        userName: '张三',
        createTime: '2024-03-10 11:00:00'
    }
];

/**
 * 数据管理类
 */
class DataManager {
    constructor() {
        this.init();
    }

    /**
     * 初始化数据
     */
    init() {
        // 初始化用户数据
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            this.saveUsers(DEFAULT_USERS);
        }
        
        // 初始化客户数据
        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            this.saveCustomers(DEFAULT_CUSTOMERS);
        }
        
        // 初始化跟进记录
        if (!localStorage.getItem(STORAGE_KEYS.FOLLOWUPS)) {
            this.saveFollowups(DEFAULT_FOLLOWUPS);
        }
    }

    /**
     * 生成唯一ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取当前时间字符串
     */
    getCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 格式化时间显示
     */
    formatTimeAgo(timeStr) {
        const time = new Date(timeStr);
        const now = new Date();
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return timeStr.split(' ')[0];
    }

    // ==================== 用户相关 ====================

    /**
     * 获取所有用户
     */
    getUsers() {
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * 保存用户列表
     */
    saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    /**
     * 根据手机号查找用户
     */
    findUserByPhone(phone) {
        const users = this.getUsers();
        return users.find(u => u.phone === phone);
    }

    /**
     * 根据ID查找用户
     */
    findUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    /**
     * 添加新用户
     */
    addUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: this.generateId('user'),
            ...userData,
            role: 'staff',
            status: 'pending', // 待审批
            createTime: this.getCurrentTime()
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    /**
     * 更新用户信息
     */
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            return users[index];
        }
        return null;
    }

    /**
     * 删除用户
     */
    deleteUser(userId) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== userId);
        this.saveUsers(filtered);
    }

    /**
     * 获取待审批用户
     */
    getPendingUsers() {
        return this.getUsers().filter(u => u.status === 'pending');
    }

    /**
     * 获取已激活用户
     */
    getActiveUsers() {
        return this.getUsers().filter(u => u.status === 'active');
    }

    /**
     * 审批用户
     */
    approveUser(userId) {
        return this.updateUser(userId, { status: 'active' });
    }

    /**
     * 拒绝/禁用用户
     */
    rejectUser(userId) {
        return this.updateUser(userId, { status: 'rejected' });
    }

    /**
     * 设置当前登录用户
     */
    setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }

    /**
     * 获取当前登录用户
     */
    getCurrentUser() {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    /**
     * 清除当前登录用户
     */
    clearCurrentUser() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // ==================== 客户相关 ====================

    /**
     * 获取所有客户
     */
    getCustomers() {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * 保存客户列表
     */
    saveCustomers(customers) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }

    /**
     * 根据ID查找客户
     */
    findCustomerById(id) {
        const customers = this.getCustomers();
        return customers.find(c => c.id === id);
    }

    /**
     * 根据手机号查找客户
     */
    findCustomerByPhone(phone) {
        const customers = this.getCustomers();
        return customers.find(c => c.phone === phone);
    }

    /**
     * 添加客户
     */
    addCustomer(customerData, owner) {
        const customers = this.getCustomers();
        const now = this.getCurrentTime();
        const newCustomer = {
            id: this.generateId('cust'),
            ...customerData,
            ownerId: owner.id,
            ownerName: owner.name,
            createTime: now,
            updateTime: now
        };
        customers.push(newCustomer);
        this.saveCustomers(customers);
        return newCustomer;
    }

    /**
     * 更新客户信息
     */
    updateCustomer(customerId, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            customers[index] = { 
                ...customers[index], 
                ...updates,
                updateTime: this.getCurrentTime()
            };
            this.saveCustomers(customers);
            return customers[index];
        }
        return null;
    }

    /**
     * 删除客户
     */
    deleteCustomer(customerId) {
        const customers = this.getCustomers();
        const filtered = customers.filter(c => c.id !== customerId);
        this.saveCustomers(filtered);
        
        // 同时删除相关跟进记录
        const followups = this.getFollowups();
        const filteredFollowups = followups.filter(f => f.customerId !== customerId);
        this.saveFollowups(filteredFollowups);
    }

    /**
     * 获取用户的客户列表
     */
    getCustomersByOwner(ownerId) {
        return this.getCustomers().filter(c => c.ownerId === ownerId);
    }

    /**
     * 搜索客户
     */
    searchCustomers(keyword, filters = {}) {
        let customers = this.getCustomers();
        
        // 关键词搜索
        if (keyword) {
            const kw = keyword.toLowerCase();
            customers = customers.filter(c => 
                c.name.toLowerCase().includes(kw) ||
                c.phone.includes(kw) ||
                (c.ownerName && c.ownerName.toLowerCase().includes(kw))
            );
        }
        
        // 来源筛选
        if (filters.source) {
            customers = customers.filter(c => c.source === filters.source);
        }
        
        // 状态筛选
        if (filters.status) {
            customers = customers.filter(c => c.status === filters.status);
        }
        
        // 归属人筛选
        if (filters.ownerId) {
            customers = customers.filter(c => c.ownerId === filters.ownerId);
        }
        
        // 按创建时间倒序
        customers.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        
        return customers;
    }

    /**
     * 获取今日新增客户数
     */
    getTodayCustomerCount(ownerId = null) {
        const today = new Date().toISOString().split('T')[0];
        let customers = this.getCustomers();
        
        if (ownerId) {
            customers = customers.filter(c => c.ownerId === ownerId);
        }
        
        return customers.filter(c => c.createTime.startsWith(today)).length;
    }

    /**
     * 获取客户统计
     */
    getCustomerStats(ownerId = null, period = 'all') {
        let customers = this.getCustomers();
        
        if (ownerId) {
            customers = customers.filter(c => c.ownerId === ownerId);
        }
        
        // 时间筛选
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }
            
            if (startDate) {
                customers = customers.filter(c => new Date(c.createTime) >= startDate);
            }
        }
        
        return {
            total: customers.length,
            new: customers.filter(c => c.status === '新客户').length,
            following: customers.filter(c => c.status === '跟进中').length,
            closed: customers.filter(c => c.status === '已成交').length,
            lost: customers.filter(c => c.status === '已流失').length
        };
    }

    /**
     * 获取来源分布
     */
    getSourceDistribution(ownerId = null) {
        let customers = this.getCustomers();
        
        if (ownerId) {
            customers = customers.filter(c => c.ownerId === ownerId);
        }
        
        const sources = {};
        customers.forEach(c => {
            sources[c.source] = (sources[c.source] || 0) + 1;
        });
        
        return Object.entries(sources)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * 获取员工排行榜
     */
    getStaffRanking(period = 'today') {
        const customers = this.getCustomers();
        const users = this.getActiveUsers().filter(u => u.role !== 'admin');
        
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0);
        }
        
        const ranking = users.map(user => {
            const userCustomers = customers.filter(c => 
                c.ownerId === user.id && 
                new Date(c.createTime) >= startDate
            );
            return {
                id: user.id,
                name: user.name,
                count: userCustomers.length
            };
        });
        
        return ranking.sort((a, b) => b.count - a.count);
    }

    // ==================== 跟进记录相关 ====================

    /**
     * 获取所有跟进记录
     */
    getFollowups() {
        const data = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * 保存跟进记录
     */
    saveFollowups(followups) {
        localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
    }

    /**
     * 获取客户的跟进记录
     */
    getFollowupsByCustomer(customerId) {
        return this.getFollowups()
            .filter(f => f.customerId === customerId)
            .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }

    /**
     * 添加跟进记录
     */
    addFollowup(followupData, user) {
        const followups = this.getFollowups();
        const newFollowup = {
            id: this.generateId('follow'),
            ...followupData,
            userId: user.id,
            userName: user.name,
            createTime: this.getCurrentTime()
        };
        followups.push(newFollowup);
        this.saveFollowups(followups);
        return newFollowup;
    }

    // ==================== 数据导出 ====================

    /**
     * 导出客户数据为CSV
     */
    exportCustomersToCSV(customers) {
        const headers = ['客户姓名', '联系电话', '客户来源', '预产期', '预算范围', '房型偏好', '状态', '跟进人', '登记时间', '备注'];
        
        const rows = customers.map(c => [
            c.name,
            c.phone,
            c.source,
            c.dueDate || '',
            c.budget || '',
            c.roomType || '',
            c.status,
            c.ownerName,
            c.createTime,
            c.remark || ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        // 添加BOM以支持Excel中文
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `客户数据_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}

// 创建全局数据管理实例
const dataManager = new DataManager();
