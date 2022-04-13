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

        const [cellX, cellY] = json.size.cell
        const [outputX, outputY] = json.size.output

        // TODO:
        // 3. Handle frames with various sizes in a single folder. 
        const canvas = pixelsmith.createCanvas(cellX * outputX, cellY * outputY)

        images.forEach((image, i) => {
            canvas.addImage(image, cellX * (i % outputX), 0 + cellY * Math.floor(i / outputX))
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
