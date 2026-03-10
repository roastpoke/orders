// Firebase数据管理 - 替换data.js使用
const db = firebase.firestore();
const auth = firebase.auth();

class FirebaseDataManager {
    getCurrentTime() {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    
    getCurrentUser() {
        const user = auth.currentUser;
        if (!user) return null;
        const userData = JSON.parse(localStorage.getItem('currentUserData') || '{}');
        return { ...userData, uid: user.uid };
    }
    
    setCurrentUser(userData) {
        localStorage.setItem('currentUserData', JSON.stringify(userData));
    }
    
    clearCurrentUser() {
        localStorage.removeItem('currentUserData');
    }
    
    async findUserByPhone(phone) {
        const snapshot = await db.collection('users').where('phone', '==', phone).get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    
    async addUser(userData) {
        const docRef = await db.collection('users').add({
            ...userData,
            role: 'staff',
            status: 'pending',
            createTime: this.getCurrentTime()
        });
        return { id: docRef.id, ...userData };
    }
    
    async updateUser(userId, updates) {
        await db.collection('users').doc(userId).update(updates);
        return { id: userId, ...updates };
    }
    
    async getPendingUsers() {
        const snapshot = await db.collection('users').where('status', '==', 'pending').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getActiveUsers() {
        const snapshot = await db.collection('users').where('status', '==', 'active').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async approveUser(userId) {
        return this.updateUser(userId, { status: 'active' });
    }
    
    async rejectUser(userId) {
        return this.updateUser(userId, { status: 'rejected' });
    }
    
    async findCustomerByPhone(phone) {
        const snapshot = await db.collection('customers').where('phone', '==', phone).get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    
    async addCustomer(customerData, owner) {
        const now = this.getCurrentTime();
        const docRef = await db.collection('customers').add({
            ...customerData,
            ownerId: owner.uid,
            ownerName: owner.name,
            createTime: now,
            updateTime: now
        });
        return { id: docRef.id, ...customerData, ownerId: owner.uid, ownerName: owner.name };
    }
    
    async getCustomers() {
        const snapshot = await db.collection('customers').orderBy('createTime', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getCustomersByOwner(ownerId) {
        const snapshot = await db.collection('customers').where('ownerId', '==', ownerId).orderBy('createTime', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async findCustomerById(id) {
        const doc = await db.collection('customers').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    
    async updateCustomer(customerId, updates) {
        await db.collection('customers').doc(customerId).update({
            ...updates,
            updateTime: this.getCurrentTime()
        });
        return { id: customerId, ...updates };
    }
    
    async deleteCustomer(customerId) {
        await db.collection('customers').doc(customerId).delete();
        const followups = await db.collection('followups').where('customerId', '==', customerId).get();
        const batch = db.batch();
        followups.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
    
    async addFollowup(followupData, user) {
        const docRef = await db.collection('followups').add({
            ...followupData,
            userId: user.uid,
            userName: user.name,
            createTime: this.getCurrentTime()
        });
        return { id: docRef.id, ...followupData };
    }
    
    async getFollowupsByCustomer(customerId) {
        const snapshot = await db.collection('followups').where('customerId', '==', customerId).orderBy('createTime', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
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
    
    exportCustomersToCSV(customers) {
        const headers = ['客户姓名', '联系电话', '客户来源', '预产期', '预算范围', '房型偏好', '状态', '跟进人', '登记时间', '备注'];
        const rows = customers.map(c => [c.name, c.phone, c.source, c.dueDate || '', c.budget || '', c.roomType || '', c.status, c.ownerName, c.createTime, c.remark || '']);
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `客户数据_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}

// 创建全局 dataManager 实例
const dataManager = new FirebaseDataManager();
window.dataManager = dataManager;
