//================================================================
// * Plugin Name    : DSI-Core
// - Last updated   : 21/2/2021
//================================================================
/*:
 * @plugindesc v1.0 A helper plugin for DSI plugins.
 * @author dsiver144
*/

// Parse SE
var Imported = Imported || {};
Imported.DSI_Core = 1.0;
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
        if (Number(version) !== Imported.DSI_Core) {
            download('https://raw.githubusercontent.com/dsiver144/mz-snipets/main/DSI-Core.js', pluginPath, ()=>{
                console.warn("UPDATED: DSI-Core to version: " + version);
            });
        } else {
            console.warn("DSI-Core is up to date! " + version);
        }
    })
};
try {
    PluginManager.checkForNewVersion();
} catch(e) {
    console.warn("Can't not update DSI-Core!");
}
// Parse Plugin Parameters
PluginManager.processParameters = function(paramObject) {
    paramObject = JsonEx.makeDeepCopy(paramObject);
    for (k in paramObject) {
        if (k.match(/(.+):(\w+)/i)) {
            value = paramObject[k];
            delete paramObject[k];
            const paramName = RegExp.$1;
            const paramType = RegExp.$2;
            switch(paramType) {
                case 'struct':
                    value = JSON.parse(value);
                    value = PluginManager.processParameters(value);
                    break;
                case 'num': case 'number':
                    value = Number(value);
                    break;
                case 'arr': case 'note': case 'array':
                    value = JSON.parse(value);
                    break;
                case 'vec': case 'vector':
                    value = value.split(",").map(n => Number(n));
                    break;
                case 'str_vec':
                    value = value.split(",");
                    break;
            }
            paramObject[paramName] = value;
            console.log(RegExp.$1, RegExp.$2);
            
        }
    }
    return paramObject;
};

// Parse SE
PluginManager.parseSE = function(param) {
    param = JSON.parse(param);
    param.volume = parseInt(param.volume);
    param.pitch = parseInt(param.pitch);
    param.pan = parseInt(param.pan);
    return param;
};


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

Easing.classes = [Sprite, Window];

Easing.classes.forEach(className => {
    className.prototype.startTween = function(settings, duration, onFinishCallBack, easingFunction, repeat) {
        if (!easingFunction) {
            easingFunction = Easing.easeLinear;
        }
        if (!repeat) repeat = false;
        var tween = {}
        tween.properties = {}
        for (key in settings) {
            tween.properties[key] = {beginValue: this[key], changeValue: (settings[key] - this[key])}
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
    
    className.prototype.onUpdate = function(callback) {
        this._onUpdateCallback = callback.bind(this);
    };
    
    className.prototype.removeTween = function() {
        this._tweenObject = undefined;
    };
    
    var DSI_SpriteTween_update = className.prototype.update;
    className.prototype.update = function() {
        DSI_SpriteTween_update.call(this);
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
                    this[property] = tween.easingFunction(t, b, c, d);
                }
                tween.frameCount += 1;
            } else {
                if (tween.onFinishCallBack) tween.onFinishCallBack.call(this);
                if (tween.repeat) {
                    tween.frameCount = 0;
                } else {
                    this._tweenObject = undefined;
                }
               
            }
        }
    };
})

