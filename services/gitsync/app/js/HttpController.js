import logger from '@overleaf/logger'
import {randomBytes} from 'crypto'
import fetch from 'node-fetch'
import settings from '@overleaf/settings'
import fs from 'fs'
import { pipeline as streamPipeline } from 'stream/promises'
import Docker from 'dockerode'


const docker = new Docker()
const worker_image = settings.internal.gitsync.gitsync_image

async function ensureImageReady() {
  try {
    const img = docker.getImage(worker_image)
  } catch(e) {
    await new Promise((resolve, reject) => docker.pull(worker_image, (err, stream) => {
      docker.modem.followProgress(stream, onFinished)
      function onFinished(err, output) {
        if (!err) {
          resolve(true)
          return
        }
        reject(err)
      }
    }))
  }
}
async function runContainer(tmp_path) {
  await ensureImageReady()
  const options = {
    Image: worker_image,
    SecurityOpt: ['no-new-privileges'],
    HostConfig: {
      Memory: 209715200, // 200MB
      DiskQuota: 8589934592, // 8GB
      Ulimits: [
        {
          Name: 'cpu',
          Soft: 15 + 5,
          Hard: 15 + 10,
        },
      ],
      AutoRemove: true,
      Binds: [
        `${tmp_path}:/ops`
    ]
    },
    AttachStdout: true,
    AttachStderr: true,
  }
  const container = await docker.createContainer(options)
  await container.start()

  const stream = await container.attach({stream: true, stdout: true, stderr: true})

  return new Promise((resolve, reject) => {
    stream.on('data', (data) => {
      const output = data.toString()
      if (output.includes('PUSH_GIT_OK')) {
        resolve("PUSH_GIT_OK")
      } else if (output.includes('PUSH_GIT_FAILED')) {
        resolve("PUSH_GIT_FAILED")
      }
    })
    stream.on('error', (err) => {
      resolve("PUSH_GIT_FAILED")
    })
  })


}

export async function gitSync(req, res, next) {
  const { project_id: project_id } = req.params
  const out_dir = `/tmp/gitsync-${randomBytes(16).toString('hex')}`
  const out_path = `${out_dir}/overleaf.zip`
  await fs.promises.mkdir(out_dir, {recursive: true})
  const http_basic_user = settings.apis.web.user
  const http_basic_pass = settings.apis.web.pass

  const destURL = `http://127.0.0.1:3000/internal/project/${project_id}/zip`

  const response = await fetch(destURL, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${http_basic_user}:${http_basic_pass}`).toString('base64')}`
    }
  })
  if(!response.ok) {
    logger.error({response,txt: response.text}, 'Failed to fetch zip')
    res.sendStatus(500)
    return
  }
  await streamPipeline(response.body, fs.createWriteStream(out_path))
  const retval = await runContainer(out_dir)
  await fs.promises.rm(out_dir, {recursive: true, force: true})
  res.sendStatus(200)
  res.send(retval)

}

