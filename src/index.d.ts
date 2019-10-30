export interface IForceProps {
  id?: string | number // 图谱id
  className?: string // 类名
  nodeList: object[] // 节点数据
  height?: number | string // 高度
  width?:number | string // 宽度
  containerScale?: number | string // 初始缩放比
  legendData: object[] // 图例数据
  minCircleRadius: number | string, // 最小的半径
  maxCircleRadius: number | string, // 最大的半径
  strength: number, // 点之间的作用力 负数为斥力，正数为引力
  linkDistance: number,  // 边之间的距离，初始化力矩图时使用
  isStatic: boolean, // 是否静态布局
  exportPngName?: string, // 导出图谱名称
  minScale?: number, // 最小的缩放比例
  maxScale?: number, // 最大的缩放比例
  linkList: object[], // 边数据
  actionList?: object[] // 右侧操作栏
  onClickNode?(node: object): void, // 点击节点
  onClickLink?(link: object): void, // 点击边
  onDoubleClickNode?(node: object): void // 双击节点
  onDoubleClickLink?(link: object): void // 双击边
  background?: string,
  distanceMin?: number,
  distanceMax?: number,
  forceCollide?: number,
  mainNodeRadius?: number,
  fontSize?: number | string, // 圆中的字体大小
  beforeLinkConnection?(linkItem: object): boolean | object // 在连线添加成功之前，返回false 则此次添加连线取消，返回object 则会作为添加到link中的数据
  degree?: number | string // 高亮时展示的度数
  showTooltip?: boolean // 是否显示hover到节点上的文字
  showMarker?: boolean // 是否显示箭头
}
