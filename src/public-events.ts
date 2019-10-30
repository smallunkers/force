// 有很多元素重复的事件 放在公共事件中

import * as d3 from 'd3'

export function bindMouseOver(me, data) {
  const {showTooltip} = me.props
  const finish = me.store.gMain.select(`.oner-circle-text-${data.id}`).attr('finish')
  if (showTooltip && finish !== 'true') {

    me.store.tooltip.style('background', 'white')
      .style('padding', '2px 8px')
      .style('font-size', 12)
    me.store.tooltip.html(`<div class="oner-force-tooltip">
      <div class="oner-force-tooltip-text">${data.name}</div>
    </div>`)

    const height = me.store.tooltip.node().getBoundingClientRect().height
    const width = me.store.tooltip.node().getBoundingClientRect().width

    // 如果右边已经超出图谱的范围，就放左边
    if (me.store.svgWidth - d3.event.offsetX < width) {
      me.store.tooltip.style('left', `${d3.event.offsetX - width - 10}px`)
        .style('top', `${d3.event.offsetY - height / 2}px`)
    } else {
      me.store.tooltip.style('left', `${d3.event.offsetX + 10}px`)
        .style('top', `${d3.event.offsetY - height / 2}px`)
    }

    me.store.tooltip
      .transition('show')
      .duration(50)
      .style('opacity', 1)

    me.store.links.filter((dt) => dt.source.id === data.id || dt.target.id === data.id)
      .style('stroke-width', '3px')

  }
}

export function bindMouseOut(me, data) {
  if (d3.event.toElement && d3.event.toElement.nodeName !== 'text' && d3.event.toElement.nodeName !== 'tspan') {
    me.store.tooltip.html('')
    me.store.links.style('stroke-width', '2px')
    me.store.links.style('stroke-opacity', 1)
    me.store.tooltip
      .style('opacity', 0)
      .style('left', `-10px`)
      .style('top', `-10px`)
  }
}
