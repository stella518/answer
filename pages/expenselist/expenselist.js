// pages/expenselist/expenselist.js
const getBuyInfoUrl = require('../../config.js').getBuyInfoUrl
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')

Date.prototype.format = function (format) {
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(),    //day
		"h+": this.getHours(),   //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
		"S": this.getMilliseconds() //millisecond
	}
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
		
	for (var k in o) if (new RegExp("(" + k + ")").test(format))
		format = format.replace(RegExp.$1,
			RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	return format;
}

Page({

	data: {
		buyList: [],
		postdata: {},
		recordcnt: 0,
		haveMore: true,
	},

	onLoad: function (options) {
		let self = this;
		self.data.buyList = [];
		self.initPostData();
		self.getBuyInfo();
	},

	//下拉加载
	onReachBottom: function (options) {
		let self = this;
		if (self.data.haveMore) {
			self.getBuyInfo();
		}
	}, 

	initPostData: function () {
		let self = this
		let sDate = new Date();
		sDate.setDate(1);

		let eDate = new Date(sDate);
		eDate.setMonth(sDate.getMonth() + 1);
		eDate.setDate(0);

		self.data.postdata = {
			sdate: '2018-04-01',
			edate: eDate.format('yyyy-MM-dd'),
			num: 10,
			offset: self.data.recordcnt
		}
	},

	//获取客户购买信息
	getBuyInfo: function () {
		let self = this

		tools.request({
			url: getBuyInfoUrl,
			method: 'POST',
			data: self.data.postdata,
			success: function (response) {
				let retdata = response.data
				logger.logger('getBuyInfo', response.data)
				if (retdata.code === 0) {
					let list = retdata.data;
					let buyList = [];

					if (list.length > 0) {
						self.data.recordcnt += list.length;
					}

					if (list.length == self.data.postdata) {
						self.data.haveMore = true;
					} else {
						self.data.haveMore = false;
					}

					for (var i = 0; i < list.length; i++) {
						let info = list[i]
						info.litre = info.litre / 100
						info.amount = info.amount / 100
						info.cash = info.cash / 100
						info.price = info.price / 100
						info.coupon = info.coupon / 100
						if (info.status == 2) {
							info.status = '已支付'
						}
						if (info.status == 3) {
							info.status = '已加油'
						}
						buyList.push(info);
					}
					self.setData({
						buyList: buyList
					})
				}
			},
			fail: function () {
				console.log("Failed.")
			}
		});
	},
})