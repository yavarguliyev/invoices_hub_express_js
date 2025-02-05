module.exports = {
  apps: [
    {
      name: 'invoices-hub',
      script: './dist/index.js',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        NODE_PATH: './dist'
      },
      watch: ['dist'],
      ignore_watch: ['node_modules', '*.log'],
      delay: 1000,
      restartable: 'rs',
      verbose: true,
      ext: 'js,ts,json',
      legacyWatch: true,
      instances: 4,
      exec_mode: 'cluster',
    },
  ],
};
