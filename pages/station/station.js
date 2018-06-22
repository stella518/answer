// pages/station/station.js
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
const ImgHost = require('../../config.js').imghost

const getGasStationsUrl = require('../../config.js').getGasStationsUrl
const getGasPriceUrl = require('../../config.js').getGasPriceUrl
const getAnswerResultUrl = require('../../config.js').getAnswerResultUrl
const getWaresUrl = require('../../config.js').getWaresUrl
const getWaresPromoUrl = require('../../config.js').getWaresPromoUrl

Page({

	data: {
		answerResult: {},
		stationList: [],
		priceList: [],
		waresList: [],
		discount: 0,
		quests: 0,
		headText: '',
		headDesc: '',
	},

	onLoad: function (options) {
		var self = this;

		self.getStation();
		//self.getPrice();
		//self.getAnswerResult();
	},

	getStation: function () {
		var self = this;
		tools.request({
			url: getGasStationsUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getStation', response.data)
				if (data.code == 0) {
					var list = data.data;
					self.setData({
						stationList: list
					})
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	getPrice: function () {
		var self = this;
		tools.request({
			url: getGasPriceUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getPrice', response.data)
				if (data.code == 0) {
					var list = data.data;
					self.setData({
						priceList: list
					})
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	buyOil: function (e) {
		var recid = e.currentTarget.dataset.recid;
		wx.navigateTo({
			url: '../refuel/refuel?id=' + recid,
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

	payProduct: function (opt) {
		console.log (opt)
		var recid = opt.currentTarget.dataset.recid;
		wx.navigateTo({
			url: '../purchase/purchase?prd='+recid,
		})
	},

	getWares: function () {
		var self = this;
		tools.request({
			url: getWaresUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				logger.logger('getWares', response.data)
				if (data.code == 0) {
					var list = data.data;
					var wares_list = [];
					for (var i = 0; i < list.length; i++) {
						var wares = list[i];
						wares.price = logger.toDecimal(list[i].price / 100)
						wares.amount = logger.toDecimal((wares.price * self.data.discount) / 100)
						wares.imgurl = ImgHost + wares.simgurl
						wares_list.push(wares);
					}
					self.setData({
						waresList: wares_list
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
					var promodesc = data.promodesc.split('，');
					self.setData({
						discount: data.discount,
						headText: promodesc[1],
						headDesc: promodesc[0],
					})

					self.getWares();
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},
  toNavigate:function(event){
    var latitude, longitude, stationame;
    var num = event.currentTarget.dataset.num;
    for (var i = 0; i < this.data.stationList.length;i++){
      var item = this.data.stationList[i];
      if(item.recid == num){
        latitude = parseFloat(item.lat);
        longitude = parseFloat(item.lng);
        stationame = item.stationame;
      }
    }
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: stationame,
      scale: 28
    })
  }
})