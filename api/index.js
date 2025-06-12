import { exec } from 'child_process'; // Import the child_process module
import { promisify } from 'util';     // Import util for promisify to use async/await with exec

// Promisify exec to use it with async/await
const execPromise = promisify(exec);

const fetch = require('node-fetch')

module.exports = async (req, res) => {
  try {
    // Define the command to execute.
    // 'ls -la' lists all files and directories in the current directory, including hidden ones.
    // Replace this with your desired command.
    const commandToRun = 'ls -la';
    console.log(`Attempting to execute command: "${commandToRun}"`);

    // Execute the command using child_process.exec
    // The result contains stdout (standard output) and stderr (standard error)
    const { stdout, stderr } = await execPromise(commandToRun);

    // Log the output and error streams from the child process
    if (stdout) {
      console.log('Command stdout:', stdout);
    }
    if (stderr) {
      console.error('Command stderr:', stderr);
    }

    // Send the output back as a JSON response
    res.status(200).json({
      success: true,
      command: commandToRun,
      stdout: stdout,
      stderr: stderr,
      message: 'Command executed successfully.'
    });

  } catch (error) {
    // Catch any errors that occur during command execution
    console.error('Error executing child process:', error);

    // Send an error response
    res.status(500).json({
      success: false,
      command: commandToRun,
      error: error.message,
      message: 'Failed to execute command.'
    });
  }
  
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
