// pages/map/map.js
const tools = require('../../tools/index.js')
const getGasStationsUrl = require('../../config.js').getGasStationsUrl
Page({
  data: {
    station:{},
  },
  onLoad: function (options) {
    var recid = options.id;
    if (recid){
      this.getStation(recid);
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
          for (var i = 0; i < list.length;i++){
            if (list[i].recid = recid){
              self.setData({
                station: list[i]
              })
              
            }
          }
          wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
              var latitude = parseFloat(self.data.station.lat)
              var longitude = parseFloat(self.data.station.lng)
              wx.openLocation({
                latitude: latitude,
                longitude: longitude,
                scale: 28,
                name: self.data.station.stationame,
                address: self.data.station.address
              })
            }
          })
        }
      },

      fail: function () {
        console.log("Failed.")
      }
    });
  },
  markertap(e) {
    // console.log(e.markerId)
    var self = this;
    wx.openLocation({
      latitude: parseFloat(self.data.station.lat),
      longitude: parseFloat(self.data.station.lng),
      scale: 18,
      name: self.data.station.stationame,
      address: self.data.station.address
    })  
    // wx.navigateTo({
    //   url: '../refuel/refuel'
    // })
  },
})