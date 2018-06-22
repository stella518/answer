// pages/question/question.js
//获取应用实例
const app = getApp()
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
const questUrl = require('../../config.js').questUrl
const answerUrl = require('../../config.js').answerUrl
const startRoundUrl = require('../../config.js').startRoundUrl
const getAnswerResultUrl = require('../../config.js').getAnswerResultUrl
const saveUserShareUrl = require('../../config.js').saveUserShareUrl

Page({

	data: {
		answer1: '',
		answer2: '',
		answer3: '',
		answer4: '',
		ifDisabled: false,//是否禁用选项按钮
		questid: 0,
		questions: {},
		answerResult: {},//用户本月答题成绩
	},

	onLoad: function (options) {

		var self = this;

		//设置转发参数
		wx.showShareMenu({
			withShareTicket: true
		})

		var answerResult = wx.getStorageSync('answerResult');
		if (!answerResult) {
			wx.showToast({
				title: '系统错误',
				icon: 'none',
				duration: 2000,
				success: function () {
					wx.redirectTo({
						url: '../index/index',
					})
				}
			})
			return
		}

		var succ = answerResult.succ;//回答正确个数
		this.setData({
			answerResult: answerResult
		})

		//本轮剩余题目数大于零
		if (answerResult.remain > 0) {
			self.getQuestion();//继续答题
			return
		}

		//还有剩余答题轮			
		if (answerResult.remainround > 0) {
			self.startNewRound();
			self.getQuestion();
			return
		}
	},

	returnIndex:function() {
		var self = this;
		self.startNewRound();
		wx.redirectTo({
			url: '../index/index',
		})
	},

	getQuestion: function () {
		var self = this;
		tools.request({
			url: questUrl,
			method: 'POST',
			success: function (response) {
				if (+response.statusCode === 200 && response.data) {
					logger.logger('getQuestion', response.data)
					var data = response.data
					if (data.code === 0) {
						self.setData({
							questions: data
						})

						self.questid = data.recid;
						self.clearAnswer();
						console.log("QuestID:", self.questid)
					}
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	chooseOption: function (event) {
		var num = event.currentTarget.dataset.num;
		this.askQuestion(num);
	},

	askQuestion: function (num) {
		var key = 'answer' + num;
		var obj = {};
		var self = this;

		tools.request({
			url: answerUrl,
			method: 'POST',
			data: {
				questid: self.questid,
				answer: num
			},
			success: function (response) {
				if (+response.statusCode === 200 && response.data) {
					logger.logger('askQuestion', response.data)
					var data = response.data
					if (data.code === 0) {

						obj[key] = 'correct';
						self.clearAnswer();
						if (data.remain && data.remain > 0 && data.idx<10) {
							self.getQuestion();
						} else {
							wx.redirectTo({
								url: '../grade/grade',
							})
						}
					} else {

						self.getAnswerResult() //答题错误，更新答题结果

						obj[key] = 'wrong';
						self.setData({
							ifDisabled: true
						})

						if (data.shares < 2) {
							wx.showModal({
								title: "回答问题",
								content: '分享朋友圈可获得继续作答的机会',
								showCancel: false,
								success: function (res) {
									if (res.confirm) {
										self.clearAnswer();
									} else {
										wx.navigateTo({
											url: '../grade/grade',
										})
									}
								}
							})
						} else {
							wx.redirectTo({
								url: '../grade/grade',
							})
						}
					}
					self.setData(obj);
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	clearAnswer: function () {
		this.setData({
			answer1: '',
			answer2: '',
			answer3: '',
			answer4: '',
		})
	},

	//分享或者转发
	onShareAppMessage: function (res) {
		var self = this;
		if (res.from === 'button') {
			// 来自页面内转发按钮
			//console.log(res.target)
		}
		var uid = app.globalData.uid;
		return {
			title: '安全志愿者，加油享补贴',
			path: '/pages/index/index?uid=' + uid,
			imageUrl: '/pages/images/share.png',
			success: function (res) {
				logger.logger('onShareAppMessage', "转发成功", res)

				self.saveUserShare(res.shareTickets[0])
				self.getQuestion();
				self.setData({
					ifDisabled: false
				})
			},
			fail: function (res) {
				// 转发失败
				console.log("转发失败", res)
			}
		}
	},

	startNewRound: function () {
		var self = this;
		tools.request({
			url: startRoundUrl,
			method: 'POST',
			success: function (response) {
				logger.logger('startNewRound', response.data)
			}
		})
	},

	//获取本月回答问题结果
	getAnswerResult: function () {
		var self = this;
		tools.request({
			url: getAnswerResultUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getAnswerResult', data)
				if (data.code == 0) {
					self.setData({
						answerResult: data
					})
					wx.setStorage({
						key: 'answerResult',
						data: data,
					})
				}

			},
			fail: function () {
				console.log("Failed.")
			}
		});
	},

	//保存用户分享ID
	saveUserShare: function (ticket) {
		var data = { tickets: ticket }
		var self = this
		tools.request({
			url: saveUserShareUrl,
			method: 'POST',
			data: data,
			success: function (response) {
				logger.logger('saveUserShare', response.data)
			},
			fail: function () {
				console.log("Failed.")
			}
		});
	},
})
