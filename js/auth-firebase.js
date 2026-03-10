// Firebase认证 - 替换auth.js
async function handleLogin() {
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!phone || !validatePhone(phone)) { showToast('请输入正确手机号'); return; }
    if (!password) { showToast('请输入密码'); return; }
    
    try {
        showLoading(true);
        const user = await dataManager.findUserByPhone(phone);
        if (!user) { showToast('账号不存在'); showLoading(false); return; }
        if (user.password !== password) { showToast('密码错误'); showLoading(false); return; }
        if (user.status === 'pending') { showToast('待审批'); showLoading(false); return; }
        if (user.status === 'rejected') { showToast('已禁用'); showLoading(false); return; }
        
        await auth.signInWithEmailAndPassword(`${phone}@fake.com`, password);
        dataManager.setCurrentUser(user);
        showToast('登录成功');
        showLoading(false);
        setTimeout(() => { initAfterLogin(); showPage('homePage'); }, 500);
    } catch (e) {
        showToast('登录失败:' + e.message);
        showLoading(false);
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    
    if (!name || !phone || !validatePhone(phone)) { showToast('请填写正确信息'); return; }
    if (password.length < 6) { showToast('密码至少6位'); return; }
    if (password !== password2) { showToast('密码不一致'); return; }
    
    try {
        showLoading(true);
        const exist = await dataManager.findUserByPhone(phone);
        if (exist) { showToast('手机号已注册'); showLoading(false); return; }
        
        await auth.createUserWithEmailAndPassword(`${phone}@fake.com`, password);
        await dataManager.addUser({ name, phone, password });
        showToast('注册成功，等待审批');
        showLoading(false);
        document.getElementById('regName').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPassword2').value = '';
        setTimeout(() => showPage('loginPage'), 1500);
    } catch (e) {
        showToast('注册失败:' + e.message);
        showLoading(false);
    }
}

async function handleLogout() {
    if (confirm('确定退出？')) {
        await auth.signOut();
        dataManager.clearCurrentUser();
        document.body.classList.remove('is-admin');
        showPage('loginPage');
        showToast('已退出');
    }
}

function validatePhone(phone) { return /^1[3-9]\d{9}$/.test(phone); }

async function initAfterLogin() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    if (user.role === 'admin') document.body.classList.add('is-admin');
    else document.body.classList.remove('is-admin');
    updateHeaderUserInfo();
    await updateHomeStats();
    await updateRecentCustomers();
    await updateTodayRanking();
    updateProfilePage();
    if (user.role === 'admin') await updatePendingUserCount();
}

function updateHeaderUserInfo() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role === 'admin' ? '管理员' : '员工';
}

function changePassword() { document.getElementById('passwordModal').classList.add('active'); }
function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

async function saveNewPassword() {
    const user = dataManager.getCurrentUser();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!oldPassword || oldPassword !== user.password) { showToast('原密码错误'); return; }
    if (newPassword.length < 6) { showToast('新密码至少6位'); return; }
    if (newPassword !== confirmPassword) { showToast('密码不一致'); return; }
    
    try {
        const updatedUser = await dataManager.updateUser(user.id, { password: newPassword });
        dataManager.setCurrentUser({ ...user, password: newPassword });
        showToast('密码修改成功');
        closePasswordModal();
    } catch (e) {
        showToast('修改失败:' + e.message);
    }
}

function checkLoginStatus() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userData = await dataManager.findUserByPhone(user.email.replace('@fake.com', ''));
            if (userData) {
                dataManager.setCurrentUser(userData);
                initAfterLogin();
                showPage('homePage');
            }
        } else {
            showPage('loginPage');
        }
    });
}

function getCurrentUser() { return dataManager.getCurrentUser(); }
function isAdmin() { const u = dataManager.getCurrentUser(); return u && u.role === 'admin'; }

async function updatePendingUserCount() {
    const users = await dataManager.getPendingUsers();
    const badge = document.getElementById('pendingUserCount');
    if (badge) {
        badge.textContent = users.length;
        badge.style.display = users.length > 0 ? 'inline' : 'none';
    }
}

async function loadUserManagePage() {
    await loadPendingUsers();
    await loadActiveUsers();
}

async function loadPendingUsers() {
    const container = document.getElementById('pendingUsers');
    const users = await dataManager.getPendingUsers();
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

async function loadActiveUsers() {
    const container = document.getElementById('activeUsers');
    const users = await dataManager.getActiveUsers();
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
            ${user.role !== 'admin' ? `<div class="user-actions"><button class="btn btn-danger btn-small" onclick="disableUser('${user.id}')">禁用</button></div>` : ''}
        </div>
    `).join('');
}

async function approveUser(userId) {
    if (confirm('确定通过？')) {
        await dataManager.approveUser(userId);
        showToast('已通过');
        loadUserManagePage();
        updatePendingUserCount();
    }
}

async function rejectUser(userId) {
    if (confirm('确定拒绝？')) {
        await dataManager.rejectUser(userId);
        showToast('已拒绝');
        loadUserManagePage();
        updatePendingUserCount();
    }
}

async function disableUser(userId) {
    if (confirm('确定禁用？')) {
        await dataManager.rejectUser(userId);
        showToast('已禁用');
        loadActiveUsers();
    }
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.toggle('active', show);
}
