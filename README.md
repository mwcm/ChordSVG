# ChordSVG 🎸

Render guitar chord diagrams using [SVG.js](https://svgjs.com/)
Replace <chord> elements using [JQuery](https://jquery.com/)

## Usage

Include the ChordSVG.js script as well as [SVG,js](https://svgjs.com/) and [JQuery](https://jquery.com/):
```
<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.0/dist/svg.min.js"></script>

<script src="./ChordSVG.js"></script>

<script type="text/javascript">//<![CDATA[
  $(document).ready(function(){
ChordSVG.replace();
  });
//]]>
</script>
```

Then include some `<chord>` elements on your page:

```
    <chord name="D" positions="xx0232" fingers="---132"></chord>
	  <chord name = "A" positions="x07655", fingers="432-1-"> </chord>
	  <chord name = "C" positions="x32010" fingers="-32-1-"> </chord>
```
