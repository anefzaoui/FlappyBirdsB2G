//<![CDATA[
if(document.createStyleSheet) {
  document.createStyleSheet('Press_Start_2P/font.css');
}
else {
  var styles = "@import url('Press_Start_2P/font.css ');";
  var newSS=document.createElement('link');
  newSS.rel='stylesheet';
  newSS.href='data:text/css,'+escape(styles);
  document.getElementsByTagName("head")[0].appendChild(newSS);
}
//]]>
