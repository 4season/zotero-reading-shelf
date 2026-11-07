# Reading Shelf 1.3.7 — 갤러리와 테이블 사이에서 펼친 자료가 따라감

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![자료 바로 옆에 노트와 첨부파일을 펼치고 우클릭 메뉴를 쓰는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-attachments.gif)

## 새로운 점

- **갤러리와 테이블을 오가도 펼친 자료가 유지됩니다.** 갤러리에서 자료의 노트·첨부파일을 펼치고 **테이블**을 누르면 그 행도 펼쳐져 있습니다. 테이블에서 행을 펼치고 **갤러리**를 누르면 해당 카드가 펼쳐져 노트와 첨부파일을 보여 줍니다.
  - 갤러리는 한 번에 한 자료만 펼치고 테이블은 여러 행을 펼칠 수 있습니다. 갤러리로 전환할 때는 선택된 자료(또는 선택된 노트·첨부파일이 속한 자료)의 행이 펼쳐져 있으면 그 자료를 펼칩니다.
  - 갤러리에서 카드를 닫으면 플러그인이 펼쳤던 행도 닫힙니다. 테이블에서 직접 펼친 다른 행은 건드리지 않습니다.
  - 노트가 있거나 첨부파일이 둘 이상인 자료만 갤러리에서 펼쳐집니다.

## 좋아진 점

- **노트·첨부파일을 닫을 때 덜 급하게 느껴집니다.** 카드가 사라지는 시간을 0.24초로 늘려 나타날 때와 맞췄습니다. 나머지 카드가 제자리로 돌아오기도 전에 사라지던 것이 줄어듭니다.

## 업데이트

1.3.0과 같은 플러그인 ID이므로 플러그인 자동 업데이트가 켜져 있으면 Zotero가 자동으로 업데이트합니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.7.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 갤러리·테이블 동기화는 Zotero 자체의 항목 트리 기능을 사용하며, 트리를 흉내 낸 대역으로 자동 테스트를 했습니다. 다양한 실제 라이브러리에서는 아직 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
