# Reading Shelf 1.2.3 — 전용 미리보기 캐시 폴더

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 영역 사이로 자료를 옮기고 모드를 바꾸는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 바뀐 점

- **미리보기 이미지를 Zotero 데이터 폴더의 `reading-shelf-thumbnails`에 저장합니다.** 이전에는 참고한 플러그인 이름을 딴 폴더를 썼는데, 다른 플러그인과 폴더를 함께 쓰는 일이 없도록 바꿨습니다.
- 업데이트 후 컬렉션을 처음 열 때 미리보기를 새로 만들기 때문에 첫 화면은 조금 느릴 수 있습니다.
- 예전 `syllabus-lite-thumbnails` 폴더는 더 이상 쓰지 않습니다. 디스크 공간이 필요하면 직접 지우세요. 같은 이름을 쓰는 다른 플러그인이 있을 수 있어 Reading Shelf가 대신 지우지는 않습니다.
- README에 일반 서재와 아이젠하워 시연 GIF를 따로 실었습니다.

설정·메모·읽기 순서·모드는 그대로 유지됩니다.

## 설치와 업데이트

**zotero-reading-shelf-1.2.3.xpi**를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치…**로 설치합니다. 1.2.1 이상에서 플러그인 자동 업데이트가 켜져 있으면 Zotero가 이 업데이트를 알아서 안내합니다. 1.2.0 이하는 한 번 직접 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
