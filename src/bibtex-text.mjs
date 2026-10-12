export function bibtexText(value='') {
  const parts=String(value).split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g);
  return parts.map((part,index)=>index%2?part:part.replace(/\\(?:textit|emph)\{([^{}]*)\}/g,'*$1*').replace(/\\textbf\{([^{}]*)\}/g,'**$1**').replace(/\\textsc\{([^{}]*)\}/g,'$1').replace(/\\([&_%#])/g,'$1').replace(/[{}]/g,'').replace(/~/g,' ')).join('');
}
