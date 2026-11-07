# Reading Shelf 1.3.1 — 모드 체크박스 연동, 별·시계 버튼 간격 통일

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 영역 사이로 자료를 옮기고 모드를 바꾸는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 바뀐 점

- **설정의 아이젠하워 모드 체크박스와 갤러리의 모드 버튼이 항상 같은 상태를 유지합니다.** 어느 쪽을 바꿔도 다른 쪽에 반영되며, 설정 창을 연 채 버튼을 눌러도 마찬가지입니다.
  - 컬렉션별 기억을 끄면 둘 다 모든 컬렉션이 함께 쓰는 모드를 바꿉니다.
  - 컬렉션별 기억을 켜면 둘 다 Zotero에서 선택한 컬렉션에만 적용되고 다른 컬렉션은 건드리지 않습니다. (이전에는 이 경우 체크박스가 비활성화되어 있었고, 보고 있는 컬렉션과 다른 값을 보여 주었습니다.)
- **★·◷ 버튼 간격이 고르게 보입니다.** 꺼진 버튼에도 켜진 버튼과 같은 크기의 옅은 테두리를 넣어, 꺼진 카드에서 간격이 더 넓어 보이던 문제를 고쳤습니다. 크기와 위치는 그대로입니다.

## 업데이트

1.3.0에서 바뀐 플러그인 ID를 그대로 쓰므로, 플러그인 자동 업데이트가 켜져 있으면 Zotero가 이 버전을 자동으로 안내할 수 있습니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.1.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 체크박스·버튼 연동은 자동 테스트와 브라우저 데모로 확인했으며, 실제 설정 창은 다양한 라이브러리에서 아직 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
