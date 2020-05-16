import ChordBox from './chordbox.js'

// TODO: similar to jquery import
import SVG from './node_modules/svg.js';


class ChordSVG{

    constructor(params) {

    }

    drawChordToCanvas(ele, positions, fingerings) {
        var canvas = SVG().insertBefore(ele).size(this.params.width, this.params.height);
        canvas.setAttribute('class', 'rendered-chord');
        var chordObj = ChordBox(canvas).draw(positions, fingerings)
        return canvas;
    }


    //requires jQuery
    //example: <chord name="A" positions="X02220" fingers="--222-"></chord>
    replace(baseEl) {
        baseEl = baseEl || 'body';

        var renderedChords = document.querySelector(baseEl).getElementsByClassName('rendered-chord')
        for(var i=0, l = renderedChords.length; i < l; ++i) {
            var elt = renderedChords[0];
            elt.remove();
        }

        var chords = document.getElementsByTagName('chord');
        for(var i=0; i < chords.length; ++i) {
            var elt = chords[i]
            var positions = elt.getAttribute('positions');
            var fingers = elt.getAttribute('fingers');

            this.drawChordToCanvas(elt, positions, fingers);
        };
    };

}

export default ChordSVG;
