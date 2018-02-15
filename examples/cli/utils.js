const fs = require('fs')
const path = require('path')
const Canvas = require('canvas')

function invariant (condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function defaults (value, defaultValue) {
  return (value === undefined) ? defaultValue : value
}

const isBrowser = (typeof window !== 'undefined')
const isNode = (typeof global !== 'undefined')

function readImage (imageName) {
  const inputImagePath = path.resolve(__dirname, '..', imageName)
  const inputImage = new Canvas.Image()
  const buffer = fs.readFileSync(inputImagePath)
  inputImage.src = buffer
  inputImage.rawSource = buffer
  return inputImage
}
// we have two modes. Types and data
function injectImageUriIntoSerialization (serialization, uri) {
  serialization.image.uri = uri
  return serialization
}
function injectImageIntoSerialization (serialization, imageData, imageType = 'image/jpg') {
  const data = imageData.toString('base64')
  serialization.image.data = data
  serialization.image.type = imageType
  return serialization
}

module.exports = {
  invariant,
  readImage,
  injectImageIntoSerialization,
  injectImageUriIntoSerialization,
  defaults,
  isBrowser,
  isNode
}
