# Reading Shelf 1.3.8 — 테이블 → 갤러리 동기화 수정

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![자료 바로 옆에 노트와 첨부파일을 펼치고 우클릭 메뉴를 쓰는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-attachments.gif)

## 수정

1.3.7에서 갤러리와 테이블 사이에 펼친 자료가 따라가게 했지만, 테이블 → 갤러리 방향에 빈틈이 두 가지 있었습니다.

- **선택하지 않고 테이블에서 펼친 행도 갤러리로 이어집니다.** 테이블에서 화살표로 행을 펼치면 선택은 바뀌지 않아서 갤러리가 이를 무시했습니다. 이제 선택된 자료의 행이 열려 있으면 그 자료를, 아니면 처음 열려 있는 행의 자료를 펼칩니다.
- **테이블에서 행을 닫으면 갤러리에서도 닫힙니다.** 이전에는 갤러리가 예전에 펼쳤던 기록을 기억하고 있다가 돌아오면 다시 펼쳤습니다. 이제 갤러리로 전환할 때는 테이블 상태가 기준입니다.

갤러리는 여전히 한 번에 한 자료만 펼치므로, 테이블에서 여러 행이 열려 있으면 위 규칙으로 고른 하나가 보입니다.

## 업데이트

1.3.0과 같은 플러그인 ID이므로 플러그인 자동 업데이트가 켜져 있으면 Zotero가 자동으로 업데이트합니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.8.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 갤러리·테이블 동기화는 Zotero의 항목 트리를 흉내 낸 대역으로 자동 테스트를 했으며, 다양한 실제 라이브러리에서는 아직 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
