const fs = require('fs')
const path = require('path')

const Pixelsmith = require('pixelsmith')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

if (argv.file) {
    // 1. List files
    const files = []
    const json = JSON.parse(fs.readFileSync(argv.file).toString())

    json.anims.forEach(anim => {
        const [ name, frames ] = anim

        frames.forEach(frame => {
            const number = `${frame}`.padStart(3, '0')

            files.push(`${name}-${number}.png`)
        })
    })

    const spriteRootPath = path.dirname(argv.file)

    for(let i = 0; i < files.length; i++) {
        files[i] = path.join(spriteRootPath, files[i])
    }

    // 2. Create spritesheet
    const pixelsmith = new Pixelsmith()

    pixelsmith.createImages(files, (err, images) => {
        if (err) {
            throw err
        }

        // TODO:
        // 1. Handle frame size other than 48x48.
        // 2. Handle frames more than 10x10.
        // 3. Handle frames with various sizes in a single folder. 
        const canvas = pixelsmith.createCanvas(480, 480)

        images.forEach((image, i) => {
            canvas.addImage(image, 48 * (i % 10), 0 + 48 * Math.floor(i / 10))
        })

        const outputPath = path.join(spriteRootPath, json.output)
        const writable = fs.createWriteStream(outputPath)

        canvas.export({ format: 'png' }).pipe(writable)
    })
}

if (argv.project) {
    // TODO: Handle project.json which contains the array of output files
    // example: ["player/sprites", "Dungeon/Enemy/sprites"]
}
