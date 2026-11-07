# Reading Shelf 1.2.0 — 첫 정식 릴리즈

[English release notes](https://github.com/4season/zotero-reading-shelf/releases/tag/v1.2.0) · **한국어**

Zotero 10.x용 일반 서재·아이젠하워 읽기 도구의 첫 정식 릴리즈입니다. 이전 버전들은 프리릴리즈였습니다.

## 기능

![Bookshelf and Markdown/LaTeX collection note](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/bookshelf-en.jpg)

- 첨부파일 프리뷰·카드 크기·읽기 순서를 조절하며 갤러리와 테이블에서 상태를 바꿉니다. 중요도·긴급도는 독립적입니다.
- 긴 Markdown·LaTeX 메모와 원문 편집을 지원합니다. 여러 줄 메모·인라인 수식·독립 분수 수식을 검증했습니다.
- 상태를 지우면 저장된 읽기 목록에서도 빠집니다. 마우스로 상태 선택 후 포커스를 해제하고 배경 클릭으로 선택창 포커스를 닫을 수 있습니다.

![Eisenhower planner with headings above boxes](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/matrix-ko.jpg)

- 중요 자료 두 영역과 아래 읽기 대기열을 제공하며 제목은 박스 위에, 가로·세로 간격은 12px로 표시합니다.
- 컬렉션별 일반 서재/아이젠하워 모드를 기억하는 옵션과 화면 내 전환 버튼을 추가했습니다.
- 마지막 추적 중인 자료 탭을 닫을 때 읽는 중 상태를 해제하는 옵션을 추가했습니다. 중요도·긴급도는 유지하며 두 신규 옵션의 기본값은 꺼짐입니다.
- 프리뷰 전용 그림자·행렬 색상·상태 표시·설정 종속성을 지원합니다. 실행 의존성이나 폴링 서비스를 추가하지 않았습니다.

## 설치

XPI를 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치**로 설치합니다. 기존 설정·순서·메모는 유지되며 업데이트는 수동입니다.

## 검증·호환 범위

**Windows·macOS·Linux 자동 테스트 및 XPI 빌드를 통과했습니다.** macOS에서는 Zotero 10.0.7 PDF.js도 확인했습니다. 브라우저에서 Markdown·MathML·여러 줄 메모·상태 해제 및 서재 이동·선택창 투명도·테이블 정렬·행렬 배치를 검증했습니다. 대응 소스를 새로 풀어 동일 XPI를 재생성하고 업로드 해시를 확인했습니다.

**Windows/Linux의 설치된 Zotero UI는 미검증입니다.** 자동 테스트는 실제 앱 화면 테스트와 다르며 RAM·프레임 시간 실측이나 모든 문서 형식을 보장하지 않습니다. Quick Look·선택적 Poppler는 macOS 전용이고 핵심 프리뷰는 호스트 API를 사용합니다. 외부 리더 앱 종료는 상태 해제 옵션이 추적하지 않습니다. 이 한계를 명시해 정식 공개합니다.

## 라이선스·주요 참고 플러그인

2026-11-07 원문 확인:

| 프로젝트 | 라이선스 | 참고 범위 |
| --- | --- | --- |
| [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) — Jan Baykara 및 기여자 | [AGPLv3](https://github.com/janbaykara/zotero-syllabus/blob/main/LICENSE) | 갤러리 기반 구현과 읽기 순서 노트 형식 |
| [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) — Guillaume Chapron | [AGPLv3](https://github.com/gchapron/ZoteroThumbLibrary/blob/main/LICENSE) | 표지 탐색·카드 크기·갤러리 사용성 |
| [Zotero](https://github.com/zotero/zotero) — 실행 호스트 | [AGPLv3](https://github.com/zotero/zotero/blob/main/COPYING) | 호스트 API와 PDF.js 사용 |

Reading Shelf는 **AGPL-3.0-only**를 유지하며 대응 소스·빌드 방법·저작권/출처 고지를 제공합니다. MIT 라이브러리 고지와 의존성 소스는 유지했고, 오래된 안내 그림은 기능 스크린샷으로 교체했습니다. 개인 라이브러리·PDF·인증정보·빌드 캐시·node_modules는 포함하지 않습니다.
