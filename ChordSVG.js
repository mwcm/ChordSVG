/*
 * ChordSVG
 * Copyright (C) 2020 Morgan Mitchell
 *
 * Based On:
 * Vex Chords v2 https://github.com/0xfe/vexchords
 * Copyright (C) 2019 Mohit Muthanna Cheppudira
 *
 * ChordJS https://github.com/acspike/ChordJS
 * Copyright (C) 2012 Aaron Spike [aaron@ekips.org]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var ChordSVG = (function () {
  if (typeof SVG === "undefined" || SVG === null) {
    console.error(
      "ChordSVG: SVG.js requirement not satisfied, SVG  is undefined!"
    );
  }

  var ChordBox = function (canvas, params) {
    var _canvas = canvas;
    var _params = {
      ...{
        chordName: "",
        numStrings: 6,
        numFrets: 4,
        height: 100,
        width: 120,
        x: 0,
        y: 0,
        strokeWidth: 1,
        showTuning: true,
        defaultColor: "#666",
        bgColor: "#fff",
        labelColor: "#fff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        fontSize: undefined,
        fontStyle: "light",
        fontWeight: "100",
        labelWeight: "100",
        tuning: ["E", "A", "D", "G", "B", "e"],
      },
      ...params,
    };

    // Setup defaults if not specifically overridden
    [
      "nutColor",
      "stringColor",
      "fretColor",
      "strokeColor",
      "textColor",
    ].forEach((param) => {
      _params[param] = _params[param] || _params.defaultColor;
    });

    ["stringWidth", "fretWidth"].forEach((param) => {
      _params[param] = _params[param] || _params.strokeWidth;
    });

    if (
      _params.chordName == null ||
      typeof _params.chordName == "undefined" ||
      _params.chordName.match(/^ *$/)
    ) {
      var _chordName = "";
    } else {
      var _chordName = String(_params.chordName);
    }

    // Size and shift board
    var _width = _params.width;
    var _height = _params.height;

    // TODO: revisit
    var _width = _params.width * 0.75;
    var _height = _params.height * 0.9;

    // Initialize scaled-spacing
    var _numStrings = 6;
    var _numFrets = _params.numFrets;
    var _spacing = _params.width / _params.numStrings;
    var _fretSpacing = _height / (_params.numFrets * 2);

    var _metrics = {
      circleRadius: _width / 20,
      barreRadius: _width / 25,
      fontSize: _params.fontSize || Math.ceil(_width / 8),
      barShiftX: _width / 28,
      nutStrokeWidth: Math.ceil(_height / 24),
    };

    // Add room on sides for finger positions on 1. and 6. string
    var _x = _params.x + _params.width * 0.15;
    var _y = _params.y + _params.height * 0.15 + _metrics.fontSize;

    var DrawText = function (x, y, msg, attrs) {
      const textAttrs = {
        ...{
          family: _params.fontFamily,
          size: _metrics.fontSize,
          style: _params.fontStyle,
          weight: _params.fontWeight,
        },
        ...attrs,
      };

      const text = _canvas
        .text(`${msg}`)
        .stroke(_params.textColor)
        .fill(_params.textColor)
        .font(textAttrs);

      return text.move(x - text.length() / 2, y);
    };

    var DrawLine = function (x, y, newX, newY) {
      return _canvas.line(0, 0, newX - x, newY - y).move(x, y);
    };

    var DrawName = function (name) {
      // draw name of chord centered horizontally
      return DrawText(
        _x + _spacing * (_numStrings / 2) - _spacing / 2,
        0,
        name
      );
    };
    var CreateImage = function (positions, fingerings) {
      var usedFrets = positions
        .filter((ele) => !isNaN(parseInt(ele)) && parseInt(ele) != 0)
        .map((x) => parseInt(x));
      var minFret = Math.min(...usedFrets);
      var maxFret = Math.max(...usedFrets);

      // adjust numFrets params to show all frets used by chord (min 3 frets shown)
      var minNumFrets = maxFret - minFret + 1;
      var fretsRequired = minNumFrets >= 3 ? minNumFrets : 3;
      if (fretsRequired > _numFrets) {
        _numFrets = fretsRequired;
        _fretSpacing = _height / (_numFrets * 2);
      }

      // draw name if provided
      if (_chordName.match(/^ *$/) === null) {
        DrawName(_chordName);
      }

      // Draw strings
      for (let i = 0; i < _numStrings; i += 1) {
        DrawLine(
          _x + _spacing * i,
          _y,
          _x + _spacing * i,
          _y + _fretSpacing * _numFrets
        ).stroke({
          width: _params.stringWidth,
          color: _params.stringColor,
        });
      }

      // Draw frets
      for (let i = 0; i < _numFrets + 1; i += 1) {
        DrawLine(
          _x,
          _y + _fretSpacing * i,
          _x + _spacing * (_numStrings - 1),
          _y + _fretSpacing * i
        ).stroke({
          width: _params.fretWidth,
          color: _params.fretColor,
        });
      }

      // skip drawing the nut when showing other sections of the fretboard
      if (
        !positions.some((el) => el != ("x" || "-") && Number(el) > _numFrets)
      ) {
        const fromX = _x - 1;
        const fromY = _y;
        _canvas
          .rect(
            _x + _spacing * (_numStrings - 1) - fromX + 1,
            _metrics.nutStrokeWidth
          )
          .move(fromX, fromY - _metrics.nutStrokeWidth)
          .stroke({ width: 0 })
          .fill(_params.nutColor);
      } else {
        DrawText(_x + _spacing * _numStrings - _spacing * 0.5, _y, minFret);
      }

      // Draw tuning keys
      if (_params.showTuning && _params.tuning.length !== 0) {
        for (
          let i = 0;
          i < Math.min(_numStrings, _params.tuning.length);
          i += 1
        ) {
          DrawText(
            _x + _spacing * i,
            _y + _numFrets * _fretSpacing + _fretSpacing / 12,
            _params.tuning[i]
          );
        }
      }

      console.log(positions);
      // Draw chord
      for (let i = 0; i < positions.length; i += 1) {
        if (
          fingerings[i] != "-" &&
          positions[i] != "0" &&
          positions[i] != "x"
        ) {
          // if fingering[i] is a fretted note draw it
          // to the appropriate fret & string
          LightUp({
            string: i,
            fret: ( _params.numFrets  >= Math.max(...positions) ?  positions[i] : positions[i] - (minFret - 1)),
            label: fingerings[i],
          });
        } else {
          // if fingering[i] is a muted or open note
          // draw it above the nut o the ap
          LightUp({
            string: i,
            fret: positions[i],
            label: "",
          });
        }
      }

      // TODO: Come back to this later, shouldn't have to explicitly provide barres
      // Draw barres
      // for (let i = 0; i < _barres.length; i += 1) {
      //     _lightBar(_barres[i].fromString, _barres[i].toString, _barres[i].fret);
      // }
    };

    var LightUp = function ({ string, fret, label }) {
      const mute = fret === "x";
      const fretNum = fret === "x" ? 0 : fret;

      const x = _x + _spacing * string;
      let y = _y + _fretSpacing * parseInt(fretNum);

      const fontSize = _metrics.fontSize * 0.55;
      const textYShift = fontSize;

      if (!mute) {
        if (fretNum == 0) {
          _canvas
            .circle()
            .move(x, y - _metrics.nutStrokeWidth * 2)
            .radius(_params.circleRadius || _metrics.circleRadius)
            .stroke({ color: _params.strokeColor, width: _params.strokeWidth })
            .fill(_params.bgColor);
        } else {
          _canvas
            .circle()
            .move(x, y - _fretSpacing / 2)
            .radius(_params.circleRadius || _metrics.circleRadius)
            .stroke({ color: _params.strokeColor, width: _params.strokeWidth })
            .fill(_params.strokeColor);
        }
      } else {
        DrawText(x, y - textYShift - _metrics.nutStrokeWidth * 2.2, "X");
      }

      // draw labels
      if (label && label != "r") {
        const fontSize = _metrics.fontSize * 0.55;
        const textYShift = fontSize * 0.66;

        DrawText(x - 0.25, y - _fretSpacing / 2 - textYShift, label, {
          weight: _params.labelWeight,
          size: fontSize,
        })
          .stroke({
            width: 0.7,
            color: fretNum !== 0 ? _params.labelColor : _params.strokeColor,
          })
          .fill(fretNum !== 0 ? _params.labelColor : _params.strokeColor);
      }
      return;
    };

    return {
      Draw: CreateImage,
    };
  };

  var DrawChordSVG = function (ele, name, positions, fingerings, height=260, width=200) {
    var canvas = SVG().addTo(ele).size(height, width);
    ele.setAttribute("class", "rendered-chord");

    var params = { chordName: name, height: height, width: width };

    var chordObj = ChordBox(canvas, params);
    chordObj.Draw(positions, fingerings);
  };

  //requires jQuery
  //example: <chord positions="X02220" fingers="--222-"></chord>
  var Replace = function (baseEl) {
    baseEl = baseEl || "body";

    var renderedChords = document
      .querySelector(baseEl)
      .getElementsByClassName("rendered-chord");
    for (var i = 0, l = renderedChords.length; i < l; ++i) {
      var elt = renderedChords[0];
      elt.remove();
    }

    var ParsePositions = function (positions) {
      if (
        positions == null ||
        typeof positions == "undefined" ||
        positions.match(/^ *$/)
      ) {
        console.warn("invalid positions format %s", positions);
        return null;
      }

      if (positions.length > 6) {
        if (positions.split(" ").length !== 6) {
          console.warn("invalid positions format %s", positions);
          return null;
        }
        return positions.split(" ");
      } else if (positions.length === 6) {
        return positions.split("");
      } else {
        console.warn("invalid positions format %s", positions);
        return null;
      }
    };

    var chords = document.getElementsByTagName("chord");
    for (var i = 0; i < chords.length; ++i) {
      var elt = chords[i];
      var positions = elt.getAttribute("positions");
      var fingers = elt.getAttribute("fingers");
      var name = elt.getAttribute("name");

      // TODO: add width & height

      var parsedPositions = ParsePositions(positions);
      if (parsedPositions === null) {
        // TODO: draw error to canvas?
        console.error("invalid positions, abandoning Draw operation...");
        continue;
      }

      DrawChordSVG(elt, name, parsedPositions, fingers);
    }
  };

  return {
    chord: ChordBox,
    replace: Replace,
    generate: DrawChordSVG,
  };
})();

var chords = ChordSVG;
