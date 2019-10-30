import * as d3 from 'd3'

export function mixin(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list)
  }
}

// 计算文字中的位置
export function drawWrapText(width, height, textSelection, text, fs) {
  textSelection.text(text).style('opacity', 0).style('font-size', `${fs}px`) // 先置为透明
  if (textSelection.empty()) {
    return
  }
  const textWidth = textSelection.node().getBoundingClientRect().width // 这一段整体长度
  const lineHeight = textSelection.node().getBoundingClientRect().height // 每一行的行高

  const everyWordWidth = textWidth / text.length // 计算出平均每个字符的宽度
  const count = Math.floor(width / everyWordWidth) // 一行几个字大约


  textSelection.html('') // 清空
  const lineNumber = Math.floor(height / lineHeight) // 这个高度下最多可以放几行

  let nowLineNumber = 0 // 当前是第n-1行
  // 当整个text 高度已经超过容器高度时
  // debugger
  while (nowLineNumber <= lineNumber - 1) {

    const lineText = text.substring(nowLineNumber * count, (nowLineNumber + 1) * count)

    if (!lineText) {
      // 此时已经所有文字解析完毕，跳出循环
      textSelection.attr('finish', 'true')
      break
    }
    const tspan = textSelection.append('tspan').attr('x', 0).attr('y',0).text(lineText)
      .attr('dy', nowLineNumber * lineHeight)
      .attr('fill', 'white')


    if (nowLineNumber === lineNumber - 1) {
      // 最后一行

      if ((nowLineNumber + 1) * count < text.length) {
        // 说明还没放完

        tspan.text(`${lineText.substr(0, lineText.length - 1)}..`) // 去掉1个字符，换成..
      }

    }


    nowLineNumber ++

    // if (tspan.node().getBoundingClientRect().width < width) {
    //   // 说明超过本行宽度， 去掉尾部一个
    //
    //
    // }
  }

  textSelection
    .attr('offset-y', function() {
      return -(d3.select(this).node().getBoundingClientRect().height / 2) + lineHeight
    })
    .attr('offset-x', function() {
      return -(d3.select(this).node().getBoundingClientRect().width) / 2
    })
    .attr('dominant-baseline', 'text-after-edge')
    .style('opacity', 1)

}

// 计算二次贝塞尔的控制点 起点，终点，控制点偏移系数, 在垂直平分线上取值
export function culControlPoint(start, end, curveness) {
  const centroid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
  const cpX = centroid[0] + (end[1] - start[1]) * curveness
  const cpY = centroid[1] + (end[0] - start[0]) * curveness
  return [cpX, cpY]
}
