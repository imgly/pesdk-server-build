if (process.env.NODE_ENV === 'production') {
  module.exports = require('./js/PhotoEditorSDK.Server.min')
} else {
  module.exports = require('./js/PhotoEditorSDK.Server')
}
