var ChordSVG = (function () {
  if (typeof SVG === "undefined" || SVG === null) {
    console.error(
      "ChordSVG: SVG.js requirement not satisfied, SVG  is undefined!"
    );
  }
  if (typeof $ === "undefined" || $ === null) {
    console.error(
      "ChordSVG: JQuery requirement not satisfied, $ is undefined!"
    );
  }

  var ChordBox = function (canvas, params) {
    var _canvas = canvas;
    var _params = {
      ...{
        chordName: "",
        numStrings: 6,
        numFrets: 3,
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

    //revisit
    var _width = _params.width * 0.75;
    var _height = _params.height * 0.90;

    // Initialize scaled-spacing
    var _numStrings = 6;
    var _numFrets = _params.numFrets;
    var _spacing = _params.width / _params.numStrings;
    var _fretSpacing = _height / (_params.numFrets *2);

    var _metrics = {
      circleRadius: _width / 20,
      barreRadius: _width / 25,
      fontSize: _params.fontSize || Math.ceil(_width / 8),
      barShiftX: _width / 28,
      bridgeStrokeWidth: Math.ceil(_height / 36),
    };

    // Add room on sides for finger positions on 1. and 6. string
    var _x = _params.x + _params.width * 0.15 + _spacing / 2;
    var _y = _metrics.fontSize * 3;

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
      return DrawText(_x + (_spacing * (_numStrings / 2)) - (_spacing/2), 0, name);
    };
    var CreateImage = function (positions, fingerings, minFrets) {

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

      // skip drawing the bridge if any notes are higher than the # of frets
      if (
        !positions.some(
          (el) => el != ("x" || "-") && Number(el) > _numFrets
        )
      ) {
        const fromX = _x - 1;
        const fromY = _y - _metrics.bridgeStrokeWidth -1;
        _canvas
          .rect(1 + _x + _spacing * (_numStrings - 1) - fromX, _y - fromY)
          .move(fromX, fromY + 3)
          .stroke({ width: 0 })
          .fill(_params.bridgeColor);
      } else {
        // TODO: how 2 calculate lowest fret # to show reliably?
        //    - wip
        //    - remember to replace 1 here
        // Draw position number
        DrawText(_x + _spacing * _numStrings - _spacing * 0.5, _y, 1);
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

      // TODO: Come back to this later, shouldn't have to explicitly provide
      // Draw barres
      // for (let i = 0; i < _barres.length; i += 1) {
      //     _lightBar(_barres[i].fromString, _barres[i].toString, _barres[i].fret);
      // }
    };

    var LightUp = function ({ string, fret, label }) {

      const mute = fret === "x";
      // const fretNum = fret === "x" ? 0 : fret - shiftPosition;
      // const fretNum = fret === "x" ? 0 : fret - shiftPosition;
      const fretNum = fret === "x" ? 0 : fret;

      const x = _x + _spacing * string;
      let y = _y + _fretSpacing * parseInt(fretNum);

      console.log(fretNum, y)
      const fontSize = _metrics.fontSize * 0.55;
      const textYShift = fontSize * 0.66;

      if (!mute) {
        if (fretNum == 0) {
        _canvas
          .circle()
          .move(x, y - _fretSpacing/ 2)
          .radius(_params.circleRadius || _metrics.circleRadius)
          .stroke({ color: _params.strokeColor, width: _params.strokeWidth })
          .fill(_params.bgColor);
        } else {
        _canvas
          .circle()
          .move(x, y - _fretSpacing/ 2)
          .radius(_params.circleRadius || _metrics.circleRadius)
          .stroke({ color: _params.strokeColor, width: _params.strokeWidth })
          .fill(_params.strokeColor);
        }
      } else {
        y -= _metrics.bridgeStrokeWidth;
        DrawText(x, y - (_fretSpacing / 2) - textYShift * 2, "X");
      }

      if (label && label != "r") {
        const fontSize = _metrics.fontSize * 0.55;
        const textYShift = fontSize * 0.66;

        DrawText(x - 0.5, y - _fretSpacing / 2 - textYShift, label, {
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

  var DrawChordSVG = function (ele, name, positions, fingerings) {

    var usedFrets = positions
      .filter((ele) => !isNaN(parseInt(ele)) && parseInt(ele) != 0)
      .map((x) => parseInt(x));
    var minFret = Math.min(...usedFrets);
    var maxFret = Math.max(...usedFrets);

    // adjust numFrets params to show all frets used by chord (min 3 frets shown)
    var minNumFrets = (maxFret - minFret) + 1;
    var numFrets = minNumFrets >= 3 ? minNumFrets : 3;

    // TODO: add ability to input in <chord>
    var height  = 120;
    var width = 100;

    var canvas = SVG().addTo(ele).size(height, width);
    ele.setAttribute("class", "rendered-chord");

    var params = { chordName: name, numFrets: numFrets,
                   height: height, width: width};

    var chordObj = ChordBox(canvas, params);
    chordObj.Draw(positions, fingerings, minFret);
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

      var parsedPositions = ParsePositions(positions);
      console.log("parsed positions: %s", parsedPositions);
      if (parsedPositions === null) {
        // TODO: draw error to canvas?
        console.error("invalid positions, abandoning Draw operation...");
        return;
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
