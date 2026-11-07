# Reading Shelf 1.3.4 — 더 부드러운 애니메이션

[English](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.md) · **한국어**

![Zotero에서 영역 사이로 자료를 옮기고 모드를 바꾸는 모습](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## 좋아진 점

- **일반 서재와 아이젠하워 화면을 전환할 때 애니메이션이 적용됩니다.** 카드가 튀지 않고 새 자리로 미끄러지듯 이동합니다.
- **자료의 노트·첨부파일을 펼치고 접는 움직임이 더 부드럽습니다.** 움직임이 조금 더 길어지고(약 0.28초) 시작과 끝이 완만해져서 갑작스럽지 않습니다.
- **추가 카드가 나타날 때 멈칫하던 것을 줄였습니다.** 새로 보이는 카드의 미리보기 이미지는 애니메이션이 끝난 뒤에 만들어서, 움직임과 겹치지 않습니다.
- **★·◷와 읽기 상태가** 카드에 마우스를 올릴 때 갑자기 나타나지 않고 서서히 나타납니다.

모든 움직임은 시스템의 "동작 줄이기" 설정을 따릅니다.

## 업데이트

1.3.0과 같은 플러그인 ID이므로 플러그인 자동 업데이트가 켜져 있으면 Zotero가 자동으로 업데이트합니다. 1.2.x에서 오셨다면 먼저 **도구 → 플러그인**에서 기존 Reading Shelf를 제거하고, **⚙ → 파일에서 플러그인 설치…**로 **zotero-reading-shelf-1.3.4.xpi**를 설치하세요.

## 알려진 한계

macOS의 Zotero 10.0.8에서 확인했습니다. Windows·Linux의 설치된 Zotero 앱은 확인하지 못했습니다. 원인은 화면 녹화를 분석해 찾았고 변경은 자동 테스트로 확인했습니다. 실제로 느끼는 부드러움은 기기에 따라 다를 수 있습니다.

## 라이선스

AGPL-3.0-only입니다. [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus)를 바탕으로 만들고 [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary)를 참고했으며 둘 다 AGPLv3입니다. [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md)를 보세요.
