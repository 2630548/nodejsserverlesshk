// This file should be placed in your Vercel project, e.g., at `api/run-command.js`
// This creates a Serverless Function accessible via `/api/run-command`

import { exec } from 'child_process'; // Import the child_process module
import { promisify } from 'util';     // Import util for promisify to use async/await with exec

// Promisify exec to use it with async/await
const execPromise = promisify(exec);

/**
 * Vercel Serverless Function handler.
 * This function will be executed when its API endpoint is accessed.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin (for testing purposes)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log the incoming request method
  console.log(`Received ${req.method} request to /api/run-command`);

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
}
