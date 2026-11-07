# Credits and third-party software

Reading Shelf began as a gallery-focused experiment based on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) by Jan Baykara and contributors. It retains compatibility with the Syllabus personal reading order note format. This modified implementation, prepared on 2026-11-07, focuses on the gallery and adapts the PDF thumbnail loading and macOS fallback from the earlier gallery patch. Zotero Syllabus is distributed under the GNU Affero General Public License version 3.

[ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) by Guillaume Chapron was a usability reference for the card size control and gallery interactions. Its [LICENSE](https://github.com/gchapron/ZoteroThumbLibrary/blob/main/LICENSE) is AGPLv3; it is not bundled as a second plugin.

The XPI bundles [markdown-it 14.2.0](https://www.npmjs.com/package/markdown-it/v/14.2.0) and [KaTeX 0.16.47](https://www.npmjs.com/package/katex/v/0.16.47) under the MIT License. Their licenses and notices for dependencies bundled with markdown-it are in `vendor/`. The release source package also includes the cached upstream npm source archives in `vendor/upstream/`.

PDF.js is loaded from the running Zotero installation. Quick Look and Poppler are optional system tools and are supplied by the operating system or the user.

Reading Shelf is an independent third-party plugin. Zotero is a registered trademark of the Corporation for Digital Scholarship. References to Zotero indicate compatibility. See the [Zotero trademark policy](https://www.zotero.org/support/terms/trademark).

The preferred form for modifying Reading Shelf, its build instructions, and the third-party source archives are in the source distribution accompanying this XPI on the [GitHub Releases page](https://github.com/4season/zotero-reading-shelf/releases).

## Verified upstream licenses / 확인한 원본 라이선스

Verified against the upstream source files on 2026-11-07:

| Project | License source | Relationship to Reading Shelf |
| --- | --- | --- |
| Zotero Syllabus — Jan Baykara and contributors | [AGPLv3 LICENSE](https://github.com/janbaykara/zotero-syllabus/blob/main/LICENSE), blob `dbbe3558157f5861bff35dcb37b328b679b0ccfd` | Gallery implementation lineage and compatibility with the personal reading-order note format / 갤러리 기반 구현 및 읽기 순서 노트 형식 호환 |
| ZoteroThumbLibrary — Guillaume Chapron | [AGPLv3 LICENSE](https://github.com/gchapron/ZoteroThumbLibrary/blob/main/LICENSE), blob `be3f7b28e564e7dd05eaf59d64adba1a4065ac0e` | Usability reference for cover browsing, card sizing and gallery interactions / 표지 탐색·카드 크기·갤러리 사용성 참고 |
| Zotero — Corporation for Digital Scholarship and contributors | [AGPLv3 COPYING](https://github.com/zotero/zotero/blob/main/COPYING), blob `b14d531f57df630c8668473475c602966561c83e` | Host application's APIs and bundled PDF.js; Zotero itself is not bundled / 실행 호스트 API 및 호스트의 PDF.js 사용, 본체 미포함 |

Reading Shelf remains AGPL-3.0-only, with modification notices, attribution, license text, build instructions and matching source supplied alongside the XPI. Bundled MIT-licensed libraries retain their own license/copyright notices. The small `vendor/upstream/` archives are corresponding dependency source, not user data or caches.

Reading Shelf는 AGPL-3.0-only를 유지하며, 수정 고지·출처·라이선스 원문·빌드 방법·XPI에 대응하는 소스를 함께 제공합니다. MIT 라이브러리의 원래 저작권·라이선스 고지도 보존합니다. Zotero의 이름은 호환성 설명에만 사용하며 로고를 복제하지 않았습니다.
