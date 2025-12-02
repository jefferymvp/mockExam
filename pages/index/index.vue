<template>
	<view class="container">
		<view class="header">
			<text class="title">模拟考试系统</text>
		</view>

		<view class="form-group">
			<text class="label">选择题目数量：</text>
			<input class="input" type="number" v-model="questionCount" placeholder="请输入题目数量" />
		</view>

		<view class="btn-group">
			<button class="btn btn-primary" @click="startExam('single')">单选题考试</button>
			<button class="btn btn-primary" @click="startExam('multi')">多选题考试</button>
			<button class="btn btn-primary" @click="startExam('judge')">判断题考试</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				questionCount: 5
			}
		},
		methods: {
			startExam(type) {
				if (!this.questionCount || this.questionCount <= 0) {
					uni.showToast({
						title: '请输入有效的题目数量',
						icon: 'none'
					});
					return;
				}

				uni.navigateTo({
					url: `/pages/exam/exam?type=${type}&count=${this.questionCount}`
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header {
		margin-bottom: 40px;
	}

	.title {
		font-size: 24px;
		font-weight: bold;
		color: #333;
	}

	.form-group {
		width: 100%;
		margin-bottom: 30px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.label {
		margin-bottom: 10px;
		font-size: 16px;
		color: #666;
	}

	.input {
		width: 100%;
		height: 40px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0 10px;
		font-size: 16px;
	}

	.btn-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.btn {
		width: 100%;
		height: 45px;
		line-height: 45px;
		text-align: center;
		border-radius: 5px;
		font-size: 16px;
	}

	.btn-primary {
		background-color: #007aff;
		color: #fff;
	}

	/* Add some spacing for better touch targets */
	button {
		margin-bottom: 15px;
	}
</style>
