let palettes = [
  [278, 18, 86, 337, 22, 100, 338, 31, 100, 208, 26, 100, 209, 36, 100],
  [255, 62, 26, 250, 41, 56, 266, 30, 75, 292, 24, 77, 327, 21, 88],
  [196, 47, 74, 212, 26, 76, 251, 17, 79, 304, 14, 84, 329, 17, 96],
  [67, 4, 89, 0, 0, 80, 262, 14, 75, 295, 31, 58, 341, 37, 23]
  // [346, 84, 61, 42, 100, 70, 164, 95, 43, 195, 83, 38, 195, 83, 16]
];

function getColor(palette, initialColor) {
  h = palettes[palette][initialColor * 3]
  s = palettes[palette][initialColor * 3 + 1]
  b = palettes[palette][initialColor * 3 + 2]
}