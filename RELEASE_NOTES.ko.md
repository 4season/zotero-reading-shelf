# Reading Shelf 1.4.0 — 발표 모드와 정리된 설정

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 아이젠하워 화면으로 바꾸고 영역 사이로 자료를 옮기는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 새로운 점

- **발표 모드.** 저널클럽·랩미팅·세미나에서 발표할 논문을 놓는 칸과 *선정됨* 상태를 추가합니다. 설정이나 모드 전환 버튼 옆 버튼으로 켜고, 컬렉션별로 기억할 수 있습니다. 선택 설정: *선정됨* 논문을 중요·긴급으로 간주, 모드를 끌 때 이전 상태로 되돌리기.
- **설정 화면 정리.** 아이젠하워·발표 모드 설정이 같은 구성(체크박스 아래 짧은 설명 한 단락)으로 통일되었습니다. 아이젠하워 모드가 꺼져 있으면 테두리 관련 항목이 비활성화됩니다. 이전에는 컬렉션별 기억이 켜져 있으면 항상 활성화되어 있었습니다.
- **표의 읽기 상태.** 열이 좁으면 잘린 글자 대신 색깔 점으로 표시합니다. 자료의 마지막 탭을 닫으면 열기 전 상태로 되돌아갑니다.
- **레이아웃 옵션.** 칸 높이 맞추기, 발표 칸 색상, 발표 버튼 숨기기, 읽기 칸에도 정렬 적용 옵션을 추가했습니다.
- **내부 구조.** 소스를 `src/` 모듈로 나누고(bootstrap.js는 자동 생성) 설정 접근을 한곳으로 모았습니다. 동작 변화는 없습니다.

## 업데이트

같은 플러그인 ID이므로 자동 업데이트가 켜져 있으면 Zotero가 알아서 업데이트합니다. 아니면 **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.4.0.xpi**를 설치하세요. 설정은 유지됩니다.

## 알려진 한계

자동 테스트를 통과했고 macOS의 Zotero 10.0.8에서 확인했습니다. 이 버전은 Windows와 Linux에서 다시 확인하지 않았습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
