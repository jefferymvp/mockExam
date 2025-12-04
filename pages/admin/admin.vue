<template>
	<view class="container">
        <!-- Tab 0: Organization Management -->
		<view v-if="currentTab === 0" class="tab-content">
            <view class="header">
                <text class="section-title">组织列表</text>
                <button class="btn-add" @click="showCreateModal">+ 新建组织</button>
            </view>

            <view class="list-container">
                <view class="list-item" v-for="org in organizations" :key="org.id">
                    <view class="item-info">
                        <text class="item-name">{{ org.name }}</text>
                        <text class="item-status" :class="{ 'status-open': org.allow_join, 'status-closed': !org.allow_join }">
                            {{ org.allow_join ? '开放加入' : '禁止加入' }}
                        </text>
                        <text class="item-id">ID: {{ org.id.slice(0, 8) }}...</text>
                    </view>
                    <view class="item-actions">
                        <button class="btn-mini btn-edit" @click="editOrg(org)">配置</button>
                        <button class="btn-mini btn-delete" @click="deleteOrg(org.id)">删除</button>
                    </view>
                </view>
                <view v-if="organizations.length === 0" class="empty-tip">暂无组织</view>
            </view>
		</view>
        
        <!-- Tab 1: User Management -->
        <view v-if="currentTab === 1" class="tab-content">
            <view class="header">
                <text class="section-title">用户列表</text>
            </view>
            
            <view class="list-container">
                <view class="list-item" v-for="user in users" :key="user.id">
                    <view class="item-info">
                        <view class="item-header">
                            <text class="item-name">{{ user.username || '未命名用户' }}</text>
                            <text class="role-badge" :class="user.role === 'admin' ? 'role-admin' : 'role-user'">
                                {{ user.role === 'admin' ? '管理员' : '用户' }}
                            </text>
                        </view>
                        <text class="item-id">ID: {{ user.id.slice(0, 8) }}...</text>
                    </view>
                    <view class="item-actions row-actions">
                         <button class="btn-mini" :class="user.is_active !== false ? 'btn-disable' : 'btn-enable'" @click="toggleUserStatus(user)">
                            {{ user.is_active !== false ? '禁用' : '启用' }}
                        </button>
                        <button class="btn-mini btn-edit" @click="openUserOrgConfig(user)">组织</button>
                    </view>
                </view>
                 <view v-if="users.length === 0" class="empty-tip">暂无用户</view>
            </view>
        </view>

        <!-- Tab 2: Question Bank Management -->
        <view v-if="currentTab === 2" class="tab-content">
            <view class="header">
                <text class="section-title">题库列表</text>
                <button class="btn-add" @click="triggerFileUpload">导入题库 (Excel)</button>
            </view>
            
            <view class="list-container">
                 <view class="list-item" v-for="bank in allBanks" :key="bank.id">
                    <view class="item-info">
                        <view class="item-header">
                            <text class="item-name">{{ bank.name }}</text>
                            <text class="status-badge" :class="bank.is_active ? 'status-active' : 'status-inactive'">
                                {{ bank.is_active ? '已启用' : '已禁用' }}
                            </text>
                        </view>
                        <text class="item-desc">{{ bank.description || '暂无描述' }}</text>
                    </view>
                    <view class="item-actions row-actions">
                        <button class="btn-mini" :class="bank.is_active ? 'btn-disable' : 'btn-enable'" @click="toggleBankStatus(bank)">
                            {{ bank.is_active ? '禁用' : '启用' }}
                        </button>
                        <button class="btn-mini btn-delete" @click="deleteBank(bank)">删除</button>
                    </view>
                 </view>
                 <view v-if="allBanks.length === 0" class="empty-tip">暂无题库，请点击上方按钮导入</view>
            </view>
        </view>
        
        <!-- Common Modal Mask -->
        <view class="modal-mask" v-if="activeModal" @click="closeModal">
            
            <!-- Modal: Org -> Banks Configuration -->
            <view class="modal-content big-modal" v-if="activeModal === 'org-banks'" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">配置题库 - {{ currentEditingOrg ? currentEditingOrg.name : '' }}</text>
                    <text class="close-btn" @click="closeModal">×</text>
                </view>
                <view class="modal-subheader">
                    <text class="sub-text">勾选以绑定题库到该组织</text>
                </view>
                <scroll-view scroll-y class="modal-body">
                    <view class="check-item" v-for="bank in allBanks" :key="bank.id" @click="toggleBankBinding(bank)">
                        <text class="check-name">{{ bank.name }}</text>
                        <view class="custom-checkbox" :class="{ 'checked': orgBankIds.includes(bank.id) }">
                            <text v-if="orgBankIds.includes(bank.id)">✓</text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- Modal: User -> Orgs Configuration -->
            <view class="modal-content big-modal" v-if="activeModal === 'user-orgs'" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">加入组织 - {{ currentEditingUser ? currentEditingUser.username : '' }}</text>
                    <text class="close-btn" @click="closeModal">×</text>
                </view>
                <view class="modal-subheader">
                    <text class="sub-text">勾选以将用户加入组织</text>
                </view>
                <scroll-view scroll-y class="modal-body">
                    <view class="check-item" v-for="org in organizations" :key="org.id" @click="toggleUserOrgBinding(org)">
                         <text class="check-name">{{ org.name }}</text>
                        <view class="custom-checkbox" :class="{ 'checked': userOrgIds.includes(org.id) }">
                            <text v-if="userOrgIds.includes(org.id)">✓</text>
                        </view>
                    </view>
                </scroll-view>
            </view>
            
        </view>

        <!-- Tab Navigation (Bottom Footer) -->
        <view class="nav-tabs">
            <view class="nav-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">组织管理</view>
            <view class="nav-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">用户管理</view>
            <view class="nav-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">题库管理</view>
        </view>
	</view>
</template>

<script>
	import { supabase } from '@/utils/supabase.js'
    import * as XLSX from 'xlsx'

	export default {
		data() {
			return {
                currentTab: 0, // 0: Orgs, 1: Users, 2: Banks
                activeModal: null, // 'org-banks' | 'user-orgs' | null
                
				organizations: [],
                users: [],
                allBanks: [],
                
                // Edit States
                currentEditingOrg: null,
                orgBankIds: [],
                
                currentEditingUser: null,
                userOrgIds: []
			}
		},
		onShow() {
            this.loadOrganizations();
            this.checkRole();
		},
		methods: {
            switchTab(index) {
                this.currentTab = index;
                if (index === 0) this.loadOrganizations();
                if (index === 1) this.loadUsers();
                if (index === 2) this.loadBanks();
            },
            
            async checkRole() {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (data && data.role !== 'admin') {
                    uni.showModal({ title: '权限不足', content: '您不是管理员', showCancel: false, success: () => uni.navigateBack() });
                }
            },
            
            closeModal() {
                this.activeModal = null;
                this.currentEditingOrg = null;
                this.currentEditingUser = null;
            },

            // --- Tab 0: Organizations ---
			async loadOrganizations() {
				const { data, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .order('created_at', { ascending: false });
				if (data) this.organizations = data;
			},

			showCreateModal() {
				uni.showModal({
					title: '新建组织',
					editable: true,
					placeholderText: '请输入组织名称',
					success: async (res) => {
						if (res.confirm && res.content) {
							const { error } = await supabase.from('organizations').insert({ name: res.content });
							if (error) uni.showToast({ title: error.message, icon: 'none' });
							else {
								uni.showToast({ title: '创建成功', icon: 'success' });
								this.loadOrganizations();
							}
						}
					}
				});
			},
            
            editOrg(org) {
                uni.showActionSheet({
                    itemList: [
                        '修改名称', 
                        org.allow_join ? '关闭加入通道' : '开启加入通道',
                        '配置题库'
                    ],
                    success: (res) => {
                        if (res.tapIndex === 0) {
                             uni.showModal({
                                title: '修改名称',
                                editable: true,
                                content: org.name,
                                success: async (mRes) => {
                                    if (mRes.confirm && mRes.content) {
                                        await supabase.from('organizations').update({ name: mRes.content }).eq('id', org.id);
                                        this.loadOrganizations();
                                    }
                                }
                            });
                        } else if (res.tapIndex === 1) {
                             this.updateOrgStatus(org);
                        } else if (res.tapIndex === 2) {
                            this.openBankConfig(org);
                        }
                    }
                });
            },
            
            async updateOrgStatus(org) {
                await supabase.from('organizations').update({ allow_join: !org.allow_join }).eq('id', org.id);
                this.loadOrganizations();
            },

            deleteOrg(id) {
                uni.showModal({
                    title: '确认删除',
                    content: '删除操作不可恢复！',
                    success: async (res) => {
                        if (res.confirm) {
                            const { error } = await supabase.from('organizations').delete().eq('id', id);
                            if (!error) {
                                uni.showToast({ title: '已删除', icon: 'success' });
                                this.loadOrganizations();
                            } else {
                                uni.showToast({ title: error.message, icon: 'none' });
                            }
                        }
                    }
                })
            },
            
            // --- Tab 1: Users ---
            async loadUsers() {
                const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
                if (data) this.users = data;
            },
            
            async toggleUserStatus(user) {
                // Default to true if null
                const currentStatus = user.is_active !== false; 
                const newStatus = !currentStatus;
                
                const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', user.id);
                
                if (error) uni.showToast({ title: error.message, icon: 'none' });
                else {
                    user.is_active = newStatus;
                    uni.showToast({ title: newStatus ? '已启用' : '已禁用', icon: 'none' });
                }
            },
            
            async openUserOrgConfig(user) {
                this.currentEditingUser = user;
                uni.showLoading({ title: '加载中...' });
                
                // Ensure we have organizations loaded
                if (this.organizations.length === 0) await this.loadOrganizations();
                
                // Load User's Memberships
                const { data } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id);
                this.userOrgIds = data ? data.map(m => m.organization_id) : [];
                
                uni.hideLoading();
                this.activeModal = 'user-orgs';
            },
            
            async toggleUserOrgBinding(org) {
                 const isBound = this.userOrgIds.includes(org.id);
                 if (isBound) {
                     // Remove
                     const { error } = await supabase.from('organization_members').delete().match({ user_id: this.currentEditingUser.id, organization_id: org.id });
                     if (!error) {
                         this.userOrgIds = this.userOrgIds.filter(id => id !== org.id);
                     }
                 } else {
                     // Add
                     const { error } = await supabase.from('organization_members').insert({ user_id: this.currentEditingUser.id, organization_id: org.id });
                     if (!error) {
                         this.userOrgIds.push(org.id);
                     }
                 }
            },

            // --- Tab 2: Question Banks ---
            async loadBanks() {
                const { data } = await supabase.from('question_banks').select('*').order('created_at', { ascending: false });
                if (data) this.allBanks = data;
            },
            
            async getOrCreateBank(name) {
                const { data: existing, error: findError } = await supabase.from('question_banks').select('id').eq('name', name).single();
                if (existing) return existing.id;
                if (findError && findError.code !== 'PGRST116') throw new Error(`查询题库失败: ${findError.message}`);
                
                const { data: newBank, error } = await supabase.from('question_banks').insert({ name, description: 'Excel导入' }).select().single();
                if (error) throw new Error(`创建题库失败: ${error.message}`);
                return newBank.id;
            },
            
            triggerFileUpload() {
                // #ifdef APP-PLUS
                uni.showToast({ title: '请使用Web版', icon: 'none' });
                return;
                // #endif
                uni.chooseFile({
                    count: 1, extension: ['.xls', '.xlsx'],
                    success: (res) => { if (res.tempFiles?.length) this.processFile(res.tempFiles[0]); }
                });
            },
            
            processFile(file) {
                 // #ifdef H5
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try { await this.parseAndImportExcel(new Uint8Array(e.target.result)); } 
                    catch (err) { uni.showToast({ title: '读取失败: ' + err.message, icon: 'none' }); }
                };
                reader.readAsArrayBuffer(file);
                // #endif
            },
            
            async parseAndImportExcel(data) {
                 uni.showLoading({ title: '导入中...' });
                 try {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                    if (!json?.length) throw new Error('内容为空');
                    await this.processImportData(json);
                 } catch (err) {
                     uni.hideLoading();
                     uni.showToast({ title: err.message, icon: 'none' });
                 }
            },
            
            async processImportData(rows) {
                // Group by '题库名称' or '题库'
                const grouped = {};
                rows.forEach(row => {
                    // Support multiple possible column headers for the bank name
                    const bankName = row['题库'] || row['题库名称'] || row['Bank'] || '默认题库';
                    if (!grouped[bankName]) grouped[bankName] = [];
                    grouped[bankName].push(row);
                });
                
                let successCount = 0;
                let failCount = 0;
                 
                 for (const name in grouped) {
                     try {
                         let bankId = await this.getOrCreateBank(name);
                         const questions = grouped[name].map(r => this.transformRowToQuestion(r, bankId)).filter(q => q);
                         if (questions.length) {
                             const { error } = await supabase.from('questions').insert(questions);
                             if (error) throw error;
                             successCount += questions.length;
                         }
                     } catch (e) {
                         console.error(e);
                         failCount++;
                     }
                 }
                 uni.hideLoading();
                 uni.showModal({ title: '结果', content: `成功: ${successCount}题\n失败题库: ${failCount}个`, showCancel: false });
                 this.loadBanks(); // Refresh list
            },
            
            transformRowToQuestion(row, bankId) {
                try {
                    const typeMap = {
                        '单选题': 'single',
                        '多选题': 'multi',
                        '判断题': 'judge'
                    };
                    
                    const type = typeMap[row['题型']] || 'single'; // Default
                    const title = row['题目'];
                    if (!title) return null;
                    
                    let options = [];
                    let answer = null;
                    
                    if (type === 'judge') {
                        options = [
                            { label: '正确', value: '1' },
                            { label: '错误', value: '0' }
                        ];
                        const rawAns = String(row['答案']).trim();
                        answer = (['对', '正确', 'T', 'TRUE', '1'].includes(rawAns)) ? '1' : '0';
                    } else {
                        // Single or Multi
                        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
                        labels.forEach(label => {
                            // Support "选项A", "选项 A", "A", "Option A"
                            const val = row[`选项${label}`] || row[`选项 ${label}`] || row[label] || row[`Option ${label}`];
                            if (val !== undefined && val !== null && String(val).trim() !== '') {
                                let text = String(val).trim();
                                // Clean up prefix "A、" or "A." if present
                                const prefixRegex = new RegExp(`^${label}[\\.|、]`, 'i');
                                if (prefixRegex.test(text)) {
                                    text = text.replace(prefixRegex, '').trim();
                                }
                                options.push({ label, value: text });
                            }
                        });
                        
                        const rawAns = String(row['答案']).trim().toUpperCase();
                        
                        if (type === 'multi') {
                            // Split "A,B" or "AB"
                            answer = rawAns.replace(/[^A-Z]/g, '').split('');
                        } else {
                            answer = rawAns;
                        }
                    }
                    
                    return {
                        bank_id: bankId,
                        type,
                        title,
                        options, // supabase will stringify jsonb automatically if passed as object/array
                        answer,
                        parse: row['解析'] || ''
                    };
                } catch (e) {
                    console.error('Error parsing row:', row, e);
                    return null;
                }
            },
            
            async toggleBankStatus(bank) {
                 const nVal = !bank.is_active;
                 const { error } = await supabase.from('question_banks').update({ is_active: nVal }).eq('id', bank.id);
                 if (!error) bank.is_active = nVal;
            },
            
            deleteBank(bank) {
                 uni.showModal({
                    title: '警告', content: '确定删除该题库及所有题目？',
                    success: async (res) => {
                        if (res.confirm) {
                            uni.showLoading();
                            await supabase.from('questions').delete().eq('bank_id', bank.id);
                            await supabase.from('organization_banks').delete().eq('bank_id', bank.id);
                            await supabase.from('question_banks').delete().eq('id', bank.id);
                            uni.hideLoading();
                            this.loadBanks();
                        }
                    }
                 });
            },
            
            // --- Bank <-> Org Config (Tab 0 Modal) ---
            async openBankConfig(org) {
                this.currentEditingOrg = org;
                uni.showLoading();
                if (this.allBanks.length === 0) await this.loadBanks();
                const { data } = await supabase.from('organization_banks').select('bank_id').eq('organization_id', org.id);
                this.orgBankIds = data ? data.map(b => b.bank_id) : [];
                uni.hideLoading();
                this.activeModal = 'org-banks';
            },
            
            async toggleBankBinding(bank) {
                 const isBound = this.orgBankIds.includes(bank.id);
                 if (isBound) {
                     await supabase.from('organization_banks').delete().match({ organization_id: this.currentEditingOrg.id, bank_id: bank.id });
                     this.orgBankIds = this.orgBankIds.filter(id => id !== bank.id);
                 } else {
                     await supabase.from('organization_banks').insert({ organization_id: this.currentEditingOrg.id, bank_id: bank.id });
                     this.orgBankIds.push(bank.id);
                 }
            }
		}
	}
</script>

<style>
	.container { padding: 0; padding-bottom: 55px; min-height: 100vh; background-color: #f5f7fa; display: flex; flex-direction: column; }
    
    /* Tabs (Bottom Footer) */
    .nav-tabs { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; border-top: 1px solid #eee; display: flex; justify-content: space-around; padding: 0; height: 50px; z-index: 99; }
    .nav-item { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; border-top: 2px solid transparent; padding: 0; transition: all 0.3s; }
    .nav-item.active { color: #007aff; border-top-color: #007aff; font-weight: bold; }
    
    .tab-content { padding: 20px; }
    
	.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.section-title { font-size: 20px; font-weight: bold; color: #333; }
	.btn-add { background: #007aff; color: #fff; font-size: 14px; padding: 0 20px; height: 36px; line-height: 36px; border-radius: 18px; margin: 0; }
    
    .list-container { display: flex; flex-direction: column; gap: 15px; }
    .list-item, .check-item { background: #fff; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .check-item { padding: 15px 20px; border-bottom: 1px solid #f9f9f9; border-radius: 0; box-shadow: none; }
    .check-item:active { background: #f5f5f5; }
    
    .item-info { display: flex; flex-direction: column; flex: 1; }
    .item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
    .item-name, .check-name { font-size: 16px; font-weight: bold; color: #333; }
    .item-desc, .item-id { font-size: 12px; color: #999; margin-top: 4px; }
    .item-id { font-family: monospace; }
    
    /* Status Badges */
    .status-open, .status-active { background: #e6f7e6; color: #28a745; font-size: 12px; padding: 2px 6px; border-radius: 4px; }
    .status-closed, .status-inactive { background: #fff5f5; color: #dc3545; font-size: 12px; padding: 2px 6px; border-radius: 4px; }
    .role-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #eee; color: #666; }
    .role-admin { background: #e8f2ff; color: #007aff; }
    
    /* Actions */
    .item-actions { display: flex; gap: 10px; flex-direction: column; }
    .row-actions { flex-direction: row; align-items: center; }
    .btn-mini { font-size: 12px; height: 28px; line-height: 28px; padding: 0 12px; margin: 0; border-radius: 14px; }
    .btn-edit { background: #f0f7ff; color: #007aff; border: 1px solid #007aff; }
    .btn-delete { background: #fff5f5; color: #dc3545; border: 1px solid #dc3545; }
    .btn-disable { background: #f8f9fa; color: #666; border: 1px solid #ddd; }
    .btn-enable { background: #e6f7e6; color: #28a745; border: 1px solid #28a745; }
    
    .empty-tip { text-align: center; color: #999; margin-top: 30px; }
    
    /* Modal */
    .modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 85%; background: #fff; border-radius: 16px; overflow: hidden; max-height: 80vh; display: flex; flex-direction: column; }
    .big-modal { height: 70vh; }
    .modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-subheader { padding: 10px 20px; background: #f9f9f9; border-bottom: 1px solid #eee; }
    .sub-text { font-size: 12px; color: #666; }
    .modal-title { font-size: 18px; font-weight: bold; }
    .close-btn { font-size: 24px; color: #999; padding: 0 10px; }
    .modal-body { padding: 0; flex: 1; overflow-y: auto; }
    
    .custom-checkbox { width: 22px; height: 22px; border: 2px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; transition: all 0.2s; }
    .custom-checkbox.checked { background-color: #007aff; border-color: #007aff; }
</style>