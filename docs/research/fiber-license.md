# React Three Fiber licence verification

Verified 2026-09-04. `@react-three/fiber@9.7.0` is MIT-licensed in both its published manifest and its own source `LICENSE`. The npm archive omits the licence file, so an exact copy from the published source revision is retained in [licenses/react-three-fiber-LICENSE](licenses/react-three-fiber-LICENSE). [Pinned upstream licence](https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/LICENSE), [pinned package manifest](https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/packages/fiber/package.json).

The npm registry identifies `0a107412ac64667b1908422e859447952f57feef` as this version's `gitHead`. Its manifest at that revision confirms the package name, version `9.7.0`, and `license: MIT`. The repository's own licence reads `MIT License`, attributes copyright to `2019-2025 Poimandres`, and contains the standard permissive grant and notice condition. [npm version metadata](https://registry.npmjs.org/@react-three%2ffiber/9.7.0), [upstream licence](https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/LICENSE).

All 37 files in the published archive were inspected. No file path contains `license`, `licence`, `notice`, or `copying`, and no file contains a complete MIT grant. Bundled React reconciler files carry MIT attribution headers for Meta Platforms; those are third-party notices and do not replace Fiber's own licence. [Published npm archive](https://registry.npmjs.org/@react-three/fiber/-/fiber-9.7.0.tgz).

| Evidence | Verified value |
|---|---|
| Gzipped npm archive | 508,147 bytes |
| Unpacked size | 2,188,429 bytes |
| Archive SHA-1 | `3cb620eafe7ed39540d3ebef4280c7827966c206` |
| Archive integrity | `sha512-EWm9FwcaOZQu/ExFW5rggoCMM1NJet5YbxVxKaOE+KSncrjU0Wx7017qSyGFvupviK89nMYGCWU3BIK4dI1clw==` |
| Licence source commit | `0a107412ac64667b1908422e859447952f57feef` |
| Licence Git blob | `493cfb3c8335c31bea327e0e27a8cb22004111d7` |
| Saved licence SHA-256 | `9c35b5de7b7493a707fffe4eb23bd2f7f449153c1911f7c6eefb4e591fd5349a` |

The archive measurements came from the local copy of the published tarball; its hash matches npm metadata. The saved licence was fetched through GitHub's contents endpoint at the exact commit and decoded without altering its bytes. [Archive metadata](https://registry.npmjs.org/@react-three%2ffiber/9.7.0), [licence source](https://api.github.com/repos/pmndrs/react-three-fiber/contents/LICENSE?ref=0a107412ac64667b1908422e859447952f57feef).

Reproduction with Node 22.22.1 selected:

```sh
npm view @react-three/fiber@9.7.0 gitHead repository license dist --json
tar -tzf react-three-fiber-9.7.0.tgz
tar -xOf react-three-fiber-9.7.0.tgz package/package.json
gh api 'repos/pmndrs/react-three-fiber/contents/LICENSE?ref=0a107412ac64667b1908422e859447952f57feef' --jq '.content' | base64 --decode
```

No package installation or execution was needed for this licence check. Keep the retained upstream notice with release licence records because the npm archive does not supply it.
