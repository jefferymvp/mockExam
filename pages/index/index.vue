<template>
	<view class="container">
		<view class="header-card">
			<view class="header-top">
				<text class="title">模拟考试系统</text>
                <view class="header-actions">
                    <text class="action-btn admin-btn" v-if="profile && profile.role === 'admin'" @click="goToAdmin">管理</text>
				    <text class="action-btn logout-btn" @click="handleLogout">退出</text>
                </view>
			</view>
			<text class="subtitle" v-if="profile">欢迎, {{ profile.username || '用户' }}</text>
		</view>

		<!-- State: Has Organizations -->
		<view class="card" v-if="!loading && myOrgs.length > 0">
            <view class="org-selector-row">
                <view class="org-picker-wrapper">
                    <text class="label-small">当前组织</text>
                    <picker @change="onOrgSwitch" :value="currentOrgIndex" :range="myOrgs" range-key="name">
                        <view class="org-picker-box">
                            <text class="org-picker-text">{{ currentOrg ? currentOrg.name : '选择组织' }}</text>
                            <text class="picker-arrow">▼</text>
                        </view>
                    </picker>
                </view>
                <view class="join-more-btn" @click="showJoinModal = true">
                    <text class="plus-icon">+</text> 加入更多
                </view>
            </view>

            <view class="divider"></view>

			<view class="section-box">
				<view class="label-row">
					<text class="label">选择题库</text>
				</view>
				<view class="picker-container">
					<picker @change="onBankChange" :value="bankIndex" :range="banks" range-key="name">
						<view class="picker-box">
							<text class="picker-text">{{ banks[bankIndex] ? banks[bankIndex].name : (banks.length > 0 ? '请选择' : '本组织暂无题库') }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
			</view>

			<view class="divider"></view>

			<view class="section-box">
				<view class="label-row">
					<text class="label">选择考试题型</text>
				</view>
				<view class="picker-container">
					<picker @change="onTypeChange" :value="typeIndex" :range="types" range-key="label">
						<view class="picker-box">
							<text class="picker-text">{{ types[typeIndex].label }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
			</view>

			<view class="divider"></view>

			<view class="section-box">
				<view class="label-row">
					<text class="label">选择题目数量</text>
					<text class="count-display">{{ questionCount }} / {{ maxQuestions }}</text>
				</view>
				<view class="slider-container">
					<slider
						:value="questionCount"
						@change="onSliderChange"
						min="1"
						:max="maxQuestions"
						activeColor="#007aff"
						backgroundColor="#e5e5e5"
						block-color="#007aff"
						block-size="20"
						show-value
					/>
				</view>
			</view>
            
            <view class="btn-group" style="margin-top: 20px;">
			    <button class="btn btn-primary" hover-class="btn-hover" @click="startExam">开始考试</button>
		    </view>
		</view>

		<!-- State: No Organization (Initial Onboarding) -->
		<view class="card" v-else-if="!loading && myOrgs.length === 0">
			<view class="section-box">
				<text class="label-large">欢迎加入</text>
				<text class="desc">您尚未加入任何组织，请从下方列表选择加入，开始您的练习之旅。</text>
				
				<view class="org-list">
					<view class="org-item" v-for="org in availableOrgs" :key="org.id" @click="joinOrganization(org)">
                        <view class="org-content">
						    <text class="org-name">{{ org.name }}</text>
                        </view>
                        <view class="org-line"></view>
                        <view class="org-footer">
						    <text class="join-btn">加入 →</text>
                        </view>
					</view>
					<view v-if="availableOrgs.length === 0" class="empty-tip">
						暂无开放加入的组织
					</view>
				</view>
			</view>
		</view>
        
        <!-- Join More Modal (Simple Overlay) -->
        <view class="modal-mask" v-if="showJoinModal" @click="showJoinModal = false">
            <view class="modal-content" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">加入新组织</text>
                    <text class="close-btn" @click="showJoinModal = false">×</text>
                </view>
                <scroll-view scroll-y class="modal-body">
                    <view class="org-list">
                        <view class="org-item" v-for="org in availableOrgs" :key="org.id" @click="joinOrganization(org)">
                            <view class="org-content">
                                <text class="org-name">{{ org.name }}</text>
                            </view>
                            <view class="org-line"></view>
                            <view class="org-footer">
                                <text class="joined-tag" v-if="isMember(org.id)">已加入</text>
                                <text class="join-btn" v-else>加入 →</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
        
        <view v-if="loading" class="loading-mask">
            <text>加载中...</text>
        </view>
	</view>
</template>

<script>
	import { supabase } from '@/utils/supabase.js'

	export default {
		data() {
			return {
				loading: true,
				user: null,
				profile: {},
                
                // Organization Data
                myOrgs: [],
                currentOrgIndex: 0,
                availableOrgs: [],
                
                showJoinModal: false,

                // Exam Config Data
				questionCount: 5,
                banks: [],
                bankIndex: 0,
				types: [
					{ label: '所有题型', value: 'all' },
					{ label: '单选题', value: 'single' },
					{ label: '多选题', value: 'multi' },
					{ label: '判断题', value: 'judge' }
				],
				typeIndex: 0,
				maxQuestions: 10
			}
		},
		async onLoad() {
            await this.checkAuth();
		},
        async onShow() {
            // Refresh data if needed when returning
            if (this.user) {
               // this.loadProfile(); 
            }
        },
        computed: {
            currentOrg() {
                return this.myOrgs[this.currentOrgIndex] || null;
            }
        },
		methods: {
            async checkAuth() {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    uni.reLaunch({ url: '/pages/login/login' });
                    return;
                }
                this.user = session.user;
                await this.loadProfile();
                await this.loadAvailableOrgs(); // Always load available orgs for 'join more'
                await this.loadMyOrgs();
            },
            
            async loadProfile() {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', this.user.id)
                    .single();
                if (data) this.profile = data;
            },

            async loadMyOrgs() {
                this.loading = true;
                const { data, error } = await supabase
                    .from('organization_members')
                    .select('organization_id, organizations:organization_id (id, name, allow_join)')
                    .eq('user_id', this.user.id);

                if (data) {
                    // Flatten structure
                    this.myOrgs = data.map(item => item.organizations).filter(o => o !== null);
                    
                    if (this.myOrgs.length > 0) {
                        this.currentOrgIndex = 0;
                        await this.loadBanks(this.myOrgs[0].id);
                    }
                }
                this.loading = false;
            },
            
            async loadAvailableOrgs() {
                const { data } = await supabase.from('organizations').select('*').eq('allow_join', true);
                this.availableOrgs = data || [];
            },

            isMember(orgId) {
                return this.myOrgs.some(o => o.id === orgId);
            },

            async joinOrganization(org) {
                if (this.isMember(org.id)) {
                    uni.showToast({ title: '您已加入该组织', icon: 'none' });
                    return;
                }
                
                uni.showLoading({ title: '加入中...' });
                const { error } = await supabase
                    .from('organization_members')
                    .insert({ 
                        user_id: this.user.id,
                        organization_id: org.id
                    });
                
                uni.hideLoading();
                if (error) {
                    // Handle unique constraint error gracefully if race condition
                    if (error.code === '23505') { 
                         uni.showToast({ title: '已加入', icon: 'success' });
                    } else {
                         uni.showToast({ title: '加入失败: ' + error.message, icon: 'none' });
                    }
                } else {
                    uni.showToast({ title: '加入成功', icon: 'success' });
                    this.showJoinModal = false;
                    // Reload my orgs
                    await this.loadMyOrgs();
                    // Auto switch to new org (last one)
                    if (this.myOrgs.length > 0) {
                        this.currentOrgIndex = this.myOrgs.length - 1;
                        this.onOrgSwitch({ detail: { value: this.currentOrgIndex }});
                    }
                }
            },
            
            onOrgSwitch(e) {
                this.currentOrgIndex = e.detail.value;
                const org = this.myOrgs[this.currentOrgIndex];
                if (org) {
                    this.loadBanks(org.id);
                }
            },

            async loadBanks(orgId) {
                // New Logic: Fetch banks via the join table
                const { data, error } = await supabase
                    .from('organization_banks')
                    .select('bank_id, question_banks!inner(*)')
                    .eq('organization_id', orgId);
                
                if (data) {
                    // Extract the nested question_banks objects
                    this.banks = data.map(item => item.question_banks);
                } else {
                    this.banks = [];
                }

                if (this.banks.length > 0) {
                    this.bankIndex = 0;
                    this.updateMaxQuestions();
                } else {
                    this.maxQuestions = 0;
                    this.questionCount = 0;
                    // Reset types just in case
                }
            },

            async updateMaxQuestions() {
                if (this.banks.length === 0) return;
                const bankId = this.banks[this.bankIndex].id;
                const type = this.types[this.typeIndex].value;
                
                // Optimization: In a real app with thousands of questions, 
                // use count() query. For now, we assume < 500 questions total.
                let query = supabase.from('questions').select('*', { count: 'exact', head: true }).eq('bank_id', bankId);
                
                if (type !== 'all') {
                    query = query.eq('type', type);
                }
                
                const { count } = await query;
                this.maxQuestions = count || 0;
                
                // New Logic: Adjust questionCount based on maxQuestions
                if (this.maxQuestions > 10) {
                    this.questionCount = 10;
                } else {
                    this.questionCount = this.maxQuestions;
                }
                // No need for previous if conditions as new logic covers them
            },

            onBankChange(e) {
                this.bankIndex = e.detail.value;
                this.updateMaxQuestions();
            },

			onTypeChange(e) {
				this.typeIndex = e.detail.value;
				this.updateMaxQuestions();
			},

			onSliderChange(e) {
				this.questionCount = e.detail.value;
			},
            
            goToAdmin() {
                uni.navigateTo({ url: '/pages/admin/admin' });
            },

			startExam() {
				if (!this.questionCount || this.questionCount <= 0) {
					uni.showToast({
						title: '题目数量不足',
						icon: 'none'
					});
					return;
				}
                
                const selectedBankId = this.banks[this.bankIndex].id;
				const selectedType = this.types[this.typeIndex].value;

				uni.navigateTo({
					url: `/pages/exam/exam?bankId=${selectedBankId}&type=${selectedType}&count=${this.questionCount}`
				});
			},

            async handleLogout() {
                await supabase.auth.signOut();
                uni.reLaunch({ url: '/pages/login/login' });
            }
		}
	}
</script>

<style>
	page { background-color: #f5f7fa; }
	.container { padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }

	.header-card {
		width: 100%; padding: 30px 20px; background: linear-gradient(135deg, #007aff, #00b4d8);
		border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
		display: flex; flex-direction: column;
	}
    .header-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
	.title { font-size: 24px; font-weight: bold; color: #fff; }
    
    .header-actions { display: flex; align-items: center; gap: 10px; }
    .action-btn { color: rgba(255,255,255,0.9); font-size: 14px; padding: 5px 12px; border: 1px solid rgba(255,255,255,0.4); border-radius: 15px; }
    .action-btn:active { background: rgba(255,255,255,0.2); }
    .admin-btn { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.6); font-weight: bold; }
    
	.subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.9); margin-top: 10px; }

	.card { width: 100%; background-color: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); margin-bottom: 20px; }

	.section-box { width: 100%; display: flex; flex-direction: column; }
	.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
	.label { font-size: 16px; font-weight: 600; color: #333; }
    .label-large { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px; }
    .desc { font-size: 14px; color: #666; margin-bottom: 20px; }
    
    .org-list { display: flex; flex-direction: column; gap: 15px; }
    
    /* Updated Org Item Style */
    .org-item { padding: 0; background: #fff; border-radius: 10px; display: flex; flex-direction: column; border: 1px solid #eee; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
    .org-item:active { transform: scale(0.99); transition: transform 0.1s; }
    
    .org-content { padding: 15px 15px 12px; }
    .org-name { font-weight: bold; color: #333; font-size: 16px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .org-line { height: 1px; background: #f5f5f5; width: 100%; }
    
    .org-footer { padding: 10px 15px; display: flex; justify-content: flex-end; background: #fafafa; }
    
    .join-btn { color: #fff; background: #007aff; font-size: 12px; padding: 4px 12px; border-radius: 14px; font-weight: 500; }
    .joined-tag { color: #999; font-size: 12px; background: #eee; padding: 4px 12px; border-radius: 14px; }
    
    .org-selector-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px; }
    .org-picker-wrapper { flex: 1; margin-right: 15px; }
    .label-small { font-size: 12px; color: #999; margin-bottom: 6px; display: block; }
    .org-picker-box { height: 44px; background-color: #f0f7ff; border: 1px solid #007aff; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; }
    .org-picker-text { color: #007aff; font-weight: bold; font-size: 16px; }
    
    .join-more-btn { height: 44px; background: #f8f9fb; border: 1px solid #ddd; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; color: #666; font-size: 14px; }
    .join-more-btn:active { background: #eee; }
    .plus-icon { font-size: 18px; margin-right: 4px; font-weight: bold; }
    
    /* Modal */
    .modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 85%; background: #fff; border-radius: 16px; overflow: hidden; max-height: 70vh; display: flex; flex-direction: column; }
    .modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-title { font-size: 18px; font-weight: bold; }
    .close-btn { font-size: 24px; color: #999; padding: 0 10px; }
    .modal-body { padding: 0; overflow-y: auto; } /* Modified */
    
    .joined-tag { color: #999; font-size: 12px; background: #eee; padding: 2px 6px; border-radius: 4px; }

	.count-display { font-size: 16px; color: #007aff; font-weight: bold; background-color: #eef6ff; padding: 4px 10px; border-radius: 12px; }
	.picker-container, .slider-container { width: 100%; }
	.picker-box { width: 100%; height: 50px; background-color: #f8f9fb; border-radius: 8px; padding: 0 15px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #eee; }
	.picker-text { font-size: 16px; color: #333; }
	.picker-arrow { font-size: 12px; color: #999; }
	.divider { height: 1px; background-color: #f0f0f0; margin: 25px 0; width: 100%; }
	.btn-group { width: 100%; }
	.btn { width: 100%; height: 54px; line-height: 54px; text-align: center; border-radius: 27px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2); }
	.btn-primary { background: linear-gradient(to right, #007aff, #0062cc); color: #fff; }
    
    .loading-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 999; }
</style>