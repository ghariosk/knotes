var Jimp = require('jimp');
let piexif = require('piexifjs');


async function adjustExifOrientation (fromFile) {
    // This is needed due to iOS adding an exif tag to jpeg images which sends them with
    // orientation 6 instead of one.
    // ues piexif to detect orienation and if it is 6 change the orientation to 1 and rotate 
    // the picutre
    // The piexif.load function takes a base 64 string and returns the exif config
    // but the piexif.insert takes a buffer so both 
    // formats are needed here
    let imageBase64 = "data:image/jpeg;base64," + fromFile.toString('base64')
    var exifObj = piexif.load(imageBase64);

    if (exifObj['0th']['274'] === 6) {  // checks the  zeroth orienation property 274 which is orientation
        var data = fromFile.toString('binary');
        var zeroth = {};
        var exif = {};
        var gps = {};
        zeroth[piexif.ImageIFD.Orientation] = 1; // changes orientation to 1
        var exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
        var exifbytes = piexif.dump(exifObj);
        var newData = piexif.insert(exifbytes, data);
        var newJpeg = Buffer.from(newData, "binary");

        const image = await Jimp.read(newJpeg);
        return new Promise(async function(resolve,reject) {
            image.rotate(-90).getBuffer(Jimp.MIME_JPEG , function(err, src) { //rotate the new image -90 degs
                if(err) reject(err);
                resolve(src);
            })
        })

    } else {
        return fromFile
    }
       
}


module.exports = adjustExifOrientation;
