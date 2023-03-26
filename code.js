import { fontList } from './fontList.js';

figma.showUI(__html__, {width: 400, height: 600});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'load-fonts') {
    let fonts = await figma.listAvailableFontsAsync();
    let jpFonts = fonts.filter((font) => fontList.hasOwnProperty(font.fontName.family));
    let sortedJpFonts = jpFonts.reduce((acc, font) => {
      const family = font.fontName.family;
      const style = font.fontName.style;
      const existingFont = acc.find(f => f.fontName.family === family);

      if (existingFont) {
        existingFont.styles.push(style);
        existingFont.styles.sort((a, b) => {
          const weightMap = [
            'Thin',
            'UltraLight',
            'ExtraLight',
            'DemiLight',
            'Light',
            'Normal',
            'Regular',
            'Italic',
            'Medium',
            'SemiBold',
            'DemiBold',
            'Bold',
            'ExtraBold',
            'UltraBold',
            'Black',
            'Heavy'
          ];
          const weightA = weightMap.indexOf(a) !== -1 ? weightMap.indexOf(a) : Infinity;
          const weightB = weightMap.indexOf(b) !== -1 ? weightMap.indexOf(b) : Infinity;
          return weightA - weightB;
        });
      } else {
        acc.push({
          fontName: {
            family: family,
          },
          displayName: fontList[family],
          styles: [style],
        });
      }

      return acc;
    }, []).sort((a, b) => a.displayName.localeCompare(b.displayName));

    figma.ui.postMessage({type: 'display-fonts', fonts: sortedJpFonts});
  } else if (msg.type === 'apply-font') {
    const nodes = figma.currentPage.selection;
    if (nodes.length > 0) {
      await figma.loadFontAsync(msg.font.fontName);
      nodes.forEach((node) => {
        if ('fontName' in node) {
          node.fontName = msg.font.fontName;
        }
      });
    }
  }
};
