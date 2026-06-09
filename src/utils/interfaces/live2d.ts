export type L2dCode = '작열' | '수냉' | '풍압' | '전격' | '철갑'
export type L2dCompany = '엘리시온' | '미실리스' | '테트라' | '필그림' | '어브노멀'

export interface live2d_interface {
  name: string
  id: string
  tl?: string
  f?: string
  fbOnly?: boolean
  imageOnly?: boolean
  code?: L2dCode
  company?: L2dCompany
  collection?: boolean
}

export interface RailStyleInterface {
  focused: boolean,
  checked: boolean
}
