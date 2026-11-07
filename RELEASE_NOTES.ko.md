# Reading Shelf 1.2.4 — 설정 이름을 Reading Shelf로 변경

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 영역 사이로 자료를 옮기고 모드를 바꾸는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 바뀐 점

- **설정을 Reading Shelf 이름(`extensions.reading-shelf.*`)으로 저장합니다.** 이전에는 참고한 플러그인 이름을 딴 키를 썼는데, 다른 플러그인과 겹치지 않도록 바꿨습니다.
- **기존 설정은 자동으로 이어집니다.** 1.2.4를 처음 실행할 때 저장해 둔 언어, 카드 크기, 색상, 읽기 상태, 중요도·긴급도, 읽기 순서, 컬렉션별 모드를 새 이름으로 복사합니다. 새 이름에 이미 저장된 값은 덮어쓰지 않습니다.
- 이전 값은 지우지 않고 남겨 두므로, 이전 버전으로 돌아가도 설정이 그대로 있습니다.

따로 할 일은 없습니다. 업데이트 후 무언가 초기화된 것처럼 보이면 이슈로 알려 주세요. 이전 값은 그대로 저장되어 있습니다.

## 설치와 업데이트

**zotero-reading-shelf-1.2.4.xpi**를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치…**로 설치합니다. 1.2.1 이상에서 플러그인 자동 업데이트가 켜져 있으면 Zotero가 이 업데이트를 알아서 안내합니다. 1.2.0 이하는 한 번 직접 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 이전 설정을 복사하는 동작은 자동 테스트로 확인했으며, 다양한 실제 라이브러리에서는 아직 실행해 보지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
