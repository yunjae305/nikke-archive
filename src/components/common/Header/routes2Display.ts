export interface route2DisplayInterface {
  path: string
  text: string
  mobile: boolean
}

export const ROUTES: route2DisplayInterface[] = [
  {
    path: 'tools',
    text: '계산기',
    mobile: true
  },
  {
    path: 'visualiser',
    text: 'Live2D 뷰어',
    mobile: true
  }
]
