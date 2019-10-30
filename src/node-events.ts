import * as d3  from 'd3'
import {message} from 'antd'

// 拖拽开始事件
function nodeDragStarted(me:any, data:any) {
  d3.event.sourceEvent.stopPropagation()
  if (!d3.event.active) {
    me.store.simulation.alphaTarget(0.9).restart()
  }
  data.fx = data.x // 固定坐标设置为初始坐标
  data.fy = data.y
  me.store.dragging = true
}

// 拖拽结束事件
function dragged(data:any, store:any) {
  data.fx = d3.event.x
  data.fy = d3.event.y
  store.dragging = true
}

function dragEnd(data:any, store:any) {
  if (!d3.event.active) {
    store.simulation.alphaTarget(0)
  }
  data.fx = d3.event.x
  data.fy = d3.event.y
  store.dragging = false
}

export function bindNodeDrag (me, nodes) {
  nodes.call(d3.drag().filter(() => !me.store.isAddLink)
    .on('start', data => nodeDragStarted(me, data))
    .on('drag', data => dragged(data, me.store))
    .on('end', data => dragEnd(data, me.store))
  )
}

export function bindNodeClick(me, data) {
  d3.event.stopPropagation()
  const {degree} = me.props
  // 一度的情况
  if (degree === '1' || degree === 1) {
    this.highlightOneDegree(data.id)
  } else if (degree === '2' || degree === 2) {
    this.highlightTwoDegree(data.id)
  } else {
    this.highlightOneDegree(data.id) // 其他情况就都用一度
  }
}

export function bindNodeMouseUp(me, data?) {
  this.store.mouseDownNode = data
  if (this.store.isAddLink) {
    if (data) {
      if (this.store.mouseDownNode.id === this.store.mouseUpNode.id) {
        // 说明是在同一个圆上
        this.clearDragLine()
      } else {
        // 不在同一个圆上
        const sourceId = me.store.mouseDownNode.id // 起始点id
        const targetId = me.store.mouseUpNode.id // 终点 id
        const filter = me.store.linkList.filter(item => (sourceId === item.source.id && targetId === item.target.id) || (sourceId === item.target.id && targetId === item.source.id))
        if (filter.length > 0) {
          // 已经存在边关系
          message.warn('已经存在关系')
          this.clearDragLine()
        } else {
          // 不存在边时,添加上一条边
          const result = me.props.beforeLinkConnection({
            source: sourceId,
            target: targetId,
          })

          this.clearDragLine()
          if (typeof result === 'boolean' && !result) {
            return false
          } else if (typeof result === 'boolean' && result) {
            me.store.linkList.push({source: sourceId, target: targetId})
            me.update() // 重新更新整个图

          } else if (Object.prototype.toString.call(result) === '[Object Object]') {
            me.store.linkList.push(Object.assign({}, result, {source: sourceId, target: targetId}))
            me.update() //
          }
        }
      }
    } else {
      // 不在节点上
      me.clearDragLine()
      me.store.mouseDownNode = null
      me.store.mouseUpNode = null
    }
  }
}

export function bindNodeMouseDown(me, data) {
  me.store.isAddLink = true
  me.store.mouseDownNode = data
  me.dragLine.append('path').attr('oner-drag-line')
}


export function binNodeDblClick(me) {

}
