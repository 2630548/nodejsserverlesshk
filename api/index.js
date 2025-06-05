const fetch = require('node-fetch')

module.exports = async (req, res) => {
  try {
    // 从 Header 获取目标网址和文件名
    var targetUrl = req.headers['x-target-url']
    const filename = req.headers['x-filename'] || 'video.ts'

    // 验证目标网址
    if (!targetUrl) {
      targetUrl = req.query.page;
      if (!targetUrl) {
        return res.status(400).json({ error: '缺少page参数' })
      }
      // return res.status(400).json({ error: '缺少 x-target-url Header' })
    }

    try {
      new URL(targetUrl)
    } catch (error) {
      return res.status(400).json({ error: '无效的 x-target-url', details: error.message })
    }

    // 发起请求到目标网址
    const response = await fetch(targetUrl, {
      method: 'GET'
    })

    // 检查响应状态
    if (!response.ok) {
      // return res.status(response.status).json({ error: '无法获取数据 ', body: response.body, status: response.status })
    }

    // 获取目标响应的 Content-Type 和流
    const contentType = response.headers.get('Content-Type') || 'video/mp2t' // 默认 fallback
    const stream = response.body

    // 设置响应头
    res.setHeader('Content-Type', contentType) // 动态设置 Content-Type
    if(contentType=='video/mp2t'||contentType=='application/vnd.apple.mpegurl'){
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    }
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'no-cache')

    // 流式传输数据
    stream.pipe(res)
  } catch (error) {
    res.status(500).json({ error: '服务器错误', details: error.message })
  }
}
