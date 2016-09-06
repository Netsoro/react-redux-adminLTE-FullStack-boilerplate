process.on('message', (media) => {
  const { Promise } = global
  const Jimp = require('jimp')
  const fs = require('fs')
  const path = require('path')
  const db = require('../config/database')
  const Media = require('../models/media.model')
  const thumbPath = path.join(process.cwd(), `${process.env.UPLOAD_DIRNAME}/thumbnail/`)

  db.connect()

  let mediaInstance

  Promise
    .resolve(Media.findById(media._id))
    .then((media) => {
      if (!media) process.send('no_media_found:fail')
      mediaInstance = media
      const fsPath = path.join(process.cwd(), media.path)
      fs.stat(thumbPath, (err, stat) => {
        if(!stat) fs.mkdir(thumbPath)
      })
      return Jimp.read(fsPath)
    })
    .then(function (image) {
      // original extension poi boh ch'o sonno
      return image
        .resize(250, 250)
        .quality(50)
        .write(thumbPath + mediaInstance.filename);
    })
    .then((i) => {
      process.send('thumb_gen:success')
    })
    .catch((err) => {
      console.log(err);
      setTimeout(() => {
        process.exit()
      }, 10)
      process.send('thumb_gen:fail')
    })
})