// Karma configuration.
module.exports = function (config) {
  config.set({
    basePath: '../',
    browserify: {
      paths: ['./']
    },
    browsers: ['Firefox'],
    client: {
      captureConsole: true,
      mocha: {ui: 'tdd'}
    },
    envPreprocessor: ['TEST_ENV'],
    files: [
      // Define test files.
      {pattern: './tests/**/*.test.js'}
    ],
    frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'browserify'],
    preprocessors: {'./tests/**/*.js': ['browserify']},
    reporters: ['mocha']
  });
};
