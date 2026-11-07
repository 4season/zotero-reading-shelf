<p align="center">
  <img src="icons/reading-shelf.svg" width="96" height="96" alt="Reading Shelf icon">
</p>
<h1 align="center">Reading Shelf</h1>
<p align="center">
  <a href="https://github.com/4season/zotero-reading-shelf/releases/latest"><img src="https://img.shields.io/github/v/release/4season/zotero-reading-shelf?label=version&amp;color=287d76" alt="Latest release"></a>
  <a href="https://github.com/4season/zotero-reading-shelf/releases/tag/v1.2.3"><img src="https://img.shields.io/badge/released-2026--11--07-64748b" alt="Released on 2026-11-07"></a>
  <a href="https://www.zotero.org/"><img src="https://img.shields.io/badge/Zotero-10.x-bf3d47" alt="Zotero 10.x"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-385c8e" alt="AGPLv3 license"></a>
  <a href="https://github.com/4season/zotero-reading-shelf/actions/workflows/ci.yml"><img src="https://github.com/4season/zotero-reading-shelf/actions/workflows/ci.yml/badge.svg" alt="Portable checks"></a>
</p>
<p align="center"><a href="README.md">English</a> · <strong>한국어</strong></p>

Reading Shelf는 Zotero 컬렉션을 서재처럼 보여 주는 플러그인입니다. 자료마다 미리보기를 보면서 읽을 순서를 정하고, 읽기 상태를 관리하고, 아이젠하워(긴급·중요) 방식으로 분류할 수 있습니다. 모두 Zotero 안에서 이루어집니다.

## 설치

1. [최신 릴리즈](https://github.com/4season/zotero-reading-shelf/releases/latest)에서 `zotero-reading-shelf-1.2.3.xpi`를 내려받습니다.
2. Zotero에서 **도구 → 플러그인 → ⚙ → 파일에서 플러그인 설치…**를 선택하고 받은 파일을 고릅니다.
3. 컬렉션을 선택하고 **갤러리**를 누르면 서재가 열립니다. **테이블**을 누르면 원래 목록으로 돌아갑니다.

Zotero 10.x가 필요합니다. 이전 버전의 설정은 그대로 유지됩니다.

**업데이트:** 1.2.1부터는 Zotero의 플러그인 자동 업데이트가 켜져 있으면 새 버전을 자동으로 받습니다. 1.2.0 이하를 쓰고 있다면 1.2.1을 한 번만 직접 설치하세요. 그 뒤에는 자동으로 업데이트됩니다.

**언어:** 기본 언어는 한국어입니다. 영어로 바꾸려면 Zotero 설정에서 **Reading Shelf**를 열고 **Language**를 English로 선택하세요.

다른 갤러리 플러그인과 화면이 겹치면 둘 중 하나를 끄세요.

## 할 수 있는 일

### 읽기 목록 정리

![Zotero 일반 서재에서 자료를 읽기 목록으로 끌어 놓는 모습](docs/images/core-article-bookshelf.gif)

- **일반 서재:** 읽을 예정이거나 읽는 중인 자료가 정한 순서대로 맨 위에 나옵니다. 나머지는 *미분류 자료*, 끝낸 자료는 *완료됨*에 모입니다.
- **순서 바꾸기:** 카드를 끌어 놓거나 카드의 + / − 버튼을 씁니다. Tab으로 − 버튼에 초점을 두고 Alt + ←/→를 누르면 카드가 이동합니다.
- **읽기 진행률:** PDF 카드에는 마지막으로 읽은 페이지를 기준으로 진행 막대가 표시됩니다.
- **읽기 상태:** *상태 없음*, *읽을 예정*, *읽는 중*, *완료됨* 중 하나입니다. 카드나 테이블의 상태 열에서 바꿉니다. 상태를 없애면 읽기 목록에서도 빠집니다.
- **중요도·긴급도:** ★는 중요도, ◷는 긴급도입니다. 읽기 상태와 따로 저장되므로 상태를 바꿔도 그대로 유지됩니다.
- 읽기 목록에 넣으면 *읽을 예정*이 됩니다(이미 *읽는 중*이면 그대로입니다). *미분류 자료*로 옮기면 상태가 없어지고, *완료됨* 자료를 읽기 목록으로 다시 넣으면 *읽을 예정*으로 돌아갑니다.
- Zotero 내장 리더로 열면 *읽는 중*이 됩니다. 원하면 마지막 리더 탭을 닫을 때 상태를 없앨 수도 있습니다(기본값은 꺼짐이며, Zotero 밖의 PDF 프로그램은 알 수 없습니다).

### 아이젠하워 분류

**정렬** 오른쪽의 모드 버튼으로 아이젠하워 화면으로 바꿉니다. 위쪽에 *긴급하고 중요한 자료*와 *중요하지만 덜 급한 자료*가 나란히 놓이고, 아래에 *읽기 대기열*이 있습니다. 자료를 끌어서 영역 사이로 옮기고, 같은 버튼을 다시 눌러 일반 서재로 돌아갑니다.

![Zotero에서 아이젠하워 화면으로 바꾸고 영역 사이로 자료를 옮기는 모습](docs/images/core-article-eisenhower.gif)

기본적으로 고른 모드는 모든 컬렉션에 똑같이 적용됩니다. 컬렉션마다 따로 기억하게 하려면 설정에서 **컬렉션별로 아이젠하워 / 일반 서재 모드 기억**을 켜세요.

### 컬렉션 메모

컬렉션 맨 위의 메모를 더블클릭하면 편집할 수 있으며 Markdown과 LaTeX를 지원합니다.

- 문장 안 수식: `$…$` 또는 `\(…\)`
- 별도 줄 수식: `$$…$$` 또는 `\[…\]`
- Ctrl/Cmd + Enter로 저장, Esc로 취소합니다.

100,000자를 넘는 메모는 Zotero가 느려지지 않도록 일반 텍스트로 보여 줍니다. 내용 자체는 바뀌지 않습니다.

### 설정

Zotero 설정에서 **Reading Shelf**를 열면 다음을 바꿀 수 있습니다.

- 자료 크기, 정렬, 표시할 버튼과 컨트롤(모드 전환 버튼 포함)
- *읽을 예정*·*읽는 중*·*완료됨*, ★·◷ 버튼, 아이젠하워 테두리의 색상. 색상 선택기나 `#RRGGBB` 입력을 쓰며, 그룹별 또는 전체 초기화가 가능합니다.
- 미리보기 그림자(없음·약하게·보통·강하게, 다크 모드 선택)

다른 옵션에 따라 쓸 수 없는 설정은 흐리게 표시되지만 값은 그대로 보존됩니다.

![실제 Zotero의 상태 색상 변경과 초기화](docs/images/core-article-colors.gif)

카드를 클릭해 선택하고, 더블클릭하면 첨부파일이나 노트가 열리며, 우클릭하면 Zotero 기본 메뉴가 나옵니다.

## 데이터와 개인정보

- 읽기 순서·컬렉션 메모·모드·읽기 상태는 내 컴퓨터의 Zotero 설정에 저장되며, 이 플러그인은 다른 컴퓨터로 동기화하지 않습니다.
- 미리보기 이미지는 Zotero 데이터 폴더의 `reading-shelf-thumbnails` 폴더에 임시 저장되며, 언제든 지워도 필요할 때 다시 만들어집니다. 이전 버전이 쓰던 `syllabus-lite-thumbnails` 폴더는 더 이상 쓰지 않으므로 지워도 됩니다.
- 파일을 외부로 업로드하지 않습니다.

## 알려진 한계

- macOS의 Zotero 10.0.8에서 확인했습니다. Windows와 Linux의 설치된 Zotero에서는 아직 확인하지 못했습니다.
- PDF·EPUB·이미지 미리보기를 지원합니다. 암호화되었거나 지원하지 않는 파일은 미리보기가 없을 수 있습니다. macOS에서는 Quick Look(설치했다면 Poppler도)을 보조로 사용합니다.

## 라이선스와 출처

Reading Shelf는 **AGPL-3.0-only** 자유 소프트웨어입니다. Jan Baykara와 기여자들의 [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들었고, Guillaume Chapron의 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했습니다. 둘 다 AGPLv3입니다. 포함된 markdown-it과 KaTeX는 MIT 라이선스입니다. 자세한 내용은 [NOTICE.md](NOTICE.md)를 보세요.

Reading Shelf는 Zotero와 관련 없는 독립 플러그인입니다. Zotero는 Corporation for Digital Scholarship의 등록 상표입니다.

개발자는 빌드·테스트·배포 방법을 [CONTRIBUTING.md](CONTRIBUTING.md)에서 확인하세요.
