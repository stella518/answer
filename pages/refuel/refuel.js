// pages/refuel/refuel.js
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
const getGasStationsUrl = require('../../config.js').getGasStationsUrl
const getGasPriceUrl = require('../../config.js').getGasPriceUrl
const getGasComputeUrl = require('../../config.js').getGasComputeUrl
const saveGasSaleUrl = require('../../config.js').saveGasSaleUrl

Page({

	data: {
		station: {},
		selectPrice: {},
		oil_price: 0,//当前类型油价
		oil_type: 92,//当前类型
		priceList: [],
		octaneList: [],//汽油型号列表
		payObj: {}, //支付用应付金额
		showObj: {},//显示用户应付金额
		money: null,
		typeColor: ['active', ''],
		amtColor: [],
		pickoctane: 92
	},

	onLoad: function (options) {
		var recid = options.id;
		if (recid) {
			this.getStation(recid);
			this.getPrice();
		}
	},

	getStation: function (recid) {
		var self = this;
		tools.request({
			url: getGasStationsUrl,
			method: 'POST',
			success: function (response) {
				var data = response.data;
				console.log(response.data);
				if (data.code == 0) {
					var list = data.data;
					for (var i = 0; i < list.length; i++) {
						if (list[i].recid = recid) {
							self.setData({
								station: list[i]
							})
						}
					}
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
				console.log(response.data);
				if (data.code == 0) {
					var list = data.data;
					var octaneList = [];
					for (var i = 0; i < list.length; i++) {
						octaneList.push(list[i].octane);
					}
					self.setData({
						priceList: list,
						oil_price: list[0].price / 100,
						octaneList: octaneList
					})
				}

			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	computePrice: function (e) {

		if (parseInt(e.detail.value) <= 10) {
			return
		}

		var self = this;
		if (e) {
			self.setData({
				money: e.detail.value
			})
		}
		var data = {
			octane: this.data.pickoctane,
			amount: e.detail.value * 100
		}
		self.reCompute(data);
	},

	reCompute: function (data) {
		var self = this;
		tools.request({
			url: getGasComputeUrl,
			method: 'POST',
			data: data,
			success: function (response) {
				var data = response.data;
				if (data.code == 0) {
					self.setData({
						showObj: {
							litre: data.litre,
							coupon: logger.toDecimal(data.coupon / 100),
							amount: logger.toDecimal(data.amount / 100),
							cash: logger.toDecimal(data.cash / 100),
							discount: logger.toDecimal(data.discount / 100)
						}
					})

					self.setData({
						payObj: {
							litre: data.litre,
							coupon: data.coupon,
							cash: data.cash,
							code: data.code
						}
					})

				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	bindPickerChange: function (e) {
		console.log('选的是', e.currentTarget.dataset.type)
		var octane = e.currentTarget.dataset.type;
		var obj = {};
		if (octane == '92') {
			obj.typeColor = ['active', ''];
		} else if (octane == '95') {
			obj.typeColor = ['', 'active'];
		}
		this.setData(obj);
		this.showPrice(octane);//根据选择的汽油型号改变基础价格
		this.setData({
			pickoctane: octane,
			oil_type: octane
		})
		if (this.data.money) {//如果已输入购买金额，则再次计算优惠价格
			this.reCompute()
			var data = {
				octane: this.data.pickoctane,
				amount: this.data.money * 100
			}
			this.reCompute(data);
		}
	},

	showPrice: function (octane) {
		var priceList = this.data.priceList;
		for (var i = 0; i < priceList.length; i++) {
			if (priceList[i].octane == octane) {
				this.setData({
					oil_price: priceList[i].price / 100
				})
			}
		}
	},

	toPay: function () {
		var self = this;
		if (this.data.payObj && this.data.payObj.code == 0) {
			var data = {
				octane: this.data.pickoctane,
				amount: this.data.payObj.cash,
				litre: this.data.payObj.litre,
				coupon: this.data.payObj.coupon
			}
			tools.request({
				url: saveGasSaleUrl,
				method: 'POST',
				data: data,
				success: function (response) {
					var data = response.data;
					console.log(response.data);
					//发起支付
					self.doWeChatPay (data);
				},
				fail: function () {
					console.log("Failed.")
				}
			});

		} else {
			wx.showToast({
				title: '请输入购买类型和金额，进行价格计算',
				icon: 'none',
				duration: 3000,
				success: function () {}
			})
		}
	},

	chooseAmount: function (e) {
		var amount = parseInt(e.currentTarget.dataset.num);
		var obj = {};
		if (amount == '100') {
			obj.amtColor = ['active', '', ''];
		} else if (amount == '200') {
			obj.amtColor = ['', 'active', ''];
		} else {
			obj.amtColor = ['', '', 'active'];
		}
		obj.money = amount;
		this.setData(obj);
		var octane = this.data.pickoctane;
		if (octane) {
			var data = {
				octane: this.data.pickoctane,
				amount: amount * 100
			}
			this.reCompute(data);
		} else {
			wx.showToast({
				title: '请选择汽油型号',
				icon: 'none',
				duration: 2000
			})
		}
	},

	doWeChatPay: function (opt) {
		wx.requestPayment({
			'timeStamp': opt.timeStamp,
			'nonceStr': opt.nonceStr,
			'package': opt.package,
			'paySign': opt.paySign,
			'signType': opt.signType,
			success: function (res) {
				console.log(res)
				wx.showToast({
					title: '支付成功',
					icon: 'none',
					duration: 2000,
					success: function () { }
				})
			},
			fail: function (res) {
				console.log (res)
				wx.showToast({
					title: '支付失败，请稍后重试',
					icon: 'none',
					duration: 2000,
					success: function () { }
				})
			},
			complete: function (res) {
				wx.redirectTo({
					url: '../index/index',
				})
			}
		})
	}
})