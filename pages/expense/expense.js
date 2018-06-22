// pages/expense/expense.js
const getBuyInfoUrl = require('../../config.js').getBuyInfoUrl
const tools = require('../../tools/index.js')
const logger = require('../../tools/logger.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBuyInfo();
  },
  //获取客户购买信息
  getBuyInfo: function () {
    var self = this
    var data = {
      sdate: '2018-04-01',
      edate: '2018-04-30',
      num: 10,
      offset: 0,
    }

    tools.request({
      url: getBuyInfoUrl,
      method: 'POST',
      data: data,
      success: function (response) {
        logger.logger('getBuyInfo', response.data)
      },
      fail: function () {
        console.log("Failed.")
      }
    });
  },
  toIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  }

})