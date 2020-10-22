if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/PhotoEditorSDK.Server.min')
} else {
  module.exports = require('./cjs/PhotoEditorSDK.Server')
}
