// Node.js v24 on Windows: fs.readlink이 비심볼릭 파일에 EINVAL 대신 EISDIR 반환
// Next.js는 EISDIR를 처리하지 않아 빌드 실패 — callback/sync/promise 세 버전 모두 패치
// 비-Windows 환경(Vercel/Linux)에서는 readlink가 EINVAL을 정상 반환하므로 fixErr는 no-op

const fs = require('fs')

// EISDIR 발생 경로 수집 (빌드 1회만 — 이후 분석용)
const eisDirPaths = new Set()
process.on('exit', () => {
  if (eisDirPaths.size > 0) {
    console.log('\n[patch-readlink] EISDIR → EINVAL 변환된 경로 목록:')
    for (const p of eisDirPaths) console.log('  ', p)
  }
})

function fixErr(err, p) {
  if (err && err.code === 'EISDIR') {
    eisDirPaths.add(p)
    const e = new Error(`EINVAL: invalid argument, readlink '${p}'`)
    e.code = 'EINVAL'
    e.syscall = 'readlink'
    e.path = p
    return e
  }
  // ENOENT, EACCES, EINVAL 등 다른 에러는 그대로 전달
  return err
}

// callback 버전 패치
const orig = fs.readlink.bind(fs)
fs.readlink = function patchedReadlink(p, optOrCb, cb) {
  if (typeof optOrCb === 'function') {
    orig(p, (err, v) => optOrCb(fixErr(err, String(p)), v))
  } else if (typeof cb === 'function') {
    orig(p, optOrCb, (err, v) => cb(fixErr(err, String(p)), v))
  } else {
    orig(p, optOrCb, cb)
  }
}

// sync 버전 패치
const origSync = fs.readlinkSync.bind(fs)
fs.readlinkSync = function patchedReadlinkSync(p, options) {
  try {
    return origSync(p, options)
  } catch (err) {
    throw fixErr(err, String(p))
  }
}

// promise 버전 패치 (unhandledRejection 방지)
const origPromise = fs.promises.readlink.bind(fs.promises)
fs.promises.readlink = async function patchedReadlinkPromise(p, options) {
  try {
    return await origPromise(p, options)
  } catch (err) {
    throw fixErr(err, String(p))
  }
}
