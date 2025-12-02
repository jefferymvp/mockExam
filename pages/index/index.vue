<template>
	<view class="container">
		<view class="header">
			<text class="title">模拟考试系统</text>
		</view>

		<view class="form-group">
			<text class="label">选择题目数量：</text>
			<input class="input" type="number" v-model="questionCount" placeholder="请输入题目数量" />
		</view>

		<view class="form-group">
			<text class="label">选择考试题型：</text>
			<picker @change="onTypeChange" :value="typeIndex" :range="types" range-key="label">
				<view class="picker-box">
					{{ types[typeIndex].label }}
				</view>
			</picker>
		</view>

		<view class="btn-group">
			<button class="btn btn-primary" @click="startExam">开始考试</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				questionCount: 5,
				types: [
					{ label: '所有题型', value: 'all' },
					{ label: '单选题', value: 'single' },
					{ label: '多选题', value: 'multi' },
					{ label: '判断题', value: 'judge' }
				],
				typeIndex: 0
			}
		},
		methods: {
			onTypeChange(e) {
				this.typeIndex = e.detail.value;
			},
			startExam() {
				if (!this.questionCount || this.questionCount <= 0) {
					uni.showToast({
						title: '请输入有效的题目数量',
						icon: 'none'
					});
					return;
				}

				const selectedType = this.types[this.typeIndex].value;

				uni.navigateTo({
					url: `/pages/exam/exam?type=${selectedType}&count=${this.questionCount}`
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

	.picker-box {
		width: 100%;
		height: 40px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0 10px;
		font-size: 16px;
		line-height: 40px;
		color: #333;
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

	button {
		margin-bottom: 15px;
	}
</style>
