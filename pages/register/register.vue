<template>
	<view class="container">
		<view class="header">
			<text class="title">创建账号</text>
			<text class="subtitle">加入我们，开始练习</text>
		</view>

		<view class="form-box">
			<view class="input-group">
				<text class="label">用户名</text>
				<input class="input" type="text" v-model="username" placeholder="设置您的昵称" />
			</view>
			<view class="input-group">
				<text class="label">邮箱</text>
				<input class="input" type="text" v-model="email" placeholder="请输入邮箱" />
			</view>
			<view class="input-group">
				<text class="label">密码</text>
				<input class="input" type="password" v-model="password" placeholder="设置密码 (至少6位)" />
			</view>

			<button class="btn btn-primary" :loading="loading" @click="handleRegister">注册</button>
			<view class="link-row">
				<text class="link-text" @click="goToLogin">已有账号？去登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { supabase } from '@/utils/supabase.js'

	export default {
		data() {
			return {
				username: '',
				email: '',
				password: '',
				loading: false
			}
		},
		methods: {
			async handleRegister() {
				if (!this.username || !this.email || !this.password) {
					uni.showToast({ title: '请填写完整信息', icon: 'none' })
					return
				}
                if (this.password.length < 6) {
                    uni.showToast({ title: '密码长度至少6位', icon: 'none' })
                    return
                }

				this.loading = true
				const { data, error } = await supabase.auth.signUp({
					email: this.email,
					password: this.password,
					options: {
						data: {
							username: this.username
						}
					}
				})
				this.loading = false

				if (error) {
					uni.showToast({ title: error.message, icon: 'none' })
				} else {
					uni.showToast({ title: '注册成功', icon: 'success' })
                    // Trigger automatically handles profile creation
					setTimeout(() => {
						uni.navigateTo({ url: '/pages/login/login' })
					}, 1500)
				}
			},
			goToLogin() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	.container { padding: 40px 30px; background-color: #fff; min-height: 100vh; }
	.header { margin-bottom: 40px; }
	.title { font-size: 32px; font-weight: bold; color: #333; display: block; margin-bottom: 10px; }
	.subtitle { font-size: 16px; color: #999; }
	.form-box { width: 100%; }
	.input-group { margin-bottom: 25px; }
	.label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }
	.input { width: 100%; height: 50px; background: #f5f7fa; border-radius: 8px; padding: 0 15px; font-size: 16px; }
	.btn { width: 100%; height: 50px; line-height: 50px; border-radius: 25px; margin-top: 20px; font-size: 18px; }
	.btn-primary { background: #007aff; color: #fff; }
	.link-row { margin-top: 20px; text-align: center; }
	.link-text { color: #007aff; font-size: 14px; }
</style>
