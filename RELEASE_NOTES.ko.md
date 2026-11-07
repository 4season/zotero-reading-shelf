# Reading Shelf 1.3.9 — 기본 언어 영어, 애니메이션 설정, "−" 안내

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 아이젠하워 화면으로 바꾸고 영역 사이로 자료를 옮기는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 새로운 점

- **기본 언어가 영어가 되었습니다.** 한국어는 그대로 쓸 수 있습니다. Zotero 설정 → Reading Shelf → Language에서 선택하세요. 이미 언어를 골라 두셨다면 달라지는 것이 없고, 고른 적이 없다면 이제 영어로 보입니다.
- **Windows에서 테스트하다 찾은 애니메이션 설정을 추가했습니다.** 플러그인은 시스템의 "동작 줄이기" 설정을 따르는데, Windows에서는 이 설정이 꺼져 있는 경우가 많아(절전 모드, 원격 접속, 가상 머신) 아무 안내 없이 모든 애니메이션이 사라졌습니다. 이제 **설정 → Reading Shelf → 디자인 → 애니메이션**에서 *시스템 설정 따르기*(기본값), *항상 켜기*, *끄기*를 고를 수 있습니다. 애니메이션이 보이지 않으면 *항상 켜기*를 선택해 보세요. Windows의 설정 > 접근성 > 시각 효과 > 애니메이션 효과도 확인해 볼 수 있습니다.
- **아이젠하워 화면의 "−" 버튼이 이유를 알려 줍니다.** ★/◷를 준 자료는 그 표시 때문에 해당 영역에 놓이므로, 읽기 목록에서 빼면 상태는 지워지지만 영역은 옮겨지지 않습니다. 이제 버튼의 설명 문구에 ★/◷가 켜져 있는 동안은 그 영역에 남는다고 나옵니다. 영역에서 빼려면 ★/◷를 끄거나 "그 밖의 자료"로 끌어 놓으세요.

## 업데이트

1.3.0과 같은 플러그인 ID이므로 플러그인 자동 업데이트가 켜져 있으면 Zotero가 자동으로 업데이트합니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.9.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했고, Windows의 애니메이션 문제는 Windows 테스터가 알려 주었습니다. Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 새 애니메이션 설정은 자동 테스트로 확인했으며, 모든 Windows 환경에서 애니메이션이 돌아오는지는 아직 확인하지 못했습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
