// pages/person/person.js
const tools = require('../../tools/index.js')
const getUserinfoUrl = require('../../config.js').getUserinfoUrl
const updateUserinfoUrl = require('../../config.js').updateUserinfoUrl
const getUserUrl = require('../../config.js').getUserUrl
const uploadImgUrl = require('../../config.js').uploadImgUrl
const ImgHost = require('../../config.js').imghost

const app = getApp()

Page({

	data: {
		items: [
			{ name: '1', value: '男', checked: 'true' },
			{ name: '2', value: '女' }
		],
		personInfo: {},
		status: 0,
		fname: '',
		imgurl: '',
		images: {},
		defaultImg: '../images/update.png',
	},

	onLoad: function (options) {
		var self = this;

		this.setData({
			userInfo: wx.getStorageSync('userInfo'),
			status: app.globalData.status
		})

		tools.request({
			url: getUserinfoUrl,
			method: 'POST',
			success: function (response) {
				if (+response.statusCode === 200 && response.data) {
					console.log(response.data);
					var data = response.data;
					if (data.code == 0) {

						if (data.imgurl) {
							self.setData({
								imgurl: ImgHost + data.imgurl,
								defaultImg: ImgHost + data.imgurl
							})
						}
						self.setData({
							personInfo: data,
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

	radioChange: function (e) {
		//console.log('radio发生change事件，携带value值为：', e.detail.value)
	},

	formSubmit: function (e) {
		var self = this;
		var postData = e.detail.value;

		postData.nickname = self.data.userInfo.nickName;
		postData.fname = self.data.fname;

		tools.request({
			url: updateUserinfoUrl,
			method: 'POST',
			data: postData,
			success: function (response) {
				self.getUserStatus()
				console.log(response);
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