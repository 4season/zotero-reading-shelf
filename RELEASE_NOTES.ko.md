# Reading Shelf 1.2.2 — 컬렉션별 모드·읽기 상태 수정

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero의 Core Article 컬렉션](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

## 수정

- **컬렉션별 모드가 다른 컬렉션에 영향을 주지 않습니다.** **컬렉션별로 아이젠하워 / 일반 서재 모드 기억**을 켜면 컬렉션마다 고른 모드가 유지됩니다. 아직 고르지 않은 컬렉션은 처음 열 때의 모드로 고정되므로, 이후 다른 컬렉션이나 기본값을 바꿔도 달라지지 않습니다.
- **컬렉션별 기억을 켜면 전역 "아이젠하워 모드" 체크박스를 쓸 수 없습니다.** 이 체크박스가 열려 있는 컬렉션의 저장된 모드를 덮어쓰던 문제를 막기 위한 것입니다. **정렬** 오른쪽의 모드 버튼을 사용하세요.
- **열려 있는 리더 탭으로 돌아가도 읽기 상태가 초기화되지 않습니다.** 이전에는 탭을 전환할 때마다 자료가 다시 *읽는 중*이 되어, 방금 바꾼 *완료됨*이나 상태 해제가 되돌려졌습니다.
- **"저장하지 못했습니다" 메시지가** 플러그인 언어가 한국어일 때 한국어로 표시됩니다.
- **저장된 읽기 순서 데이터가 손상되어도 갤러리가 멈추지 않습니다.** 컬렉션의 읽기 순서 노트로 대체합니다.

그 밖에 Zotero 플러그인 목록의 설명을 실제 기능에 맞게 고쳤습니다.

## 설치와 업데이트

**zotero-reading-shelf-1.2.2.xpi**를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치…**로 설치합니다. 설정·메모·읽기 순서는 그대로 유지됩니다. 1.2.1을 쓰고 플러그인 자동 업데이트가 켜져 있으면 Zotero가 이 업데이트를 알아서 안내합니다. 1.2.0 이하는 한 번 직접 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
