# Reading Shelf 1.2.1 — 상태 동기화·설정 버그 수정

[English](https://github.com/4season/zotero-reading-shelf/releases/tag/v1.2.1) · **한국어**

![실제 Core Article의 서재·아이젠하워 전환](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

- 읽기 영역으로 이동할 때 목록 순서와 읽기 상태를 함께 갱신합니다. 빈 상태·완료됨은 읽을 예정으로 바뀌고, 읽는 중은 정렬 중 유지합니다. 그 밖의 자료로 빼면 읽기 상태를 해제하며 예전의 빈 상태 대기열 데이터도 정리합니다.
- 일관되지 않던 Drop here 안내를 다른 빈 영역과 통일했습니다.
- **완료됨** 상태·전용 영역·색상을 추가했습니다. 완료 시 읽기 대기열에서 분리하고 중요도·긴급도는 보존합니다. 다시 읽기 영역에 넣으면 읽을 예정으로 돌아갑니다.
- 모드 버튼을 정렬 오른쪽으로 옮기고 숨김 옵션을 추가했습니다. DOM 숨김과 CSS를 함께 적용합니다.
- 스타일 주소에 버전을 붙여 업데이트 후 예전 CSS가 남는 문제를 고쳤습니다. 저장된 색상·숨김 설정이 화면에 반영되지 않던 원인이었습니다.
- 색상 선택기의 실시간 입력과 `#RRGGBB` 직접 입력을 동기화했습니다. 디자인 설정을 그림자·읽기 상태 색상·중요도/긴급도 버튼·아이젠하워 테두리로 나눴습니다. 그룹별·전체 색상 초기화가 가능하며 다른 설정은 보존합니다.
- GitHub Release XPI와 SHA-256을 사용하는 Zotero 자동 업데이트 메타데이터를 추가했습니다. **1.2.0 이하는 한 번 수동으로 1.2.1을 설치해야 합니다.** 기존 내장 업데이트 주소가 예시용 주소였기 때문입니다. 이후에는 Zotero의 플러그인 자동 업데이트가 켜져 있으면 저장소의 정식 버전을 받을 수 있으며 별도 서버는 필요하지 않습니다.

![실제 Zotero의 색상 변경과 초기화](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-colors.gif)

GIF는 Zotero 10.0.8의 **Core Article** 컬렉션에서 캡처한 단계를 이어 붙였으며, 갤러리 영역만 잘라 다른 컬렉션과 사이드바는 포함하지 않았습니다.

## 설치

**zotero-reading-shelf-1.2.1.xpi**를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치**로 설치합니다. 기존 로컬 설정·메모·읽기 순서는 유지하며, 불일치하던 옛 대기열 항목은 복구 규칙에 따라 정리합니다.

## 검증 범위

Windows·macOS·Linux에서 회귀 테스트와 빌드를 실행합니다. 빈 상태 드래그, 완료 영역·다시 읽기, 중요도 보존, 체크박스 저장, 실시간 색상 입력, 그룹별 초기화, 버전별 스타일 주소, 업데이트 JSON과 실제 XPI 해시를 검증합니다. 설치된 Zotero PDF.js 테스트도 통과했습니다. 브라우저에서는 두 언어·65/100/150% 크기·긴 Markdown/LaTeX 메모·테이블 정렬을 점검합니다.

macOS의 실제 Zotero 10.0.8에 후보를 설치해 모드·중요도·긴급도 전환, 모드 숨김, Hex 색상 변경과 초기화를 확인했습니다. 색상 검증 후 기존 사용자 팔레트를 복원했습니다. 드래그 자동 회귀 검증은 통과했으나 실제 앱의 드래그 자동화에서는 안정적인 드롭 결과를 얻지 못했으므로, 실제 드래그 전체 경로 검증 완료를 주장하지 않습니다. Windows/Linux의 설치된 Zotero UI와 RAM·프레임 시간은 미검증입니다.

## 라이선스·출처

AGPL-3.0-only입니다. 주요 참고 플러그인은 [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus), [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)이며 둘 다 AGPLv3입니다. Zotero의 COPYING도 AGPLv3입니다. 원본 고지·대응 소스·의존성 소스를 함께 제공합니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)에 출처를 기록했습니다.
