// pages/car/car.js
const tools = require('../../tools/index.js')
const getCarinfo = require('../../config.js').getCarinfo
const updateCarinfo = require('../../config.js').updateCarinfo
const getUserUrl = require('../../config.js').getUserUrl
const uploadImgUrl = require('../../config.js').uploadImgUrl
const ImgHost = require('../../config.js').imghost

const app = getApp()

Page({

	data: {
		date: '2018',
		carInfo: {},
		status: 0,
		fname: '',
		imgurl: '',
		area: '豫A',
		showArea: false,
		images: {},
		defaultImg: '../images/update.png',
		areaList: [
			{
				id: 'A',
				name: '豫A'
			},
			{
				id: 'B',
				name: '豫B'
			},
			{
				id: 'C',
				name: '豫C'
			},
			{
				id: 'D',
				name: '豫D'
			},
			{
				id: 'E',
				name: '豫E'
			},
			{
				id: 'F',
				name: '豫F'
			},
			{
				id: 'G',
				name: '豫G'
			},
			{
				id: 'H',
				name: '豫H'
			},
			{
				id: 'J',
				name: '豫J'
			},
			{
				id: 'K',
				name: '豫K'
			},
			{
				id: 'L',
				name: '豫L'
			},
			{
				id: 'M',
				name: '豫M'
			},
			{
				id: 'N',
				name: '豫N'
			},
			{
				id: 'P',
				name: '豫P'
			},
			{
				id: 'Q',
				name: '豫Q'
			},
			{
				id: 'R',
				name: '豫Q'
			},
			{
				id: 'S',
				name: '豫S'
			},
			{
				id: 'U',
				name: '豫U'
			}
		]
	},

	onLoad: function (options) {
		var self = this;
		this.setData({
			status: app.globalData.status
		})

		tools.request({
			url: getCarinfo,
			method: 'POST',
			success: function (response) {
				if (+response.statusCode === 200 && response.data) {
					console.log(response.data);
					var data = response.data;
					if (data.code == 0) {
						var platenumber = data.platenumber;
						if (platenumber.length == 7) {
							data.platenumber_main = platenumber.slice(2);
							data.platenumber_tag = platenumber.slice(0, 2);
						}
						if (data.imgurl) {
							self.setData({
								imgurl: ImgHost + data.imgurl,
								defaultImg: ImgHost + data.imgurl
							})
						}
						self.setData({
							carInfo: data,
							area: data.platenumber_tag,
						})
					}
				} else {
					console.log("Error.")
				}
			},

			fail: function () {
				console.log("Failed.")
			}
		});
	},

	formSubmit: function (e) {
		console.log('form发生了submit事件，携带数据为：', e.detail.value)
		var self = this;
		var data = e.detail.value;

		if (data.platenumber.length == 5) {
			data.platenumber = this.data.area + data.platenumber;
		}

		data.fname = self.data.fname

		tools.request({
			url: updateCarinfo,
			method: 'POST',
			data: data,
			success: function (response) {
				self.getUserStatus()
				console.log(response)
				wx.redirectTo({
					url: '../user/user'
				})
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
				if (response.data.code === 0) {
					var user = response.data.user
					app.globalData.uid = user.memberid
					app.globalData.status = user.status
				}
			},
			fail: function () {
				console.log("Failed.")
			}
		});
	},

	returnMain: function (e) {
		wx.redirectTo({
			url: '../user/user',
		})
	},

	uploadImg: function (e) {
		var self = this;
		wx.chooseImage({
			count: 1,
			sizeType: ['original'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				var data = {
					uid: app.globalData.uid
				}
				var tempFilePaths = res.tempFilePaths

				wx.showLoading({
					title: '上传中...',
				})

				wx.uploadFile({
					url: uploadImgUrl,
					filePath: tempFilePaths[0],
					name: 'image',
					success: function (response) {
						if (+response.statusCode === 200 && response.data) {
							var data = JSON.parse(response.data);
							if (data.code == 0) {
								self.setData({
									defaultImg: res.tempFilePaths
								})
							}
						}
					},
					complete: function (opt) {
						wx.hideLoading()
						wx.showToast({
							title: '上传成功',
							icon: 'success',
							duration: 2000
						})
					}
				})
			}
		})
	},
	areaPickerChange: function (e) {
		var areaList = this.data.areaList;
		var name = areaList[e.detail.value].name
		this.setData({
			area: name
		})
	},
	
	imageLoad: function (e) {
		var $width = e.detail.width,    //获取图片真实宽度
			$height = e.detail.height,
			ratio = $width / $height;    //图片的真实宽高比例
		var viewWidth = 150,           //设置图片显示宽度，左右留有16rpx边距
			viewHeight = 150 / ratio;    //计算的高度值
		var image = this.data.images;
		//将图片的datadata-index作为image对象的key,然后存储图片的宽高值
		image = {
			width: viewWidth,
			height: viewHeight
		}
		this.setData({
			images: image
		})
	}
})