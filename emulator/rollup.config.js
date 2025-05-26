import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import polyfillNode from 'rollup-plugin-polyfill-node';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'VTL',
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    polyfillNode(),
    terser()
  ]
};
