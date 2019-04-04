module.exports = function (wallaby) {
  return {
    files: [
      'lib/*.js',
      '!lib/*.test.js',
      'package.json'
    ],

    tests: [
      'lib/*.test.js'
    ],

    compilers: {
      'lib/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node',
      runner: 'node'
    }
  }
}
