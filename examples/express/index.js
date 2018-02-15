const express = require('express')
const bodyParser = require('body-parser')

const Utils = require('./utils')
const fs = require('fs')
const Canvas = require('canvas')
const PhotoEditorServer = require('photoeditorsdk-server')

Utils.invariant(express, 'Module express not installed!')
Utils.invariant(bodyParser, 'Module bodyParser not installed!')
Utils.invariant(Canvas, 'Module Canvas not installed!')
Utils.invariant(PhotoEditorServer, 'Module PhotoEditorServer not installed')

const argv = require('minimist')(process.argv.slice(2))
let { l: licenseFile, p: port, h: help } = argv

function printHelp () {
  console.log('Possible parameters are')
  console.log('-l\tLicense file')
  console.log('-p\tPort')
}

if (help) {
  printHelp()
  process.exit(0)
}

port = Utils.defaults(port, 3000)

try {
  Utils.invariant(licenseFile, 'No license file given!')
} catch (error) {
  console.log(error.message)
  printHelp()
  process.exit(1)
}

console.log('Reading license file...')
const license = fs.readFileSync(licenseFile).toString()
Utils.invariant(license.length > 0, 'No license file content!')

const mimeType = 'image/jpeg'
const pesdkConfig = {
  license: license,
  transparent: true,
  editor: {
    preferredRenderer: 'webgl',
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

const renderFromPostRequest = (req, res) => {
  const {body: serialization} = req
  Utils.invariant(serialization, 'Request body does not include serialization')

  pesdkServer.render(serialization)
    .then((outputImage) => {
      res.contentType(mimeType)
      res.end(outputImage, 'binary')
    })
    .catch((error) => {
      res.status = 500
      res.statusText = error.message
      res.end()
    })
}

const routeNotfound = (req, res) => {
  res.status = 404
  res.statusText = `Route ${req.path} not found`
  res.end()
}

const app = express()
app.use(bodyParser.json({limit: '1000mb'}))
app.post('/render', renderFromPostRequest)
app.get('*', routeNotfound)
app.post('*', routeNotfound)
app.listen(port, () => console.log(`Listening on port ${port}!`))
