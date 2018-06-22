
const app = getApp()
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')

const loginUrl = require('../../config.js').loginUrl
const saveStartInfoUrl = require('../../config.js').saveStartInfoUrl
const getAnswerResultUrl = require('../../config.js').getAnswerResultUrl
const saveUserShareUrl = require('../../config.js').saveUserShareUrl

const getUserUrl = require('../../config.js').getUserUrl
const uploadImgUrl = require('../../config.js').uploadImgUrl

var Session = require('../../tools/lib/session.js')

Page({
	data: {
		userInfo: {},//用户微信授权信息
		hasUserInfo: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		numbers: 0,
		hint: '请完成答题后注册',
		answerResult: {},//用户本月答题成绩
		baseInfo: {},//用户基本信息
		carInfo: {},//车辆基本信息
		status: 0,//用户当前状态
	},

	onLoad: function (options) {

		var self = this;
		var session = Session.get();
		if (!session) {
			wx.showLoading({
				title: '加载中',
			})
		} else {
			self.getUserStatus()
		}

		tools.setLoginUrl(loginUrl)
		tools.login({
			success: function (result) {
				console.log('登录成功', result)
				app.globalData.userInfo = result
				wx.setStorage({
					key: 'userInfo',
					data: result,
				})

				self.setData({
					userInfo: result,
					hasUserInfo: true,
				})

				if (!app.globalData.uid) {
					var session = Session.get();
					app.globalData.uid = session.memberid;
					app.globalData.status = session.status
					self.setData({
						status: session.status
					})
				}

				self.setHint(app.globalData.status);//根据状态值设置首页提示
				self.sendStartOption() //保存启动参数
				self.getAnswerResult() //获取本月回答问题结果
				
				wx.hideLoading()
			},
			fail: function (error) {
				console.log('登录失败', error)
				wx.hideLoading()
			}
		})

		//设置转发参数
		wx.showShareMenu({
			withShareTicket: true
		})

		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
				hasUserInfo: true
			})
		} else if (this.data.canIUse) {
			// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.userInfoReadyCallback = res => {
				this.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				})
			}
		} else {
			// 在没有 open-type=getUserInfo 版本的兼容处理
			wx.getUserInfo({
				success: res => {
					app.globalData.userInfo = res.userInfo
					this.setData({
						userInfo: res.userInfo,
						hasUserInfo: true
					})
				}
			})
		}
	},

	getUserInfo: function (e) {
		app.globalData.userInfo = e.detail.userInfo
		this.setData({
			userInfo: e.detail.userInfo,
			hasUserInfo: true
		})
	},

	setHint: function (status) {
		switch (status) {
			case 0: {
				this.setData({
					'hint': '完成安全知识问答赢安全志愿者资格'
				})
				break;
			}
			case 1: {
				this.setData({
					'hint': '答题成功，请注册'
				})
				break;
			}
			case 2: {
				this.setData({
					'hint': '请完善您的爱车信息'
				})
				break;
			}
			case 3: {
				this.setData({
					'hint': '您的信息正在审核中'
				})
				break;
			}
			case 4: {
				this.setData({
					'hint': '恭喜，您本月可享受优惠'
				})
				break;
			}

		}
	},

	toRefuel: function (e) {
		wx.navigateTo({
			url: '../station/station',
		})
	},

	turnQuestion: function (e) {
		var self = this;
		//判断用户本月是否还有答题次数
		if (self.data.answerResult.code == 0) {
			var remain = self.data.answerResult.remain
			var remainround = self.data.answerResult.remainround
			var round = self.data.answerResult.round
			var fails = self.data.answerResult.fail
			var succnt = self.data.answerResult.succnt

			if (remain <= 0 && remainround <= 0) {
				wx.showToast({
					title: '您本月答题次数已使用完毕',
					icon: 'none',
					duration: 2000
				})
				return
			}

			//最后一轮失败两次
			if (fails > 2 && remain > 0 && remainround === 0) {
				wx.showToast({
					title: '您本月答题次数已使用完毕',
					icon: 'none',
					duration: 2000
				})
				return
			}

			wx.showModal({
				title: '提示',
				content: '当前进行第 ' + round + ' 轮答题，请一次答完，中途退出，将失去本轮机会！',
				confirmText: '继续',
				success: function (res) {
					if (res.confirm) {
						wx.redirectTo({
							url: '../question/question',
						})
					} else if (res.cancel) {
						return;
					}
				}
			})
		} else {
			wx.showToast({
				title: '系统错误，请稍后重试！',
				icon: 'none',
				duration: 2000
			})
			return
		}
	},

	turnUser: function () {
		var self = this;
		var status = app.globalData.status;
		if (status == 0) {
			var question = this.data.answerResult.maxsucc;
			//判断用户是否已经答题，并且成功答对6道以上
			if (question >= 6) {
				wx.redirectTo({
					url: '../user/user',
				})
			} else {
				//判断用户本月是否还有答题次数
				var remain = self.data.answerResult.remain;
				var remainround = self.data.answerResult.remainround;

				if (remain <= 0 && remainround <= 0) {
					wx.showToast({
						title: '您本月答题次数已使用完毕',
						icon: 'none',
						duration: 2000
					})
					return
				}

				wx.showModal({
					title: '提示',
					content: '请先完成答题',
					success: function (res) {
						if (res.confirm) {
							wx.redirectTo({
								url: '../question/question',
							})
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
			}
		} else {
			wx.redirectTo({
				url: '../user/user',
			})
		}
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
			}
		}
	},

	//保存启动参数
	sendStartOption: function (e) {
		tools.request({
			url: saveStartInfoUrl,
			method: 'POST',
			data: app.globalData.startInfo,
			success: function (response) {
				logger.logger('sendStartOption', response.data)
			},
			fail: function () {
				console.log("Failed.")
			}
		});
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
					self.setData({
						status: user.status
					})
					self.setHint(app.globalData.status);
				}
			},
			fail: function () {
				console.log("Failed.")
			}
		});
	},
	turnRule: function () {
		wx.navigateTo({
			url: '../rule/rule',
		})
	}
})