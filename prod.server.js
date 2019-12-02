/* 自己模拟的服务器 */

var express=require('express');
var config=require('./config/index');
var axios=require('axios');

var app = express();
var apiRoutes = express.Router();

apiRoutes.get('/getDiscList', function (req, res) {
        let url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg"
        axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        // axios发送get请求，可以自己配置config
        axios.get(url, {
          headers: {
            referer: 'http://c.y.qq.com/',
            host: 'c.y.qq.com',
          },
            //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      apiRoutes.get('/getLyric', function (req, res) {
        let url = "https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg"

        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');

        // axios发送get请求，可以自己配置config
        axios.get(url, {
          headers: {
						//通过node请求QQ接口，发送http请求时，修改referer和host
            referer: 'http://c.y.qq.com/',
            host: 'c.y.qq.com',
          },
            //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
          params: req.query
        }).then((response) => {
					// var ret=response.data;
					// if(typeof ret==='string'){
						// var reg=/^\w+\(({[^()]+})\)$/;
						// 以单词a-z，A-Z开头，一个或多个
            // \(\)转义括号以（）开头结尾
            // （）是用来分组
            // 【^()】不以左括号/右括号的字符+多个
            // {}大括号也要匹配到
						// var matches=ret.matches(reg);
						// if(matches){
							// 对匹配到的分组的内容进行转换
							// ret=JSON.parse(matches[1]);
						// }
					// }
          res.json(response.data)
        }).catch((e) => {
          console.log(e);
        })
      })

 			apiRoutes.get('/getSongList', function (req, res) {
 			  let url = "https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg"
 			  // axios发送get请求，可以自己配置config
 			  axios.get(url, {
 			    headers: {
 			      referer: 'http://c.y.qq.com/',
 			      host: 'c.y.qq.com',
 			    },
 			      //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
 			    params: req.query
 			  }).then((response) => {
 			    res.json(response.data)
 			  }).catch((e) => {
			    console.log(e)
 			  })
 			})

      app.use('/api', apiRoutes)

      app.use(express.static('./dist'));

      var port=process.env.PORT || config.build.port;

      module.exports=app.listen(port,function(err){
        if(err){
          console.log(err)
          return
        }
        console.log('Listening at http://localhost:'+port+'\n');
      })
