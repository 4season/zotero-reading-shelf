# Reading Shelf 1.2.1 — 읽기 상태·색상·업데이트 수정

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero의 Core Article 컬렉션](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

## 새로운 점

- **완료됨 상태.** 자료를 *완료됨*으로 표시하면 별도의 *완료됨* 영역으로 이동하며 전용 색상을 쓸 수 있습니다. 읽기 목록에서는 빠지지만 중요도·긴급도는 유지되고, 다시 읽기 목록으로 끌어 놓으면 *읽을 예정*이 됩니다.
- **읽기 상태가 읽기 목록과 함께 바뀝니다.** 읽기 목록에 넣으면 *읽을 예정*이 되고(*읽는 중*이면 그대로), *그 밖의 자료*로 옮기면 상태가 없어집니다. 이전 버전에서 어긋났던 항목은 자동으로 바로잡습니다.
- **모드 버튼.** **정렬** 오른쪽으로 옮겼고, 숨기기 설정이 제대로 작동합니다.
- **색상 설정.** 색상 선택기가 바로 반영되고 `#RRGGBB` 입력란과 연동됩니다. 설정은 미리보기 그림자·읽기 상태 색상·★/◷ 버튼 색상·아이젠하워 테두리로 나뉘며, 그룹별 또는 전체 색상을 다른 설정에 영향 없이 초기화할 수 있습니다.
- **빈 영역 안내 통일.** 빈 영역마다 달랐던 "Drop here" 등의 문구를 같은 안내로 맞췄습니다.

## 수정

- 플러그인 업데이트 후 저장한 색상과 숨김 설정이 화면에 반영되지 않던 문제를 고쳤습니다. Zotero가 예전 스타일을 계속 사용하던 것이 원인이었습니다.

## 설치와 업데이트

**zotero-reading-shelf-1.2.1.xpi**를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치…**로 설치합니다. 설정·메모·읽기 순서는 그대로 유지됩니다.

이 버전부터 Zotero의 플러그인 자동 업데이트가 켜져 있으면 GitHub Releases에서 새 버전을 받습니다. **1.2.0 이하를 쓰고 있다면 1.2.1을 한 번 직접 설치하세요.** 이전 버전에는 임시 업데이트 주소가 들어 있습니다.

![Zotero에서 상태 색상을 바꾸고 초기화하는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-colors.gif)

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱과, 설치된 앱에서의 카드 끌어 놓기는 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
