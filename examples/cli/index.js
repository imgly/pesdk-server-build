const Utils = require('./utils')
const fs = require('fs')
const Canvas = require('canvas')
const PhotoEditorServer = require('photoeditorsdk-server')
const minimist = require('minimist')

Utils.invariant(fs, 'Module canvas not installed!')
Utils.invariant(Canvas, 'Canvas module not installed!')
Utils.invariant(PhotoEditorServer, 'Module photoeditorsdk-server not installed!')
Utils.invariant(minimist, 'Module minimist not installed!')

const argv = minimist(process.argv.slice(2))
let { i: inputImageFile, c: configurationFile, o: outputImageFile, l: licenseFile, h: showHelp, r: preferredRenderer, m: mimeType } = argv

function printHelp () {
  console.log('Possible parameters are')
  console.log('-h\tShow help')
  console.log('-l\tLicense file')
  console.log('-r\tRenderer to use (webgl or canvas)')
  console.log('-c\tConfiguration File')
  console.log('-i\tInput Image File')
  console.log('-o\tOutput Image File')
}

if (showHelp) {
  printHelp()
  process.exit(0)
}

try {
  Utils.invariant(licenseFile, 'No license file given!')
} catch (error) {
  console.log(error.message)
  printHelp()
  process.exit(1)
}

const license = fs.readFileSync(licenseFile).toString()
Utils.invariant(license.length > 0, 'No license file content!')

// Defaults
preferredRenderer = Utils.defaults(preferredRenderer, 'webgl')
configurationFile = Utils.defaults(configurationFile, '../shared/serialization/example_text.json')
inputImageFile = Utils.defaults(inputImageFile, '../shared/assets/example.jpg')
outputImageFile = Utils.defaults(outputImageFile, './output.jpg')
mimeType = Utils.defaults(mimeType, 'image/jpeg')

const configuration = JSON.parse(fs.readFileSync(configurationFile))

configuration.image.uri = inputImageFile

// Initialize sdk
const pesdkConfig = {
  license: license,
  transparent: true,
  editor: {
    preferredRenderer: preferredRenderer,
    export: {
      format: mimeType,
      type: PhotoEditorServer.SDK.RenderType.BUFFER
    }
  },
  assets: {
    baseUrl: '../node_modules/photoeditorsdk-server/assets'
  }
}

const pesdkServer = new PhotoEditorServer(pesdkConfig)
// Call render function
pesdkServer.render(configuration)
  .then(image => {
    fs.writeFileSync(outputImageFile, image)
    console.log('Done!')
  })
  .catch(e => {
    console.log(`Error: ${e.message}`)
  })
