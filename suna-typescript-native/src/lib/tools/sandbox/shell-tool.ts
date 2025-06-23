import { z } from 'zod';
import { BaseTool, ToolSchema, SchemaType, ToolResult, ToolContext } from '../base-tool';
import { logger } from '../../logging/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Shell command execution parameters
const shellExecuteSchema = z.object({
  command: z.string().describe('The shell command to execute'),
  timeout: z.number().optional().default(30).describe('Timeout in seconds'),
  workingDirectory: z.string().optional().describe('Working directory for command execution'),
});

// Shell tool for executing system commands
export class ShellTool extends BaseTool {
  name = 'shell';
  description = 'Execute shell commands in a sandboxed environment';
  version = '1.0.0';

  private maxTimeout = 60; // Maximum allowed timeout
  private allowedCommands = new Set([
    'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find', 'wc',
    'date', 'whoami', 'uname', 'df', 'du', 'ps', 'top', 'free',
    'curl', 'wget', 'ping', 'nslookup', 'dig',
    'git', 'npm', 'node', 'python', 'python3', 'pip', 'pip3',
    'docker', 'kubectl', 'helm',
  ]);

  async init(): Promise<void> {
    await super.init();
    logger.info('Shell tool initialized', { 
      allowedCommands: Array.from(this.allowedCommands).length 
    });
  }

  getSchemas(): Record<string, ToolSchema[]> {
    return {
      execute: [
        this.createOpenAPISchema(
          'execute',
          'Execute a shell command and return the output',
          shellExecuteSchema,
          [
            { command: 'ls -la', description: 'List files in current directory' },
            { command: 'pwd', description: 'Show current working directory' },
            { command: 'echo "Hello World"', description: 'Echo a message' },
          ]
        ),
        this.createXMLSchema(
          'shell_execute',
          'Execute a shell command',
          {
            command: {
              type: 'string',
              description: 'The shell command to execute',
              required: true,
            },
            timeout: {
              type: 'number',
              description: 'Timeout in seconds (default: 30)',
              required: false,
            },
            workingDirectory: {
              type: 'string',
              description: 'Working directory for command execution',
              required: false,
            },
          },
          [
            '<shell_execute>\n<command>ls -la</command>\n</shell_execute>',
            '<shell_execute>\n<command>pwd</command>\n</shell_execute>',
            '<shell_execute>\n<command>echo "Hello World"</command>\n<timeout>10</timeout>\n</shell_execute>',
          ]
        ),
      ],
    };
  }

  async execute(
    functionName: string,
    parameters: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult> {
    if (functionName !== 'execute') {
      return {
        success: false,
        error: `Unknown function: ${functionName}`,
      };
    }

    // Validate parameters
    const validation = this.validateParameters(functionName, parameters, shellExecuteSchema);
    if (!validation.success) {
      return validation;
    }

    const { command, timeout, workingDirectory } = validation.data;

    // Security checks
    const securityCheck = this.validateCommand(command);
    if (!securityCheck.success) {
      return securityCheck;
    }

    try {
      logger.debug('Executing shell command', {
        command,
        timeout,
        workingDirectory,
        userId: context?.userId,
        threadId: context?.threadId,
      });

      const startTime = performance.now();
      
      // Execute command with timeout
      const result = await this.executeCommand(command, {
        timeout: Math.min(timeout, this.maxTimeout) * 1000, // Convert to milliseconds
        cwd: workingDirectory,
      });

      const duration = performance.now() - startTime;

      logger.info('Shell command executed successfully', {
        command: command.substring(0, 100),
        duration_ms: Math.round(duration),
        outputLength: result.stdout.length,
        errorLength: result.stderr.length,
      });

      return {
        success: true,
        data: {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: 0,
          command,
          duration_ms: Math.round(duration),
        },
        metadata: {
          executedAt: new Date().toISOString(),
          workingDirectory: result.cwd || workingDirectory,
        },
      };
    } catch (error) {
      logger.error('Shell command execution failed', error as Error, {
        command: command.substring(0, 100),
        userId: context?.userId,
      });

      if (error instanceof Error) {
        // Handle timeout errors
        if (error.message.includes('timeout')) {
          return {
            success: false,
            error: `Command timed out after ${timeout} seconds`,
            data: {
              command,
              timeout,
              exitCode: -1,
            },
          };
        }

        // Handle execution errors
        if ('code' in error && 'stdout' in error && 'stderr' in error) {
          const execError = error as any;
          return {
            success: false,
            error: `Command failed with exit code ${execError.code}`,
            data: {
              stdout: execError.stdout || '',
              stderr: execError.stderr || '',
              exitCode: execError.code,
              command,
            },
          };
        }
      }

      return {
        success: false,
        error: `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
        data: {
          command,
          exitCode: -1,
        },
      };
    }
  }

  // Validate command for security
  private validateCommand(command: string): ToolResult {
    // Basic security checks
    const dangerousPatterns = [
      /rm\s+-rf/i,
      />\s*\/dev\/null/i,
      /sudo/i,
      /su\s/i,
      /passwd/i,
      /chmod\s+777/i,
      /mkfs/i,
      /dd\s+if=/i,
      /:\(\)\{.*\}/i, // Fork bomb pattern
      /eval/i,
      /exec/i,
      /system/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          success: false,
          error: `Command contains potentially dangerous pattern: ${pattern.source}`,
        };
      }
    }

    // Check if command starts with allowed command
    const firstWord = command.trim().split(/\s+/)[0];
    const baseCommand = firstWord.split('/').pop() || firstWord; // Handle paths like /usr/bin/ls

    if (!this.allowedCommands.has(baseCommand)) {
      return {
        success: false,
        error: `Command '${baseCommand}' is not in the allowed commands list`,
      };
    }

    // Check command length
    if (command.length > 1000) {
      return {
        success: false,
        error: 'Command is too long (max 1000 characters)',
      };
    }

    return { success: true };
  }

  // Execute command with proper error handling
  private async executeCommand(
    command: string,
    options: { timeout: number; cwd?: string }
  ): Promise<{ stdout: string; stderr: string; cwd?: string }> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: options.timeout,
        cwd: options.cwd,
        maxBuffer: 1024 * 1024, // 1MB max output
        env: {
          ...process.env,
          // Limit environment for security
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USER: process.env.USER,
        },
      });

      return {
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        cwd: options.cwd,
      };
    } catch (error) {
      // Re-throw with additional context
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    logger.info('Shell tool cleaned up');
  }
}
