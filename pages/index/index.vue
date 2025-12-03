<template>
	<view class="container">
		<view class="header-card">
			<text class="title">模拟考试系统</text>
			<text class="subtitle">随时随地，轻松练习</text>
		</view>

		<view class="card">
            <!-- Question Bank Selection -->
			<view class="section-box">
				<view class="label-row">
					<text class="label">选择题库</text>
				</view>
				<view class="picker-container">
					<picker @change="onBankChange" :value="bankIndex" :range="banks" range-key="name">
						<view class="picker-box">
							<text class="picker-text">{{ banks[bankIndex] ? banks[bankIndex].name : '加载中...' }}</text>
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
		</view>

		<view class="btn-group">
			<button class="btn btn-primary" hover-class="btn-hover" @click="startExam">开始考试</button>
		</view>
	</view>
</template>

<script>
	import questionBank from '@/utils/questionBank.js';

	export default {
		data() {
			return {
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
				maxQuestions: 15 // Default for 'all'
			}
		},
		onLoad() {
            this.loadBanks();
			this.updateMaxQuestions();
		},
		methods: {
            loadBanks() {
                this.banks = questionBank.getBanks();
                if (this.banks.length > 0) {
                    this.bankIndex = 0;
                }
            },
			updateMaxQuestions() {
                // Determine current bank key
                const currentBankKey = this.banks[this.bankIndex] ? this.banks[this.bankIndex].key : null;
                if (!currentBankKey) return;

				const selectedType = this.types[this.typeIndex].value;
				this.maxQuestions = questionBank.getTotalCount(currentBankKey, selectedType);

				// Adjust current count if it exceeds max
				if (this.questionCount > this.maxQuestions) {
					this.questionCount = this.maxQuestions;
				}
				// Ensure at least 1
				if (this.questionCount < 1 && this.maxQuestions > 0) {
					this.questionCount = 1;
				}
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
			startExam() {
				if (!this.questionCount || this.questionCount <= 0) {
					uni.showToast({
						title: '请输入有效的题目数量',
						icon: 'none'
					});
					return;
				}

                const selectedBank = this.banks[this.bankIndex].key;
				const selectedType = this.types[this.typeIndex].value;

				uni.navigateTo({
					url: `/pages/exam/exam?bank=${selectedBank}&type=${selectedType}&count=${this.questionCount}`
				});
			}
		}
	}
</script>

<style>
	page {
		background-color: #f5f7fa;
	}

	.container {
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
	}

	.header-card {
		width: 100%;
		padding: 40px 20px;
		background: linear-gradient(135deg, #007aff, #00b4d8);
		border-radius: 16px;
		margin-bottom: 30px;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.title {
		font-size: 28px;
		font-weight: bold;
		color: #fff;
		margin-bottom: 10px;
		letter-spacing: 1px;
	}

	.subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.9);
	}

	.card {
		width: 100%;
		background-color: #fff;
		border-radius: 16px;
		padding: 30px 20px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
		margin-bottom: 30px;
	}

	.section-box {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.label {
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}

	.count-display {
		font-size: 16px;
		color: #007aff;
		font-weight: bold;
		background-color: #eef6ff;
		padding: 4px 10px;
		border-radius: 12px;
	}

	.picker-container, .slider-container {
		width: 100%;
	}

	.picker-box {
		width: 100%;
		height: 50px;
		background-color: #f8f9fb;
		border-radius: 8px;
		padding: 0 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid #eee;
		transition: all 0.3s;
	}

	.picker-box:active {
		background-color: #f0f2f5;
	}

	.picker-text {
		font-size: 16px;
		color: #333;
	}

	.picker-arrow {
		font-size: 12px;
		color: #999;
	}

	.divider {
		height: 1px;
		background-color: #f0f0f0;
		margin: 25px 0;
		width: 100%;
	}

	.btn-group {
		width: 100%;
	}

	.btn {
		width: 100%;
		height: 54px;
		line-height: 54px;
		text-align: center;
		border-radius: 27px;
		font-size: 18px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
		transition: all 0.3s;
	}

	.btn-primary {
		background: linear-gradient(to right, #007aff, #0062cc);
		color: #fff;
	}

	.btn-hover {
		opacity: 0.9;
		transform: scale(0.98);
	}
</style>
