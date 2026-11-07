# Reading Shelf 1.3.5 — 노트·첨부파일 다시 열기 속도 개선

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 영역 사이로 자료를 옮기고 모드를 바꾸는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 좋아진 점

- **자료의 노트·첨부파일을 다시 열 때 더 빠릅니다.** 이미 만든 미리보기와 노트 요약을 매번 다시 읽고 만들지 않고 재사용합니다. 항목이 바뀌면 새로 만듭니다.
- **만들지 못한 미리보기는 덜 자주 다시 시도합니다**(2분에서 30분 간격으로). 암호화되었거나 지원하지 않는 파일 때문에 둘러보는 중에 느린 시도가 반복되지 않습니다.

## 고친 점

- **카드를 열 때 자료 크기가 조금 커지던 문제를 고쳤습니다.** 카드를 열면 줄이 늘어나 스크롤바가 나타날 수 있고, 그러면 갤러리 폭이 줄어 한 줄에 들어가는 카드가 하나 줄면서 모든 카드가 커졌습니다. 이제 스크롤바 자리를 미리 확보해 폭이 그대로 유지됩니다.

## 업데이트

1.3.0과 같은 플러그인 ID이므로 플러그인 자동 업데이트가 켜져 있으면 Zotero가 자동으로 업데이트합니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.5.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 카드 크기 수정은 화면 녹화를 바탕으로 한 것이며 테스트 브라우저에서는 재현하지 못했습니다. 카드를 열 때 여전히 커지면 알려 주세요.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
