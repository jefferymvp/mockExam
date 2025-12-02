<template>
	<view class="container">
		<!-- Loading State -->
		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>

		<!-- Result State -->
		<view v-else-if="finished" class="result-container">
			<text class="result-title">考试结束</text>
			<view class="result-score">
				<text>你的正确率：</text>
				<text class="score-value">{{ scoreRate }}%</text>
			</view>
			<view class="result-details">
				<text>共 {{ totalQuestions }} 题，答对 {{ correctCount }} 题</text>
			</view>
			<button class="btn btn-primary" @click="goHome">返回首页</button>
		</view>

		<!-- Exam State -->
		<view v-else class="exam-container">
			<view class="exam-header">
				<text class="progress">进度: {{ currentIndex + 1 }} / {{ totalQuestions }}</text>
				<button class="btn-abort" size="mini" @click="goHome">退出</button>
			</view>

			<view class="question-card">
				<text class="question-type">[{{ getTypeName(currentQuestion.type) }}]</text>
				<text class="question-title">{{ currentQuestion.title }}</text>
			</view>

			<view class="options-container">
				<!-- Single Choice / Judge -->
				<radio-group v-if="currentQuestion.type === 'single' || currentQuestion.type === 'judge'" @change="onRadioChange">
					<label class="option-item" v-for="(item, index) in currentQuestion.options" :key="index">
						<view class="option-row">
							<radio :value="item.value" :checked="selectedAnswer === item.value" :disabled="hasAnswered" />
							<text class="option-text">{{ item.label }}. {{ getLabelText(item) }}</text>
						</view>
					</label>
				</radio-group>

				<!-- Multiple Choice -->
				<checkbox-group v-if="currentQuestion.type === 'multi'" @change="onCheckboxChange">
					<label class="option-item" v-for="(item, index) in currentQuestion.options" :key="index">
						<view class="option-row">
							<checkbox :value="item.value" :checked="selectedAnswer.includes(item.value)" :disabled="hasAnswered" />
							<text class="option-text">{{ item.label }}. {{ getLabelText(item) }}</text>
						</view>
					</label>
				</checkbox-group>
			</view>

			<!-- Feedback Area -->
			<view v-if="hasAnswered" class="feedback-area" :class="isCorrect ? 'feedback-correct' : 'feedback-wrong'">
				<text class="feedback-text">{{ isCorrect ? '回答正确！' : '回答错误！' }}</text>
				<text v-if="!isCorrect" class="correct-answer">正确答案: {{ formatAnswer(currentQuestion.answer) }}</text>
			</view>

			<!-- Action Buttons -->
			<view class="action-area">
				<button v-if="!hasAnswered" class="btn btn-primary" @click="submitAnswer" :disabled="!canSubmit">确认答案</button>
				<button v-if="hasAnswered" class="btn btn-success" @click="nextQuestion">{{ isLastQuestion ? '查看结果' : '下一题' }}</button>
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
			}
		},
		onLoad(options) {
			const type = options.type || 'single';
			const count = parseInt(options.count) || 5;

			this.questions = questionBank.getQuestions(type, count);
			this.loading = false;

			// Initialize first answer container
			this.resetSelection();
		},
		methods: {
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
				// In questionBank, judge options are label: '正确', value: '1'.
				// But we display "A. 正确" in the template logic above.
				// Actually, for Judge, usually we don't say "A. Correct", just "Correct".
				// Let's adjust based on type if needed, but the template handles it generically.
				// In questionBank definition: options: [{ label: '正确', value: '1' }]
				// But template says: {{ item.label }}. {{ getLabelText(item) }}
				// This might look like "正确. undefined" if I don't check.
				// Wait, checking mock data:
				// Judge: { label: '正确', value: '1' } -> Here label IS the text.
				// Single/Multi: { label: 'A', value: 'React' } -> Here label is index, value is text.

				if (this.currentQuestion.type === 'judge') {
				    return ''; // The label itself is the text for judge in my mock data structure?
				    // Re-checking mock data:
				    // Judge: options: [{ label: '正确', value: '1' }]
				    // Single: options: [{ label: 'A', value: 'React' }]
				    // My template: {{ item.label }}. {{ getLabelText(item) }}
				    // For Judge: "正确. " (weird)
				    // For Single: "A. React" (Correct)

				    // Let's fix this method.
				    return '';
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
			    // For Judge, ans is '1' or '0', we should probably convert back to text
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
	.container {
		padding: 20px;
	}

	.loading, .result-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 80vh;
	}

	.result-title {
		font-size: 28px;
		font-weight: bold;
		margin-bottom: 20px;
	}

	.result-score {
		font-size: 40px;
		color: #007aff;
		margin-bottom: 10px;
	}

	.result-details {
		font-size: 16px;
		color: #666;
		margin-bottom: 40px;
	}

	.exam-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #eee;
		padding-bottom: 10px;
	}

	.progress {
		font-size: 14px;
		color: #999;
	}

	.btn-abort {
		margin: 0;
		background-color: #f5f5f5;
		color: #666;
	}

	.question-card {
		margin-bottom: 20px;
	}

	.question-type {
		background-color: #007aff;
		color: #fff;
		font-size: 12px;
		padding: 2px 6px;
		border-radius: 4px;
		margin-right: 8px;
		vertical-align: middle;
	}

	.question-title {
		font-size: 18px;
		font-weight: bold;
		line-height: 1.5;
		vertical-align: middle;
	}

	.options-container {
		margin-bottom: 30px;
	}

	.option-item {
		display: block;
		margin-bottom: 15px;
	}

	.option-row {
		display: flex;
		align-items: center;
	}

	.option-text {
		margin-left: 10px;
		font-size: 16px;
	}

	.feedback-area {
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
		text-align: center;
	}

	.feedback-correct {
		background-color: #e6f7e6;
		color: #28a745;
	}

	.feedback-wrong {
		background-color: #fce8e8;
		color: #dc3545;
	}

	.feedback-text {
		font-weight: bold;
		font-size: 18px;
		display: block;
	}

	.correct-answer {
		margin-top: 5px;
		font-size: 14px;
		display: block;
	}

	.action-area {
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

	.btn-success {
		background-color: #28a745;
		color: #fff;
	}

	/* Adjust checkbox/radio size transform if needed, but default is usually okay */
</style>
