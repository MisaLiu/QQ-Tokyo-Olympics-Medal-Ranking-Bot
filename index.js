/****************************************************
  * 请在下面的 _qq_account 中填入你的机器人账号信息
  * * * * * * * * * * * * * * * * * * * * * * * * *
  * _qq_account.loginType: 登陆方式，1==账号密码登陆，0==扫码登陆
  *  扫码登陆的好处是不需要过设备锁，坏处是掉 token 要重新登陆
  *  账号密码登陆的好处是一劳永逸，坏处是可能要过验证和提示环境异常
  *  相关可阅读 https://github.com/takayama-lily/oicq/wiki/02.%E5%85%B6%E4%BB%96%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98
  *  过滑块和设备锁请参阅 https://github.com/takayama-lily/oicq/wiki/01.%E6%BB%91%E5%8A%A8%E9%AA%8C%E8%AF%81%E7%A0%81%E5%92%8C%E8%AE%BE%E5%A4%87%E9%94%81
  *  * * * * * * * * * * * * * * * * * * * * * * * * *
  * _qq_account.uin: 机器人的 QQ 号，无需解释
  *  * * * * * * * * * * * * * * * * * * * * * * * * *
  * _qq_account.password: 机器人的登陆密码，支持原文或 md5 后的密码，仅在 loginType = 1 时需要
  *  * * * * * * * * * * * * * * * * * * * * * * * * *
  * _qq_account.platform: 登陆设备协议，1==安卓手机(默认)，2==aPad，3==安卓手表，4==MacOS，5==iPad 
****************************************************/
const _qq_account = {
    loginType: 1,
    platform: 1,
    uin: 1234567890,
    password: 'abcdefg123456'
};


/****************************************************
  * ！！！！！！！！！！特别注意！！！！！！！！！！
  * 在使用本程序前请先安装 oicq 模块和 request 模块
  * 否则会无法使用
****************************************************/
const { createClient } = require('oicq');
const request = require('request');
const client = createClient(_qq_account.uin, {platform: _qq_account.platform});



client.on('system.online', () =>
	console.info('=====机器人已上线，开始获取并处理消息=====')
);

client.on('system.offline', () =>
	console.warn('=====!!机器人已下线，将无法获取并处理消息!!=====')
);

client.on('message.group', function (data) {
	const msg = {
		fromGroup: data.group_id,
		fromAccount: data.sender.user_id,
		message: data.raw_message
	};

	if (data.message.length != 1) {
		return;
	}

	if (msg.message.indexOf('奥运') > -1 &&
		(msg.message.indexOf('排名') > -1 || msg.message.indexOf('排行') > -1)) {
		request('https://m.sogou.com/tworeq?queryString=123&ie=utf8&format=json&qoInfo=query%3Dtype%253A%253A%25E6%2580%25BB%253A%253A0%257C%257Cmingzhong%253A%253A%25E5%25A5%2596%25E7%2589%258C%25E6%25A6%259C%253A%253A0%26vrQuery%3Dtype%253A%253A%25E6%2580%25BB%253A%253A0%257C%257Cmingzhong%253A%253A%25E5%25A5%2596%25E7%2589%258C%25E6%25A6%259C%253A%253A0%26classId%3D70261400%26item_num%3D500%26classTag%3DMULTIHIT.TIYU.70261400%26tplId%3D70261400%26sortRules%3D1%253A%253Aasce', function (err, response, body) {
			if (!err && response.statusCode == 200) {

				let = _json = undefined;
				let _lastUpdateTime = undefined;
				let _list = undefined;
				let loopCount = 0;
				let output = '';

				try {
					_json = JSON.parse(body);
					_lastUpdateTime = _json.doc[0].item[0].crawlTime[0].$;
					_list = _json.doc[0].item[0].display[0].subitem[0].subdisplay[0].list;

				} catch (e) {
					_json = undefined;

				}

				if (_json == undefined) {
					client.sendGroupMsg(msg.fromGroup, '[CQ:at,qq=' + msg.fromAccount + '] 服务器链接失败！');
					return;
				}

				output += '☆★当前奥运会奖牌榜★☆\n'
					 + ' #  国家  金/银/铜/总\n';

				for (let i = 0; i < 10; i++) {
					output += ' ' + (i + 1)
						 + '  ' + _list[i].country[0].$
						 + '  ' + _list[i].gold[0].$
						 + '/' + _list[i].silver[0].$
						 + '/' + _list[i].bronze[0].$
						 + '/' + _list[i].total[0].$ + '\n';
				}

				output += '☆★━━━━━━━━★☆\n'
					 + '最后更新：' + _lastUpdateTime;

				client.sendGroupMsg(msg.fromGroup, output);

			} else {
				client.sendGroupMsg(msg.fromGroup, '[CQ:at,qq=' + msg.fromAccount + '] 服务器链接失败！');
				console.error('[!!!奥运接口错误!!!]' + err);
				return;
				
			}
		});
	}
});



if (_qq_account.loginType == 1) {

	client.on('system.login.slider', function (data) {
		process.stdin.once('data', (input) => {
			this.sliderLogin(input);
		});
	}); 

	client.on('system.login.device', function (data) {
		process.stdin.once('data', () => {
			this.login();
		});
	});

	client.login(_qq_account.password);

} else {

	client.on('system.login.qrcode', function (data) {
		process.stdin.once('data', () => {
			this.login();
		});
	});
	
	client.login();
}


