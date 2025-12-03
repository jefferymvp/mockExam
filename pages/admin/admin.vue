<template>
	<view class="container">
		<view class="header">
			<text class="title">组织管理</text>
			<button class="btn-add" @click="showCreateModal">+ 新建</button>
		</view>

		<view class="org-list">
			<view class="org-item" v-for="org in organizations" :key="org.id">
				<view class="org-info">
					<text class="org-name">{{ org.name }}</text>
					<text class="org-status" :class="{ 'status-open': org.allow_join, 'status-closed': !org.allow_join }">
						{{ org.allow_join ? '开放加入' : '禁止加入' }}
					</text>
                    <text class="org-id">ID: {{ org.id.slice(0, 8) }}...</text>
				</view>
				<view class="org-actions">
					<button class="btn-mini btn-edit" @click="editOrg(org)">管理</button>
                    <button class="btn-mini btn-delete" @click="deleteOrg(org.id)">删除</button>
				</view>
			</view>
            <view v-if="organizations.length === 0" class="empty-tip">暂无组织</view>
		</view>
        
        <!-- Bank Configuration Modal -->
        <view class="modal-mask" v-if="showBankModal" @click="showBankModal = false">
            <view class="modal-content big-modal" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">配置题库 - {{ currentEditingOrg ? currentEditingOrg.name : '' }}</text>
                    <text class="close-btn" @click="showBankModal = false">×</text>
                </view>
                <view class="modal-subheader">
                    <text class="sub-text">勾选以绑定题库到该组织</text>
                </view>
                <scroll-view scroll-y class="modal-body">
                    <view class="bank-item" v-for="bank in allBanks" :key="bank.id" @click="toggleBankBinding(bank)">
                        <view class="bank-info">
                            <text class="bank-name">{{ bank.name }}</text>
                        </view>
                        <view class="checkbox-wrapper">
                            <view class="custom-checkbox" :class="{ 'checked': orgBankIds.includes(bank.id) }">
                                <text v-if="orgBankIds.includes(bank.id)">✓</text>
                            </view>
                        </view>
                    </view>
                    <view v-if="allBanks.length === 0" class="empty-tip">暂无可用题库</view>
                </scroll-view>
            </view>
        </view>
	</view>
</template>

<script>
	import { supabase } from '@/utils/supabase.js'

	export default {
		data() {
			return {
				organizations: [],
                
                // Bank Config State
                showBankModal: false,
                currentEditingOrg: null,
                allBanks: [],
                orgBankIds: [] // List of bank IDs bound to current org
			}
		},
		onShow() {
			this.loadOrganizations();
		},
		methods: {
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
							this.createOrg(res.content);
						}
					}
				});
			},

			async createOrg(name) {
				const { error } = await supabase.from('organizations').insert({ name: name });
				if (error) uni.showToast({ title: error.message, icon: 'none' });
				else {
					uni.showToast({ title: '创建成功', icon: 'success' });
					this.loadOrganizations();
				}
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
                            this.renameOrg(org);
                        } else if (res.tapIndex === 1) {
                            this.updateOrg(org.id, { allow_join: !org.allow_join });
                        } else if (res.tapIndex === 2) {
                            this.openBankConfig(org);
                        }
                    }
                });
            },
            
            renameOrg(org) {
                uni.showModal({
                    title: '修改名称',
                    editable: true,
                    content: org.name,
                    success: async (mRes) => {
                        if (mRes.confirm && mRes.content) {
                            this.updateOrg(org.id, { name: mRes.content });
                        }
                    }
                });
            },

            async updateOrg(id, updateData) {
                const { error } = await supabase.from('organizations').update(updateData).eq('id', id);
                if (error) uni.showToast({ title: error.message, icon: 'none' });
                else {
                     uni.showToast({ title: '更新成功', icon: 'success' });
                     this.loadOrganizations();
                }
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
                            }
                        }
                    }
                })
            },
            
            // --- Bank Configuration Logic ---
            
            async openBankConfig(org) {
                this.currentEditingOrg = org;
                uni.showLoading({ title: '加载中...' });
                
                // 1. Load all available banks (no filter, as admin can see all)
                const { data: banks } = await supabase.from('question_banks').select('*').order('name');
                this.allBanks = banks || [];
                
                // 2. Load current bindings
                const { data: bindings } = await supabase
                    .from('organization_banks')
                    .select('bank_id')
                    .eq('organization_id', org.id);
                
                this.orgBankIds = bindings ? bindings.map(b => b.bank_id) : [];
                
                uni.hideLoading();
                this.showBankModal = true;
            },
            
            async toggleBankBinding(bank) {
                const isBound = this.orgBankIds.includes(bank.id);
                
                if (isBound) {
                    // Unbind: Delete
                    const { error } = await supabase
                        .from('organization_banks')
                        .delete()
                        .match({ organization_id: this.currentEditingOrg.id, bank_id: bank.id });
                        
                    if (!error) {
                        this.orgBankIds = this.orgBankIds.filter(id => id !== bank.id);
                    }
                } else {
                    // Bind: Insert
                    const { error } = await supabase
                        .from('organization_banks')
                        .insert({ organization_id: this.currentEditingOrg.id, bank_id: bank.id });
                        
                    if (!error) {
                        this.orgBankIds.push(bank.id);
                    }
                }
            }
		}
	}
</script>

<style>
	.container { padding: 20px; min-height: 100vh; background-color: #f5f7fa; }
	.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.title { font-size: 24px; font-weight: bold; color: #333; }
	.btn-add { background: #007aff; color: #fff; font-size: 14px; padding: 0 20px; height: 36px; line-height: 36px; border-radius: 18px; margin: 0; }
    
    .org-list { display: flex; flex-direction: column; gap: 15px; }
    .org-item { background: #fff; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    
    .org-info { display: flex; flex-direction: column; flex: 1; }
    .org-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px; }
    .org-status { font-size: 12px; padding: 2px 6px; border-radius: 4px; align-self: flex-start; margin-bottom: 5px; }
    .status-open { background: #e6f7e6; color: #28a745; }
    .status-closed { background: #fff5f5; color: #dc3545; }
    .org-id { font-size: 12px; color: #999; font-family: monospace; }

    .org-actions { display: flex; gap: 10px; flex-direction: column; }
    .btn-mini { font-size: 12px; height: 28px; line-height: 28px; padding: 0 12px; margin: 0; border-radius: 14px; }
    .btn-edit { background: #f0f7ff; color: #007aff; border: 1px solid #007aff; }
    .btn-delete { background: #fff5f5; color: #dc3545; border: 1px solid #dc3545; }
    
    .empty-tip { text-align: center; color: #999; margin-top: 50px; }
    
    /* Modal Styles */
    .modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 85%; background: #fff; border-radius: 16px; overflow: hidden; max-height: 80vh; display: flex; flex-direction: column; }
    .big-modal { height: 70vh; }
    .modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-subheader { padding: 10px 20px; background: #f9f9f9; border-bottom: 1px solid #eee; }
    .sub-text { font-size: 12px; color: #666; }
    .modal-title { font-size: 18px; font-weight: bold; }
    .close-btn { font-size: 24px; color: #999; padding: 0 10px; }
    .modal-body { padding: 0; flex: 1; overflow-y: auto; }
    
    .bank-item { padding: 15px 20px; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center; }
    .bank-item:active { background-color: #f9f9f9; }
    .bank-name { font-size: 16px; color: #333; }
    
    .checkbox-wrapper { width: 24px; height: 24px; }
    .custom-checkbox { width: 22px; height: 22px; border: 2px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; transition: all 0.2s; }
    .custom-checkbox.checked { background-color: #007aff; border-color: #007aff; }
</style>
