<template>
	<view class="container">
		<view class="header">
			<text class="title">模拟考试系统</text>
		</view>

		<view class="section-box">
			<view class="label-row">
				<text class="label">选择考试题型：</text>
			</view>
			<view class="picker-container">
				<picker @change="onTypeChange" :value="typeIndex" :range="types" range-key="label">
					<view class="picker-box">
						{{ types[typeIndex].label }}
					</view>
				</picker>
			</view>
		</view>

		<view class="section-box">
			<view class="label-row">
				<text class="label">选择题目数量：</text>
				<text class="count-display">{{ questionCount }} / {{ maxQuestions }}</text>
			</view>
			<view class="slider-container">
				<slider
					:value="questionCount"
					@change="onSliderChange"
					min="1"
					:max="maxQuestions"
					show-value
					block-size="28"
				/>
			</view>
		</view>

		<view class="btn-group">
			<button class="btn btn-primary" @click="startExam">开始考试</button>
		</view>
	</view>
</template>

<script>
	import questionBank from '@/utils/questionBank.js';

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
				typeIndex: 0,
				maxQuestions: 15 // Default for 'all'
			}
		},
		onLoad() {
			this.updateMaxQuestions();
		},
		methods: {
			updateMaxQuestions() {
				const selectedType = this.types[this.typeIndex].value;
				this.maxQuestions = questionBank.getTotalCount(selectedType);

				// Adjust current count if it exceeds max
				if (this.questionCount > this.maxQuestions) {
					this.questionCount = this.maxQuestions;
				}
				// Ensure at least 1
				if (this.questionCount < 1 && this.maxQuestions > 0) {
					this.questionCount = 1;
				}
			},
			onTypeChange(e) {
				this.typeIndex = e.detail.value;
				this.updateMaxQuestions();
			},
			onSliderChange(e) {
				this.questionCount = e.detail.value;
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

	.section-box {
		width: 100%;
		margin-bottom: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.label-row {
		width: 80%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.label {
		font-size: 16px;
		color: #666;
	}

	.count-display {
		font-size: 16px;
		color: #007aff;
		font-weight: bold;
	}

	.picker-container, .slider-container {
		width: 80%;
	}

	.picker-box {
		width: 100%;
		height: 45px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0 15px;
		font-size: 16px;
		line-height: 43px; /* vertically center text, accounting for border */
		color: #333;
		background-color: #fff;
		text-align: center;
	}

	.btn-group {
		width: 80%;
		margin-top: 20px;
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
</style>
