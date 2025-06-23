export interface Sandbox {
  id: string;
  fs: {
    writeFile: (path: string, content: string) => Promise<void>;
  };
  process: {
    exec: (options: {
      command: string;
    }) => Promise<{ stdout: string; stderr: string }>;
  };
}

export async function createSandbox(): Promise<Sandbox> {
  console.log("Creating Daytona sandbox...");
  return {
    id: `suna-agent-${Date.now()}`,
    fs: {
      writeFile: async (path: string) => {
        console.log(`Writing to ${path} in sandbox...`);
      },
    },
    process: {
      exec: async (options: { command: string }) => {
        console.log(`Executing "${options.command}" in sandbox...`);
        return {
          stdout: 'Mocked output from Daytona sandbox',
          stderr: '',
        };
      },
    },
  };
}

export async function runCodeInSandbox(
  workspace: Sandbox,
  code: string,
  language: "python" | "javascript",
): Promise<string> {
  const fileName = language === 'python' ? 'script.py' : 'script.js';
  await workspace.fs.writeFile(fileName, code);

  const { stdout, stderr } = await workspace.process.exec({
    command: language === 'python' ? `python ${fileName}` : `node ${fileName}`,
  });

  if (stderr) {
    return `Error: ${stderr}`;
  }

  return stdout;
}
