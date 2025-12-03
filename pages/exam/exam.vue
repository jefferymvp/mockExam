<template>
	<view class="container">
		<!-- Loading State -->
		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>

		<!-- Result State -->
		<view v-else-if="finished" class="result-container">
			<view class="result-card">
				<text class="result-title">考试结束</text>

				<view class="chart-container">
					<view class="circular-chart" :style="circleStyle">
						<view class="inner-circle">
							<text class="score-value">{{ scoreRate }}%</text>
							<text class="score-label">正确率</text>
						</view>
					</view>
				</view>

				<view class="result-stats">
					<view class="stat-item">
						<text class="stat-val">{{ totalQuestions }}</text>
						<text class="stat-label">总题数</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-val correct">{{ correctCount }}</text>
						<text class="stat-label">答对</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-val wrong">{{ totalQuestions - correctCount }}</text>
						<text class="stat-label">答错</text>
					</view>
				</view>
			</view>

			<button class="btn btn-primary" hover-class="btn-hover" @click="goHome">返回首页</button>
		</view>

		<!-- Exam State -->
		<view v-else class="exam-container">
			<view class="exam-header">
				<view class="progress-bar-bg">
					<view class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></view>
				</view>
				<view class="header-row">
					<text class="progress-text">进度: {{ currentIndex + 1 }} / {{ totalQuestions }}</text>
					<view class="exit-btn" @click="goHome">退出</view>
				</view>
			</view>

			<view class="card question-card">
				<view class="tag-row">
					<text class="question-type">{{ getTypeName(currentQuestion.type) }}</text>
				</view>
				<text class="question-title">{{ currentQuestion.title }}</text>
			</view>

			<view class="options-container">
				<!-- Single Choice / Judge -->
				<radio-group v-if="currentQuestion.type === 'single' || currentQuestion.type === 'judge'" @change="onRadioChange">
					<label class="option-item" v-for="(item, index) in currentQuestion.options" :key="index" :class="{ 'option-selected': selectedAnswer === getOptionValue(item) }">
						<view class="option-row">
							<radio :value="getOptionValue(item)" :checked="selectedAnswer === getOptionValue(item)" :disabled="hasAnswered" class="custom-radio" />
							<text class="option-text">
                                <text v-if="currentQuestion.type !== 'judge'" class="option-label">{{ item.label }}. </text>
                                {{ getLabelText(item) }}
                            </text>
						</view>
					</label>
				</radio-group>

				<!-- Multiple Choice -->
				<checkbox-group v-if="currentQuestion.type === 'multi'" @change="onCheckboxChange">
					<label class="option-item" v-for="(item, index) in currentQuestion.options" :key="index" :class="{ 'option-selected': selectedAnswer.includes(getOptionValue(item)) }">
						<view class="option-row">
							<checkbox :value="getOptionValue(item)" :checked="selectedAnswer.includes(getOptionValue(item))" :disabled="hasAnswered" class="custom-checkbox" />
							<text class="option-text"><text class="option-label">{{ item.label }}. </text>{{ getLabelText(item) }}</text>
						</view>
					</label>
				</checkbox-group>
			</view>

			<!-- Feedback Area -->
			<view v-if="hasAnswered" class="feedback-area" :class="isCorrect ? 'feedback-correct' : 'feedback-wrong'">
				<view class="feedback-icon">{{ isCorrect ? '✔' : '✖' }}</view>
				<view class="feedback-content">
					<text class="feedback-text">{{ isCorrect ? '回答正确！' : '回答错误' }}</text>
					<text v-if="!isCorrect" class="correct-answer">正确答案: {{ formatAnswer(currentQuestion.answer) }}</text>
				</view>
			</view>

			<!-- Action Buttons -->
			<view class="action-area">
				<button v-if="!hasAnswered" class="btn btn-primary" hover-class="btn-hover" @click="submitAnswer" :disabled="!canSubmit">确认答案</button>
				<button v-if="hasAnswered" class="btn btn-success" hover-class="btn-hover" @click="nextQuestion">{{ isLastQuestion ? '查看结果' : '下一题' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import questionBank from '@/utils/questionBank.js';

	export default {
		data() {
			return {
				loading: true,
				finished: false,
				questions: [],
				currentIndex: 0,
				selectedAnswer: null, // String for single/judge, Array for multi
				hasAnswered: false,
				isCorrect: false,
				correctCount: 0
			}
		},
		computed: {
			totalQuestions() {
				return this.questions.length;
			},
			currentQuestion() {
				return this.questions[this.currentIndex] || {};
			},
			isLastQuestion() {
				return this.currentIndex === this.questions.length - 1;
			},
			scoreRate() {
				if (this.totalQuestions === 0) return 0;
				return Math.round((this.correctCount / this.totalQuestions) * 100);
			},
			canSubmit() {
				if (this.currentQuestion.type === 'multi') {
					return this.selectedAnswer && this.selectedAnswer.length > 0;
				}
				return this.selectedAnswer !== null && this.selectedAnswer !== '';
			},
			circleStyle() {
				// Create a conic gradient for the circular chart
				const percent = this.scoreRate;
				// Color 1: Primary (blue) up to X%, Color 2: Grey from X%
				return {
					background: `conic-gradient(#007aff ${percent}%, #f0f0f0 ${percent}%)`
				};
			},
			progressPercentage() {
				if (this.totalQuestions === 0) return 0;
				return ((this.currentIndex + 1) / this.totalQuestions) * 100;
			}
		},
		onLoad(options) {
			const type = options.type || 'single';
			const count = parseInt(options.count) || 5;
            const bankKey = options.bank || 'bank1'; // Default to bank1 if missing

			this.questions = questionBank.getQuestions(bankKey, type, count);
			this.loading = false;

			// Initialize first answer container
			this.resetSelection();
		},
		methods: {
			getOptionValue(item) {
				if (this.currentQuestion.type === 'judge') {
					return item.value;
				}
				return item.label;
			},
			resetSelection() {
				if (this.currentQuestion.type === 'multi') {
					this.selectedAnswer = [];
				} else {
					this.selectedAnswer = null;
				}
				this.hasAnswered = false;
				this.isCorrect = false;
			},
			getTypeName(type) {
				const map = {
					'single': '单选题',
					'multi': '多选题',
					'judge': '判断题'
				};
				return map[type] || '题目';
			},
			getLabelText(item) {
				if (this.currentQuestion.type === 'judge') {
					return item.label;
				}
				return item.value;
			},
			onRadioChange(evt) {
				this.selectedAnswer = evt.detail.value;
			},
			onCheckboxChange(evt) {
				this.selectedAnswer = evt.detail.value;
			},
			submitAnswer() {
				const q = this.currentQuestion;
				let correct = false;

				if (q.type === 'single' || q.type === 'judge') {
					correct = this.selectedAnswer === q.answer;
				} else if (q.type === 'multi') {
					// Compare arrays
					if (this.selectedAnswer.length === q.answer.length) {
						const sortedSelected = [...this.selectedAnswer].sort();
						const sortedAnswer = [...q.answer].sort();
						correct = sortedSelected.every((val, index) => val === sortedAnswer[index]);
					}
				}

				this.isCorrect = correct;
				if (correct) {
					this.correctCount++;
				}
				this.hasAnswered = true;
			},
			nextQuestion() {
				if (this.isLastQuestion) {
					this.finished = true;
				} else {
					this.currentIndex++;
					this.resetSelection();
				}
			},
			goHome() {
				uni.navigateBack();
			},
			formatAnswer(ans) {
			    if (Array.isArray(ans)) {
			        return ans.join(', ');
			    }
			    if (this.currentQuestion.type === 'judge') {
			        const opt = this.currentQuestion.options.find(o => o.value === ans);
			        return opt ? opt.label : ans;
			    }
			    return ans;
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
		min-height: 100vh;
	}

	.loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
	}

	/* --- Result Page Styles --- */
	.result-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px 0;
	}

	.result-card {
		width: 100%;
		background: #fff;
		border-radius: 16px;
		padding: 40px 20px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40px;
	}

	.result-title {
		font-size: 24px;
		font-weight: bold;
		color: #333;
		margin-bottom: 30px;
	}

	.chart-container {
		margin-bottom: 30px;
	}

	.circular-chart {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		/* background handled by inline style conic-gradient */
	}

	.inner-circle {
		width: 130px;
		height: 130px;
		background: #fff;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.score-value {
		font-size: 36px;
		font-weight: bold;
		color: #007aff;
	}

	.score-label {
		font-size: 14px;
		color: #999;
		margin-top: 5px;
	}

	.result-stats {
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-val {
		font-size: 20px;
		font-weight: bold;
		color: #333;
		margin-bottom: 4px;
	}

	.stat-val.correct { color: #28a745; }
	.stat-val.wrong { color: #dc3545; }

	.stat-label {
		font-size: 12px;
		color: #999;
	}

	.stat-divider {
		width: 1px;
		height: 30px;
		background-color: #eee;
	}

	/* --- Exam Page Styles --- */
	.exam-container {
		width: 100%;
	}

	.exam-header {
		margin-bottom: 20px;
	}

	.progress-bar-bg {
		width: 100%;
		height: 6px;
		background-color: #e5e5e5;
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 15px;
	}

	.progress-bar-fill {
		height: 100%;
		background-color: #007aff;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.progress-text {
		font-size: 14px;
		color: #666;
		font-weight: 500;
	}

	.exit-btn {
		font-size: 14px;
		color: #999;
		padding: 4px 10px;
		border-radius: 12px;
		background-color: #f0f0f0;
	}

	.card {
		background: #fff;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	}

	.question-card {
		margin-bottom: 20px;
	}

	.tag-row {
		margin-bottom: 12px;
	}

	.question-type {
		background-color: #eef6ff;
		color: #007aff;
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 4px;
		font-weight: 600;
	}

	.question-title {
		font-size: 18px;
		font-weight: bold;
		line-height: 1.6;
		color: #333;
	}

	.options-container {
		margin-bottom: 25px;
	}

	.option-item {
		display: block;
		margin-bottom: 12px;
		background: #fff;
		border-radius: 10px;
		padding: 15px;
		border: 1px solid #eee;
		transition: all 0.2s;
	}

	.option-item:active {
		background-color: #f9f9f9;
	}

	.option-selected {
		border-color: #007aff;
		background-color: #f0f7ff;
	}

	.option-row {
		display: flex;
		align-items: flex-start;
	}

	.custom-radio, .custom-checkbox {
		transform: scale(0.9);
		margin-right: 8px;
		margin-top: 2px;
	}

	.option-text {
		flex: 1;
		font-size: 16px;
		line-height: 1.5;
		color: #333;
	}

	.option-label {
		font-weight: 600;
		color: #666;
		margin-right: 4px;
	}

	.feedback-area {
		padding: 15px;
		border-radius: 10px;
		margin-bottom: 30px;
		display: flex;
		align-items: flex-start;
	}

	.feedback-correct {
		background-color: #e6f7e6;
		border: 1px solid #d4edda;
	}

	.feedback-wrong {
		background-color: #fff5f5;
		border: 1px solid #fde8e8;
	}

	.feedback-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		margin-right: 12px;
		margin-top: 2px;
	}

	.feedback-correct .feedback-icon {
		background-color: #28a745;
	}

	.feedback-wrong .feedback-icon {
		background-color: #dc3545;
	}

	.feedback-content {
		flex: 1;
	}

	.feedback-text {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 4px;
		display: block;
	}

	.feedback-correct .feedback-text { color: #28a745; }
	.feedback-wrong .feedback-text { color: #dc3545; }

	.correct-answer {
		font-size: 14px;
		color: #666;
	}

	.action-area {
		margin-top: 10px;
	}

	.btn {
		width: 100%;
		height: 50px;
		line-height: 50px;
		text-align: center;
		border-radius: 25px;
		font-size: 16px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		transition: opacity 0.3s;
	}

	.btn-hover {
		opacity: 0.8;
	}

	.btn-primary {
		background: linear-gradient(to right, #007aff, #0062cc);
		color: #fff;
	}

	.btn-success {
		background: linear-gradient(to right, #28a745, #218838);
		color: #fff;
	}
</style>
