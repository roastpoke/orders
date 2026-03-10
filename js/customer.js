/**
 * 客户管理模块
 * 处理客户的增删改查、搜索筛选等功能
 */

// 当前查看的客户ID
let currentCustomerId = null;

/**
 * 添加客户
 */
function handleAddCustomer() {
    const user = dataManager.getCurrentUser();
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    // 获取表单数据
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const source = document.getElementById('customerSource').value;
    const dueDate = document.getElementById('customerDueDate').value;
    const budget = document.getElementById('customerBudget').value;
    const roomType = document.getElementById('customerRoomType').value;
    const status = document.getElementById('customerStatus').value;
    const remark = document.getElementById('customerRemark').value.trim();
    
    // 验证必填项
    if (!name) {
        showToast('请输入客户姓名');
        return;
    }
    
    if (!phone) {
        showToast('请输入联系电话');
        return;
    }
    
    if (!validatePhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }
    
    if (!source) {
        showToast('请选择客户来源');
        return;
    }
    
    // 检查手机号是否已存在
    const existCustomer = dataManager.findCustomerByPhone(phone);
    if (existCustomer) {
        showToast(`该客户已存在，归属人：${existCustomer.ownerName}`);
        return;
    }
    
    // 创建客户
    const customer = dataManager.addCustomer({
        name,
        phone,
        source,
        dueDate,
        budget,
        roomType,
        status,
        remark
    }, user);
    
    showToast('客户添加成功');
    
    // 清空表单
    clearAddCustomerForm();
    
    // 刷新首页数据
    updateHomeStats();
    updateRecentCustomers();
    updateTodayRanking();
    
    // 返回首页
    setTimeout(() => {
        showPage('homePage');
    }, 500);
}

/**
 * 清空添加客户表单
 */
function clearAddCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerSource').value = '';
    document.getElementById('customerDueDate').value = '';
    document.getElementById('customerBudget').value = '';
    document.getElementById('customerRoomType').value = '';
    document.getElementById('customerStatus').value = '新客户';
    document.getElementById('customerRemark').value = '';
}

/**
 * 加载客户列表
 */
function loadCustomerList() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const container = document.getElementById('customerList');
    let customers;
    
    // 管理员看所有，员工只看自己的
    if (user.role === 'admin') {
        customers = dataManager.searchCustomers('', {});
    } else {
        customers = dataManager.searchCustomers('', { ownerId: user.id });
    }
    
    renderCustomerList(container, customers);
}

/**
 * 搜索客户
 */
function searchCustomers() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const keyword = document.getElementById('searchInput').value.trim();
    const source = document.getElementById('filterSource').value;
    const status = document.getElementById('filterStatus').value;
    
    const container = document.getElementById('customerList');
    
    const filters = {};
    if (source) filters.source = source;
    if (status) filters.status = status;
    
    // 员工只能看自己的客户
    if (user.role !== 'admin') {
        filters.ownerId = user.id;
    }
    
    const customers = dataManager.searchCustomers(keyword, filters);
    renderCustomerList(container, customers);
}

/**
 * 渲染客户列表
 */
function renderCustomerList(container, customers) {
    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无客户记录</div>';
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="customer-item" onclick="viewCustomerDetail('${customer.id}')">
            <div class="customer-avatar">${customer.name.charAt(0)}</div>
            <div class="customer-info">
                <div class="customer-name">
                    ${customer.name}
                    <span class="status-tag ${getStatusClass(customer.status)}">${customer.status}</span>
                </div>
                <div class="customer-meta">
                    <span>${customer.phone}</span>
                    <span>${customer.source}</span>
                </div>
            </div>
            <div class="customer-time">
                <div>${dataManager.formatTimeAgo(customer.createTime)}</div>
                <div class="customer-owner">${customer.ownerName}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
    const classMap = {
        '新客户': 'new',
        '跟进中': 'following',
        '已成交': 'closed',
        '已流失': 'lost'
    };
    return classMap[status] || 'new';
}

/**
 * 查看客户详情
 */
function viewCustomerDetail(customerId) {
    currentCustomerId = customerId;
    const customer = dataManager.findCustomerById(customerId);
    
    if (!customer) {
        showToast('客户不存在');
        return;
    }
    
    const user = dataManager.getCurrentUser();
    
    // 渲染详情
    const container = document.getElementById('customerDetail');
    container.innerHTML = `
        <div class="detail-header">
            <div class="detail-avatar">${customer.name.charAt(0)}</div>
            <div class="detail-title">
                <h3>${customer.name}</h3>
                <p><span class="status-tag ${getStatusClass(customer.status)}">${customer.status}</span></p>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">联系电话</div>
            <div class="detail-value">${customer.phone}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">客户来源</div>
            <div class="detail-value">${customer.source}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">预产期</div>
            <div class="detail-value">${customer.dueDate || '未填写'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">预算范围</div>
            <div class="detail-value">${customer.budget || '未填写'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">房型偏好</div>
            <div class="detail-value">${customer.roomType || '未填写'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">跟进人</div>
            <div class="detail-value">${customer.ownerName}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">登记时间</div>
            <div class="detail-value">${customer.createTime}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">备注</div>
            <div class="detail-value">${customer.remark || '无'}</div>
        </div>
    `;
    
    // 加载跟进记录
    loadFollowupList(customerId);
    
    // 权限控制：只有归属人或管理员可以编辑/删除
    const canEdit = user.role === 'admin' || customer.ownerId === user.id;
    document.getElementById('editCustomerBtn').style.display = canEdit ? 'block' : 'none';
    document.getElementById('deleteCustomerBtn').style.display = canEdit ? 'block' : 'none';
    
    showPage('customerDetailPage');
}

/**
 * 编辑当前客户
 */
function editCurrentCustomer() {
    const customer = dataManager.findCustomerById(currentCustomerId);
    if (!customer) return;
    
    // 填充表单
    document.getElementById('editCustomerName').value = customer.name;
    document.getElementById('editCustomerPhone').value = customer.phone;
    document.getElementById('editCustomerSource').value = customer.source;
    document.getElementById('editCustomerDueDate').value = customer.dueDate || '';
    document.getElementById('editCustomerBudget').value = customer.budget || '';
    document.getElementById('editCustomerRoomType').value = customer.roomType || '';
    document.getElementById('editCustomerStatus').value = customer.status;
    document.getElementById('editCustomerRemark').value = customer.remark || '';
    
    showPage('editCustomerPage');
}

/**
 * 更新客户信息
 */
function handleUpdateCustomer() {
    const name = document.getElementById('editCustomerName').value.trim();
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const source = document.getElementById('editCustomerSource').value;
    const dueDate = document.getElementById('editCustomerDueDate').value;
    const budget = document.getElementById('editCustomerBudget').value;
    const roomType = document.getElementById('editCustomerRoomType').value;
    const status = document.getElementById('editCustomerStatus').value;
    const remark = document.getElementById('editCustomerRemark').value.trim();
    
    // 验证
    if (!name) {
        showToast('请输入客户姓名');
        return;
    }
    
    if (!phone) {
        showToast('请输入联系电话');
        return;
    }
    
    // 更新
    dataManager.updateCustomer(currentCustomerId, {
        name,
        phone,
        source,
        dueDate,
        budget,
        roomType,
        status,
        remark
    });
    
    showToast('保存成功');
    
    // 刷新详情页
    viewCustomerDetail(currentCustomerId);
}

/**
 * 删除当前客户
 */
function deleteCurrentCustomer() {
    if (confirm('确定删除该客户？删除后无法恢复')) {
        dataManager.deleteCustomer(currentCustomerId);
        showToast('已删除');
        
        // 刷新数据
        updateHomeStats();
        updateRecentCustomers();
        
        // 返回列表
        showPage('customerListPage');
        loadCustomerList();
    }
}

/**
 * 拨打客户电话
 */
function callCustomer() {
    const customer = dataManager.findCustomerById(currentCustomerId);
    if (customer) {
        window.location.href = `tel:${customer.phone}`;
    }
}

/**
 * 加载跟进记录
 */
function loadFollowupList(customerId) {
    const container = document.getElementById('followupList');
    const followups = dataManager.getFollowupsByCustomer(customerId);
    
    if (followups.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无跟进记录</div>';
        return;
    }
    
    container.innerHTML = followups.map(f => `
        <div class="followup-item">
            <div class="followup-header">
                <span class="followup-type">${f.type}</span>
                <span class="followup-time">${f.userName} · ${dataManager.formatTimeAgo(f.createTime)}</span>
            </div>
            <div class="followup-content">${f.content}</div>
        </div>
    `).join('');
}

/**
 * 显示添加跟进弹窗
 */
function showAddFollowUp() {
    document.getElementById('followupModal').classList.add('active');
}

/**
 * 关闭跟进弹窗
 */
function closeFollowupModal() {
    document.getElementById('followupModal').classList.remove('active');
    document.getElementById('followupContent').value = '';
    document.getElementById('followupType').value = '电话';
}

/**
 * 保存跟进记录
 */
function saveFollowup() {
    const content = document.getElementById('followupContent').value.trim();
    const type = document.getElementById('followupType').value;
    
    if (!content) {
        showToast('请输入跟进内容');
        return;
    }
    
    const user = dataManager.getCurrentUser();
    
    dataManager.addFollowup({
        customerId: currentCustomerId,
        type,
        content
    }, user);
    
    showToast('跟进记录已保存');
    closeFollowupModal();
    
    // 刷新跟进列表
    loadFollowupList(currentCustomerId);
    
    // 更新客户状态为跟进中（如果是新客户）
    const customer = dataManager.findCustomerById(currentCustomerId);
    if (customer && customer.status === '新客户') {
        dataManager.updateCustomer(currentCustomerId, { status: '跟进中' });
    }
}

/**
 * 切换搜索栏显示
 */
function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('active');
    
    if (searchBar.classList.contains('active')) {
        document.getElementById('searchInput').focus();
    }
}

/**
 * 管理员-加载所有客户
 */
function loadAllCustomers() {
    const container = document.getElementById('allCustomerList');
    const customers = dataManager.searchCustomers('', {});
    renderCustomerList(container, customers);
}

/**
 * 管理员-搜索所有客户
 */
function searchAllCustomers() {
    const keyword = document.getElementById('allSearchInput').value.trim();
    const container = document.getElementById('allCustomerList');
    const customers = dataManager.searchCustomers(keyword, {});
    renderCustomerList(container, customers);
}

/**
 * 切换全部客户搜索栏
 */
function toggleAllSearch() {
    const searchBar = document.getElementById('allSearchBar');
    searchBar.classList.toggle('active');
    
    if (searchBar.classList.contains('active')) {
        document.getElementById('allSearchInput').focus();
    }
}

/**
 * 导出数据
 */
function exportData() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    let customers;
    if (user.role === 'admin') {
        customers = dataManager.getCustomers();
    } else {
        customers = dataManager.getCustomersByOwner(user.id);
    }
    
    if (customers.length === 0) {
        showToast('暂无数据可导出');
        return;
    }
    
    dataManager.exportCustomersToCSV(customers);
    showToast('导出成功');
}

/**
 * 导出全部数据（管理员）
 */
function exportAllData() {
    const customers = dataManager.getCustomers();
    
    if (customers.length === 0) {
        showToast('暂无数据可导出');
        return;
    }
    
    dataManager.exportCustomersToCSV(customers);
    showToast('导出成功');
}

/**
 * 更新最近录入客户
 */
function updateRecentCustomers() {
    const user = dataManager.getCurrentUser();
    if (!user) return;
    
    const container = document.getElementById('recentCustomers');
    let customers;
    
    if (user.role === 'admin') {
        customers = dataManager.searchCustomers('', {}).slice(0, 5);
    } else {
        customers = dataManager.searchCustomers('', { ownerId: user.id }).slice(0, 5);
    }
    
    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无客户记录</div>';
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="customer-item" onclick="viewCustomerDetail('${customer.id}')">
            <div class="customer-avatar">${customer.name.charAt(0)}</div>
            <div class="customer-info">
                <div class="customer-name">
                    ${customer.name}
                    <span class="status-tag ${getStatusClass(customer.status)}">${customer.status}</span>
                </div>
                <div class="customer-meta">
                    <span>${customer.phone}</span>
                    <span>${customer.source}</span>
                </div>
            </div>
            <div class="customer-time">
                <div>${dataManager.formatTimeAgo(customer.createTime)}</div>
            </div>
        </div>
    `).join('');
}
