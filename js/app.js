/**
 * 主应用模块
 * 处理页面切换、统计数据、通用功能等
 */

// 当前统计周期
let currentStatsPeriod = 'today';

/**
 * 应用初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
});

/**
 * 显示页面
 */
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 页面特定的初始化
    switch (pageId) {
        case 'homePage':
            updateHomeStats();
            updateRecentCustomers();
            updateTodayRanking();
            break;
        case 'customerListPage':
            loadCustomerList();
            break;
        case 'statsPage':
            updateStatsPage();
            break;
        case 'profilePage':
            updateProfilePage();
            break;
        case 'adminPage':
            // 管理中心
            break;
        case 'userManagePage':
            loadUserManagePage();
            break;
        case 'allCustomersPage':
            loadAllCustomers();
            break;
    }
}

/**
 * 显示Toast提示
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, duration);
}

/**
 * 更新首页统计数据
 */
function updateHomeStats() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const isAdmin = user.role === 'admin';
    const ownerId = isAdmin ? null : user.id;
    
    // 今日新增
    const todayCount = dataManager.getTodayCustomerCount(ownerId);
    document.getElementById('statTodayCount').textContent = todayCount;
    
    // 我的客户/总客户
    const stats = dataManager.getCustomerStats(ownerId);
    document.getElementById('statMyCount').textContent = stats.total;
    
    // 总客户数（管理员看全部，员工看自己）
    const totalStats = dataManager.getCustomerStats(null);
    document.getElementById('statTotalCount').textContent = totalStats.total;
    
    // 待跟进（新客户数量）
    document.getElementById('statPendingCount').textContent = stats.new + stats.following;
}

/**
 * 更新今日排行榜
 */
function updateTodayRanking() {
    const container = document.getElementById('todayRanking');
    const ranking = dataManager.getStaffRanking('today');
    
    if (ranking.length === 0 || ranking.every(r => r.count === 0)) {
        container.innerHTML = '<div class="empty-state">今日暂无数据</div>';
        return;
    }
    
    container.innerHTML = ranking.slice(0, 5).map((item, index) => `
        <div class="ranking-item">
            <div class="ranking-rank ${index < 3 ? 'top' + (index + 1) : ''}">${index + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${item.name}</div>
            </div>
            <div class="ranking-count">${item.count}</div>
        </div>
    `).join('');
}

/**
 * 更新个人中心页面
 */
function updateProfilePage() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    // 基本信息
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileRole').textContent = user.role === 'admin' ? '管理员' : '员工';
    document.getElementById('profilePhone').textContent = user.phone;
    
    // 统计数据
    const stats = dataManager.getCustomerStats(user.id);
    const todayCount = dataManager.getTodayCustomerCount(user.id);
    
    document.getElementById('profileCustomerCount').textContent = stats.total;
    document.getElementById('profileTodayCount').textContent = todayCount;
    document.getElementById('profileClosedCount').textContent = stats.closed;
}

/**
 * 更新统计页面
 */
function updateStatsPage() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const isAdmin = user.role === 'admin';
    const ownerId = isAdmin ? null : user.id;
    
    // 获取统计数据
    const stats = dataManager.getCustomerStats(ownerId, currentStatsPeriod);
    
    // 更新统计数字
    document.getElementById('statsTotal').textContent = stats.total;
    document.getElementById('statsNew').textContent = stats.new;
    document.getElementById('statsFollowing').textContent = stats.following;
    document.getElementById('statsClosed').textContent = stats.closed;
    document.getElementById('statsLost').textContent = stats.lost;
    
    // 更新来源分布图
    updateSourceChart(ownerId);
    
    // 更新员工排行（管理员可见）
    if (isAdmin) {
        updateStaffRanking();
    }
}

/**
 * 切换统计周期
 */
function changeStatsPeriod(period) {
    currentStatsPeriod = period;
    
    // 更新标签样式
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 刷新数据
    updateStatsPage();
}

/**
 * 更新来源分布图表
 */
function updateSourceChart(ownerId) {
    const container = document.getElementById('sourceChart');
    const distribution = dataManager.getSourceDistribution(ownerId);
    
    if (distribution.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无数据</div>';
        return;
    }
    
    const maxCount = Math.max(...distribution.map(d => d.count));
    
    container.innerHTML = distribution.map(item => {
        const percentage = maxCount > 0 ? (item.count / maxCount * 100) : 0;
        return `
            <div class="chart-bar">
                <div class="chart-label">${item.name}</div>
                <div class="chart-track">
                    <div class="chart-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="chart-value">${item.count}</div>
            </div>
        `;
    }).join('');
}

/**
 * 更新员工排行榜
 */
function updateStaffRanking() {
    const container = document.getElementById('staffRanking');
    const ranking = dataManager.getStaffRanking(currentStatsPeriod);
    
    if (ranking.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无数据</div>';
        return;
    }
    
    container.innerHTML = ranking.map((item, index) => `
        <div class="ranking-item">
            <div class="ranking-rank ${index < 3 ? 'top' + (index + 1) : ''}">${index + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${item.name}</div>
            </div>
            <div class="ranking-count">${item.count}</div>
        </div>
    `).join('');
}

/**
 * 显示关于信息
 */
function showAbout() {
    alert(`客户管理系统 v1.0

功能特点：
• 客户信息录入与管理
• 销售抢单归属确权
• 多角色权限控制
• 数据统计与导出

测试账号：
管理员：13800000001 / admin123
员工1：13800000002 / 123456
员工2：13800000003 / 123456
员工3：13800000004 / 123456

数据存储在浏览器本地，清除浏览器数据会丢失记录。`);
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * PWA 安装提示
 */
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

/**
 * 安装 PWA
 */
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受安装');
            }
            deferredPrompt = null;
        });
    }
}

// 注册 Service Worker（如果需要离线功能）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
