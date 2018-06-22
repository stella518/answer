// pages/user/user.js
//获取应用实例
const app = getApp()

Page({

	data: {
		status:0
	},

	onLoad: function (options) {
		var status = app.globalData.status;
		this.setData({
			status: status
		})
	},

	returnMain: function (e) {
		wx.redirectTo({
			url: '../index/index',
		})
	}
})