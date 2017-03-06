'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Service()

const request = require('request')
const isEmpty = require('lodash.isempty')
const isPlainObject = require('lodash.isplainobject')

_plugin.on('data', (data) => {
  if (!isPlainObject(data)) {
    return _plugin.logException(new Error(`Invalid data received. Must be a valid JSON Object. Data: ${data}`))
  }

  if (isEmpty(data) || isEmpty(data.image)) {
    return _plugin.logException(new Error('Invalid data received. Data must have a base64 encoded image field.'))
  }

  request.post({
    url: _plugin.config.emotionApiEndPoint,
    qs: {
      'faceRectangle': _plugin.config.faceRectangles
    },
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': _plugin.config.apiKey
    },
    body: new Buffer(data.image, 'base64')
  }, (error, response, body) => {
    if (error) {
      _plugin.logException(error)
    } else if (response.statusCode !== 200) {
      let errorMessage = ''

      try {
        errorMessage = JSON.parse(body).message
      } catch (ex) {
      }
      _plugin.logException(new Error(`HTTP ${response.statusCode}: ${errorMessage}`))
    } else {
      try {
        let result = {
          emotionRecognitionResults: JSON.parse(body)
        }

        _plugin.pipe(JSON.stringify(result))
          .then(() => {
            _plugin.log(JSON.stringify({
              title: 'Processed data using Emotion Recognition Service',
              data: data,
              result: result
            }))
          })
          .catch((error) => {
            _plugin.logException(error)
          })
        console.log(JSON.stringify(result))
      } catch (error) {
        _plugin.logException(error)
      }
    }
  })
})

_plugin.once('ready', () => {
  _plugin.log('Service has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
