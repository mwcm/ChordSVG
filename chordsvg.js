var ChordSVG = (function () {
  var ChordBox = function (canvas, params) {
    var _canvas = canvas;
    var _params = {
      ...{
        numStrings: 6,
        numFrets: 5,
        x: 0,
        y: 0,
        width: 100,
        height: 120,
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
      "bridgeColor",
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

    // Size and shift board
    var _width = _params.width * 0.75;
    var _height = _params.height * 0.75;

    // Initialize scaled-spacing
    var _numStrings = _params.numStrings;
    var _numFrets = _params.numFrets;
    var _spacing = _params.width / _params.numStrings;
    var _fretSpacing = _params.height / (_params.numFrets + 2);

    // Add room on sides for finger positions on 1. and 6. string
    var _x = _params.x + _params.width * 0.15 + _spacing / 2;
    var _y = _params.y + _params.height * 0.15 + _fretSpacing;

    var _metrics = {
      circleRadius: _width / 20,
      barreRadius: _width / 25,
      fontSize: _params.fontSize || Math.ceil(_width / 8),
      barShiftX: _width / 28,
      bridgeStrokeWidth: Math.ceil(_height / 36),
    };

    var DrawText = function (x, y, msg, attrs) {
      // console.log(x, y, msg, attrs);
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
      // console.log(x, y, newX, newY);
      return _canvas.line(0, 0, newX - x, newY - y).move(x, y);
    };

    var CreateImage = function (positions, fingerings) {
      if (_params.tuning.length === 0) {
        _fretSpacing = _height / (_numFrets + 1);
      }
      // const { spacing } = _spacing;
      // const { fretSpacing } = _fretSpacing;

      // draw the bridge if there is a note higher than fret 5
      if (!Array.from(positions).some((el) => el != "x" && Number(el) > 5)) {
        const fromX = _x;
        const fromY = _y - _metrics.bridgeStrokeWidth;
        _canvas
          .rect(_x + _spacing * (_numStrings - 1) - fromX, _y - fromY)
          .move(fromX, fromY)
          .stroke({ width: 0 })
          .fill(_params.bridgeColor);
      } else {
        // TODO: is there a way to calculate position?
        // Draw position number
        // _drawText(_x - _spacing / 2 - _spacing * 0.1, _y + _fretSpacing * position, position);
      }

      // Draw strings
      for (let i = 0; i < _numStrings; i += 1) {
        // console.log(_x, _y, _spacing, _spacing, _numFrets, _fretSpacing);
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

      // Draw chord
      for (let i = 0; i < positions.length; i += 1) {
        // Light up string, fret, and optional label.
        if (fingerings[i] != "-") {
          LightUp({
            string: i,
            fret: positions[i],
            label: fingerings[i],
          });
        } else {
          LightUp({
            string: i,
            fret: positions[i],
          });
        }
      }

      // TODO: Come back to _ check how it's interpreted in chordjs
      // Draw barres
      // for (let i = 0; i < _barres.length; i += 1) {
      //     _lightBar(_barres[i].fromString, _barres[i].toString, _barres[i].fret);
      // }
    };

    var LightUp = function ({ string, fret, label }) {
      // const shiftPosition =
      //   _position === 1 && _positionText === 1 ? _positionText : 0;

      const mute = fret === "x";
      // const fretNum = fret === "x" ? 0 : fret - shiftPosition;
      const fretNum = fret === "x" ? 0 : fret;

      const x = _x + _spacing * string;
      let y = _y + _fretSpacing * fretNum;

      if (fretNum === 0) {
        y -= _metrics.bridgeStrokeWidth;
      }
      console.log(string, fret);

      if (!mute) {
        _canvas
          .circle()
          .move(x, y - _fretSpacing / 2)
          .radius(_params.circleRadius || _metrics.circleRadius)
          .stroke({ color: _params.strokeColor, width: _params.strokeWidth })
          .fill(fretNum > 0 ? _params.strokeColor : _params.bgColor);
      } else {
        DrawText(x, y - _fretSpacing, "X");
      }

      if (label) {
        const fontSize = _metrics.fontSize * 0.55;
        const textYShift = fontSize * 0.66;

        DrawText(x, y - _fretSpacing / 2 - textYShift, label, {
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

  var DrawChordToCanvas = function (ele, positions, fingerings) {
    // TODO: make constants
    var canvas = SVG().addTo(ele).size(400, 480);
    ele.setAttribute("class", "rendered-chord");
    var chordObj = ChordBox(canvas);
    chordObj.Draw(positions, fingerings);
    // return canvas;
  };

  //requires jQuery
  //example: <chord name="A" positions="X02220" fingers="--222-"></chord>
  var Replace = function (baseEl) {
    baseEl = baseEl || "body";

    var renderedChords = document
      .querySelector(baseEl)
      .getElementsByClassName("rendered-chord");
    for (var i = 0, l = renderedChords.length; i < l; ++i) {
      var elt = renderedChords[0];
      elt.remove();
    }

    var chords = document.getElementsByTagName("chord");
    for (var i = 0; i < chords.length; ++i) {
      var elt = chords[i];
      var positions = elt.getAttribute("positions");
      var fingers = elt.getAttribute("fingers");

      DrawChordToCanvas(elt, positions, fingers);
    }
  };

  return {
    chord: ChordBox,
    replace: Replace,
    generate: DrawChordToCanvas,
  };
})();

var chords = ChordSVG;
