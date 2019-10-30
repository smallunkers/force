import * as React from 'react'
import * as _ from 'lodash'
import * as moment from 'moment'
import * as d3 from 'd3'
import {message, Spin} from 'antd'
import {IForceProps} from './index.d'
import ForceDataStore from './force-data-store'
import {bindSvgDrag, bindSvgZoom, bindSvgClick, bindSvgMouseUp, bindSvgMouseMove, bindSvgMouseDown} from './svg-events'
import {bindNodeDrag, bindNodeClick, bindNodeMouseUp, bindNodeMouseDown,} from './node-events'
import {bindMouseOver, bindMouseOut} from './public-events'
import {mixin} from './util'
import behavior from './behavior'
import {drawWrapText} from './util'


const icon = require('./images/icon.svg')

@mixin(behavior)
export default class Force extends React.Component<IForceProps> {
  static defaultProps = {
    id: new Date().getTime(), // 图谱id
    className: '', // 类名
    nodeList: [], // 节点数据
    height: 540, // 高度
    width: '100%', // 宽度
    containerScale: 1, // 初始缩放比
    legendData: [], // 图例数据
    minCircleRadius: 20, // 最小的半径
    maxCircleRadius: 40, // 最大的半径
    strength: -2000, // 点之间的作用力 负数为斥力，正数为引力
    distanceMin: 50,
    distanceMax: 500,
    forceCollide: -50,
    linkDistance: 50,  // 边之间的距离，初始化力矩图时使用
    isStatic: false, // 是否静态布局
    exportPngName: '', // 导出图谱名称
    minScale: 0.1, // 最小的缩放比例
    maxScale: 2, // 最大的缩放比例
    linkList: [], // 边数据
    actionList: [], // 右侧操作栏
    onClickNode: (node: object) => {}, // 点击节点
    onClickLink: (link: object) => {}, // 点击边
    onDoubleClickNode: (node: object) => {}, // 双击节点
    onDoubleClickLink: (link: object) => {}, // 双击边
    background: 'white', // 背景
    mainNodeRadius: 80,
    beforeLinkConnection: (linkItem: object) => true,
    degree: 1,
    showTooltip: true, // 是否显示hover 到node 上的tooltip
    showMarker: false, // 是否显示边上的箭头
  }

  private store = null // 存储数据

  state = {
    loading: false,
    tip: '',
  }

  // mixin 混入的方法
  public highlightOneDegree: (id) => void
  public highlightTwoDegree: (id) => void
  public highlightOut: () => void
  public setLoading: (status, tip?) => void

  constructor(props) {
    super(props)
    this.store = new ForceDataStore()
    this.state = {
      loading: false,
      tip: '',
    }
  }

  componentDidMount() {
    const {nodeList, linkList} = this.props
    if (!this.store.isInit && nodeList && nodeList.length > 0 && linkList && linkList.length > 0) {
      this.drawForce(this.props)
      this.store.isInit = false
    }

    d3.select('body').on('mouseup', () => {
      // 如果正在拉线时在图谱外松开了鼠标， 内部会有判断是在拉线的时候，还是点击 内部冒泡取消
      this.clearDragLine()
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.nodeList !== nextProps.nodekList || this.props.linkList !== nextProps.linkList) {
      this.drawForce(nextProps)
    }
  }


  render() {
    const {width, height, id} = this.props
    return (
      <div className={`force-container force-container-${id}`}>
        <Spin spinning={this.state.loading} tip={this.state.tip}>
          <div className={`force-wrap-${id} force-wrap`} style={{width, height}}>
            <svg className="force-legend" style={{overflow: 'visible', position: 'absolute', zIndex: 100}}> </svg>
            <svg className="force-graph" style={{width: '100%', overflow: 'visible'}}></svg>
          </div>
        </Spin>
        <div className="force-tooltip-wrap"></div>
        <div className="force-drag-circle"></div>
      </div>
    )
  }

  private initChart(props) {
    this.store.initChartData(props) // 初始化store 中的必要数据
    this.addSvgEvents()
    this.store.dragLine = this.store.gMain.append('g').attr('class', 'drag-line-wrapper')
  }

  // 创建力模型
  private createSimulation(props) {
    const {strength, distanceMin, distanceMax, forceCollide, linkDistance} = props
    const {svgWidth, svgHeight, linkList, nodeList} = this.store
    if(this.store.simulation) {
      // 已经存在一个力模型
      this.store.simulation.stop()
    }

    const nodeRMax = d3.max(_.map(this.store.nodeList, 'round')) // 最大半径
    const scale = d3.scaleLinear().domain([0, nodeRMax]).range([this.store.minCircleRadius, this.store.maxCircleRadius])
    const simulation = d3.forceSimulation()
    simulation.nodes(nodeList)
      .force('charge', d3.forceManyBody().strength(strength).distanceMin(distanceMin).distanceMax(distanceMax))
      .force('collision', d3.forceCollide(forceCollide).radius((data:any) => data.round ? scale(data.round) : 35))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force('links', d3.forceLink(linkList).distance(linkDistance).id((data:any) => data.id))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', () => this.tick())

    this.store.simulation = simulation
    this.store.scale = scale

  }

  // 创建节点
  private createNode() {
    const {gMain, nodeList, scale, mainNodeRadius} = this.store
    const gNode =  gMain.select('.g-nodes').empty() ? gMain.append('g')
      .attr('class', 'g-nodes') : gMain.select('.g-nodes')

    let nodes = gNode.selectAll('.nodes')
      .data(nodeList)

    nodes.exit().remove()

    nodes = nodes.enter()
      .append('circle')
      .merge(nodes)
      .attr('class', d => `nodes nodes-${d.id}`)
      .attr('fill', d => d.color)
      .attr('r', d => d.isMain ? mainNodeRadius : scale(d.round))
      .style('cursor', 'pointer')
      .style('stroke', d => d.strokeColor || d.color)
      .style('stroke-width', d => d.strokeWidth ? `${d.strokeWidth}px` : 0)
      .style('stroke-opacity', d => d.strokeOpacticy || 0)


    bindNodeDrag(this, nodes) // 绑定节点的拖拽事件
    const me = this

    nodes.on('click', (data:any, index:number) => bindNodeClick(this, data))
      .on('mouseup', (data:any, index:number) => bindNodeMouseUp(this, data))
      .on('mousedown', (data:any, index:number) => bindNodeMouseDown(this, data))
      .on('mouseover', (data:any, index:number) => {
        d3.event.stopPropagation()
        bindMouseOver(this, data)
      })
      .on('mousemove', (data) => {
        d3.event.stopPropagation()
        bindMouseOver(this, data) // 就是不断的显示
      })
      .on('mouseleave', (data:any, index) => {
        d3.event.stopPropagation()
        bindMouseOut(this, data)
      })
      .on('dblclick', (data:any, index:number) => {

      })

    this.store.nodes = nodes

  }

  // 绘制圆中的文字
  private createCircleText(props) {
    const {gMain, nodeList, scale} = this.store
    const gText = gMain.select('.g-texts').empty() ? gMain.append('g')
      .attr('class', 'g-texts') : gMain.select('.g-texts')
    let texts = gText.selectAll('.circle-text').data(nodeList)

    texts.exit().remove()

    texts = texts.enter()
      .append('text')
      .merge(texts)
      .attr('class', d =>`circle-text circle-text-${d.id}`)
      .style('color', 'white')
      .style('cursor', 'pointer')

    texts.each(function (data) {
      const radius = data.round ? scale(data.round) : 35
      const sideLength = radius / 1.45 * 2 // 一个正方形的变长

      // 文字自动换行
      drawWrapText(sideLength, sideLength, d3.select(this), data.name, 12)
      // 相比较圆心的偏移距离
    })

    texts.on('mouseover', (data:any, index:number) => {
      d3.event.stopPropagation()
      bindMouseOver(this, data)
    })
      .on('mousemove', (data) => {
        d3.event.stopPropagation()
        bindMouseOver(this, data) // 就是不断的显示
      })
      .on('mouseleave', (data:any, index) => {
        d3.event.stopPropagation()
        bindMouseOut(this, data)
      })

    this.store.circleTexts = texts
  }

  private createLink() {
    const {gMain, linkList} = this.store

    const gLink = gMain.select('.g-links').empty() ? gMain.append('g')
      .attr('class', 'g-links') : gMain.select('.g-links')
    let links = gLink.selectAll('.links').data(linkList)

    links.exit().remove()
    links = links.enter()
      .append('path')
      .merge(links)
      .attr('class', 'links hand')
      .style('stroke-width', '2px')
      .style('stroke', data => data.color)
      .style('stroke-dasharray', data => data.dash || '')

    const gHideLink = gMain.select('.hide-g-links').empty() ? gMain.append('g')
      .attr('class', 'hide-g-links') : gMain.select('.hide-g-links')

    let hideLinks = gHideLink.selectAll('.hide-links').data(linkList)

    hideLinks.exit().remove()
    hideLinks = hideLinks.enter()
      .append('path')
      .merge(hideLinks)
      .attr('class', 'hide-links hand')
      .style('stroke-width', '5px')
      .style('stroke', data => data.color)
      .style('opacity', 0)

    this.store.hideLinks = hideLinks // 主要是隐藏方便触发边上的事件
    this.store.links = links
  }

  // 绘制线上的关系
  private createRelationText() {
    const {gMain, linkList} = this.store
    const relationG = gMain.select('.oenr-g-relation').empty() ? gMain.append('g')
      .attr('class', 'g-relation') : gMain.select('.g-relation')

    let relationText = relationG.selectAll('.relation')
      .data(linkList)

    relationText.exit().remove()
    relationText = relationText.enter().append('text')
      .merge(relationText)
      .attr('class', '.relation')

    relationText.each(function(data) {
      if (Array.isArray(data.relation)) {
        // 是个数组 可以接受多个关系
        if (data.relation.length > 0) {
          data.relation.forEach((item, ind) => {
            d3.select(this).append('tspan')
              .attr('fill', item.color || 'rgba(127, 127, 127, 1)')
              .style('font-size', 12)
              .text(() => {
                if (ind !== data.relation.length -1) {
                  return `${item.name}|`
                }

                return item.name
              })
          })
        }

      } else if (typeof data.relation === 'string') {
        d3.select(this).text(data.relation).attr('fill', 'rgba(127, 127, 127, 1)')
          .style('font-size', 12)
          .attr('text-anchor', 'middle')
      }
    })

    this.store.relationText = relationText


  }

  private createMarker() {
    const {gMain, linkList} = this.store

    gMain.append('defs')

    const defs = gMain.select('.g-defs').empty() ? gMain.append('g')
      .attr('class', 'g-defs').append('defs').attr('class', 'defs') : gMain.select('.g-defs .defs')

    let markers = defs.selectAll('.defs-marker').data(linkList)

    markers.exit().remove()
    markers = markers.enter()
      .append('marker')
      .merge(markers)
      .attr('class', 'defs-marker')
      .attr('id', data => `defs-marker-${data.source.id}-${data.target.id}`)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('refX', 1)
      .attr('refY', data => this.store.svg.select(`.nodes-${data.target.id}`).attr('r'))
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M0,0 L0,6 L9,3 z')
      .attr('fill', data => data.color)

    this.store.markers = markers
  }

  private createLegend(props) {
    const padding = 6 // 圆与字之间
    const modPadding = 12 // legend 组件之间
    let modStart = 6
    const me = this
    const {container, legendHeight, paddingTop} = this.store
    const {legendData} = props

    const legendSvg = container.select('.force-legend')
      .attr('height', legendHeight)
    const gLegend = legendSvg.selectAll('.g-legend')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', '.g-legend')

    gLegend.each(function (data, index) {
      if (data.type === 'circle') {
        d3.select(this)
          .append('circle')
          .attr('fill', data.color)
          .attr('r', data.r)
          .attr('cx', modStart + data.r)
          .attr('cy', paddingTop)
      } else if (data.type === 'line') {
        d3.select(this)
          .append('line')
          .attr('x1', modStart)
          .attr('x2', modStart + data.length)
          .attr('y1', paddingTop)
          .attr('y2', paddingTop)
          .attr('stroke', data.color)
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', data.dash || '')
      }

      const text = d3.select(this)
        .append('text')
        .attr('fill', 'rgba(0, 0, 0, 0.45)')
        .style('font-size', 12)
        .text(data.name)
        .attr('dominant-baseline', 'middle')
        .attr('x', data.type === 'circle' ? modStart + data.r * 2 + padding : modStart + data.length + padding)
        .attr('y', paddingTop)

      modStart = modStart + (data.type === 'circle' ? data.r * 2 : data.length) + padding + text.node().getBoundingClientRect().width + modPadding
    })
  }

  private addSvgEvents() {
    bindSvgDrag(this) // 绑定拖动事件
    bindSvgZoom(this) // 绑定缩放事件
    this.store.svg
      .on('click', () => bindSvgClick(this))
      .on('mouseup', () => bindSvgMouseUp(this))
      .on('dblclick.zoom', null) // 禁止双击缩放
      .on('mousedown', (d, i) => bindSvgMouseDown(this))
      .on('mousemove', () => bindSvgMouseMove(this))
  }



  private drawForce(props) {
    this.initChart(props)
    this.createSimulation(props)
    this.createLink()
    if (this.props.showMarker) {
      this.createMarker()
    }
    this.createRelationText()
    this.createNode()
    this.createCircleText(props)
    this.createLegend(props)
  }

  private tick() {
    const {simulation, links, nodes, circleTexts, relationText} = this.store

    const currentAlpha = simulation.alpha()
    // 减少渲染频率，尝试提高性能
    if (currentAlpha < 0.015) {
      return
    }


    // 边更新
    links.attr('d', data => `M${data.source.x} ${data.source.y} L${data.target.x} ${data.target.y}`)

    // 节点位置更新
    nodes.attr('cx', data => data.x)
      .attr('cy', data => data.y)
    // 圆中的文字
    circleTexts.each(function(data) {
      const x = d3.select(this).attr('offset-x')
      const y = d3.select(this).attr('offset-y')
      d3.select(this).attr('transform', `translate(${Number(x) + data.x}, ${Number(y) + data.y})`)
    })

    // 关系上的文字
    relationText.attr('transform', data => {
      const rotate = Math.atan2((data.target.y - data.source.y), (data.target.x - data.source.x)) * (180 / Math.PI)
      // +10 把文字放上面点
      return `translate(${(data.source.x + data.target.x) / 2}, ${(data.source.y + data.target.y) / 2}) rotate(${rotate}, 0 10)`

    })

    circleTexts.on('click', (data, index) => bindNodeClick(this, data))
      .on('mouseup', (data, index) => bindNodeMouseUp(this, data))
      .on('mousedown', (data, index) => bindNodeMouseDown(this, data))
      .on('dblclick', (data, index) => {

      })


  }

  private clearDragLine() {
    const {dragLine} = this.store
    if (dragLine && dragLine.select('.drag-line').empty()) {
      dragLine.select('.drag-line').remove()
    }

    this.store.isAddLink = false
  }

  update() {
    this.createSimulation(this.props)
    this.createNode()
    this.createCircleText(this.props)
    this.createLink()
    this.createRelationText()

    this.store.simulation.restart()
  }
}
