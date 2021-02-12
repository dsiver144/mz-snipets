// Draw Sprite Texture To A Bitmap.

var sprite = new Sprite(new Bitmap(pw, ph));
sourceBitmap.addLoadListener(()=>{
    sprite.bitmap.blt(bitmap, sx, sy, sw, sh, 0, 0);
    sprite.setColorTone([50, -50, -50, 100]);
    const renderTexture = PIXI.RenderTexture.create(pw, height);
    const renderer = Graphics.app.renderer;
    renderer.render(sprite, renderTexture);
    const canvas = renderer.extract.canvas(renderTexture);
    targetBitmap.context.drawImage(canvas, dx, dy);
})