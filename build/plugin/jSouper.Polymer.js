!function(){var a=jSouper.$.D,b=Polymer.dom;b(document),a.iB=function(a,c,d){try{b(a).insertBefore(c,d||null),Polymer.dom.flush()}catch(e){console.error(e)}},a.ap=function(a,c){try{b(a).appendChild(c),Polymer.dom.flush()}catch(d){console.error(d)}},a.cl=function(a,c){return b(a).cloneNode(c)},a.rC=function(a,c){b(a).removeChild(c),Polymer.dom.flush()},a.re=function(a,c,d){b(a).replaceChild(c,d),Polymer.dom.flush()},a.rm=function(a){a&&a.parentNode&&"BODY"!=a.tagName&&(delete b(a.parentNode).removeChild(a),Polymer.dom.flush())}}();