// https://remix.run/docs/en/v1/api/remix#createsessionstorage
import type { Cookie } from '@remix-run/node'
import { createSessionStorage } from '@remix-run/node'
import crypto from 'crypto'
import fs from 'fs'
import type { RedisOptions } from 'ioredis'
import Redis from 'ioredis'
import path from 'path'

interface RedisSessionStorageOptions {
  cookie: Cookie
  options: RedisOptions
}
export function createRedisSessionStorage({ cookie, options }: RedisSessionStorageOptions) {
  const redis = new Redis(options)

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const id = crypto.randomUUID({ disableEntropyCache: true })
      expires
        ? await redis.set(id, JSON.stringify(data), 'EX', expirationSeconds(expires))
        : await redis.set(id, JSON.stringify(data))
      return id
    },
    async readData(id) {
      const data = await redis.get(id)
      return data ? JSON.parse(data) : null
    },
    async updateData(id, data, expires) {
      expires
        ? await redis.set(id, JSON.stringify(data), 'EX', expirationSeconds(expires))
        : await redis.set(id, JSON.stringify(data))
    },
    async deleteData(id) {
      await redis.del(id)
    },
  })
}

interface FileSessionStorageOptions {
  cookie: Cookie
  dir: string
}

// sync version so the file isn't corrupted on concurrent writes
export function createFileSessionStorage({ cookie, dir }: FileSessionStorageOptions) {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const content = JSON.stringify({ data, expires })
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = crypto.randomUUID({ disableEntropyCache: true })
        try {
          const file = getFile(dir, id)
          fs.mkdirSync(path.dirname(file), { recursive: true })
          fs.writeFileSync(file, content, { encoding: 'utf-8', flag: 'wx' })
          return id
        } catch (error: any) {
          if (error.code !== 'EEXIST') throw error
        }
      }
    },
    async readData(id) {
      try {
        const file = getFile(dir, id)
        const content = JSON.parse(fs.readFileSync(file, 'utf-8'))
        if (!isExpired(content.expires)) return content.data
        fs.unlinkSync(file)
        return null
      } catch (error: any) {
        if (error.code !== 'ENOENT') throw error
        return null
      }
    },
    async updateData(id, data, expires) {
      const content = JSON.stringify({ data, expires })
      const file = getFile(dir, id)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, content, 'utf-8')
    },
    async deleteData(id) {
      try {
        fs.unlinkSync(getFile(dir, id))
      } catch (error: any) {
        if (error.code !== 'ENOENT') throw error
      }
    },
  })
}

// Divide the session id up into a directory (first 2 bytes) and filename
// (remaining 6 bytes) to reduce the chance of having very large directories,
// which should speed up file access. This is a maximum of 2^16 directories,
// each with 2^48 files.
function getFile(dir: string, id: string) {
  return path.join(dir, id.slice(0, 4), id.slice(4))
}

function expirationSeconds(expires: Date) {
  return Math.max(0, (expires.getTime() - new Date().getTime()) / 1000)
}

function isExpired(date?: string) {
  const expires = typeof date === 'string' ? new Date(date) : null
  return expires ? expires < new Date() : false
}
