//================================================================
// * Plugin Name    : DSI-Core
// - Last updated   : 04/11/2021
//================================================================
/*:
 * @plugindesc v1.9 A helper plugin for DSI plugins.
 * @author dsiver144
 * 
 * @param showDevTool:bool
 * @text Show Dev Tool On Startup
 * @default true
 * @type boolean
 * @desc true : Show | false: Hide
 * 
 * @param autoUpdate:bool
 * @text Auto Update
 * @type boolean
 * @default true
 * 
*/
/*~struct~PositionObject:
 * @param x:num
 * @desc X position
 * 
 * @param y:num
 * @desc Y Position
 * ex: {"x:num":"228","y:num":"661"}
 */
// Parse SE
var Imported = Imported || {};

Imported.DSI_Core = {};
Imported.DSI_Core.version = 1.9;

aS = function(bitmap) {
    var sprite = new Sprite(bitmap);
    sprite.followMouse(true);
    SceneManager._scene.addChild(sprite);
    SceneManager._scene._lastSprite = sprite;
    return sprite;
}

lS = function() {
    return SceneManager._scene._lastSprite;
};

gS = function() {
    return SceneManager._scene;
}

// Update To Lastest Version.
PluginManager.checkForNewVersion = function() {
    const http = require('https');
    const fs = require('fs');
    const download = function(url, dest, cb) {
        var file = fs.createWriteStream(dest);
        http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                if (cb)
                    cb.call(this, file);
                file.close();
            });
        });
    };
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    const versionPath = path.join(base, "js/") + "dsi_core.version";
    const pluginPath = path.join(base, "js/plugins/") + "DSI-Core.js";
    download('https://raw.githubusercontent.com/dsiver144/mz-snipets/main/CoreVersion.txt', versionPath, ()=>{
        const version = fs.readFileSync(versionPath, {encoding: "utf-8"});
        if (Number(version) > Imported.DSI_Core.version) {
            download('https://raw.githubusercontent.com/dsiver144/mz-snipets/main/DSI-Core.js', pluginPath, ()=>{
                console.warn("UPDATED: DSI-Core to version: " + version);
            });
        } else {
            console.warn("DSI-Core is up to date! " + version);
        }
    })
};
// Parse Plugin Parameters
PluginManager.processParameters = function(paramObject) {
    paramObject = JsonEx.makeDeepCopy(paramObject);
    for (k in paramObject) {
        if (k.match(/(.+):(\w+)/i)) {
            var value = paramObject[k];
            delete paramObject[k];
            const paramName = RegExp.$1;
            const paramType = RegExp.$2;
            switch(paramType) {
                case 'struct':
                    value = JSON.parse(value);
                    value = PluginManager.processParameters(value);
                    break;
                case 'arr_struct':
                    var array = JSON.parse(value);
                    value = [];
                    for (let i = 0; i < array.length; i++) {
                        var rawStruct = JSON.parse(array[i]);
                        rawStruct = PluginManager.processParameters(rawStruct);
                        value.push(rawStruct)
                    }
                    break;
                case 'num': case 'number':
                    value = Number(value);
                    break;
                case 'arr': case 'note': case 'array':
                    value = JSON.parse(value);
                    break;
                case 'arr_num':
                    value = JSON.parse(value).map(n => Number(n));
                    break;
                case 'bool':
                    value = value === 'true';
                    break;
                case 'vec': case 'vector':
                    value = value.split(",").map(n => Number(n));
                    break;
                case 'vec_str':
                    value = value.split(",");
                    break;
            }
            paramObject[paramName] = value;
        }
    }
    return paramObject;
};

Imported.DSI_Core.params = PluginManager.processParameters(PluginManager.parameters('DSI-Core'));
Imported.DSI_Core.params.autoUpdate = Imported.DSI_Core.params.autoUpdate || true;
if (Imported.DSI_Core.params.autoUpdate && Utils.isOptionValid("test")) {
    try {
        PluginManager.checkForNewVersion();
    } catch(e) {
        console.warn("Can't not update DSI-Core!");
    }
}

// Parse SE
PluginManager.parseSE = function(param) {
    param = JSON.parse(param);
    param.volume = parseInt(param.volume);
    param.pitch = parseInt(param.pitch);
    param.pan = parseInt(param.pan);
    return param;
};

// Show Dev Tools
Imported.DSI_Core.params.showDevTool = Imported.DSI_Core.params.showDevTool || true;
if (Imported.DSI_Core.params.showDevTool) {
    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
        nw.Window.get().showDevTools();
    }
}


// Return An Random Item From Array
Array.prototype.randomizeItem = function() {
    return this[Math.floor(Math.random() * this.length)];
};
 
var Easing = Easing || {}
Easing.easeInOutExpo = function(t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
}
Easing.easeOutExpo = function(t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}
Easing.easeInOutQuad = function(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
}
Easing.easeLinear = function(t, b, c, d) {
    return c * t / d + b;
}
Easing.easeOutSine = function(t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}
Easing.easeInCirc = function(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
}
Easing.easeInCubic = function(t, b, c, d) {
    return c * (t /= d) * t * t + b;
}
Easing.easeInOutCubic = function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}
Easing.easeInOutBack = function(t, b, c, d) {
    s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
}

Bitmap.prototype.drawIcon = function(iconIndex, x, y) {
    const bitmap = ImageManager.loadSystem("IconSet");
    const pw = ImageManager.iconWidth;
    const ph = ImageManager.iconHeight;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    this.blt(bitmap, sx, sy, pw, ph, x, y);
};

Easing.classes = [Sprite, Window];
Easing.classes.forEach(className => {

    className.prototype.followMouse = function(value) {
        if (value === undefined) 
            value = true;
        this._followMouse = value;
    };

    className.allActiveInstances = [];

	var DSI_Core_Sprite_initialize = className.prototype.initialize;
    className.prototype.initialize = function() {
		DSI_Core_Sprite_initialize.apply(this, arguments);
        className.allActiveInstances.push(this);
    };

	var DSI_Core_Sprite_destroy = className.prototype.destroy;
    className.prototype.destroy = function() {
		DSI_Core_Sprite_destroy.call(this);
        className.allActiveInstances.splice(className.allActiveInstances.indexOf(this), 1);
    };

    className.prototype.readDotProperty = function(dotProperties) {
        var result = null;
        for (var i = 0; i < dotProperties.length - 1; i++) {
            if (!result) {
                result = this[dotProperties[i]];
            } else {
                result = result[dotProperties[i]];
            }
        }
        return [result, dotProperties[dotProperties.length - 1]];
    };

    className.prototype.popAnimation = function(scaleValueX, scaleValueY, duration, callback) {
        var originScaleX = this.scale.x;
        var originScaleY = this.scale.y;
        var adjustAnchor = false;
        var lastX = this.x;
        var lastY = this.y;
        if (this.anchor.x !== 0.5) {
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.x += this.width / 2;
            this.y += this.height / 2;

            adjustAnchor = true;
        }
        this.startTween({"scale.x": scaleValueX, "scale.y": scaleValueY}, duration / 2).onFinish(()=>{
            this.startTween({"scale.x": originScaleX, "scale.y": originScaleY}, duration / 2).onFinish(()=>{
                if (adjustAnchor) {
                    this.anchor.x = 0.0;
                    this.anchor.y = 0.0;
                    this.x = lastX;
                    this.y = lastY;
                    this.scale.x = originScaleX;
                    this.scale.y = originScaleY;
                }
                if (callback) callback();
            });
        });
    };

    className.prototype.startTween = function(settings, duration, onFinishCallBack, easingFunction, repeat) {
        if (!easingFunction) {
            easingFunction = Easing.easeLinear;
        }
        if (!repeat) repeat = false;
        var tween = {}
        tween.properties = {}
        for (key in settings) {
            var dotProperties = key.split('.');
            if (dotProperties.length > 1) {
                var dotObj = this.readDotProperty(dotProperties);
                const b = dotObj[0][dotObj[1]];
                const c = settings[key] - b;
                tween.properties[key] = {beginValue: b, changeValue: c};
                tween.properties[key].dotObj = dotObj;
            } else {
                tween.properties[key] = {beginValue: this[key], changeValue: (settings[key] - this[key])}
            }
        }
        tween.frameCount = 0;
        tween.duration = duration;
        tween.onFinishCallBack = onFinishCallBack;
        tween.easingFunction = easingFunction.bind(this);
        tween.repeat = repeat;
        tween.delayCount = 0;
        // Chain functions
        tween.delay = function(frames) {
            this.delayCount = frames;
            console.log(frames);
            return this;
        }
        var self = this;
        tween.ease = function(func) {
            this.easingFunction = func.bind(self);
            return this;
        }
        tween.onFinish = function(func) {
            this.onFinishCallBack = func;
            return this;
        }
        tween.repeatForever = function(bool) {
            this.repeat = bool;
            return this;
        }
        this._tweenObject = tween;
        return tween
    };

    className.prototype.hasTween = function() {
        return !!this._tweenObject;
    };
    
    className.prototype.onUpdate = function(callback) {
        this._onUpdateCallback = callback.bind(this);
    };
    
    className.prototype.removeTween = function() {
        this._tweenObject = undefined;
    };
    
    var DSI_SpriteTween_update = className.prototype.update;
    className.prototype.update = function() {
        DSI_SpriteTween_update.call(this);
        if (this._followMouse) {
            this.x = TouchInput.x;
            this.y = TouchInput.y;
            if (TouchInput.isCancelled() || Input.isTriggered('control')) {
                this._followMouse = false;
                console.log(this.x, this.y);
            }
        }
        if (this._onUpdateCallback) this._onUpdateCallback();
        if (this._tweenObject) {
            const tween = this._tweenObject;
            if (tween.delayCount > 0) {
                tween.delayCount -= 1;
                return;
            }
            if (tween.frameCount < tween.duration) {
                for (property in tween.properties) {
                    var t = tween.frameCount;
                    var b = tween.properties[property].beginValue;
                    var c = tween.properties[property].changeValue;
                    var d = tween.duration;
                    var dotObj = tween.properties[property].dotObj;
                    if (dotObj) {
                        dotObj[0][dotObj[1]] = tween.easingFunction(t, b, c, d);
                    } else {
                        this[property] = tween.easingFunction(t, b, c, d);
                    }
                }
                tween.frameCount += 1;
            } else {
                let callback = tween.onFinishCallBack;
                if (tween.repeat) {
                    tween.frameCount = 0;
                } else {
                    this._tweenObject = undefined;
                }
                if (callback)
                    callback();
            }
        }
    };
})

