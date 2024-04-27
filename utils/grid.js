function buildGrid() {
  let gridPositions = [];
  for (let x = framePadding; x < width - framePadding + 1; x+=sizeOfCell) {
    for (let y = framePadding; y < height - framePadding + 1; y+=sizeOfCell) {
      gridPositions.push(x, y);
    }
  }
  return gridPositions;
}