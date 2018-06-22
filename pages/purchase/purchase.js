// pages/purchase/purchase.js

const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
const ImgHost = require('../../config.js').imghost

const getAnswerResultUrl = require('../../config.js').getAnswerResultUrl
const getWaresInfoUrl = require('../../config.js').getWaresInfoUrl
const getWaresPromoUrl = require('../../config.js').getWaresPromoUrl

Page({

	data: {
		answerResult: {},
		waresInfo: {},
		discount: 0,
		quests: 0,
		wareid: 0,
	},

	onLoad: function (options) {
		var self = this;
		self.data.wareid = options.prd
		self.getAnswerResult();
	},

	//获取本月回答问题结果
	getAnswerResult: function () {
		var self = this;
		tools.request({
			url: getAnswerResultUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				self.setData({
					answerResult: data,
					quests: data.maxsucc
				})
				//wx.setStorageSync('answerResult', data);

				self.getWaresPromo();
			},
			fail: function () {
				console.log("getAnswerResult Failed.")
			}
		});
	},

	getWareInfo: function () {
		var self = this;
		tools.request({
			url: getWaresInfoUrl,
			data:{
				wareid: self.data.wareid
			},
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getWareInfo', response.data)
				if (data.code == 0) {
					var ware_info = data;
					ware_info.price = logger.toDecimal(data.price / 100)
					ware_info.amount = logger.toDecimal((data.price * self.data.discount) / 100)
					ware_info.imgurl = ImgHost + data.bimgurl
				
					self.setData({
						waresInfo: ware_info
					})
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	getWaresPromo: function () {
		var self = this;
		tools.request({
			url: getWaresPromoUrl,
			data: {
				quests: self.data.quests
			},
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getWarePromo', response.data)
				if (data.code == 0) {
					self.setData({
						discount: data.discount
					})

					self.getWareInfo();
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},
  toPay:function(){
    wx.showToast({
      title: '产品即将上线，敬请期待',
      icon: 'none',
      duration: 3000,
      success: function () {
      }
    })
  }
})