module.exports = [
  // {
  //   type: 'list',
  //   name: 'repoType',
  //   message: '请选择你的仓库类型',
  //   choices: [
  //     { name: 'github', value: '' },
  //     { name: '公司仓库', value: 'direct:' }
  //   ],
  //   default: ''
  // },
  {
    type: 'input',
    name: 'target',
    message: '请输入你仓库的 http 地址',
    validate (val) {
      return !!val.trim()
    }
  }
]
