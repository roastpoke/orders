/**
 * 认证模块
 * 处理用户登录、注册、权限验证等功能
 */

/**
 * 处理登录
 */
function handleLogin() {
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // 验证输入
    if (!phone) {
        showToast('请输入手机号');
        return;
    }
    
    if (!validatePhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }
    
    if (!password) {
        showToast('请输入密码');
        return;
    }
    
    // 查找用户
    const user = dataManager.findUserByPhone(phone);
    
    if (!user) {
        showToast('账号不存在，请先注册');
        return;
    }
    
    if (user.password !== password) {
        showToast('密码错误');
        return;
    }
    
    if (user.status === 'pending') {
        showToast('账号待审批，请联系管理员');
        return;
    }
    
    if (user.status === 'rejected') {
        showToast('账号已被禁用');
        return;
    }
    
    // 登录成功
    dataManager.setCurrentUser(user);
    showToast('登录成功');
    
    // 清空输入
    document.getElementById('loginPhone').value = '';
    document.getElementById('loginPassword').value = '';
    
    // 跳转到首页
    setTimeout(() => {
        initAfterLogin();
        showPage('homePage');
    }, 500);
}

/**
 * 处理注册
 */
function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    
    // 验证输入
    if (!name) {
        showToast('请输入姓名');
        return;
    }
    
    if (!phone) {
        showToast('请输入手机号');
        return;
    }
    
    if (!validatePhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }
    
    if (!password) {
        showToast('请设置密码');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码至少6位');
        return;
    }
    
    if (password !== password2) {
        showToast('两次密码不一致');
        return;
    }
    
    // 检查手机号是否已注册
    const existUser = dataManager.findUserByPhone(phone);
    if (existUser) {
        showToast('该手机号已注册');
        return;
    }
    
    // 创建用户
    const newUser = dataManager.addUser({
        name,
        phone,
        password
    });
    
    showToast('注册成功，请等待管理员审批');
    
    // 清空输入
    document.getElementById('regName').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regPassword2').value = '';
    
    // 返回登录页
    setTimeout(() => {
        showPage('loginPage');
    }, 1500);
}

/**
 * 处理退出登录
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        dataManager.clearCurrentUser();
        document.body.classList.remove('is-admin');
        showPage('loginPage');
        showToast('已退出登录');
    }
}

/**
 * 登录后初始化
 */
function initAfterLogin() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    // 设置管理员标识
    if (user.role === 'admin') {
        document.body.classList.add('is-admin');
    } else {
        document.body.classList.remove('is-admin');
    }
    
    // 更新头部用户信息
    updateHeaderUserInfo();
    
    // 更新首页数据
    updateHomeStats();
    updateRecentCustomers();
    updateTodayRanking();
    
    // 更新个人中心
    updateProfilePage();
    
    // 如果是管理员，更新待审批数量
    if (user.role === 'admin') {
        updatePendingUserCount();
    }
}

/**
 * 更新头部用户信息
 */
function updateHeaderUserInfo() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role === 'admin' ? '管理员' : '员工';
}

/**
 * 验证手机号格式
 */
function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 修改密码
 */
function changePassword() {
    document.getElementById('passwordModal').classList.add('active');
}

/**
 * 关闭密码弹窗
 */
function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

/**
 * 保存新密码
 */
function saveNewPassword() {
    const user = dataManager.getCurrentUser();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!oldPassword) {
        showToast('请输入原密码');
        return;
    }
    
    if (oldPassword !== user.password) {
        showToast('原密码错误');
        return;
    }
    
    if (!newPassword) {
        showToast('请输入新密码');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('新密码至少6位');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('两次密码不一致');
        return;
    }
    
    // 更新密码
    const updatedUser = dataManager.updateUser(user.id, { password: newPassword });
    dataManager.setCurrentUser(updatedUser);
    
    showToast('密码修改成功');
    closePasswordModal();
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
    const user = dataManager.getCurrentUser();
    if (user) {
        initAfterLogin();
        showPage('homePage');
    } else {
        showPage('loginPage');
    }
}

/**
 * 获取当前用户
 */
function getCurrentUser() {
    return dataManager.getCurrentUser();
}

/**
 * 是否是管理员
 */
function isAdmin() {
    const user = dataManager.getCurrentUser();
    return user && user.role === 'admin';
}

/**
 * 更新待审批用户数量
 */
function updatePendingUserCount() {
    const count = dataManager.getPendingUsers().length;
    const badge = document.getElementById('pendingUserCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

/**
 * 加载用户管理页面
 */
function loadUserManagePage() {
    loadPendingUsers();
    loadActiveUsers();
}

/**
 * 加载待审批用户
 */
function loadPendingUsers() {
    const container = document.getElementById('pendingUsers');
    const users = dataManager.getPendingUsers();
    
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无待审批用户</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-phone">${user.phone}</div>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary btn-small" onclick="approveUser('${user.id}')">通过</button>
                <button class="btn btn-danger btn-small" onclick="rejectUser('${user.id}')">拒绝</button>
            </div>
        </div>
    `).join('');
}

/**
 * 加载已激活用户
 */
function loadActiveUsers() {
    const container = document.getElementById('activeUsers');
    const users = dataManager.getActiveUsers();
    
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无用户</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <div class="user-name">${user.name} ${user.role === 'admin' ? '<span class="status-tag closed">管理员</span>' : ''}</div>
                <div class="user-phone">${user.phone}</div>
            </div>
            ${user.role !== 'admin' ? `
                <div class="user-actions">
                    <button class="btn btn-danger btn-small" onclick="disableUser('${user.id}')">禁用</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * 审批通过用户
 */
function approveUser(userId) {
    if (confirm('确定通过该用户的注册申请？')) {
        dataManager.approveUser(userId);
        showToast('已通过');
        loadUserManagePage();
        updatePendingUserCount();
    }
}

/**
 * 拒绝用户
 */
function rejectUser(userId) {
    if (confirm('确定拒绝该用户的注册申请？')) {
        dataManager.rejectUser(userId);
        showToast('已拒绝');
        loadUserManagePage();
        updatePendingUserCount();
    }
}

/**
 * 禁用用户
 */
function disableUser(userId) {
    if (confirm('确定禁用该用户？禁用后用户将无法登录')) {
        dataManager.rejectUser(userId);
        showToast('已禁用');
        loadActiveUsers();
    }
}
