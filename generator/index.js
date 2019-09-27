const path = require('path')
const download = require('download-git-repo')
const { execSync } = require('child_process')
const fs = require('fs')

const getRepoName = str => {
  const i = str.lastIndexOf('/')
  let result = str.substr(i + 1)
  const dotI = result.lastIndexOf('.')
  return result.substr(0, dotI)
}

const downloadGit = (repoType, target) => new Promise((resolve, reject) => {
  const root = path.resolve(process.cwd(), 'tmp')

  if (repoType === 'direct:') {
    try {
      execSync(`mkdir tmp`)
    } catch (e) {
      // exist
    }
    execSync(`git clone ${target}`, { cwd: root })
    const repoName = getRepoName(target)
    fs.readdirSync(path.resolve(root, repoName)).forEach(file => {
      execSync(`mv ./${file} ../`, { cwd: path.resolve(root, repoName) })
    })
    resolve()
  } else {
    download(repoType + target, root, { clone: true }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  }
})

module.exports = async (api, opts, rootOptions) => {
  let { repoType, target } = opts

  if (!target) {
    const urlIndex = process.argv.findIndex(x => x === '--url')
    target = process.argv[urlIndex + 1]
    repoType = /shinemo\.com/.test(target) ? 'direct:' : ''
  }
  if (!target) {
    throw `顶层地址为空`
  }

  // 将调用命令写入 scripts
  api.extendPackage({
    scripts: {
      'micro': `vue invoke micro --url ${target} --mode awesome`
    }
  })

  // 下载顶层 dist 到子项目 public 目录
  const root = path.resolve(process.cwd(), 'tmp')
  await downloadGit(repoType, target)

  try {
    const files = fs.readdirSync(path.resolve(root, 'dist'))
    files.forEach(file => {
      console.log(`\n拷贝 ${path.resolve(root, 'dist', file)}\n`)
      execSync(`cp -rf ${path.resolve(root, 'dist', file)} ${path.resolve(process.cwd(), 'public')}`)
    })
  } catch (e) {
    console.log(`\n❌ 没有 dist 目录：${e.message}\n`)
  }
  console.log(`\n⏫ 删除 tmp ...\n`)
  execSync(`rm -rf ${root}`)
  console.log(`\n👌 执行完成\n`)
}