let rootDir: string | undefined = undefined;

export function useConfig() {
  return {
    RootDir: rootDir,
  };
}

export function SetRootDir(directory: string | undefined) {
  rootDir = directory;
}
