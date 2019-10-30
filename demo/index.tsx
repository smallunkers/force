import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as d3 from 'd3'

import {OnerForce} from '../src/index'
import '../src/index.styl'

// 如果想要测试编译之后的代码, 执行 `npm run build` 之后, 在 demo 中引入
// import OnerForce2 from '..'

import './index.styl'

const nodeColorMap = {
  1: '#0099FF',
  2: '#FF6600',
  3: '#5CBB44'
}

const linkColorMap = {
  1: 'rgba(138, 159, 255, 0.75)',
  2: 'rgba(255, 152, 175, 0.75)',
  3: 'rgba(127, 127, 127, 0.75)',
}

const legendData = [{
  name: '节点1',
  color: '#0099FF',
  type: 'circle',
  r: 4,
}, {
  name: '节点2',
  color: '#FF6600',
  type: 'circle',
  r: 4,
}, {
  name: '节点3',
  color: '#5CBB44',
  type: 'circle',
  r: 4,
}, {
  name: '关系1',
  color: 'rgba(138, 159, 255, 0.75)',
  type: 'line',
  length: 12,
}, {
  name: '关系2',
  color: 'rgba(255, 152, 175, 0.75)',
  type: 'line',
  length: 12,
}, {
  name: '关系3',
  color: 'rgba(127, 127, 127, 0.75)',
  type: 'line',
  length: 12,
  dash: '3',
}]

class Demo extends React.Component {
  constructor(props) {
    super(props)
    import('./data.json').then(result => {
      result.content.node.forEach((item:any) => {
        item.color = nodeColorMap[item.type] // 根据某个字段 确定颜色

        if (item.type === 2) {
          item.strokeColor = nodeColorMap[item.type] // strokeColor 圆圈的外层border颜色
          item.strokeWidth = 8 // 外层宽度
          item.strokeOpacticy = 0.5 // 外层透明度
        }
      })

      result.content.link.forEach((item:any) => {
        item.color = linkColorMap[item.group] // 根据字段来确定颜色

        if (item.group === 3) {
          item.dash = '8, 4' // dash 存在值，则直线变成虚线
          item.relation = [{name: '同学'}, {name: '朋友', color: 'red'}] // 关系可以多个（数组），
        } else if (item.group === 1) {
          item.relation = '同事'
        }
      })

      this.setState({
        nodeList: result.content.node,
        linkList: result.content.link,
      })
    })
  }

  state = {
    legendData: [], // 图例数据
    minCircleRadius: 20, // 最小的半径
    maxCircleRadius: 60, // 最大的半径
    strength: -1000, // 点之间的作用力 负数为斥力，正数为引力
    linkDistance: 50,  // 边之间的距离，初始化力矩图时使用
    isStatic: false, // 是否静态布局
    linkList: [],
    nodeList: [],
    background: '#e7e7e7',
  }

  render() {
    return (
      <div className="demo-oner-force">
        <div className="space"></div>
        <div className="FB1">
          <OnerForce
            width="100%"
            height={600}
            legendData={legendData}
            minCircleRadius={this.state.minCircleRadius}
            maxCircleRadius={this.state.maxCircleRadius}
            strength={this.state.strength}
            isStatic={this.state.isStatic}
            linkList={this.state.linkList}
            nodeList={this.state.nodeList}
            linkDistance={this.state.linkDistance}
            background={this.state.background}
          />
        </div>
        {/* <OnerForce2 name="oner team!" /> */}
      </div>
    )
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'))
