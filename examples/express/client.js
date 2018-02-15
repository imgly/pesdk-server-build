
const Utils = require('./utils')
const fs = require('fs')
const Canvas = require('canvas')
const fetch = require('isomorphic-fetch') // required for fetch
const minimist = require('minimist')

Utils.invariant(Utils, 'Module Utils not installed')
Utils.invariant(fs, 'Module canvas not installed')
Utils.invariant(fetch, 'Module fetch not installed')
Utils.invariant(Canvas, 'Module canvas not installed')
Utils.invariant(minimist, 'Module minimist not installed')

const argv = minimist(process.argv.slice(2))
let { i: inputImageFile, u: inputImageUri, o: outputImageFile, c: configurationFile, h: help, s: serverUrl } = argv

function printHelp () {
  console.log('Possible parameters are')
  console.log('-c\tConfiguration/Serialization File')
  console.log('-i\tInput Image File. Loaded locally and pushed to remote server)')
  console.log('-u\tInput Image Uri. Fetched and loaded on remote server')
  console.log('-s\tServer Url')
}

if (help) {
  printHelp()
  process.exit(0)
}

outputImageFile = Utils.defaults(outputImageFile, 'output.jpg')
configurationFile = Utils.defaults(configurationFile, '../shared/serialization/example_text.json')
serverUrl = Utils.defaults(serverUrl, 'http://localhost:3000/render')

// Read serialization/configuration from file
let serialization = JSON.parse(fs.readFileSync(configurationFile))

/** We have two ways of passing images to the server. Both are supported by the configuration/serialization format
 * 1) Read Image data locally.
 * 2) Let Server load the image.
 * In any case set serialization.image.uri to either a data-url (https://de.wikipedia.org/wiki/Data-URL) or any valid http/file uri.
**/

if (!inputImageFile && !inputImageUri) {
  inputImageFile = '../shared/assets/example.jpg'
  console.log(`No input image file given! Using ${inputImageFile}!`)
}

if (inputImageFile) {
  // Injection Image Data into serialization!
  const inputImageData = fs.readFileSync(inputImageFile)
  serialization = Utils.injectImageIntoSerialization(serialization, inputImageData)
}
if (inputImageUri) {
  // Injection Image Uri into serialization
  serialization = Utils.injectImageUriIntoSerialization(serialization, inputImageUri)
}

const url = serverUrl
const body = JSON.stringify(serialization)
const method = 'POST'
const headers = { 'Content-Type': 'application/json' }

// Post data to server and get reply
fetch(url, { method, headers, body })
  .then((response) => {
    // Check errors
    if (!response.ok) { throw response }
    if (response.headers.get('Content-Length') === '0') { throw new Error('No data returned from server!') }
    return response.buffer()
  })
  .then((data) => {
    // Write data to file
    fs.writeFileSync(outputImageFile, data)
  })
  .catch((error) => console.log(`Error: ${error.message}`))
