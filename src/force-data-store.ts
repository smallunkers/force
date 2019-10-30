import * as d3 from 'd3'

export default class OnerForceDataStore {

  wrap = null // 最外层的容易
  isInit = false // 是否初始化
  svg = null // svg 容器
  svgWidth = 0
  svgHeight = 0
  gMain = null
  containerScale = 1
  nodeList = [] // 节点数据
  linkList = [] // 边数据
  legendData = [] // 图例
  container = null // 最外层容器
  isAddLink = false // 是否正在添加连线
  minScale = 0
  maxScale = 2
  containerX = 0 // 偏移y
  containerY = 0 // 偏移x
  offsetX = 0 // 临时计算的偏移
  offsetY = 0 //
  minCircleRadius = 20 // 最小的半径
  maxCircleRadius = 40 // 最大的半径
  scale = null // 半径的比例尺
  mainNodeRadius = 80 // 如果有主节点的话
  legendHeight = 40 // 图例所占的颜色
  paddingTop = 20

  nodes = null // 所有节点的选择集
  links = null // 所有边的选择集

  isHover = false // 是否在hover 状态
  dragging = false // 是否在拖拽状态
  isFullScreen = false // 是否为全屏
  circleTexts = null // 圆中间文字的选择集
  relationText = null // 关系的选择集

  dragLine = null // 拖拽连线的节点容器
  mouseDownNode = null // 按下的节点
  mouseUpNode = null // 抬起的节点
  fullScreenWidth = 0 // 全屏宽度
  fullScreenHeight = 0 // 全屏高度
  tooltip = null // tooltip
  dragCircle = null // 拖拽的时候会出来
  markers = null // 箭头

  initChartData (props){
    const {id, height, containerScale, nodeList, linkList, legendData, background, minScale, maxScale, minCircleRadius, maxCircleRadius, mainNodeRadius} = props

    this.wrap = d3.select(`.oner-force-container-${id}`)
    this.container = d3.select(`.oner-force-wrap-${id}`).style('background', background)
    this.svg = this.container.select('.oner-force-graph')
    this.svgWidth = this.svg.node().getBoundingClientRect().width
    this.svgHeight = height
    this.svg.attr('height', this.svgHeight)
      .style('width', `${this.svgWidth}px`)
      .style('background', background)
    this.tooltip = this.wrap.select('.oner-force-tooltip-wrap')
    this.gMain = this.svg.append('g').attr('class', 'oner-g-main')
    this.containerScale = containerScale
    this.nodeList = nodeList
    this.linkList = linkList

    this.legendData = legendData
    this.minScale = minScale
    this.maxScale = maxScale

    this.minCircleRadius = minCircleRadius
    this.maxCircleRadius = maxCircleRadius
    this.mainNodeRadius = mainNodeRadius
  }
}
