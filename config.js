
var host = ""
var imghost = ""

var config = {

	host,
	imghost,

	saveStartInfoUrl: `${host}/app/start`,			//保存启动参数，用于记录邀请用户相关信息

	loginUrl: `${host}/doLogin`,					// 登录地址，用于建立会话

	questUrl: `${host}/quest/getquest`,				//获取问题
	answerUrl: `${host}/quest/answer`,				//回答问题
	startRoundUrl: `${host}/quest/startround`,		//开始新一轮答题
	finishRoundUrl: `${host}/quest/startround`,		//结束一轮答题
	getAnswerResultUrl: `${host}/quest/getresult`,	//获取本月答题结果

	getUserinfoUrl: `${host}/user/getinfo`,			//获取用户信息
	updateUserinfoUrl: `${host}/user/updateinfo`,	//更新用户信息

	saveUserShareUrl: `${host}/user/share`,			//保存用户分享信息
	getShareCountUrl: `${host}/user/shareinfo`,		//获取用户分享次数

	getUserUrl: `${host}/user/getuser`,				//获取用户状态

	getCarinfo: `${host}/car/getinfo`,				//获取用户车辆信息
	updateCarinfo: `${host}/car/updateinfo`,		//更新用户车辆信息

	getGasStationsUrl: `${host}/gas/list`,			//获取加油站列表
	getGasPriceUrl: `${host}/gas/price`,			//获取油价接口
	getGasComputeUrl: `${host}/gas/computer`,		//计算优惠油价
	saveGasSaleUrl: `${host}/gas/saleinfo`,			//保存购买信息
	getBuyInfoUrl: `${host}/gas/buyinfo`,			//获取客户购买信息

	getPromoInfoUrl: `${host}/promo/list`,			//获取优惠活动列表

	getWaresUrl: `${host}/wares/list`,				//获取商品列表
	getWaresInfoUrl: `${host}/wares/info`,				//获取商品列表
	getWaresPromoUrl: `${host}/wares/promo`,			//获取商品优惠

	uploadImgUrl: `${host}/upload`
};

module.exports = config
