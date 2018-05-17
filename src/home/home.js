import config from '../../config'
const app = getApp()

Page({
  data: {
    isAccess_token: true,
    portraitPath: '',
    rankings: true,
    rankingsList: [],
    userShareGroupsList: [],
    cccc: false
  },
  onLoad: function (options) {
    var that = this
    // 埋点
    wx.reportAnalytics('page_view', {
      page_view_name: '首页'
    })
    if (app.employIdCallback) {
      this.setData({
        isAccess_token: false
      })
      that.loginUserShareGroups()
    } else {
      app.employIdCallback = res => {
        this.setData({
          isAccess_token: false
        })
        that.loginUserShareGroups()
        if (app.globalData.shareEncryptedData != '') {
          that.uploadGroupInfo(res.encryptedData, res.iv)
        }
      }
    }
  },
  // 分享
  onShareAppMessage: function (res) {
    var that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '牛逼死了',
      path: 'src/home/home?id=hahah',
      success: function(res) {
        // 转发成功
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function(res){
            that.uploadGroupInfo(res.encryptedData, res.iv)
          }
        })
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  // 解析信息
  uploadGroupInfo: function (encryptedData, iv) {
    var that = this
    wx.request({
      url: config.host + '/v1/user_share_groups/upload_group_info',
      method: 'POST',
      header: {
        'Authorization': app.globalData.access_token,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        'encryptedData': encryptedData,
        'iv': iv
      }),
      success: function (obj) {
        that.userShareGroups(obj.data.open_gid)
      }
    })
  },
  // 获取排行榜人员信息
  userShareGroups: function (openGid) {
    var that = this
    console.log(openGid)
    wx.request({
      url: config.host + '/v1/user_share_groups/top',
      method: 'GET',
      data: {
        'open_gid': openGid
      },
      header: {
        'Authorization': app.globalData.access_token,
        'Content-Type': 'application/json'
      },
      success: function (res) {
        that.setData({
          rankings: !res.data.is_has_test,
          cccc: true
        })
        console.log(res)
        let userList = []
        if (res.data.users != undefined && res.data.users.length > 0) {
          res.data.users.map((item, i) => {
            if (item.name != null && item.avatar_url != null && item.answer_name ) {
              userList.push(item)
            }
          })
        }
        that.setData({
          rankingsList: userList
        })
        console.log(that.data.rankingsList)
      },
      fail: function(res) {
      }
    })
  },
  // 搜索进入程序 判断用户分享过哪些群
  loginUserShareGroups: function () {
    var that = this
    wx.request({
      url: config.host + '/v1/user_share_groups',
      method: 'GET',
      header: {
        'Authorization': app.globalData.access_token,
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.user_share_groups.length > 0) {
          that.setData({
            rankings: false
          })
          // 这里调用加载群用户信息
          // that.xxxxx(res.data.user_share_groups[res.data.user_share_groups.length - 1])
        }
        that.setData({
          userShareGroupsList: res.data.user_share_groups
        })
      }
    })
  },
  toTesting: function () {
    wx.navigateTo({
      url:'/src/testing/testing'
    })
  },
  toBankList: function () {
    wx.navigateTo({
      url:'/src/bankList/bankList'
    })
  },
  group: function () {
    wx.navigateTo({
      url:'/src/shareGroups/shareGroups'
    })
  }
})
