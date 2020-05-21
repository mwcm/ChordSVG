# ChordSVG 🎸

Render guitar chord diagrams using [SVG.js](https://svgjs.com/)

Replace `<chord>` elements using [JQuery](https://jquery.com/)

Inspired by [Vexchords](https://github.com/0xfe/vexchords) and [ChordJS](https://github.com/acspike/ChordJS)

## Usage


Include the ChordSVG.js script as well as [SVG.js](https://svgjs.com/) and [JQuery](https://jquery.com/):

```
<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.0/dist/svg.min.js"></script>

<script src="./ChordSVG.js"></script>
```


Then include some `<chord>` elements:

```
<chord name = "D" positions="xx0232" fingers="---132"></chord>
<chord name = "A" positions="x07655", fingers="432-1-"> </chord>
<chord name = "C" positions="x32010" fingers="-32-1-"> </chord>
<chord name = "Db" positions="9 11 11 10 9 9" fingers="134211"> </chord>
```


Finally, include a call to `ChordSVG.replace();`:

```
<script type="text/javascript">//<![CDATA[
  $(document).ready(function(){
  ChordSVG.replace();
  });
//]]>
</script>
```

Diagrams will be generated corresponding to your `<chord>` elements:
