// svg 元素上所添加的事件
import * as d3 from 'd3'
import {culControlPoint} from './util'

export function bindSvgDrag (me) {
  const drag = d3.drag().filter(() => !me.store.isAddLink).on('start', () => {
    const {x, y} = d3.event
    me.store.dragCircle = me.store.wrap.select('.oner-force-drag-circle')
      .style('height', '40px')
      .style('width', '40px')
      .style('background', 'black')
      .style('opacity', 0.1)
      .style('left', `${x - 40 / 2}px`)
      .style('top', `${y - 40 / 2}px`)
      .attr('left', `${x - 40 / 2}`)
      .attr('top', `${y - 40 / 2}`)

    // me.store.dragCircle.attr('r', 30)
    //   .attr('cx', x - me.store.containerX) // 不减的话，第二次会有问题
    //   .attr('cy', y - me.store.containerY)
    //   .style('opacity', 0.1)

  })
    .on('drag', () => {
      const {dx, dy} = d3.event
      me.store.containerX += dx
      me.store.containerY += dy

      me.store.offsetX += dx
      me.store.offsetY += dy

      const left = Number(me.store.dragCircle.attr('left'))
      const top = Number(me.store.dragCircle.attr('top'))
      me.store.dragCircle.style('left', `${left + me.store.offsetX}px`)
        .style('top', `${me.store.offsetY + top}px`)

      me.store.svg.style('transform', `translate(${me.store.containerX}px, ${me.store.containerY}px)`)
    })
    .on('end', () => {
      me.store.dragCircle.style('left', 0)
        .style('top', 0)
        .style('width', 0)
        .style('height', 0)

      me.store.offsetX = 0
      me.store.offsetY = 0 // 每次的偏移要清0
    })

  me.store.svg.call(drag)

  me.store.container.call(drag)
}

// svg 放大缩小
export function bindSvgZoom(me) {
  me.store.container.call(d3.zoom().scaleExtent([me.store.minScale, me.store.maxScale]).on('zoom', () => {
    me.store.containerScale = d3.event.transform.k
    me.store.svg.style('transform', `translate(${me.store.containerX}px, ${me.store.containerY}px) scale(${me.store.containerScale})`)
  }))
}

export function bindSvgClick(me) {
  if (d3.event.toElement && d3.event.toElement.nodeName && d3.event.toElement.nodeName === 'svg') {
    me.highlightOut()
    me.store.nodeList.forEach(item => {
      item.fx = null
      item.fy = null
    })
  }

  if (me.store.dragging) {
    return false
  }

  d3.event.stopPropagation() // 拒绝冒泡
}

export function bindSvgMouseUp(me) {
  // 在svg 上松开鼠标
  me.clearDragLine()
  me.store.mouseDownNode = null
  d3.event.stopPropagation()
}

export function bindSvgMouseMove(me) {
  let x = 0
  let y = 0
  if (!me.store.dragLine.select('.drag-line').empty() && me.store.mouseDownNode) {
    x = d3.event.offsetX
    y = d3.event.offsetY
    const newControl = culControlPoint([x, y], [me.store.mouseDownNode.x, me.store.mouseDownNode.y], 0.2)
    me.store.dragLine.select('.oner-drag-line')
      .style('opacity', 1)
      .attr('fill', 'none')
      .attr('stroke', '#E8E8E8')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8, 4')
      .attr('d', `M${x}, ${y} Q${newControl[0]}, ${newControl[1]} ${me.store.mouseDownNode.x}, ${me.store.mouseDownNode}`)
  }

}

export function bindSvgMouseDown(me) {
  d3.event.stopPropagation()
}
