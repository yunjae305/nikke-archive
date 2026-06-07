/* eslint-disable */
enum globalParams {
  LOCALHOST = 'http://localhost:5500/',
  NIKKE_DB = 'https://nikke-db-legacy.pages.dev/',
  PATH_L2D = 'https://cdn.jsdelivr.net/gh/yunjae305/nikke_l2d-@main/', // local: '/l2d-data/' | nikke-db: NIKKE_DB + 'l2d/'
  PATH_L2D_AIM = 'aim/',
  PATH_L2D_COVER = 'cover/',
  PATH_SPRITE_1 = 'images/sprite/si_',
  PATH_SPRITE_2 = '_00_s.png',
  BUILD_PATH = 'chibi/Build/',
  STREAMING_ASSETS_PATH = 'chibi/StreamingAssets',
  GALLERY_PATH = 'images/gallery/',
  CHIBI_BUILD = NIKKE_DB + BUILD_PATH,
  STREAMING_ASSETS = NIKKE_DB + STREAMING_ASSETS_PATH,
  GALLERY = NIKKE_DB + GALLERY_PATH,
  LOCALHOST_CHIBI_BUILD = LOCALHOST + BUILD_PATH,
  LOCALHOST_STREAMING_ASSETS = LOCALHOST + STREAMING_ASSETS_PATH,
  CRYPTOJS_AES_KEY = 'Nikke DB AES Key'
}

enum messagesEnum {
  MESSAGE_ERROR = '오류가 발생했습니다',
  MESSAGE_ASSET_LOADED = '에셋을 불러왔습니다',
  MESSAGE_LOCALSTORAGE_SAVED = '데이터가 로컬 저장소에 저장되었습니다',
  MESSAGE_CANCELLED = '취소되었습니다',
  MESSAGE_CANNOT_SAVE_EMPTY = '빈 값은 저장할 수 없습니다',
  MESSAGE_WRONG_FORM_DATA = '입력한 양식 데이터에 문제가 있습니다',
  MESSAGE_PROCESSING = '처리 중입니다',
  MESSAGE_UNLOAD = '이전 에셋을 불러 해제했습니다',
  MESSAGE_WRONG_FILE_FORMAT = '파일 형식이 올바르지 않습니다',
  MESSAGE_UI_SHOWBACK = '"Enter" 키를 눌러 UI를 다시 표시하세요',
  MESSAGE_TIERLIST_DELETE_ROW = '행이 삭제되었고 해당 행의 캐릭터가 대기 목록으로 이동되었습니다',
  MESSAGE_TIERLIST_UPDATED_ROW = '행이 업데이트되었습니다',
  MESSAGE_TIERLIST_SCREENSHOT_CONVERT2CANVAS = 'HTML 데이터를 캔버스로 변환하는 중...',
  MESSAGE_TIERLIST_SCREENSHOT_CANVAS2PNG = '캔버스를 PNG 파일로 다운로드하는 중',
  MESSAGE_EXPORT_ANIMATION = '애니메이션을 재생하고 내보내는 중...',
  MESSAGE_EXPORT_ANIMATION_SUCCESS = '애니메이션 내보내기가 완료되었습니다',
  MESSAGE_EXPORT_ANIMATION_FAILED = '애니메이션 내보내기에 실패했습니다'
}

enum theme {
  BACKGROUND_COLOR = '#2f353a',
  BACKGROUND_COLOR_2 = '#212529',
  NAIVE_GREEN = '#63e2b7',
  GREY = 'rgb(180, 175, 175)'
}

// dev: local files, prod: jsDelivr CDN
const L2D_PATH = import.meta.env.DEV
  ? '/l2d-data/'
  : globalParams.PATH_L2D

export { globalParams, messagesEnum, theme, L2D_PATH }
