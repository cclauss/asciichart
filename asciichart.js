"use strict";

(function (exports) {

    // color indices

    exports.black = 0
    exports.red = 1,
    exports.green = 2
    exports.yellow = 3
    exports.blue = 4
    exports.magenta = 5
    exports.cyan = 6
    exports.lightgray = 7
    exports.default = 9
    exports.darkgray = 60
    exports.lightred = 61
    exports.lightgreen = 62
    exports.lightyellow = 63
    exports.lightblue = 64
    exports.lightmagenta = 65
    exports.lightcyan = 66
    exports.white = 67

    // control sequences for coloring

    exports.escape = "\x1b["
    exports.end = "m"
    exports.reset = exports.escape + "0" + exports.end

    function colored (char, color) {
        // do not color it if color is not specified
        if (color === undefined) {
            return char;
        } else if (Array.isArray (color)) {
            let foreground = 30 + ((color[0] === undefined) ? exports.default : color[0])
            let background = 40 + ((color[1] === undefined) ? exports.default : color[1])
            foreground = foreground.toString ()
            background = background.toString ()
            return exports.escape + foreground + ';' + background + exports.end + char + exports.reset
        } else {
            let foreground = (30 + color).toString ()
            return exports.escape + foreground + exports.end + char + exports.reset
        }
    }

    exports.colored = colored

    exports.plot = function (series, cfg = undefined) {
        // this function takes oth one array and array of arrays
        // if an array of numbers is passed it is transfored to
        // an array of exactly one array with numbers
        if (typeof(series[0]) == "number"){
            series = [series]
        }

        let min = series[0][0]
        let max = series[0][0]

        for (let j = 0; j < series.length; j++) {
            for (let i = 0; i < series[j].length; i++) {
                min = Math.min(min, series[j][i])
                max = Math.max(max, series[j][i])
            }
        }

        let defaultSymbols = [ '┼', '┤', '╶', '╴', '─', '╰', '╭', '╮', '╯', '│' ]
        let range   = Math.abs (max - min)
        cfg         = (typeof cfg !== 'undefined') ? cfg : {}
        let offset  = (typeof cfg.offset  !== 'undefined') ? cfg.offset  : 3
        let padding = (typeof cfg.padding !== 'undefined') ? cfg.padding : '           '
        let height  = (typeof cfg.height  !== 'undefined') ? cfg.height  : range
        let colors  = (typeof cfg.colors !== 'undefined') ? cfg.colors : []
        let ratio   = range !== 0 ? height / range : 1;
        let min2    = Math.round (min * ratio)
        let max2    = Math.round (max * ratio)
        let rows    = Math.abs (max2 - min2)
        let width = 0
        for (let i = 0; i < series.length; i++) {
            width = Math.max(width, series[i].length)
        }
        width = width + offset
        let symbols = (typeof cfg.symbols !== 'undefined') ? cfg.symbols : defaultSymbols
        let format  = (typeof cfg.format !== 'undefined') ? cfg.format : function (x) {
            return (padding + x.toFixed (2)).slice (-padding.length)
        }

        let result = new Array (rows + 1) // empty space
        for (let i = 0; i <= rows; i++) {
            result[i] = new Array (width)
            for (let j = 0; j < width; j++) {
                result[i][j] = ' '
            }
        }
        for (let y = min2; y <= max2; ++y) { // axis + labels
            let label = format (rows > 0 ? max - (y - min2) * range / rows : y, y - min2)
            result[y - min2][Math.max (offset - label.length, 0)] = label
            result[y - min2][offset - 1] = (y == 0) ? symbols[0] : symbols[1]
        }

        for (let j = 0; j < series.length; j++) {
            let currentColor = colors[j % colors.length]
            let y0 = Math.round (series[j][0] * ratio) - min2
            result[rows - y0][offset - 1] = colored(symbols[0], currentColor) // first value

            for (let x = 0; x < series[j].length - 1; x++) { // plot the line
                let y0 = Math.round (series[j][x + 0] * ratio) - min2
                let y1 = Math.round (series[j][x + 1] * ratio) - min2
                if (y0 == y1) {
                    result[rows - y0][x + offset] = colored(symbols[4], currentColor)
                } else {
                    result[rows - y1][x + offset] = colored((y0 > y1) ? symbols[5] : symbols[6], currentColor)
                    result[rows - y0][x + offset] = colored((y0 > y1) ? symbols[7] : symbols[8], currentColor)
                    let from = Math.min (y0, y1)
                    let to = Math.max (y0, y1)
                    for (let y = from + 1; y < to; y++) {
                        result[rows - y][x + offset] = colored(symbols[9], currentColor)
                    }
                }
            }
        }
        return result.map (function (x) { return x.join ('') }).join ('\n')
    }

}) (typeof exports === 'undefined' ? /* istanbul ignore next */ this['asciichart'] = {} : exports);
