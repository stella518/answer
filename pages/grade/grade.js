// pages/grade/grade.js
const app = getApp()
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
const getAnswerResultUrl = require('../../config.js').getAnswerResultUrl
const getPromoInfoUrl = require('../../config.js').getPromoInfoUrl
const finishRoundUrl = require('../../config.js').finishRoundUrl
const saveUserShareUrl = require('../../config.js').saveUserShareUrl
const getUserUrl = require('../../config.js').getUserUrl

Page({

	data: {
		answerResult: {},
		promoObj: {},
		discounts: 0
	},

	onLoad: function (options) {
		this.getAnswerResult();

		//设置转发参数
		wx.showShareMenu({
			withShareTicket: true
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
				var discounts = 0.0;
				if (data.succ >= 6) {
					discounts = data.succ * 0.1;
					self.getPromo(data.succ);
				}
				self.setData({
					answerResult: data,
					discounts: discounts
				})
				wx.setStorageSync('answerResult', data);
			},
			fail: function () {
				console.log("getAnswerResult Failed.")
			}
		});
	},

	getPromo: function (succ) {
		var self = this;
		tools.request({
			url: getPromoInfoUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				if (data.code == 0) {
					logger.logger('getPromo', data)
					if (succ == 7) {
						succ = 6;
					} else if (succ == 9) {
						succ = 8;
					}
					var list = data.data;
					for (var i = 0; i < list.length; i++) {
						if (list[i].quests == succ) {
							self.setData({
								promoObj: list[i]
							})
						}
					}
				}
			},
			fail: function () {
				console.log("getAnswerResult Failed.")
			}
		});
	},

	answerAgain: function () {
		var self = this;
		var times = self.data.answerResult.remainround;
		if (times > 0) {
			this.finishRound();//结束本轮，清理数据
			wx.redirectTo({
				url: '../question/question?again=1',
			})
		} else {
			wx.showModal({
				title: '抱歉',
				content: '本月答题次数已用完',
				success: function (res) {
					if (res.confirm) {
						self.finishRound();//结束本轮，清理数据
						wx.redirectTo({
							url: '../index/index',
						})
					} else if (res.cancel) {
					}
				}
			})
		}
	},

	turnInde: function () {
		this.finishRound();//结束本轮，清理数据
		wx.redirectTo({
			url: '../index/index',
		})
	},

	finishRound: function () {
		tools.request({
			url: finishRoundUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('finishRound', data)
			}
		})
	},

	UserRegister: function () {
		this.finishRound();//结束本轮，清理数据
		wx.redirectTo({
			url: '../user/user',
		})
	},

	//分享或者转发
	onShareAppMessage: function (res) {
		var self = this
		if (res.from === 'button') {
			// 来自页面内转发按钮
			console.log(res.target)
		}
		return {
			title: '安全志愿者，加油享补贴',
			path: '/pages/index/index?uid=' + app.globalData.uid,
			imageUrl: '/pages/images/share.png',
			success: function (res) {
				// 转发成功
				self.saveUserShare(res.shareTickets[0])
				self.getUserStatus()
			},
			fail: function (res) {
				// 转发失败
				console.log("转发失败", res)
			},
		}
	},

	//保存用户分享id
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

	getUserStatus: function (e) {
		var self = this
		tools.request({
			url: getUserUrl,
			method: 'POST',
			success: function (response) {
				logger.logger('getUserStatus', response.data)
				if (response.data.code === 0) {
					var user = response.data.user
					app.globalData.uid = user.memberid
					app.globalData.status = user.status
				}
			},
			fail: function () {
				console.log("Failed.")
			},
			complete: function () {
				self.turnInde ()
			}
		});
	},
})