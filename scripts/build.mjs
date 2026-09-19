// Build the same application as an offline file. Documentation stays in the repo.
import {readFile,writeFile,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const css=await read('dist/style.css');
const modules=await Promise.all(['geometry','ride-calibration','fit-model','app'].map(m=>read('dist/'+m+'.mjs')));
const names=[['SOURCE','NOMINAL','cockpitTarget','saddleTarget','target','solve','nominalCheck'],['CALIBRATION_REVISION','HARDWARE','BAR_SCALES','RAW_MEDIUM','fitCorners','MEASURED_MEDIUM_BAR','FOOT_PROFILES'],['measuredSaddlePoint','solveMeasuredSaddle','barPoint','barPolygon','solveBar','saddlePoint','solveSaddle','scalePosition','saddleAtAngle','geometrySaddleTarget','makeTarget','evaluateFit','recommend','TRAINER_GEOMETRY','trainerTilt','rotateForLift','liftedProfile','suggestTrainerLift']];
let bundle='';
modules.forEach((source,i)=>{const clean=source.replace(/^import .*?;\n/gm,'').replace(/^export /gm,'');bundle+=i<3?`const {${names[i].join(',')}} = (()=>{\n${clean}\nreturn {${names[i].join(',')}};\n})();\n`:`(()=>{\n${clean}\n})();`;});
let html=await read('dist/index.html');
html=html.replace('<link rel="stylesheet" href="./style.css">',`<style>\n${css}\n</style>`).replace('<script type="module" src="./app.mjs"></script>','');
html=html.replace('</body>',`<script>\n${bundle.replace(/<\/script/gi,'<\\/script')}\n</script>\n</body>`);
await writeFile(new URL('ride-fit-preview.html',root),html);
await rm(new URL('dist/calibration.html',root),{force:true});
console.log('Built ride-fit-preview.html');
