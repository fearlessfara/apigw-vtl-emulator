const unsupported = () => {
  throw new Error('Filesystem access is not available in the browser runtime.');
};

export const readFileSync = unsupported;
export const existsSync = () => false;
export const statSync = () => ({
  isDirectory: () => false,
  isFile: () => false
});

export const promises = {
  readFile: unsupported,
  stat: unsupported
};

export default {
  readFileSync,
  existsSync,
  statSync,
  promises
};
