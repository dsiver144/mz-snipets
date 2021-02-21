/*~struct~SoundEffect:
 * @param name
 * @type file
 * @dir audio/se/
 * @desc Choose the name of SE you want to use.
 *
 * @param volume
 * @default 70
 * @desc Choose the volume value of the se
 * 
 * @param pitch
 * @default 100
 * @desc Choose the pitch value of the se
 * 
 * @param pan
 * @default 0
 * @desc Choose the pan value of the se
 * 
 */
// Draw Sprite Texture To A Bitmap.
PluginManager.parseSE = function(param) {
    param = JSON.parse(param);
    param.volume = parseInt(param.volume);
    param.pitch = parseInt(param.pitch);
    param.pan = parseInt(param.pan);
};

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

// Scene Template
function Scene_Custom() {
    this.initialize.apply(this, arguments);
}

Scene_Custom.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Custom.prototype.constructor = Scene_Custom;
Scene_Custom.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Custom.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
};

// MV Plugin Command

var DSI_FG_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    DSI_FG_Game_Interpreter_pluginCommand.apply(this, arguments);
    
}