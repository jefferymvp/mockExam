<template>
	<view class="container">
		<view class="header">
			<text class="title">欢迎回来</text>
			<text class="subtitle">请登录您的账号</text>
		</view>

		<view class="form-box">
			<view class="input-group">
				<text class="label">邮箱</text>
				<input class="input" type="text" v-model="email" placeholder="请输入邮箱" />
			</view>
			<view class="input-group">
				<text class="label">密码</text>
				<input class="input" type="password" v-model="password" placeholder="请输入密码" />
			</view>

			<button class="btn btn-primary" :loading="loading" @click="handleLogin">登录</button>
			<view class="link-row">
				<text class="link-text" @click="goToRegister">没有账号？去注册</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { supabase } from '@/utils/supabase.js'

	export default {
		data() {
			return {
				email: '',
				password: '',
				loading: false
			}
		},
		methods: {
			async handleLogin() {
				if (!this.email || !this.password) {
					uni.showToast({ title: '请填写完整信息', icon: 'none' })
					return
				}
				this.loading = true
				const { error } = await supabase.auth.signInWithPassword({
					email: this.email,
					password: this.password
				})
				this.loading = false

				if (error) {
					uni.showToast({ title: error.message, icon: 'none' })
				} else {
					uni.showToast({ title: '登录成功', icon: 'success' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/index/index' })
					}, 1500)
				}
			},
			goToRegister() {
				uni.navigateTo({ url: '/pages/register/register' })
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
