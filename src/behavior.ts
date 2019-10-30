// 图表控制自身表现的一些方法
import * as d3 from 'd3'
import * as _ from 'lodash'
import html2canvas from 'html2canvas'

export default {
  // 高亮某个节点 以及它一度关系的节点
  highlightOneDegree(id) {
    this.store.isHover = true
    const nodeId = []
    // 找到除了该点之外的别的相连的-度节点
    this.store.links.style('opacity', 0.2)
      .filter(data => {
        if (data.source.id === id) {
          nodeId.push(data.target.id)
          return true
        } else if (data.target.id === id) {
          nodeId.push(data.source.id)
          return true
        } else {
          return false
        }
      })
      .style('opacity', 1)
    nodeId.push(id) // 点击的点加上一度的点

    this.store.nodes.style('opacity', 0.2)
      .filter(data => nodeId.indexOf(data.id) > -1)
      .style('opacity', 1)

    // 关系上的文字
    this.store.relationText.style('opacity', 0.2)
      .filter(data => (data.source.id === id || data.target.id === id))

    // 圆上的文字
    this.store.circleTexts.style('opacity', 0.2)
      .filter(data => nodeId.indexOf(data.id) > -1)
      .style('opacity', 1)

  },

  // 高亮某个节点 以及它二度关系的节点
  highlightTwoDegree(id) {
    this.store.isHover = true
    let nodeId = []
    const twoDegreeNode = [] // 两度的节点
    this.store.links.each(data => {
      if (data.source.id === data.id) {
        twoDegreeNode.push(data.target.id)
      } else if (data.target.id === data.id) {
        twoDegreeNode.push(data.source.id)
      }
    })

    twoDegreeNode.push(id) // 此时已有中间点和周围一圈的点
    this.store.links.style('opacity', 0.2)
      .filter(data => {
        if (twoDegreeNode.indexOf(data.source.id) > -1 || twoDegreeNode.indexOf(data.target.id) > -1) {
          nodeId.push(data.source.id, data.target.id) // 所有三维节点 有重复
          return true
        } else {
          return false
        }
      })
      .style('opacity', 1)

    this.store.relationText.style('opacity', 0.2)
      .filter(data => (twoDegreeNode.indexOf(data.source.id) > -1 || twoDegreeNode.indexOf(data.target.id) > -1))
      .style('opacity', 1)

    nodeId = Array.from(new Set([...nodeId])) // 数组去重

    this.store.nodes.style('opacity', 0.2)
      .filter(data => nodeId.indexOf(data.id) > -1)
      .style('opacity', 1)

    this.store.circleTexts.style('opacity', 0.2)
      .filter(data => nodeId.indexOf(data.id) > -1)
      .style('opacity', 1)
  },

  // 结束节点高亮 复原
  highlightOut() {
    this.store.nodes.style('opacity', 1)
    this.store.links.style('opacity', 1)
    this.store.circleTexts.style('opacity', 1)
    this.store.relationText.style('opacity', 1)
    this.store.isHover = false
  },

  // 图谱放大
  zoomIn() {
    this.store.containerScale = this.containerScale + 0.2

    if (this.store.containerScale > this.store.maxScale) {
      this.store.containerScale = this.store.maxScale
    }
  },

  // 图谱缩小
  zoomOut() {
    this.store.containerScale = this.store.containerScale - 0.2

    if (this.store.containerScale < this.store.minScale) {
      this.store.containerScale = this.store.minScale
    }
  },

  // 导出图片
  exportPng() {
    this.store.simulation.stop() // 先暂停
    this.setLoading(true, '正在导出图片，请稍后...')

    // y位置最小的圆 this.maxRadius 为圆半径的最大值
    const minY = Number(d3.min(_.map(this.store.nodeList, 'y'))) - this.store.mainNodeRadius
    // y 位置最大的圆
    const maxY = Number(d3.max(_.map(this.store.nodeList, 'y'))) + this.store.mainNodeRadius
    const minX = Number(d3.min(_.map(this.store.nodeList, 'x'))) - this.store.mainNodeRadius
    const maxX = Number(d3.max(_.map(this.store.nodeList, 'x'))) + this.store.mainNodeRadius

    let width = null
    let height = null
    if (this.store.isFullScreen) {
      width = this.store.fullScreenWidth
      height = this.store.fullScreenHeight
    } else {
      width = this.store.width
      height = this.store.height
    }
    const scaleY = (maxY - minY) / height
    const scaleX = (maxX - minX) / width

    // 计算时稍微隔出100px 此处padding是为了图片的间隔
    const paddingRight = 100
    const paddingLeft = 100
    const paddingTop = 100
    const paddingBottom = 100

    this.store.svg.style('width', `${scaleX > 1 ? width * scaleX + paddingRight + paddingLeft : maxX - minX + paddingRight + paddingLeft}px`).attr('height', scaleY > 1 ? height * scaleY + this.store.legendHeight : maxY - minY + paddingLeft + paddingRight + this.store.legendHeight)
    d3.select('.component-force-graph-wrap').style('width', `${scaleX > 1 ? width * scaleX + paddingBottom + paddingTop : maxX - minX + paddingTop + paddingBottom}px`)
    // 移动位置
    this.store.svg.style('transform', `translate(${0}px, ${this.store.legendHeight}px) scale(${1})`)
    this.store.gMain.attr('transform', `translate(${0 - minX + paddingLeft}, ${0 - minY})`) // 统一最靠上

    const canvas = document.createElement('canvas')

    const canvasHeight = scaleY > 1 ? height * scaleY + this.store.legendHeight + paddingTop + paddingBottom : maxY - minY + paddingTop + paddingBottom + this.store.legendHeight
    const canvasWidth = scaleX > 1 ? width * scaleX + paddingLeft + paddingRight : maxX - minX + paddingRight + paddingLeft


    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // ----------------
    const options = {
      dpi: window.devicePixelRatio,
      canvas,
      logging: false, // 是否输出日志
      width: canvasWidth,
      height: canvasHeight,
    }

    const {exportPngName, id} = this.props

    html2canvas(document.querySelector(`.oner-force-wrap-${id}`), options).then(data => {
      const a = document.createElement('a')
      a.href = data.toDataURL('image/png') // 将画布内的信息导出为png图片数据
      a.download = `${exportPngName} 图谱` // 设定下载名称
      a.click() // 点击触发下载
    })
    const {containerX, containerY, containerScale, svg, gMain, simulation} = this.store

    d3.select(`.oner-force-wrap-${id}`).style('width', '100%')

    svg.style('width', `${width}px`).attr('height', height)
      .style('transform', `translate(${containerX}px, ${containerY}px) scale(${containerScale})`)

    gMain.attr('transform', 'translate(0, 0)')
    simulation.restart()

    this.setLoading(false)
  },

  // 全屏
  fullScreen() {
    this.store.isFullScreen = true
    this.store.container
      .style('position', 'fixed')
      .style('left', `${0}px`)
      .style('right', `${0}px`)
      .style('bottom', `${0}px`)
      .style('top', `${0}px`)

    const width = this.store.container.node().getBoundingClientRect().width
    const height = this.store.container.node().getBoundingClientRect().height

    this.store.fullScreenWidth = width
    this.store.fullScreenHeight = height
  },

  // 全屏退出
  fullScreenOut() {
    this.store.isFullScreen = false

    this.store.svg.style('transform', `translate(${this.store.containerX}px, ${this.store.containerY}px) scale(${this.store.containerScale})`)
    this.store.svg.style('width', `${this.store.width}px`).attr('height', `${this.store.height}`)

    this.store.container.style('position', 'relative')
  },


  // 显示关系线上的文字
  showRelation() {
    this.store.relationText.style('display', '')
  },

// 隐藏关系线上的文字
  hideRelation() {
    this.store.relationText.style('display', 'none')
  },

// 刷新
  reload() {

  },

// 添加节点
  addNode(nodeItem) {

  },

// 删除节点
  deleteNode(id) {

  },

  setLoading(status, tip?) {
    this.setState({
      loading: status,
      tip: tip || '',
    })
  }

}


