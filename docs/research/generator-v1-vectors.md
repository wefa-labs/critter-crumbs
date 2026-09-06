# Generator version 1: independent fixed-seed vectors

Checked 2026-09-05. These literal vectors were calculated before the application generator was implemented, using a separate Python unsigned-32-bit reference derived from Design System §5.1–§5.2 and §5.7. The original JavaScript algorithms independently reproduced every 53-bit seed and all 26 random draws under Node 22.22.1; JavaScript also reproduced every layout value exactly. No app/core/shared module or dependency was used.

## Source provenance

Use the original `cyrb53`, not `cyrb53a_beta`. Bryc's source carries a public-domain dedication, with MIT offered if needed, and asks for attribution. The inspected file is pinned to revision `88c1317ea6f9b25c153afa9c369c365fed11b482`; its SHA-256 is `24d9ecaf766a099ad78a9c0337d80be9262494049611c9e19b92d742c7426707`. Retain a short attribution and source link beside the inlined implementation. [Original cyrb53 source](https://github.com/bryc/code/blob/88c1317ea6f9b25c153afa9c369c365fed11b482/jshash/experimental/cyrb53.js)

Mulberry32 was written by Tommy Ettinger in 2017. His original C publication dedicates it to the public domain under CC0; the inspected gist revision is `fc93b8ad259c09a3635d80ed12a05309120795dc`. Bryc's JavaScript port separately states that it is public domain. The inspected PRNG collection at the same Bryc revision has SHA-256 `432df82ca72e71f1e73c98b7cb15ea6c3e9f482c6940bbaf7a27b1a70559bd76`. The chosen port coerces its state to 32 bits before each addition. [Original Mulberry32 publication](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c/fc93b8ad259c09a3635d80ed12a05309120795dc), [JavaScript port and terms](https://github.com/bryc/code/blob/88c1317ea6f9b25c153afa9c369c365fed11b482/jshash/PRNGs.md#mulberry32)

These are identity-generation algorithms. Preserve the spec's selected version; encryption salts and other cryptographic randomness continue to use the cryptographic randomness seam.

## Interpretation pinned by the vectors

The seed text is the lowercase input, a colon, the decimal variant, and `:1`. `cyrb53` returns an exact 53-bit integer; the Mulberry32 state uses its low 32 bits. Each parameter consumes exactly one draw, in the table's order, even when an earlier choice makes that parameter visually unused. The option vector therefore still consumes `earSize` and `earSpread` draws when `earType` is `none`.

A uniform draw uses `low + (high - low) * u`, where `u` is the unsigned random word divided by `4294967296`. A weighted choice uses `u * sum(weights)` and takes the first cumulative upper bound strictly greater than that value. Equal choices preserve the listed option order; cheeks is `u < 0.30`.

Size parameters described as fractions remain dimensionless ratios in `params`. In particular, `headSize`, `earSize`, `eyeSize`, `pupilSize`, and `legLength` are not multiplied by their parent size while drawing. The §5.7 layout applies the body/head factors once, in the exact expression order printed in the spec. Degrees remain degrees. The `markings` value `belly patch` retains the table's spelling.

The public seam fixtures should compare the literal `params` and `layout` objects. The seed and random-word fields below are provenance for diagnosing a mismatch, not new private test surfaces. Layout output uses the §5.7 names (`yF`, `bh`, `bw`, `leg`, `bodyC`, `hr`, `headC`, `earLen`).

## Literal vectors

```json
[
  {
    "input": "0x0000000000000000000000000000000000000001",
    "variant": 0,
    "seedText": "0x0000000000000000000000000000000000000001:0:1",
    "seed53": 1292175895854904,
    "seed32": 625114936,
    "drawsUint32": [
      2476268608,
      3627631492,
      3462846245,
      1187718239,
      3761600727,
      1960789269,
      2124682030,
      3145070960,
      3556901777,
      1072024240,
      3946675744,
      3145718126,
      3800509320,
      3363248570,
      1876609497,
      3361327097,
      1575415528,
      47493732,
      3542515391,
      1152628096,
      107405266,
      1883936901,
      3543050113,
      532078798,
      3840487420,
      524475869
    ],
    "params": {
      "bodyShape": "bean",
      "bodyHeight": 1.1878495100885629,
      "bodyWidth": 1.0725026880390942,
      "belly": 0.08296116061974317,
      "headShape": "squarish",
      "headSize": 0.6004370020655915,
      "headTilt": -0.08494264632463455,
      "earType": "tufts",
      "earSize": 0.44500983364880087,
      "earSpread": 44.98400375247002,
      "eyeStyle": "half-lid",
      "eyeSize": 0.17324195760302247,
      "eyeSpacing": 0.5854625093564392,
      "eyeHeight": 0.5831214459845796,
      "pupilSize": 0.5592330492683686,
      "snout": "muzzle",
      "cheeks": false,
      "armType": "stubs",
      "legLength": 0.3149612277280539,
      "tailType": "none",
      "markings": "none",
      "hue": 157.90976685471833,
      "chroma": 0.11774514468153939,
      "lightness": 0.602299164822325,
      "accentShift": 41.825494738295674,
      "idlePhase": 0.12211405416019261
    },
    "layout": {
      "yF": 1.1,
      "bh": 0.6533172305487096,
      "bw": 0.5362513440195471,
      "leg": 0.37412654005366114,
      "bodyC": 0.8777931545809063,
      "hr": 0.3566143993713291,
      "headC": 1.802137328651826,
      "earLen": 0.571308892347608
    }
  },
  {
    "input": "0x0000000000000000000000000000000000000001",
    "variant": 4,
    "seedText": "0x0000000000000000000000000000000000000001:4:1",
    "seed53": 6269289476856596,
    "seed32": 3024296724,
    "drawsUint32": [
      1937598066,
      1340984449,
      2084662467,
      1966288001,
      4102575620,
      205230236,
      4214975254,
      3055321358,
      1996400213,
      1275953567,
      1321746117,
      104073081,
      2781356198,
      1098454799,
      4280224134,
      311054167,
      1829672181,
      1280837465,
      2854219766,
      673300702,
      2216750812,
      1741481124,
      1618927653,
      2752611071,
      995078884,
      1382505651
    ],
    "params": {
      "bodyShape": "bean",
      "bodyHeight": 0.9748889089561998,
      "bodyWidth": 0.9441493215970694,
      "belly": 0.13734363026451318,
      "headShape": "squarish",
      "headSize": 0.5105124553479254,
      "headTilt": 7.702006421983242,
      "earType": "tufts",
      "earSize": 0.328743406906724,
      "earSpread": 46.883243611082435,
      "eyeStyle": "round",
      "eyeSize": 0.10242314024362714,
      "eyeSpacing": 0.5142754861433059,
      "eyeHeight": 0.49347816943889483,
      "pupilSize": 0.6991418350255116,
      "snout": "none",
      "cheeks": false,
      "armType": "stubs",
      "legLength": 0.2829099650494754,
      "tailType": "none",
      "markings": "none",
      "hue": 145.96926156431437,
      "chroma": 0.0863855177233927,
      "lightness": 0.6953605973301455,
      "accentShift": 21.950545711442828,
      "idlePhase": 0.32188968057744205
    },
    "layout": {
      "yF": 1.1,
      "bh": 0.5361888999259099,
      "bw": 0.4720746607985347,
      "leg": 0.2758057871599197,
      "bodyC": 0.7016723722218617,
      "hr": 0.24884646530134485,
      "headC": 1.4269845857767935,
      "earLen": 0.29450388527949595
    }
  },
  {
    "input": "0xabababababababababababababababababababababababababababababababab",
    "variant": 0,
    "seedText": "0xabababababababababababababababababababababababababababababababab:0:1",
    "seed53": 6961054441988065,
    "seed32": 3376865249,
    "drawsUint32": [
      230178565,
      3178144805,
      2086495485,
      299621408,
      2359986474,
      956041260,
      30804034,
      3967924282,
      4031463844,
      1056921325,
      4162159940,
      1265379557,
      1229423036,
      318049801,
      3003966953,
      2695547022,
      1999179327,
      2006790613,
      332862898,
      3198636610,
      2900400919,
      461130600,
      1041996888,
      784950664,
      1256935886,
      4258716968
    ],
    "params": {
      "bodyShape": "egg",
      "bodyHeight": 1.1459878002293409,
      "bodyWidth": 0.9443200347013772,
      "belly": 0.020928313583135603,
      "headShape": "egg",
      "headSize": 0.5489710544236004,
      "headTilt": -7.885246030986309,
      "earType": "none",
      "earSize": 0.4803674629330635,
      "earSpread": 44.84334689565003,
      "eyeStyle": "half-lid",
      "eyeSize": 0.12946191367227586,
      "eyeSpacing": 0.40587420703843236,
      "eyeHeight": 0.4625887957797386,
      "pupilSize": 0.6248538897954858,
      "snout": "button",
      "cheeks": false,
      "armType": "stubs",
      "legLength": 0.16550013655796647,
      "tailType": "curl",
      "markings": "belly patch",
      "hue": 38.651520386338234,
      "chroma": 0.07698261642828584,
      "lightness": 0.6128969023004174,
      "accentShift": 23.779595741070807,
      "idlePhase": 0.9915598127990961
    },
    "layout": {
      "yF": 1.25,
      "bh": 0.716242375143338,
      "bw": 0.4721600173506886,
      "leg": 0.18966113743171953,
      "bodyC": 0.8300390576023697,
      "hr": 0.3145570655242418,
      "headC": 1.7853448025441314,
      "earLen": 0.543970726248778
    }
  }
]
```

## Reproduction evidence

Temporary research files:

- `/private/tmp/critter-generator-v1-reference.py`: independent Python reference, SHA-256 `f81133462c3faf6e1be1b36c5222e9bd54963736b139097b2312e9864b38719f`.
- `/private/tmp/critter-generator-v1-vectors.json`: literal output, SHA-256 `d797f87b94e465e821137d1216f0aad970987d7935564dce5ba8b51c6b5eb626`.
- `/private/tmp/critter-generator-v1-js-check.cjs`: source-derived JavaScript seed/draw/layout cross-check, with no project imports.

Commands run successfully:

```sh
python3 /private/tmp/critter-generator-v1-reference.py
/Users/afo/.local/share/mise/installs/node/22.22.1/bin/node /private/tmp/critter-generator-v1-js-check.cjs
```

The second command reported `hashAnd26DrawsMatch: true` and `layoutMatchesExactly: true` for all three vectors. Permanent generator seam tests must preserve these literal expected outputs; they must not compute their expectations by calling the implementation under test.
